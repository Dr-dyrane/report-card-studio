export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
};

export const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    shortLabel: "DB",
    description: "Overview",
  },
  {
    href: "/students",
    label: "Students",
    shortLabel: "ST",
    description: "Roster",
  },
  {
    href: "/subjects",
    label: "Subjects",
    shortLabel: "SU",
    description: "Rules",
  },
  {
    href: "/classes",
    label: "Classes",
    shortLabel: "CL",
    description: "Groups",
  },
  {
    href: "/terms",
    label: "Terms",
    shortLabel: "TR",
    description: "Calendar",
  },
  {
    href: "/reports",
    label: "Reports",
    shortLabel: "RP",
    description: "Entry",
  },
  {
    href: "/analytics",
    label: "Analytics",
    shortLabel: "AN",
    description: "Insights",
  },
  {
    href: "/exports",
    label: "Exports",
    shortLabel: "EX",
    description: "Output",
  },
  {
    href: "/settings",
    label: "Settings",
    shortLabel: "SE",
    description: "System",
  },
];
