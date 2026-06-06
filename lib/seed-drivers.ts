import type { Driver } from "./types";

const ts = "2026-06-04T12:00:00.000Z";

/** Dispatch drivers from trailer movement sheet */
export const SEED_DRIVERS: Driver[] = [
  {
    id: "drv-tylance",
    name: "Tylance",
    driverId: "DRV-1001",
    phone: "",
    status: "on_duty",
    currentAssignment: "",
    lastActiveAt: ts,
    updatedAt: ts,
  },
  {
    id: "drv-brandon",
    name: "Brandon",
    driverId: "DRV-1002",
    phone: "",
    status: "on_duty",
    currentAssignment: "",
    lastActiveAt: ts,
    updatedAt: ts,
  },
  {
    id: "drv-nimoy",
    name: "Nimoy",
    driverId: "DRV-1003",
    phone: "",
    status: "on_duty",
    currentAssignment: "",
    lastActiveAt: ts,
    updatedAt: ts,
  },
  {
    id: "drv-aubrey",
    name: "Aubrey",
    driverId: "DRV-1004",
    phone: "",
    status: "on_duty",
    currentAssignment: "",
    lastActiveAt: ts,
    updatedAt: ts,
  },
];
