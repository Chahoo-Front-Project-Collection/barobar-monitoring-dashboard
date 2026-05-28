import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";

import { AppProviders } from "@/app/providers/AppProviders";
import { router } from "@/app/router/router";
import { applyTheme } from "@/app/theme/applyTheme";

import "@/app/styles/global.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element was not found.");
}

applyTheme();

createRoot(root).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
