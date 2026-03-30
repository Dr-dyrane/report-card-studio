import type { ComponentType, SVGProps } from "react";
import {
  AcademicCapIcon,
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  HomeIcon,
  RectangleGroupIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

type AppIconName =
  | "home"
  | "students"
  | "subjects"
  | "classes"
  | "terms"
  | "reports"
  | "insights"
  | "exports"
  | "settings";

type AppIconProps = SVGProps<SVGSVGElement> & {
  name: AppIconName;
};

const iconMap: Record<AppIconName, ComponentType<SVGProps<SVGSVGElement>>> = {
  home: HomeIcon,
  students: UserGroupIcon,
  subjects: AcademicCapIcon,
  classes: RectangleGroupIcon,
  terms: CalendarDaysIcon,
  reports: DocumentTextIcon,
  insights: ChartBarIcon,
  exports: ArrowDownTrayIcon,
  settings: Cog6ToothIcon,
};

export function AppIcon({ name, className, ...props }: AppIconProps) {
  const Icon = iconMap[name];
  return <Icon className={className} aria-hidden="true" {...props} />;
}
