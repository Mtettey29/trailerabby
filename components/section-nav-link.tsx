"use client";

import Link from "next/link";
import type { ReactNode } from "react";

interface SectionNavLinkProps {
  href: string;
  sectionId: string;
  className?: string;
  children?: ReactNode;
}

export function SectionNavLink({
  href,
  sectionId,
  className,
  children,
}: SectionNavLinkProps) {
  function scrollToSection() {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", href);
    }
  }

  return (
    <Link
      href={href}
      className={className}
      onClick={(e) => {
        if (window.location.pathname === "/") {
          e.preventDefault();
          scrollToSection();
        }
      }}
    >
      {children}
    </Link>
  );
}
