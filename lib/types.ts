export const TRAILER_STATUSES = ["outbound", "onsite", "in_shop"] as const;

export type TrailerStatus = (typeof TRAILER_STATUSES)[number];

export interface Trailer {
  id: string;
  trailerNumber: string;
  status: TrailerStatus;
  driver: string;
  location: string;
  notes: string;
  updatedAt: string;
  /** Fixed asset register fields (from company CSV) */
  description: string;
  vin: string;
  licensePlate: string;
  vehicleYear: number;
  locationCode: string;
  customerName: string;
  trackingSerialNo: string;
  description2: string;
  manufacturer: string;
  onRent: boolean;
  inService: boolean;
  blocked: boolean;
  disposed: boolean;
  acquired: boolean;
  customerNo: string;
  branchCode: string;
  doorType: string;
  condition: string;
  suspension: string;
  eTrack: boolean;
  logPost: boolean;
  roof: string;
}

export const EMPTY_TRAILER_ASSET: Pick<
  Trailer,
  | "description"
  | "vin"
  | "licensePlate"
  | "vehicleYear"
  | "locationCode"
  | "customerName"
  | "trackingSerialNo"
  | "description2"
  | "manufacturer"
  | "onRent"
  | "inService"
  | "blocked"
  | "disposed"
  | "acquired"
  | "customerNo"
  | "branchCode"
  | "doorType"
  | "condition"
  | "suspension"
  | "eTrack"
  | "logPost"
  | "roof"
> = {
  description: "",
  vin: "",
  licensePlate: "",
  vehicleYear: 0,
  locationCode: "",
  customerName: "",
  trackingSerialNo: "",
  description2: "",
  manufacturer: "",
  onRent: false,
  inService: true,
  blocked: false,
  disposed: false,
  acquired: false,
  customerNo: "",
  branchCode: "",
  doorType: "",
  condition: "",
  suspension: "",
  eTrack: false,
  logPost: false,
  roof: "",
};

export type TrailerAssetFields = typeof EMPTY_TRAILER_ASSET;

export type TrailerInput = Pick<Trailer, "trailerNumber" | "status"> &
  Partial<Pick<Trailer, "driver" | "location" | "notes"> & TrailerAssetFields>;

export type TrailerUpdate = Partial<
  Pick<Trailer, "trailerNumber" | "status" | "driver" | "location" | "notes"> &
    TrailerAssetFields
>;

export const STATUS_LABELS: Record<TrailerStatus, string> = {
  outbound: "Outbound",
  onsite: "Onsite",
  in_shop: "In Shop",
};

export const STATUS_SECTION_TITLES: Record<TrailerStatus, string> = {
  outbound: "Outbound Trailers",
  onsite: "Onsite Trailers",
  in_shop: "In Shop",
};

/** DOM id for sidebar hash / scroll targets */
export const STATUS_SECTION_IDS: Record<TrailerStatus, string> = {
  outbound: "outbound",
  onsite: "onsite",
  in_shop: "in-shop",
};

export const LOCATION_TYPES = ["yard", "customer", "other"] as const;

export type LocationType = (typeof LOCATION_TYPES)[number];

export const LOCATION_STATUSES = ["active", "inactive"] as const;

export type LocationStatus = (typeof LOCATION_STATUSES)[number];

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  status: LocationStatus;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
  updatedAt: string;
}

export type LocationInput = Pick<
  Location,
  | "name"
  | "type"
  | "status"
  | "addressLine1"
  | "city"
  | "state"
  | "zip"
  | "latitude"
  | "longitude"
> &
  Partial<Pick<Location, "addressLine2">>;

export type LocationUpdate = Partial<
  Pick<
    Location,
    | "name"
    | "type"
    | "status"
    | "addressLine1"
    | "addressLine2"
    | "city"
    | "state"
    | "zip"
    | "latitude"
    | "longitude"
  >
>;

export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  yard: "Yard",
  customer: "Customer",
  other: "Other",
};

