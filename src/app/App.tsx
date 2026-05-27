import { Activity, ListFilter } from "lucide-react";
import { NavLink, Outlet } from "react-router";

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  [
    "inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition",
    isActive
      ? "border-stone-900 text-stone-950"
      : "border-transparent text-stone-500 hover:text-stone-950",
  ].join(" ");

export function App() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-950">
      <header className="border-b border-stone-200 bg-stone-50/95">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-4">
            <span className="flex size-9 items-center justify-center border border-stone-300 bg-white">
              <Activity aria-hidden="true" className="size-5 text-red-600" />
            </span>
            <div>
              <p className="text-sm font-semibold leading-none">Barobar Monitoring</p>
              <p className="mt-1 text-xs text-stone-500">Replay-based frontend errors</p>
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
