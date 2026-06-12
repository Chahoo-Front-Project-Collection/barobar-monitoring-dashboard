import { LogOut } from "lucide-react";
import { useNavigate } from "react-router";

import logoIcon from "@/assets/icons/logo.png";
import { useAdminLogout } from "@/features/admin-auth";
import routes from "@/app/router/routes";

export function Header() {
  const navigate = useNavigate();
  const logout = useAdminLogout();

  async function handleLogout() {
    await logout.mutateAsync().catch(() => undefined);
    navigate(routes.LOGIN.path, { replace: true });
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-subtle bg-surface px-5">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center">
          <img src={logoIcon} alt="Barobar Logo" className="h-9 w-8" />
        </span>

        <div className="flex flex-col">
          <p className="text-lg font-extrabold leading-none text-primary">바로바 모니터링</p>
          <p className="mt-1 text-xs font-medium text-text-subtle">Replay-based</p>
        </div>
      </div>

      <button
        className="inline-flex h-9 items-center justify-center gap-2 border border-subtle bg-surface px-3 text-xs font-semibold text-text-muted transition-colors hover:bg-surface-muted hover:text-text disabled:text-text-subtle rounded-lg"
        disabled={logout.isPending}
        onClick={() => void handleLogout()}
        type="button"
      >
        <LogOut aria-hidden="true" className="size-3" />
        <span className="text-xs">로그아웃</span>
      </button>
    </header>
  );
}
