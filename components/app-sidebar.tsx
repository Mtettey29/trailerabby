"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Logo } from "@/components/logo";
import { SectionNavLink } from "@/components/section-nav-link";
import { collapseNavItem, navItems, type SidebarNavItem } from "@/components/app-shared";
import { parseFleetStatusParam } from "@/lib/trailer-display";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

function NavItem({ item }: { item: SidebarNavItem }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeStatus = searchParams.get("status");
  const isPathActive =
    item.path != null &&
    pathname === item.path &&
    (item.fleetStatus != null
      ? false
      : item.path !== "/trailers" ||
        parseFleetStatusParam(searchParams.get("status")) === "all");
  const isFilterActive =
    item.filterStatus != null &&
    pathname === "/" &&
    activeStatus === item.filterStatus;
  const isFleetFilterActive =
    item.fleetStatus != null &&
    pathname === "/trailers" &&
    parseFleetStatusParam(searchParams.get("status")) === item.fleetStatus;

  const link =
    item.sectionId != null && item.url.startsWith("/#") ? (
      <SectionNavLink href={item.url} sectionId={item.sectionId} />
    ) : (
      <Link href={item.url} />
    );

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isPathActive || isFilterActive || isFleetFilterActive}
        tooltip={item.title}
        size="sm"
        className="text-[#e7e9ea] [&_svg]:text-white"
        render={link}
      >
        {item.icon}
        <span>{item.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function CollapseButton() {
  const { toggleSidebar } = useSidebar();

  return (
    <SidebarMenuItem className="mt-auto">
      <SidebarMenuButton
        size="sm"
        className="text-[#e7e9ea] [&_svg]:text-white"
        tooltip={collapseNavItem.title}
        onClick={toggleSidebar}
      >
        {collapseNavItem.icon}
        <span>{collapseNavItem.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  return (
    <Sidebar
      className="border-r border-[#2f3336] *:data-[slot=sidebar-inner]:bg-black"
      collapsible="icon"
      variant="sidebar"
    >
      <SidebarHeader className="px-2 py-2">
        <Link
          className="flex h-8 items-center gap-1.5 rounded-lg px-1.5 hover:bg-[#16181c] group-data-[collapsible=icon]:justify-center"
          href="/"
        >
          <Logo className="text-xs" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="flex h-full min-h-0 flex-col px-1.5 py-2">
          <SidebarMenu className="flex min-h-0 flex-1 flex-col">
            {navItems.map((item) => (
              <NavItem key={item.title} item={item} />
            ))}
            <CollapseButton />
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
