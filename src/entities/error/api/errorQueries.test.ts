import { fetchErrorDetail, fetchErrorGroups } from "@/entities/error";
import { createErrorDetailFixture, createErrorGroupsFixture } from "@/shared/testing";

test("fetchErrorGroups calls the Admin errors endpoint with filters", async () => {
  const response = createErrorGroupsFixture();
  const fetcher = vi.fn(async () => Response.json(apiSuccess(response)));

  const result = await fetchErrorGroups(
    { tenant_id: "demo", environment: "production", page: 2 },
    { baseUrl: "http://api.test", fetcher },
  );

  expect(result).toEqual(response);
  expect(fetcher).toHaveBeenCalledWith(
    "http://api.test/api/admin/errors?tenant_id=demo&environment=production&page=2",
    { headers: { Accept: "application/json" } },
  );
});

test("fetchErrorGroups normalizes camelCase Admin error rows", async () => {
  const fetcher = vi.fn(async () =>
    Response.json(
      apiSuccess({
        items: [
          {
            id: "error_abc123",
            tenant: { slug: "demo" },
            message: "Request failed with status code 500",
            pageUrl: "https://service.example.com/orders",
            requestUrl: "/api/orders",
            statusCode: 500,
            version: "3.2.0",
            environment: "production",
            occurrenceCount: 12,
            firstSeenAt: "2026-05-27T09:00:00.000Z",
            lastSeenAt: "2026-05-27T10:00:00.000Z",
          },
        ],
        pagination: {
          total: 1,
          limit: 100,
        },
      }),
    ),
  );

  const result = await fetchErrorGroups({}, { baseUrl: "http://api.test", fetcher });

  expect(result.items[0]).toMatchObject({
    tenant_id: "demo",
    page_url: "https://service.example.com/orders",
    request_url: "/api/orders",
    status_code: 500,
    occurrence_count: 12,
    first_seen_at: "2026-05-27T09:00:00.000Z",
    last_seen_at: "2026-05-27T10:00:00.000Z",
  });
  expect(result.pagination).toEqual({
    page: 1,
    page_size: 100,
    total: 1,
    total_pages: 1,
  });
});

test("fetchErrorDetail calls the Admin error detail endpoint", async () => {
  const response = createErrorDetailFixture();
  const fetcher = vi.fn(async () => Response.json(apiSuccess(response)));

  const result = await fetchErrorDetail("error_abc123", {
    baseUrl: "http://api.test",
    fetcher,
  });

  expect(result).toEqual(response);
  expect(fetcher).toHaveBeenCalledWith("http://api.test/api/admin/errors/error_abc123", {
    headers: { Accept: "application/json" },
  });
});

function apiSuccess<T>(data: T) {
  return {
    success: true,
    message: "OK",
    data,
  };
}