export const LOCATION_STATUS_LABELS: Record<LocationStatus, string> = {
  active: "Active",
  inactive: "Inactive",
};

export const DRIVER_STATUSES = ["on_duty", "off_duty", "unavailable"] as const;

export type DriverStatus = (typeof DRIVER_STATUSES)[number];

export interface Driver {
  id: string;
  name: string;
  driverId: string;
  phone: string;
  status: DriverStatus;
  currentAssignment: string;
  lastActiveAt: string;
  updatedAt: string;
}

export type DriverInput = Pick<
  Driver,
  "name" | "driverId" | "phone" | "status"
> &
  Partial<Pick<Driver, "currentAssignment" | "lastActiveAt">>;

export type DriverUpdate = Partial<
  Pick<
    Driver,
    "name" | "driverId" | "phone" | "status" | "currentAssignment" | "lastActiveAt"
  >
>;

export const DRIVER_STATUS_LABELS: Record<DriverStatus, string> = {
  on_duty: "On Duty",
  off_duty: "Off Duty",
  unavailable: "Unavailable",
};

export const ALERT_SEVERITIES = ["critical", "warning", "info"] as const;

export type AlertSeverity = (typeof ALERT_SEVERITIES)[number];

export const ALERT_TYPES = ["maintenance", "operations", "security"] as const;

export type AlertType = (typeof ALERT_TYPES)[number];

export const ALERT_STATUSES = ["open", "resolved"] as const;

export type AlertStatus = (typeof ALERT_STATUSES)[number];

export interface SystemAlert {
  id: string;
  message: string;
  type: AlertType;
  severity: AlertSeverity;
  relatedTo: string;
  assignedTo: string;
  status: AlertStatus;
  createdAt: string;
  updatedAt: string;
}

export type SystemAlertInput = Pick<
  SystemAlert,
  "message" | "type" | "severity" | "relatedTo"
> &
  Partial<Pick<SystemAlert, "assignedTo" | "status">>;

export type SystemAlertUpdate = Partial<
  Pick<
    SystemAlert,
    "message" | "type" | "severity" | "relatedTo" | "assignedTo" | "status"
  >
>;

export const ALERT_SEVERITY_LABELS: Record<AlertSeverity, string> = {
  critical: "Critical",
  warning: "Warning",
  info: "Info",
};

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  maintenance: "Maintenance",
  operations: "Operations",
  security: "Security",
};

export const ALERT_STATUS_LABELS: Record<AlertStatus, string> = {
  open: "Open",
  resolved: "Resolved",
};

export const MAINTENANCE_SERVICE_TYPES = [
  "dot_inspection",
  "brake_service",
  "tire_service",
  "general_repair",
  "annual_inspection",
] as const;

export type MaintenanceServiceType = (typeof MAINTENANCE_SERVICE_TYPES)[number];

export const MAINTENANCE_SERVICE_STATUSES = [
  "due_soon",
  "overdue",
  "scheduled",
  "completed",
] as const;

export type MaintenanceServiceStatus =
  (typeof MAINTENANCE_SERVICE_STATUSES)[number];

export const MAINTENANCE_PRIORITIES = ["high", "medium", "low"] as const;

export type MaintenancePriority = (typeof MAINTENANCE_PRIORITIES)[number];

