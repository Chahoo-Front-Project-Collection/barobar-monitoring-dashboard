import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";

import { DashboardReplayDetailPage } from "@/pages/dashboard-replay-detail";
import { createReplayDetailFixture } from "@/shared/testing";

function renderPage(route = "/dashboard/replays/replay_abc123") {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  const router = createMemoryRouter(
    [{ path: "/dashboard/replays/:replayId", element: <DashboardReplayDetailPage /> }],
    { initialEntries: [route] },
  );

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
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

test("renders replay context, missing payload state, and recent HTTP requests", async () => {
  const fetcher = vi.fn<typeof fetch>(async () =>
    jsonResponse(apiSuccess(createReplayDetailFixture())),
  );
  vi.stubGlobal("fetch", fetcher);

  renderPage();

  expect(await screen.findByRole("heading", { name: "Replay replay_abc123" })).toBeVisible();
  expect(await screen.findByText("Replay 데이터를 찾을 수 없습니다.")).toBeVisible();
  expect(screen.getByText("Request failed with status code 500")).toBeVisible();
  expect(screen.getByText("홍길동")).toBeVisible();
  expect(screen.getByText("고객사A")).toBeVisible();
  expect(screen.getByText("Chrome 125.0.0.0")).toBeVisible();
  expect(screen.getByText("macOS 14.5")).toBeVisible();
  expect(screen.getByText("GET")).toBeVisible();
  expect(screen.getAllByText("/api/orders")).toHaveLength(2);

  expect(fetcher).toHaveBeenCalledWith("http://localhost:4000/api/admin/replays/replay_abc123", {
    headers: { Accept: "application/json" },
  });
});

test("renders retry action when replay loading fails", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => jsonResponse(apiFailure("Replay not found"), 404)),
  );

  renderPage();

  expect(await screen.findByText("Replay not found")).toBeVisible();
  expect(screen.getByRole("button", { name: "Retry" })).toBeEnabled();
});
