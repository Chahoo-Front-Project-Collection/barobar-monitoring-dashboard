import { Navigate, createBrowserRouter } from "react-router";

import { App } from "@/app/App";
import { DashboardErrorDetailPage } from "@/pages/dashboard-error-detail";
import { DashboardErrorsPage } from "@/pages/dashboard-errors";

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard/errors" replace />,
      },
      {
        path: "/dashboard/errors",
        element: <DashboardErrorsPage />,
      },
      {
        path: "/dashboard/errors/:errorId",
        element: <DashboardErrorDetailPage />,
      },
    ],
  },
]);
