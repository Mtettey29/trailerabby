"use client";

import { PageHeaderActions } from "@/components/page-header-actions";

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-[#2f3336] pb-6 lg:flex-row lg:items-start lg:justify-between print:block">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-white print:text-black">
          {title}
        </h1>
        <p className="mt-1 text-sm text-[#71767b] print:text-gray-600">
          {subtitle}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <PageHeaderActions />
      </div>
    </div>
  );
}
