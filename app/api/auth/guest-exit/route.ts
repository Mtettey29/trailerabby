import { NextResponse } from "next/server";
import { GUEST_VIEW_COOKIE } from "@/lib/guest-token";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(GUEST_VIEW_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
