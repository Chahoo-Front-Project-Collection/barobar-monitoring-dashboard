import { Navigate, createBrowserRouter } from "react-router";

import { App } from "@/app/App";
import { PlaceholderPage } from "@/app/router/PlaceholderPage";

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
        element: <PlaceholderPage title="Error list" />,
      },
      {
        path: "/dashboard/errors/:errorId",
        element: <PlaceholderPage title="Error detail" />,
      },
      {
        path: "/dashboard/replays/:replayId",
        element: <PlaceholderPage title="Replay detail" />,
      },
    ],
  },
]);
