import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black text-white">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <Button
        nativeButton={false}
        render={<Link href="/" />}
        className="rounded-full bg-white font-bold text-black hover:bg-[#e7e9ea]"
      >
        Back to dashboard
      </Button>
    </div>
  );
}
