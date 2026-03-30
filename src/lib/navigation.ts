export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
  icon:
    | "home"
    | "students"
    | "subjects"
    | "classes"
    | "terms"
    | "reports"
    | "insights"
    | "exports"
    | "settings";
};

export const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Home",
    shortLabel: "DB",
    description: "",
    icon: "home",
  },
  {
    href: "/students",
    label: "Students",
    shortLabel: "ST",
    description: "",
    icon: "students",
  },
  {
    href: "/subjects",
    label: "Subjects",
    shortLabel: "SU",
    description: "",
    icon: "subjects",
  },
  {
    href: "/classes",
    label: "Classes",
    shortLabel: "CL",
    description: "",
    icon: "classes",
  },
  {
    href: "/terms",
    label: "Terms",
    shortLabel: "TR",
    description: "",
    icon: "terms",
  },
  {
    href: "/reports",
    label: "Reports",
    shortLabel: "RP",
    description: "",
    icon: "reports",
  },
  {
    href: "/analytics",
    label: "Insights",
    shortLabel: "AN",
    description: "",
    icon: "insights",
  },
  {
    href: "/exports",
    label: "Exports",
    shortLabel: "EX",
    description: "",
    icon: "exports",
  },
  {
    href: "/settings",
    label: "Settings",
    shortLabel: "SE",
    description: "",
    icon: "settings",
  },
];
