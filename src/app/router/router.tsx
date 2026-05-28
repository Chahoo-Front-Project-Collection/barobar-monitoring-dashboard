import { Navigate, createBrowserRouter } from "react-router";

import { App } from "@/app/App";
import { DashboardErrorDetailPage } from "@/pages/dashboard-error-detail";
import { DashboardErrorsPage } from "@/pages/dashboard-errors";
import routes from "./routes";

export const router = createBrowserRouter([
  {
    element: <App />,
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
