import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { GUEST_VIEW_COOKIE, verifyGuestViewToken } from "@/lib/guest-token";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/view(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) return;

  const guestToken = request.cookies.get(GUEST_VIEW_COOKIE)?.value;
  if (guestToken && (await verifyGuestViewToken(guestToken))) {
    return;
  }

  await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/__clerk/:path*",
    "/(api|trpc)(.*)",
  ],
};
