import type { AppUser } from "./types";

export const GUEST_VIEW_COOKIE = "guest_view_token";
export const GUEST_VIEWER_ID = "guest-view";

export const GUEST_VIEWER_USER: AppUser = {
  id: GUEST_VIEWER_ID,
  name: "Guest viewer",
  email: "",
  phone: "",
  role: "viewer",
  status: "active",
  location: "",
  locationAccess: [],
  notes: "Read-only overview via administrator link",
  lastLoginAt: new Date().toISOString(),
  joinedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

type GuestTokenPayload = {
  exp: number;
  role: "viewer";
  v: 1;
};

function getGuestSecret(): string {
  const secret =
    process.env.GUEST_LINK_SECRET ?? process.env.CLERK_SECRET_KEY ?? "";
  if (!secret) {
    throw new Error("GUEST_LINK_SECRET or CLERK_SECRET_KEY is required");
  }
  return secret;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  const binary = atob(padded + "=".repeat(padLen));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createGuestViewToken(
  expiresInSeconds: number
): Promise<{ token: string; expiresAt: string }> {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload: GuestTokenPayload = { exp, role: "viewer", v: 1 };
  const payloadB64 = toBase64Url(
    new TextEncoder().encode(JSON.stringify(payload))
  );
  const key = await getHmacKey(getGuestSecret());
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadB64)
  );
  const sigB64 = toBase64Url(new Uint8Array(signature));
  const expiresAt = new Date(exp * 1000).toISOString();
  return { token: `${payloadB64}.${sigB64}`, expiresAt };
}

export async function verifyGuestViewToken(
  token: string
): Promise<GuestTokenPayload | null> {
  const dot = token.indexOf(".");
  if (dot <= 0) return null;

  const payloadB64 = token.slice(0, dot);
  const sigB64 = token.slice(dot + 1);
  if (!payloadB64 || !sigB64) return null;

  try {
    const key = await getHmacKey(getGuestSecret());
    const signatureBytes = new Uint8Array(fromBase64Url(sigB64));
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      new TextEncoder().encode(payloadB64)
    );
    if (!valid) return null;

    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(payloadB64))
    ) as GuestTokenPayload;

    if (payload.v !== 1 || payload.role !== "viewer") return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

export function isGuestViewer(user: AppUser | null | undefined): boolean {
  return user?.id === GUEST_VIEWER_ID;
}
