import { AlertTriangle } from "lucide-react";
import { NavLink } from "react-router";

import routes from "../router/routes";

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  [
    "flex items-center justify-center rounded-lg py-2.5 text-sm font-medium transition-colors lg:justify-between lg:px-3",
    isActive
      ? "bg-primary-soft text-primary"
      : "text-text-muted hover:bg-surface-muted hover:text-text",
  ].join(" ");

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-16 z-30 flex h-[calc(100vh-4rem)] w-16 shrink-0 flex-col overflow-y-auto border-r border-subtle bg-surface px-2 py-4 lg:w-30 lg:px-4">
      <p className="hidden text-center pb-2 text-xs font-semibold uppercase tracking-wide text-text-subtle lg:block">
        Monitoring
      </p>
      <nav className="flex flex-col gap-1" aria-label="Sidebar navigation">
        <NavLink className={navLinkClassName} title={routes.ERRORS.label} to={routes.ERRORS.path}>
          <AlertTriangle aria-hidden="true" className="size-5 shrink-0" />
          <span className="hidden lg:block">{routes.ERRORS.label}</span>
        </NavLink>
      </nav>
    </aside>
  );
}
