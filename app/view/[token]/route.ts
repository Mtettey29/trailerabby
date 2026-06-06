import { NextResponse } from "next/server";
import {
  GUEST_VIEW_COOKIE,
  verifyGuestViewToken,
} from "@/lib/guest-token";

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const payload = await verifyGuestViewToken(token);

  if (!payload) {
    return NextResponse.redirect(
      new URL("/sign-in?error=invalid_guest_link", request.url)
    );
  }

  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set(GUEST_VIEW_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(payload.exp * 1000),
  });

  return response;
}
