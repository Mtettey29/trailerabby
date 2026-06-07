"use client";

import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { navigateAfterSignIn } from "@/lib/post-sign-in";

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="mr-2 size-5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

interface Login1Props {
  loginText?: string;
  googleText?: string;
  helpText?: string;
}

const Login1 = ({
  loginText = "Sign in",
  googleText = "Sign in with Google",
  helpText = "Need access? Contact your administrator.",
}: Login1Props) => {
  const router = useRouter();
  const { signIn, errors, fetchStatus } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isLoading = fetchStatus === "fetching";

  const formError =
    errors.fields.identifier?.message ??
    errors.fields.password?.message ??
    errors.global?.[0]?.message ??
    null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const { error } = await signIn.password({ emailAddress: email, password });
    if (error) return;

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            router.push("/sign-in");
            return;
          }
          void navigateAfterSignIn(router, decorateUrl);
        },
      });
    }
  }

  async function handleGoogleSignIn() {
    const redirectCallbackUrl = `${window.location.origin}/sign-in/sso-callback`;
    await signIn.sso({
      strategy: "oauth_google",
      redirectUrl: "/sign-in",
      redirectCallbackUrl,
    });
  }

  return (
    <section className="h-screen bg-black">
      <div className="flex h-full items-center justify-center px-4">
        <div className="flex w-full max-w-sm flex-col items-center gap-y-8 rounded-md border border-[#2f3336] bg-black px-6 py-12 shadow-md">
          <Logo size="lg" className="scale-110" />

          <form
            className="flex w-full flex-col gap-8"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Input
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isLoading}
                  aria-invalid={Boolean(errors.fields.identifier)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Input
                  type="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isLoading}
                  aria-invalid={Boolean(errors.fields.password)}
                />
              </div>

              {formError ? (
                <p className="text-sm text-destructive" role="alert">
                  {formError}
                </p>
              ) : null}

              <div className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="mt-2 h-10 w-full rounded-full bg-white text-black hover:bg-white/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in…" : loginText}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full rounded-full border-[#2f3336] bg-[#16181c] text-[#e7e9ea] hover:bg-[#2f3336]"
                  onClick={() => void handleGoogleSignIn()}
                  disabled={isLoading}
                >
                  <GoogleIcon />
                  {googleText}
                </Button>
              </div>
            </div>
          </form>

          <p className="text-center text-sm text-[#71767b]">{helpText}</p>
        </div>
      </div>
    </section>
  );
};

export { Login1 };
