import { fetchErrorDetail, fetchErrorGroups } from "@/entities/error";
import { createErrorDetailFixture, createErrorGroupsFixture } from "@/shared/testing";

test("fetchErrorGroups calls the Admin errors endpoint with filters", async () => {
  const response = createErrorGroupsFixture();
  const fetcher = vi.fn(async () => Response.json(response));

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

test("fetchErrorDetail calls the Admin error detail endpoint", async () => {
  const response = createErrorDetailFixture();
  const fetcher = vi.fn(async () => Response.json(response));

  const result = await fetchErrorDetail("error_abc123", {
    baseUrl: "http://api.test",
    fetcher,
  });

  expect(result).toEqual(response);
  expect(fetcher).toHaveBeenCalledWith("http://api.test/api/admin/errors/error_abc123", {
    headers: { Accept: "application/json" },
  });
});
