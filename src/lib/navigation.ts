export type NavIcon =
  | "home"
  | "students"
  | "subjects"
  | "classes"
  | "terms"
  | "reports"
  | "insights"
  | "exports"
  | "settings";

export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: NavIcon;
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    id: "workspace",
    label: "Workspace",
    items: [
      {
        href: "/dashboard",
        label: "Home",
        shortLabel: "DB",
        description: "",
        icon: "home",
      },
    ],
  },
  {
    id: "academics",
    label: "Academics",
    items: [
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
    ],
  },
  {
    id: "reports",
    label: "Reports",
    items: [
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
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      {
        href: "/settings",
        label: "Settings",
        shortLabel: "SE",
        description: "",
        icon: "settings",
      },
    ],
  },
];

export const navItems: NavItem[] = navGroups.flatMap((group) => group.items);
