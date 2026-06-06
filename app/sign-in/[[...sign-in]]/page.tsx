"use client";

import { HandleSSOCallback } from "@clerk/react";
import { usePathname, useRouter } from "next/navigation";

import { Login1 } from "@/components/ui/login-1";

export default function SignInPage() {
  const pathname = usePathname();
  const router = useRouter();
  const isSsoCallback = pathname.includes("sso-callback");

  if (isSsoCallback) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <HandleSSOCallback
          navigateToApp={({ session, decorateUrl }) => {
            const destination = session?.currentTask
              ? decorateUrl("/sign-in")
              : decorateUrl(
                  process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL ?? "/"
                );
            if (destination.startsWith("http")) {
              window.location.href = destination;
              return;
            }
            router.push(destination);
          }}
          navigateToSignIn={() => router.push("/sign-in")}
          navigateToSignUp={() => router.push("/sign-in")}
        />
      </div>
    );
  }

  return <Login1 />;
}
