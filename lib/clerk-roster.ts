import { clerkClient } from "@clerk/nextjs/server";
import type { User } from "@clerk/backend";
import type { ClerkLinkStatus } from "./types";

export type ClerkProfileSummary = {
  clerkUserId: string | null;
  imageUrl: string | null;
  clerkStatus: ClerkLinkStatus;
  clerkLastSignInAt: string | null;
};

export function isClerkProduction(): boolean {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  const sk = process.env.CLERK_SECRET_KEY ?? "";
  return pk.startsWith("pk_live_") && sk.startsWith("sk_live_");
}

function clerkLastSignIn(user: User): string | null {
  const ts = user.lastSignInAt;
  if (!ts) return null;
  return new Date(ts).toISOString();
}

export function clerkProfileFromUser(user: User | null): ClerkProfileSummary {
  if (!user) {
    return {
      clerkUserId: null,
      imageUrl: null,
      clerkStatus: "none",
      clerkLastSignInAt: null,
    };
  }

  return {
    clerkUserId: user.id,
    imageUrl: user.imageUrl,
    clerkStatus: "linked",
    clerkLastSignInAt: clerkLastSignIn(user),
  };
}

export async function findClerkUserByEmail(
  email: string
): Promise<User | null> {
  const normalized = email.toLowerCase().trim();
  if (!normalized) return null;

  const client = await clerkClient();
  const result = await client.users.getUserList({
    emailAddress: [normalized],
    limit: 1,
  });

  return result.data[0] ?? null;
}

export async function findClerkUserById(
  clerkUserId: string
): Promise<User | null> {
  try {
    const client = await clerkClient();
    return await client.users.getUser(clerkUserId);
  } catch {
    return null;
  }
}

export async function getClerkProfilesByEmail(
  emails: string[]
): Promise<Map<string, ClerkProfileSummary>> {
  const unique = [
    ...new Set(emails.map((e) => e.toLowerCase().trim()).filter(Boolean)),
  ];
  const map = new Map<string, ClerkProfileSummary>();

  if (unique.length === 0) return map;

  const client = await clerkClient();

  for (const email of unique) {
    const result = await client.users.getUserList({
      emailAddress: [email],
      limit: 1,
    });
    map.set(email, clerkProfileFromUser(result.data[0] ?? null));
  }

  const pendingEmails = unique.filter(
    (email) => map.get(email)?.clerkStatus === "none"
  );

  if (pendingEmails.length > 0) {
    const invitations = await client.invitations.getInvitationList({
      status: "pending",
      limit: 100,
    });

    for (const email of pendingEmails) {
      const invited = invitations.data.some(
        (inv) => inv.emailAddress.toLowerCase() === email
      );
      if (invited) {
        map.set(email, {
          clerkUserId: null,
          imageUrl: null,
          clerkStatus: "invited",
          clerkLastSignInAt: null,
        });
      }
    }
  }

  return map;
}

export async function inviteClerkUser(
  email: string,
  redirectUrl: string
): Promise<{ status: "invited" | "exists" | "created" }> {
  const normalized = email.toLowerCase().trim();
  const existing = await findClerkUserByEmail(normalized);
  if (existing) {
    return { status: "exists" };
  }

  const client = await clerkClient();

  try {
    await client.invitations.createInvitation({
      emailAddress: normalized,
      redirectUrl,
      ignoreExisting: true,
    });
    return { status: "invited" };
  } catch (error) {
    const code =
      error &&
      typeof error === "object" &&
      "errors" in error &&
      Array.isArray((error as { errors: { code?: string }[] }).errors)
        ? (error as { errors: { code?: string }[] }).errors[0]?.code
        : undefined;

    if (code === "invitations_not_supported") {
      const local = normalized.split("@")[0]?.replace(/[^a-z0-9]/gi, "") || "user";
      await client.users.createUser({
        emailAddress: [normalized],
        password: `TrailerAbby-${local}-2026!`,
        skipPasswordChecks: true,
      });
      return { status: "created" };
    }

    throw error;
  }
}

export function clerkDisplayName(user: User): string {
  const parts = [user.firstName, user.lastName].filter(Boolean);
  if (parts.length > 0) return parts.join(" ");
  return user.username ?? user.primaryEmailAddress?.emailAddress ?? "User";
}
