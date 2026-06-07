"use client";

import { useAuth } from "@clerk/nextjs";
import { HandleSSOCallback } from "@clerk/react";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { Login1 } from "@/components/ui/login-1";
import { navigateAfterSignIn } from "@/lib/post-sign-in";

function AuthLoading({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-black">
      <Loader2
        className="size-6 animate-spin text-white"
        strokeWidth={1.75}
        aria-hidden
      />
      <p className="text-sm text-[#71767b]">{message}</p>
    </div>
  );
}

function SignedInRedirect() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    router.replace(process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL ?? "/");
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return <AuthLoading message="Loading…" />;
  }

  if (isSignedIn) {
    return <AuthLoading message="Redirecting to dashboard…" />;
  }

  return <Login1 />;
}

export default function SignInPage() {
  const pathname = usePathname();
  const router = useRouter();
  const isSsoCallback = pathname.includes("sso-callback");

  if (isSsoCallback) {
    return (
      <>
        <AuthLoading message="Completing sign-in…" />
        <HandleSSOCallback
          navigateToApp={({ session, decorateUrl }) => {
            if (session?.currentTask) {
              router.push("/sign-in");
              return;
            }
            void navigateAfterSignIn(router, decorateUrl);
          }}
          navigateToSignIn={() => router.push("/sign-in")}
          navigateToSignUp={() => router.push("/sign-in")}
        />
      </>
    );
  }

  return <SignedInRedirect />;
}
