import { Activity, ListFilter } from "lucide-react";
import { NavLink, Outlet } from "react-router";

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  [
    "inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition",
    isActive ? "border-primary text-text" : "border-transparent text-text-subtle hover:text-text",
  ].join(" ");

export function App() {
  return (
    <div className="min-h-screen bg-page text-text">
      <header className="border-b border-subtle bg-page">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-4">
            <span className="flex size-9 items-center justify-center border border-strong bg-surface">
              <Activity aria-hidden="true" className="size-5 text-primary" />
            </span>
            <div>
              <p className="text-sm font-semibold leading-none">Barobar Monitoring</p>
              <p className="mt-1 text-xs text-text-subtle">Replay-based frontend errors</p>
            </div>
          </div>
          <nav aria-label="Dashboard navigation">
            <NavLink className={navLinkClassName} to="/dashboard/errors">
              <ListFilter aria-hidden="true" className="size-4" />
              Errors
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
