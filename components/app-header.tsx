import Link from "next/link";
import { Logo } from "@/components/logo";
import { SectionNavBar } from "@/components/section-nav-bar";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 shrink-0 border-b border-[#2f3336] bg-black/90 backdrop-blur-md print:hidden">
      <div className="flex h-14 items-center gap-8 px-6 xl:px-10 2xl:px-14">
        <Link
          href="/"
          className="rounded-lg px-1 py-0.5 hover:bg-[#16181c]"
        >
          <Logo />
        </Link>
        <SectionNavBar />
      </div>
    </header>
  );
}
