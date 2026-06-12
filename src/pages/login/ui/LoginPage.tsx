import { AlertCircle } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import logoIcon from "@/assets/icons/logo.png";
import { useAdminLogin, useAdminMe } from "@/features/admin-auth";

const DASHBOARD_PATH = "/dashboard/errors";
const LOGIN_PATH = "/login";

type LoginLocationState = {
  from?: {
    pathname?: string;
    search?: string;
  };
};

export function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const login = useAdminLogin();
  const session = useAdminMe();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const redirectTo = useMemo(() => readRedirectPath(location.state), [location.state]);

  if (session.isSuccess) {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await login.mutateAsync({ username, password });
      navigate(redirectTo, { replace: true });
    } catch {
      // The mutation state renders the API error message below the password field.
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-5 py-12 text-text">
      <section className="w-full max-w-sm">
        <div className="flex items-center gap-4">
          <div>
            <img src={logoIcon} alt="Barobar Logo" className="h-11 w-10" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">바로바 모니터링</p>
            <h1 className="text-2xl font-bold text-text">관리자 로그인</h1>
          </div>
        </div>

        <form className="mt-8 grid gap-4" onSubmit={(event) => void handleSubmit(event)}>
          <label className="grid gap-2 text-sm font-semibold text-text-muted">
            아이디
            <input
              autoComplete="username"
              className="h-11 rounded-lg border border-subtle bg-surface-muted px-3 text-base font-medium text-text outline-none transition-colors focus:border-primary focus:bg-surface"
              onChange={(event) => setUsername(event.target.value)}
              required
              value={username}
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-text-muted">
            비밀번호
            <input
              autoComplete="current-password"
              className="h-11 rounded-lg border border-subtle bg-surface-muted px-3 text-base font-medium text-text outline-none transition-colors focus:border-primary focus:bg-surface"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {login.isError ? (
            <div className="flex items-start gap-2 rounded-lg border border-danger bg-danger-soft px-3 py-2 text-sm text-danger-strong">
              <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <span>{login.error.message}</span>
            </div>
          ) : null}

          <button
            className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white transition-colors hover:bg-primary-hover disabled:bg-surface-muted disabled:text-text-subtle"
            disabled={login.isPending || username.trim().length === 0 || password.length === 0}
            type="submit"
          >
            {login.isPending ? "로그인 중" : "로그인"}
          </button>
        </form>
      </section>
    </main>
  );
}

function readRedirectPath(state: unknown) {
  const locationState = state as LoginLocationState | null;
  const pathname = locationState?.from?.pathname;
  const search = locationState?.from?.search ?? "";

  return pathname && pathname !== LOGIN_PATH ? `${pathname}${search}` : DASHBOARD_PATH;
}
