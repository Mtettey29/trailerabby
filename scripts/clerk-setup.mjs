/**
 * Trailer Abby — Clerk configuration via Backend API + CLI handoff.
 * Run: npm run clerk:setup
 *
 * Uses CLERK_SECRET_KEY from .env.local. For full instance config (paths,
 * social providers), run `npm run clerk:login` then `npm run clerk:config`.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env.local");

const DISPATCH_USERS = [
  {
    email: "michaeltettey29@gmail.com",
    firstName: "Michael",
    lastName: "Admin",
    role: "administrator",
  },
  {
    email: "dispatch1@littleabbyco.com",
    firstName: "Dispatch",
    lastName: "One",
    role: "dispatcher",
  },
  {
    email: "dispatch2@littleabbyco.com",
    firstName: "Dispatch",
    lastName: "Two",
    role: "dispatcher",
  },
];

async function loadEnvFile(filePath) {
  try {
    const raw = await readFile(filePath, "utf-8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local may not exist yet
  }
}

async function clerkFetch(secretKey, pathname, options = {}) {
  const res = await fetch(`https://api.clerk.com/v1${pathname}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const text = await res.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  return { ok: res.ok, status: res.status, body };
}

async function findUserByEmail(secretKey, email) {
  const { ok, body } = await clerkFetch(
    secretKey,
    `/users?email_address=${encodeURIComponent(email)}&limit=1`
  );
  if (!ok) {
    throw new Error(
      `Failed to list users for ${email}: ${JSON.stringify(body)}`
    );
  }
  return body?.[0] ?? body?.data?.[0] ?? null;
}

function tempPassword(email) {
  const local = email.split("@")[0]?.replace(/[^a-z0-9]/gi, "") || "user";
  return `TrailerAbby-${local}-2026!`;
}

async function createClerkUser(secretKey, user) {
  const { ok, body } = await clerkFetch(secretKey, "/users", {
    method: "POST",
    body: JSON.stringify({
      email_address: [user.email],
      first_name: user.firstName,
      last_name: user.lastName,
      password: tempPassword(user.email),
      skip_password_checks: true,
    }),
  });

  if (!ok) {
    throw new Error(`Failed to create ${user.email}: ${JSON.stringify(body)}`);
  }

  console.log(`  → Created Clerk user ${user.email} (${body.id})`);
  console.log(`    Temporary password: ${tempPassword(user.email)}`);
  return { status: "created", email: user.email };
}

async function ensureDispatchUser(secretKey, user, redirectUrl) {
  const existing = await findUserByEmail(secretKey, user.email);
  if (existing) {
    console.log(`  ✓ ${user.email} already in Clerk (${existing.id})`);
    return { status: "exists", email: user.email };
  }

  const invite = await clerkFetch(secretKey, "/invitations", {
    method: "POST",
    body: JSON.stringify({
      email_address: user.email,
      redirect_url: redirectUrl,
      ignore_existing: true,
    }),
  });

  if (invite.ok) {
    console.log(`  → Invitation sent to ${user.email}`);
    return { status: "invited", email: user.email };
  }

  const inviteCode = invite.body?.errors?.[0]?.code;
  if (inviteCode === "invitations_not_supported") {
    console.log(`  ℹ Invitations unavailable for ${user.email}, creating user directly …`);
    return createClerkUser(secretKey, user);
  }

  throw new Error(
    `Failed to invite ${user.email}: ${JSON.stringify(invite.body)}`
  );
}

async function configureFreePlanAccess(secretKey) {
  const restrictions = await clerkFetch(secretKey, "/instance/restrictions", {
    method: "PATCH",
    body: JSON.stringify({
      allowlist: false,
      blocklist: false,
    }),
  });

  if (restrictions.ok) {
    console.log("  ✓ Allowlist disabled (free plan — no paid feature needed)");
  } else {
    console.warn(
      "  ⚠ Could not disable allowlist via API:",
      JSON.stringify(restrictions.body)
    );
  }

  const restrictedMode = await clerkFetch(secretKey, "/instance", {
    method: "PATCH",
    body: JSON.stringify({ sign_up_mode: "restricted" }),
  });

  if (restrictedMode.ok) {
    console.log("  ✓ Sign-up mode set to restricted (invite / admin-created users only)");
  } else {
    console.warn(
      "  ⚠ Could not set restricted sign-up via API:",
      JSON.stringify(restrictedMode.body)
    );
    console.warn(
      "    Set manually: Clerk Dashboard → Configure → Restrictions → Restricted"
    );
  }

  console.log("  ℹ Trailer Abby roster (.data/users.json) blocks unknown emails at /no-access");
}

async function ensureEnvKeys() {
  const required = [
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
    "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
    "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL",
    "NEXT_PUBLIC_APP_URL",
  ];

  const missing = required.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    console.error("Missing required env vars in .env.local:");
    for (const key of missing) console.error(`  - ${key}`);
    console.error("\nRun on your host shell:");
    console.error("  npm run clerk:login");
    console.error("  npm run clerk:env");
    process.exit(1);
  }

  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  const sk = process.env.CLERK_SECRET_KEY ?? "";
  const isProd = pk.startsWith("pk_live_") && sk.startsWith("sk_live_");
  const isDev = pk.startsWith("pk_test_") && sk.startsWith("sk_test_");

  if (isProd) {
    console.log("  ✓ Clerk env vars present (production keys)");
  } else if (isDev) {
    console.log("  ⚠ Clerk env vars present (development keys — Dashboard shows Development)");
    console.log("    Use pk_live_ / sk_live_ for production. See: npm run clerk:check");
  } else {
    console.log("  ✓ Clerk env vars present");
  }
}

async function writeEnvExampleMerge() {
  const guestSecret = process.env.GUEST_LINK_SECRET?.trim();
  if (guestSecret) {
    console.log("  ✓ GUEST_LINK_SECRET is set");
    return;
  }
  console.log(
    "  ℹ GUEST_LINK_SECRET not set — overview links will fall back to CLERK_SECRET_KEY"
  );
}

async function main() {
  console.log("Trailer Abby — Clerk setup\n");
  await loadEnvFile(envPath);
  await ensureEnvKeys();
  await writeEnvExampleMerge();

  const secretKey = process.env.CLERK_SECRET_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const redirectUrl = process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || "/";

  console.log("\n1. Access control (free plan)");
  await configureFreePlanAccess(secretKey);

  console.log("\n2. Dispatch roster (Clerk invitations)");
  const afterSignIn = `${appUrl}${
    redirectUrl.startsWith("/") ? redirectUrl : `/${redirectUrl}`
  }`;

  for (const user of DISPATCH_USERS) {
    await ensureDispatchUser(secretKey, user, afterSignIn);
  }

  console.log("\n3. App roster");
  const usersDataPath = path.join(root, ".data", "users.json");
  try {
    await readFile(usersDataPath, "utf-8");
    console.log("  ✓ .data/users.json exists");
  } catch {
    console.log("  → Seeding .data/users.json …");
    const { spawnSync } = await import("node:child_process");
    const result = spawnSync("npm", ["run", "seed:users"], {
      cwd: root,
      stdio: "inherit",
      shell: true,
    });
    if (result.status !== 0) process.exit(result.status ?? 1);
  }

  const reportPath = path.join(root, ".clerk", "setup-report.json");
  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(
    reportPath,
    JSON.stringify(
      {
        completedAt: new Date().toISOString(),
        appUrl,
        signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
        afterSignInUrl: redirectUrl,
        dispatchUsers: DISPATCH_USERS.map((u) => u.email),
        guestAccess: "Administrator-generated /view/{token} links (no Clerk account)",
        nextSteps: [
          "npm run clerk:login",
          "npm run clerk:config",
          "npm run clerk:doctor",
        ],
      },
      null,
      2
    ),
    "utf-8"
  );

  console.log("\n4. Host CLI (run these in your terminal)");
  console.log("  npm run clerk:login     # one-time browser auth");
  console.log("  npm run clerk:env       # refresh keys from dashboard");
  console.log("  npm run clerk:config    # apply clerk/instance.patch.json");
  console.log("  npm run clerk:doctor    # verify integration health");
  console.log(`\nReport written to .clerk/setup-report.json`);
  console.log("\nDone.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
