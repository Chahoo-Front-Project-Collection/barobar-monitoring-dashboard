import { fetchReplayDetail } from "@/entities/replay";
import { createReplayDetailFixture } from "@/shared/testing";

test("fetchReplayDetail calls the Admin replay detail endpoint", async () => {
  const response = createReplayDetailFixture();
  const fetcher = vi.fn(async () => Response.json(apiSuccess(response)));

  const result = await fetchReplayDetail("replay_abc123", {
    baseUrl: "http://api.test",
    fetcher,
  });

  expect(result).toEqual(response);
  expect(fetcher).toHaveBeenCalledWith("http://api.test/api/admin/replays/replay_abc123", {
    credentials: "include",
    headers: { Accept: "application/json" },
    method: "GET",
  });
});

test("fetchReplayDetail normalizes camelCase Admin replay payload", async () => {
  const fetcher = vi.fn(async () =>
    Response.json(
      apiSuccess({
        id: "replay_abc123",
        tenantId: "tenant_db_id",
        errorEventId: "event_abc123",
        durationMs: 120000,
        createdAt: "2026-05-27T10:00:01.000Z",
        errorEvent: {
          id: "event_abc123",
          message: "Request failed with status code 500",
          requestUrl: "/api/orders",
          statusCode: 500,
          userId: "u_123",
          userName: "홍길동",
          companyId: "c_001",
          companyName: "고객사A",
          browserName: "Chrome",
          browserVersion: "125.0.0.0",
          osName: "macOS",
          osVersion: "14.5",
          deviceType: "Desktop",
        },
        payload: {
          events: [{ type: 0 }],
          http_requests: [{ method: "GET", url: "/api/orders", status_code: 500 }],
          client: {
            browser: { name: "Chrome", version: "125.0.0.0", user_agent: "Mozilla/5.0" },
            os: { name: "macOS", version: "14.5" },
            device: { type: "Desktop" },
          },
          user: { user_id: "u_123", user_name: "홍길동" },
          company: { company_id: "c_001", company_name: "고객사A" },
        },
      }),
    ),
  );

  const result = await fetchReplayDetail("replay_abc123", {
    baseUrl: "http://api.test",
    fetcher,
  });

  expect(result).toMatchObject({
    id: "replay_abc123",
    tenant_id: "tenant_db_id",
    error_event_id: "event_abc123",
    duration_ms: 120000,
    created_at: "2026-05-27T10:00:01.000Z",
    error: {
      message: "Request failed with status code 500",
      status_code: 500,
      request_url: "/api/orders",
    },
    context: {
      user: { user_id: "u_123", user_name: "홍길동" },
      company: { company_id: "c_001", company_name: "고객사A" },
      client: {
        browser: { name: "Chrome", version: "125.0.0.0", user_agent: "Mozilla/5.0" },
        os: { name: "macOS", version: "14.5" },
        device: { type: "Desktop" },
      },
    },
    http_requests: [{ method: "GET", url: "/api/orders", status_code: 500 }],
    events: [{ type: 0 }],
  });
});

test("prefers the error event over the payload snapshot for context fields", async () => {
  const fetcher = vi.fn(async () =>
    Response.json(
      apiSuccess({
        id: "replay_abc123",
        errorEvent: {
          id: "event_abc123",
          userName: "수정된사용자",
          companyName: "barobar_gs",
          browserName: "Edge",
          osName: "Windows",
          deviceType: "Mobile",
        },
        payload: {
          events: [{ type: 0 }],
          user: { user_name: "원본사용자" },
          company: { company_name: "barobar_dev_ssl" },
          client: {
            browser: { name: "Chrome" },
            os: { name: "macOS" },
            device: { type: "Desktop" },
          },
        },
      }),
    ),
  );

  const result = await fetchReplayDetail("replay_abc123", {
    baseUrl: "http://api.test",
    fetcher,
  });

  expect(result.context).toMatchObject({
    user: { user_name: "수정된사용자" },
    company: { company_name: "barobar_gs" },
    client: {
      browser: { name: "Edge" },
      os: { name: "Windows" },
      device: { type: "Mobile" },
    },
  });
});

function apiSuccess<T>(data: T) {
  return {
    success: true,
    message: "OK",
    data,
  };
}
