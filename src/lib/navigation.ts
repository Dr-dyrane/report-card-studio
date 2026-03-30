export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
};

export const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Home",
    shortLabel: "DB",
    description: "",
  },
  {
    href: "/students",
    label: "Students",
    shortLabel: "ST",
    description: "",
  },
  {
    href: "/subjects",
    label: "Subjects",
    shortLabel: "SU",
    description: "",
  },
  {
    href: "/classes",
    label: "Classes",
    shortLabel: "CL",
    description: "",
  },
  {
    href: "/terms",
    label: "Terms",
    shortLabel: "TR",
    description: "",
  },
  {
    href: "/reports",
    label: "Reports",
    shortLabel: "RP",
    description: "",
  },
  {
    href: "/analytics",
    label: "Insights",
    shortLabel: "AN",
    description: "",
  },
  {
    href: "/exports",
    label: "Exports",
    shortLabel: "EX",
    description: "",
  },
  {
    href: "/settings",
    label: "Settings",
    shortLabel: "SE",
    description: "",
  },
];