export interface MaintenanceService {
  id: string;
  trailerNumber: string;
  serviceType: MaintenanceServiceType;
  dueDate: string;
  status: MaintenanceServiceStatus;
  priority: MaintenancePriority;
  technician: string;
  cost: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type MaintenanceServiceInput = Pick<
  MaintenanceService,
  | "trailerNumber"
  | "serviceType"
  | "dueDate"
  | "status"
  | "priority"
> &
  Partial<Pick<MaintenanceService, "technician" | "cost" | "notes">>;

export type MaintenanceServiceUpdate = Partial<
  Pick<
    MaintenanceService,
    | "trailerNumber"
    | "serviceType"
    | "dueDate"
    | "status"
    | "priority"
    | "technician"
    | "cost"
    | "notes"
  >
>;

export const MAINTENANCE_SERVICE_TYPE_LABELS: Record<
  MaintenanceServiceType,
  string
> = {
  dot_inspection: "DOT Inspection",
  brake_service: "Brake Service",
  tire_service: "Tire Service",
  general_repair: "General Repair",
  annual_inspection: "Annual Inspection",
};

export const MAINTENANCE_SERVICE_STATUS_LABELS: Record<
  MaintenanceServiceStatus,
  string
> = {
  due_soon: "Due Soon",
  overdue: "Overdue",
  scheduled: "Scheduled",
  completed: "Completed",
};

export const MAINTENANCE_PRIORITY_LABELS: Record<MaintenancePriority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const USER_ROLES = [
  "administrator",
  "dispatcher",
  "maintenance_manager",
  "driver",
  "viewer",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ["active", "inactive"] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

export type ClerkLinkStatus = "linked" | "invited" | "none";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  location: string;
  locationAccess: string[];
  notes: string;
  /** Linked Clerk production user id (set on first sign-in) */
  clerkUserId?: string;
  lastLoginAt: string;
  joinedAt: string;
  updatedAt: string;
}

/** App roster row merged with live Clerk profile data */
export interface AppUserView extends AppUser {
  imageUrl: string | null;
  clerkStatus: ClerkLinkStatus;
  clerkLastSignInAt: string | null;
}

export type AppUserInput = Pick<
  AppUser,
  "name" | "email" | "role" | "status"
> &
  Partial<
    Pick<AppUser, "phone" | "location" | "locationAccess" | "notes" | "lastLoginAt">
  >;

export type AppUserUpdate = Partial<
  Pick<
    AppUser,
    | "name"
    | "email"
    | "phone"
    | "role"
    | "status"
    | "location"
    | "locationAccess"
    | "notes"
    | "lastLoginAt"
    | "clerkUserId"
  >
>;

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  administrator: "Administrator",
  dispatcher: "Dispatcher",
  maintenance_manager: "Maintenance Manager",
  driver: "Driver",
  viewer: "Viewer",
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  active: "Active",
  inactive: "Inactive",
};

export const SETTINGS_INDUSTRIES = [
  "Logistics & Transportation",
  "Freight & Hauling",
  "Warehousing & Distribution",
  "Other",
] as const;

export const SETTINGS_TIMEZONES = [
  "(GMT-05:00) Eastern Time (US & Canada)",
  "(GMT-06:00) Central Time (US & Canada)",
  "(GMT-07:00) Mountain Time (US & Canada)",
  "(GMT-08:00) Pacific Time (US & Canada)",
] as const;

export const SETTINGS_CURRENCIES = [
  "USD - US Dollar",
  "CAD - Canadian Dollar",
] as const;

export const SETTINGS_BUSINESS_DAYS = [
  "Monday - Friday",
  "Monday - Saturday",
  "Every day",
] as const;

export type SettingsIndustry = (typeof SETTINGS_INDUSTRIES)[number];
export type SettingsTimezone = (typeof SETTINGS_TIMEZONES)[number];
export type SettingsCurrency = (typeof SETTINGS_CURRENCIES)[number];
export type SettingsBusinessDays = (typeof SETTINGS_BUSINESS_DAYS)[number];

export interface CompanySettings {
  companyName: string;
  legalName: string;
  industry: string;
  phone: string;
  address: string;
  companyEmail: string;
  website: string;
  timezone: string;
  currency: string;
  companyDescription: string;
  logoUrl: string;
  supportEmail: string;
  supportPhone: string;
  billingEmail: string;
  emergencyPhone: string;
  businessDays: string;
  businessStartTime: string;
  businessEndTime: string;
  is24x7: boolean;
  dateFormat: string;
  timeFormat: string;
  language: string;
  defaultLocation: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  primaryColor: string;
}

export interface AppSettings {
  company: CompanySettings;
  updatedAt: string;
}

export type CompanySettingsUpdate = Partial<CompanySettings>;
export type AppSettingsUpdate = {
  company?: CompanySettingsUpdate;
};
