import { ReactNode, SVGProps } from "react";

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

export function AppIcon({ name, className, ...props }: AppIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {iconPaths[name]}
    </svg>
  );
}

const iconPaths: Record<AppIconName, ReactNode> = {
  home: (
    <>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6.5 10v9h11v-9" />
    </>
  ),
  students: (
    <>
      <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M4.5 19a4.5 4.5 0 0 1 9 0" />
      <path d="M16.5 10a2.5 2.5 0 1 0 0-5" />
      <path d="M15 19a4 4 0 0 1 5 0" />
    </>
  ),
  subjects: (
    <>
      <path d="M6 5.5h12" />
      <path d="M6 10.5h12" />
      <path d="M6 15.5h8" />
      <path d="M6 19.5h8" />
    </>
  ),
  classes: (
    <>
      <rect x="4.5" y="5" width="15" height="14" rx="2.5" />
      <path d="M4.5 10.5h15" />
      <path d="M9.5 5v14" />
    </>
  ),
  terms: (
    <>
      <rect x="4.5" y="5" width="15" height="14" rx="2.5" />
      <path d="M8 3.5v3" />
      <path d="M16 3.5v3" />
      <path d="M8 12h3" />
    </>
  ),
  reports: (
    <>
      <path d="M7 4.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V6A1.5 1.5 0 0 1 7.5 4.5Z" />
      <path d="M14 4.5V9h4" />
      <path d="M9 13h6" />
      <path d="M9 16h6" />
    </>
  ),
  insights: (
    <>
      <path d="M6 18.5V13" />
      <path d="M12 18.5V9" />
      <path d="M18 18.5V5.5" />
    </>
  ),
  exports: (
    <>
      <path d="M12 4.5v10" />
      <path d="m8.5 11 3.5 3.5 3.5-3.5" />
      <path d="M5 18.5h14" />
    </>
  ),
  settings: (
    <>
      <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
      <path d="M19 12a7 7 0 0 0-.08-1l2.08-1.6-2-3.46-2.53 1a7.3 7.3 0 0 0-1.73-1l-.38-2.7h-4l-.38 2.7a7.3 7.3 0 0 0-1.73 1l-2.53-1-2 3.46L5.08 11A7 7 0 0 0 5 12c0 .34.03.67.08 1L3 14.6l2 3.46 2.53-1a7.3 7.3 0 0 0 1.73 1l.38 2.7h4l.38-2.7a7.3 7.3 0 0 0 1.73-1l2.53 1 2-3.46-2.08-1.6c.05-.33.08-.66.08-1Z" />
    </>
  ),
};
