import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";

import { useAdminMe } from "../api/adminAuthApi";

const LOGIN_PATH = "/login";

type RequireAdminSessionProps = {
  children: ReactNode;
};

export function RequireAdminSession({ children }: RequireAdminSessionProps) {
  const location = useLocation();
  const { isError, isPending } = useAdminMe();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page px-6 text-sm font-medium text-text-muted">
        Checking session...
      </div>
    );
  }

  if (isError) {
    return <Navigate to={LOGIN_PATH} replace state={{ from: location }} />;
  }

  return children;
}
