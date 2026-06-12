import { Navigate, createBrowserRouter } from "react-router";

import { App } from "@/app/App";
import { RequireAdminSession } from "@/features/admin-auth";
import { DashboardErrorDetailPage } from "@/pages/dashboard-error-detail";
import { DashboardErrorsPage } from "@/pages/dashboard-errors";
import { LoginPage } from "@/pages/login";
import routes from "./routes";

export const router = createBrowserRouter([
  {
    path: routes.LOGIN.path,
    element: <LoginPage />,
  },
  {
    element: (
      <RequireAdminSession>
        <App />
      </RequireAdminSession>
    ),
    children: [
      {
        index: true,
        element: <Navigate to={routes.ERRORS.path} replace />,
      },
      {
        path: routes.ERRORS.path,
        element: <DashboardErrorsPage />,
      },
      {
        path: routes.ERROR_DETAIL.path,
        element: <DashboardErrorDetailPage />,
      },
    ],
  },
]);
