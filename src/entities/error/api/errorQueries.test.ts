import { fetchErrorDetail, fetchErrorGroups } from "@/entities/error";
import { createErrorDetailFixture, createErrorGroupsFixture } from "@/shared/testing";

test("fetchErrorGroups calls the Admin errors endpoint with filters", async () => {
  const response = createErrorGroupsFixture();
  const fetcher = vi.fn(async () => Response.json(apiSuccess(response)));

  const result = await fetchErrorGroups(
    { message: "timeout", environment: "production", page: 2 },
    { baseUrl: "http://api.test", fetcher },
  );

  expect(result).toEqual(response);
  expect(fetcher).toHaveBeenCalledWith(
    "http://api.test/api/admin/errors?message=timeout&environment=production&page=2",
    {
      credentials: "include",
      headers: { Accept: "application/json" },
      method: "GET",
    },
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

  const result = await fetchErrorDetail(
    "error_abc123",
    { events_page: 2, events_page_size: 20 },
    {
      baseUrl: "http://api.test",
      fetcher,
    },
  );

  expect(result).toEqual(response);
  expect(fetcher).toHaveBeenCalledWith(
    "http://api.test/api/admin/errors/error_abc123?events_page=2&events_page_size=20",
    {
      credentials: "include",
      headers: { Accept: "application/json" },
      method: "GET",
    },
  );
});

test("fetchErrorDetail normalizes camelCase event pagination", async () => {
  const fetcher = vi.fn(async () =>
    Response.json(
      apiSuccess({
        ...createErrorDetailFixture({ events_pagination: undefined }),
        eventsPagination: {
          page: 3,
          pageSize: 10,
          total: 45,
          totalPages: 5,
        },
      }),
    ),
  );

  const result = await fetchErrorDetail(
    "error_abc123",
    {},
    { baseUrl: "http://api.test", fetcher },
  );

  expect(result.events_pagination).toEqual({
    page: 3,
    page_size: 10,
    total: 45,
    total_pages: 5,
  });
});

function apiSuccess<T>(data: T) {
  return {
    success: true,
    message: "OK",
    data,
  };
}
