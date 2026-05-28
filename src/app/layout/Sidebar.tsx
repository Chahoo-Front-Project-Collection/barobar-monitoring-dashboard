import { AlertTriangle } from "lucide-react";
import { NavLink } from "react-router";
import routes from "../router/routes";

const sidebarNavLinkClassName = ({ isActive }: { isActive: boolean }) =>
  [
    "flex flex-col items-center gap-1 rounded-xl border p-2 text-sm font-medium transition",
    isActive
      ? "border-primary bg-primary-soft text-text"
      : "border-transparent text-text-subtle hover:border-subtle hover:bg-surface-muted hover:text-text",
  ].join(" ");

export function Sidebar() {
  return (
    <aside className="fixed top-16 flex h-[calc(100vh-4rem)] shrink-0 flex-col overflow-y-auto border-r border-subtle bg-surface">
      <nav className="flex-1 p-2" aria-label="Sidebar navigation">
        <NavLink className={sidebarNavLinkClassName} to={routes.ERRORS.path}>
          <span className="flex size-7 items-center justify-center rounded-lg border border-current/20 bg-surface-muted">
            <AlertTriangle aria-hidden="true" className="size-4" />
          </span>
          <span className="hidden md:block text-xs font-medium">{routes.ERRORS.label}</span>
        </NavLink>
      </nav>
    </aside>
  );
}
