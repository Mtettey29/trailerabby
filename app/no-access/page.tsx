import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function NoAccessPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-black px-4 text-center">
      <h1 className="text-2xl font-semibold text-white">Access not granted</h1>
      <p className="mt-3 max-w-md text-sm text-[#71767b]">
        Your account signed in successfully, but it is not on the Trailer Abby
        dispatch roster. Contact an administrator if you need access.
      </p>
      <SignOutButton redirectUrl="/sign-in">
        <Button
          type="button"
          className="mt-8 rounded-none bg-[#1d9bf0] text-white hover:bg-[#1a8cd8]"
        >
          Sign out
        </Button>
      </SignOutButton>
    </div>
  );
}
