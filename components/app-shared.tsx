import {
  ArrowLeftRightIcon,
  BellIcon,
  LayoutGridIcon,
  MapPinIcon,
  PanelLeftCloseIcon,
  SettingsIcon,
  TruckIcon,
  UsersIcon,
  WrenchIcon,
  FileTextIcon,
} from "lucide-react";

export type SidebarNavItem = {
  title: string;
  url: string;
  icon: React.ReactNode;
  /** Exact pathname match for multi-page routes */
  path?: string;
  sectionId?: string;
  filterStatus?: "outbound" | "onsite" | "in_shop";
  fleetStatus?:
    | "in_transit"
    | "at_location"
    | "under_maintenance"
    | "out_of_service";
};

export const navItems: SidebarNavItem[] = [
  {
    title: "Dashboard",
    url: "/",
    path: "/",
    icon: <LayoutGridIcon strokeWidth={1.75} className="text-white" />,
  },
  {
    title: "Movements",
    url: "/movements",
    path: "/movements",
    icon: <ArrowLeftRightIcon strokeWidth={1.75} className="text-white" />,
  },
  {
    title: "Trailers",
    url: "/trailers",
    path: "/trailers",
    icon: <TruckIcon strokeWidth={1.75} className="text-white" />,
  },
  {
    title: "Locations",
    url: "/locations",
    path: "/locations",
    icon: <MapPinIcon strokeWidth={1.75} className="text-white" />,
  },
  {
    title: "Drivers",
    url: "/movements",
    path: "/movements",
    icon: <UsersIcon strokeWidth={1.75} className="text-white" />,
  },
  {
    title: "Reports",
    url: "/#analytics",
    sectionId: "analytics",
    icon: <FileTextIcon strokeWidth={1.75} className="text-white" />,
  },
  {
    title: "Alerts",
    url: "/#summary",
    sectionId: "summary",
    icon: <BellIcon strokeWidth={1.75} className="text-white" />,
  },
  {
    title: "Maintenance",
    url: "/trailers?status=under_maintenance",
    path: "/trailers",
    fleetStatus: "under_maintenance",
    icon: <WrenchIcon strokeWidth={1.75} className="text-white" />,
  },
  {
    title: "Settings",
    url: "#settings",
    icon: <SettingsIcon strokeWidth={1.75} className="text-white" />,
  },
];

export const collapseNavItem = {
  title: "Collapse",
  icon: <PanelLeftCloseIcon strokeWidth={1.75} className="text-white" />,
};

/** @deprecated use navItems */
export const navLinks: SidebarNavItem[] = navItems;
