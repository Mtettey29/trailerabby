export type DriverAvatarStyle = {
  initials: string;
  className: string;
};

/** Known drivers from the movement sheet — stable initials and accent colors */
const KNOWN_DRIVERS: Record<string, DriverAvatarStyle> = {
  tylance: { initials: "TY", className: "bg-[#534AB7]/35 text-[#b4adf8]" },
  brandon: { initials: "BR", className: "bg-[#993C1D]/35 text-[#f0a78a]" },
  nimoy: { initials: "NI", className: "bg-[#854F0B]/35 text-[#f5d08a]" },
  aubrey: { initials: "AU", className: "bg-[#534AB7]/35 text-[#b4adf8]" },
};

const UNASSIGNED_STYLE: DriverAvatarStyle = {
  initials: "",
  className: "border border-[#2f3336] bg-[#16181c] text-[#71767b]",
};

export function getDriverAvatarStyle(name: string): DriverAvatarStyle {
  const trimmed = name.trim();
  if (!trimmed) return UNASSIGNED_STYLE;

  const known = KNOWN_DRIVERS[trimmed.toLowerCase()];
  if (known) return known;

  return {
    initials: trimmed.slice(0, 2).toUpperCase(),
    className: "border border-[#2f3336] bg-[#16181c] text-[#e7e9ea]",
  };
}

export function countUnassignedDrivers(
  trailers: { driver: string }[]
): number {
  return trailers.filter((t) => !t.driver.trim()).length;
}
