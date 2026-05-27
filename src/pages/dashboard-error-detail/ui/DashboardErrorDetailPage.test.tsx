import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";

import { DashboardErrorDetailPage } from "@/pages/dashboard-error-detail/ui/DashboardErrorDetailPage";
import { createErrorDetailFixture } from "@/shared/testing/fixtures";

function renderPage(route = "/dashboard/errors/error_abc123") {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  const router = createMemoryRouter(
    [
      { path: "/dashboard/errors", element: <div>Errors route</div> },
      { path: "/dashboard/errors/:errorId", element: <DashboardErrorDetailPage /> },
    ],
    { initialEntries: [route] },
  );

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  return { router };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    status,
  });
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

test("renders error metadata and occurrence events", async () => {
  const fetcher = vi.fn<typeof fetch>(async () => jsonResponse(createErrorDetailFixture()));
  vi.stubGlobal("fetch", fetcher);

  renderPage();

  expect(await screen.findByRole("heading", { name: "Request failed with status code 500" })).toBeVisible();
  expect(screen.getByText("https://service.example.com/orders")).toBeVisible();
  expect(screen.getByText("/api/orders")).toBeVisible();
  expect(screen.getByText("local-dev")).toBeVisible();
  expect(screen.getByText("production")).toBeVisible();
  expect(screen.getByText("홍길동")).toBeVisible();
  expect(screen.getByText("고객사A")).toBeVisible();
  expect(screen.getByRole("link", { name: "Open replay" })).toHaveAttribute(
    "href",
    "/dashboard/replays/replay_abc123",
  );

  expect(fetcher).toHaveBeenCalledWith("http://localhost:4000/api/admin/errors/error_abc123", {
    headers: { Accept: "application/json" },
  });
});

test("renders retry and back actions when detail loading fails", async () => {
  const user = userEvent.setup();
  vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ message: "Error group not found" }, 404)));

  const { router } = renderPage();

  expect(await screen.findByText("Error group not found")).toBeVisible();
  expect(screen.getByRole("button", { name: "Retry" })).toBeEnabled();

  await user.click(screen.getByRole("link", { name: "Back to errors" }));
  expect(router.state.location.pathname).toBe("/dashboard/errors");
});
