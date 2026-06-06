import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { createGuestViewToken } from "@/lib/guest-token";

const DEFAULT_EXPIRY_SECONDS = 60 * 60 * 24 * 7; // 7 days
const ADMIN_EMAIL = "michaeltettey29@gmail.com";

export async function POST(request: Request) {
  const authResult = await requireApiUser({ roles: ["administrator"] });
  if (authResult instanceof NextResponse) return authResult;

  if (authResult.email.toLowerCase() !== ADMIN_EMAIL) {
    return NextResponse.json(
      { error: "Only the primary administrator can generate overview links" },
      { status: 403 }
    );
  }

  let expiresInSeconds = DEFAULT_EXPIRY_SECONDS;
  try {
    const body = (await request.json()) as { expiresInDays?: number };
    if (body.expiresInDays && body.expiresInDays > 0 && body.expiresInDays <= 30) {
      expiresInSeconds = body.expiresInDays * 60 * 60 * 24;
    }
  } catch {
    // empty body is fine
  }

  const { token, expiresAt } = await createGuestViewToken(expiresInSeconds);

  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    new URL(request.url).origin;
  const url = `${origin}/view/${token}`;

  return NextResponse.json({
    url,
    expiresAt,
    role: "viewer",
    description:
      "Share this link with anyone who needs read-only fleet overview access. No account required.",
  });
}
