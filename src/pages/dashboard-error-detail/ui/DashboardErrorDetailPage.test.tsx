import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";

import { DashboardErrorDetailPage } from "@/pages/dashboard-error-detail";
import { createErrorDetailFixture, createReplayDetailFixture } from "@/shared/testing";

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

test("renders error metadata and occurrence events", async () => {
  const fetcher = vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(
      jsonResponse(
        apiSuccess(
          createErrorDetailFixture({
            events: [
              {
                id: "event_old",
                session_id: "1716790000000-old",
                user_id: "u_old",
                user_name: "홍길동",
                company_id: "c_001",
                company_name: "고객사A",
                browser_name: "Chrome",
                browser_version: "124.0.0.0",
                os_name: "macOS",
                os_version: "14.4",
                device_type: "Desktop",
                occurred_at: "2026-05-27T09:59:59.000Z",
                replay_id: "replay_old",
              },
              {
                id: "event_new",
                session_id: "1716790000000-new",
                user_id: "u_123",
                user_name: "홍길동",
                company_id: "c_001",
                company_name: "고객사A",
                browser_name: "Chrome",
                browser_version: "125.0.0.0",
                os_name: "macOS",
                os_version: "14.5",
                device_type: "Desktop",
                occurred_at: "2026-05-27T10:00:00.000Z",
                replay_id: "replay_abc123",
              },
            ],
          }),
        ),
      ),
    )
    .mockResolvedValueOnce(jsonResponse(apiSuccess(createReplayDetailFixture())))
    .mockResolvedValueOnce(
      jsonResponse(
        apiSuccess(
          createReplayDetailFixture({
            id: "replay_old",
            error_event_id: "event_old",
          }),
        ),
      ),
    );
  vi.stubGlobal("fetch", fetcher);

  renderPage();

  expect(
    await screen.findByRole("heading", { name: "Request failed with status code 500" }),
  ).toBeVisible();
  expect(screen.getByText("https://service.example.com/orders")).toBeVisible();
  expect(screen.getByText("/api/orders")).toBeVisible();
  expect(screen.getByText("3.2.0")).toBeVisible();
  expect(screen.getByText("production")).toBeVisible();
  expect(screen.getAllByText("홍길동").length).toBeGreaterThan(0);
  expect(screen.getAllByText("고객사A").length).toBeGreaterThan(0);
  expect(screen.getByText("Session replay")).toBeVisible();
  expect(screen.getAllByText("Replay ID").length).toBeGreaterThan(0);
  expect(screen.getAllByText("replay_abc123").length).toBeGreaterThan(0);
  expect(await screen.findByText("Replay 데이터를 찾을 수 없습니다.")).toBeVisible();

  const oldReplayRow = screen.getByRole("button", { name: /replay_old/i });
  await userEvent.setup().click(oldReplayRow);

  expect(await screen.findByText("Session replay")).toBeVisible();
  expect(screen.getAllByText("replay_old").length).toBeGreaterThan(0);

  expect(fetcher).toHaveBeenCalledWith("http://localhost:4000/api/admin/errors/error_abc123", {
    credentials: "include",
    headers: { Accept: "application/json" },
    method: "GET",
  });
  expect(fetcher).toHaveBeenLastCalledWith("http://localhost:4000/api/admin/replays/replay_old", {
    credentials: "include",
    headers: { Accept: "application/json" },
    method: "GET",
  });
});

test("renders retry and back actions when detail loading fails", async () => {
  const user = userEvent.setup();
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => jsonResponse(apiFailure("Error group not found"), 404)),
  );

  const { router } = renderPage();

  expect(await screen.findByText("Error group not found")).toBeVisible();
  expect(screen.getByRole("button", { name: "Retry" })).toBeEnabled();

  await user.click(screen.getByRole("link", { name: "Back" }));
  expect(router.state.location.pathname).toBe("/dashboard/errors");
});
