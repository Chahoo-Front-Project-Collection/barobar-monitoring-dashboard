import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";

import { DashboardErrorsPage } from "@/pages/dashboard-errors";
import { createErrorGroupsFixture } from "@/shared/testing";

function renderPage(route = "/dashboard/errors") {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  const router = createMemoryRouter(
    [{ path: "/dashboard/errors", element: <DashboardErrorsPage /> }],
    {
      initialEntries: [route],
    },
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

function apiSuccess<T>(data: T, message = "OK") {
  return {
    success: true,
    message,
    data,
  };
}

function apiFailure(message: string) {
  return {
    success: false,
    message,
    data: null,
  };
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

test("renders error groups using filters from the URL query string", async () => {
  const fetcher = vi.fn<typeof fetch>(async () =>
    jsonResponse(
      apiSuccess(
        createErrorGroupsFixture({
          pagination: { page: 2, page_size: 20, total: 41, total_pages: 3 },
        }),
      ),
    ),
  );
  vi.stubGlobal("fetch", fetcher);

  renderPage(
    "/dashboard/errors?tenant_id=demo&environment=production&version=3.2.0&date_from=2026-05-27&date_to=2026-05-28&page=2",
  );

  expect(await screen.findByRole("heading", { name: "Errors" })).toBeInTheDocument();
  expect(screen.getByLabelText("Tenant")).toHaveValue("demo");
  expect(screen.getByLabelText("Environment")).toHaveValue("production");
  expect(screen.getByLabelText("Version")).toHaveValue("3.2.0");
  expect(
    await screen.findByRole("cell", { name: "Request failed with status code 500" }),
  ).toBeVisible();
  expect(screen.getByRole("cell", { name: "/api/orders" })).toBeVisible();
  expect(screen.getByText("Page 2 of 3")).toBeVisible();

  const requestedUrl = new URL(String(fetcher.mock.calls[0][0]));
  expect(requestedUrl.pathname).toBe("/api/admin/errors");
  expect(requestedUrl.searchParams.get("tenant_id")).toBe("demo");
  expect(requestedUrl.searchParams.get("environment")).toBe("production");
  expect(requestedUrl.searchParams.get("version")).toBe("3.2.0");
  expect(requestedUrl.searchParams.get("date_from")).toBe("2026-05-27");
  expect(requestedUrl.searchParams.get("date_to")).toBe("2026-05-28");
  expect(requestedUrl.searchParams.get("page")).toBe("2");
});

test("submits filters back into the route search params", async () => {
  const user = userEvent.setup();
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => jsonResponse(apiSuccess(createErrorGroupsFixture()))),
  );

  const { router } = renderPage("/dashboard/errors");

  await screen.findByRole("cell", { name: "Request failed with status code 500" });
  await user.type(screen.getByLabelText("Tenant"), "demo");
  await user.selectOptions(screen.getByLabelText("Environment"), "production");
  await user.click(screen.getByRole("button", { name: "Apply filters" }));

  await waitFor(() => {
    expect(router.state.location.search).toContain("tenant_id=demo");
    expect(router.state.location.search).toContain("environment=production");
    expect(router.state.location.search).toContain("page=1");
  });
});

test("renders an empty state when no error groups exist", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      jsonResponse(
        apiSuccess(
          createErrorGroupsFixture({
            items: [],
            pagination: { page: 1, page_size: 20, total: 0, total_pages: 0 },
          }),
        ),
      ),
    ),
  );

  renderPage();

  expect(await screen.findByText("No errors match the current filters.")).toBeVisible();
});

test("renders a retry action when error groups fail to load", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => jsonResponse(apiFailure("Database unavailable"), 500)),
  );

  renderPage();

  expect(await screen.findByText("Database unavailable")).toBeVisible();
  expect(screen.getByRole("button", { name: "Retry" })).toBeEnabled();
});
