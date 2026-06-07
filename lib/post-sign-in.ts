import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const AFTER_SIGN_IN =
  process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL ?? "/";

export async function navigateAfterSignIn(
  router: AppRouterInstance,
  decorateUrl: (url: string) => string
): Promise<void> {
  const destination = decorateUrl(AFTER_SIGN_IN);

  try {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    if (res.status === 403) {
      router.push("/no-access");
      return;
    }
  } catch {
    // RoleGate on the app shell will handle roster denial if this races.
  }

  if (destination.startsWith("http")) {
    window.location.href = destination;
    return;
  }

  router.push(destination);
}
