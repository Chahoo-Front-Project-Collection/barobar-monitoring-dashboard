import { ApiError, buildAdminApiUrl, requestJson } from "@/shared/api";

test("buildAdminApiUrl joins the base URL, path, and non-empty query params", () => {
  const url = buildAdminApiUrl(
    "/api/admin/errors",
    {
      tenant_id: "demo",
      environment: "",
      version: undefined,
      page: 2,
    },
    "http://localhost:4000/",
  );

  expect(url).toBe("http://localhost:4000/api/admin/errors?tenant_id=demo&page=2");
});

test("requestJson unwraps data from a successful API envelope", async () => {
  const fetcher = vi.fn(async () =>
    Response.json({
      success: true,
      message: "Errors fetched",
      data: { ok: true },
    }),
  );

  const result = await requestJson<{ ok: boolean }>("/api/admin/errors", {
    baseUrl: "http://api.test",
    fetcher,
    params: { page: 1 },
  });

  expect(result).toEqual({ ok: true });
  expect(fetcher).toHaveBeenCalledWith("http://api.test/api/admin/errors?page=1", {
    credentials: "include",
    headers: { Accept: "application/json" },
    method: "GET",
  });
});

test("requestJson sends JSON bodies with credentials", async () => {
  const fetcher = vi.fn(async () =>
    Response.json({
      success: true,
      message: "Logged in",
      data: { username: "admin" },
    }),
  );

  await requestJson("/api/admin/login", {
    baseUrl: "http://api.test",
    body: { username: "admin", password: "secret" },
    fetcher,
    method: "POST",
  });

  expect(fetcher).toHaveBeenCalledWith("http://api.test/api/admin/login", {
    body: JSON.stringify({ username: "admin", password: "secret" }),
    credentials: "include",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    method: "POST",
  });
});

test("requestJson supports DELETE requests", async () => {
  const fetcher = vi.fn(async () =>
    Response.json({
      success: true,
      message: "OK",
      data: { deleted: true },
    }),
  );

  const result = await requestJson<{ deleted: boolean }>("/api/admin/replays/replay_abc123", {
    baseUrl: "http://api.test",
    fetcher,
    method: "DELETE",
  });

  expect(result).toEqual({ deleted: true });
  expect(fetcher).toHaveBeenCalledWith("http://api.test/api/admin/replays/replay_abc123", {
    credentials: "include",
    headers: { Accept: "application/json" },
    method: "DELETE",
  });
});

test("requestJson throws ApiError when an API envelope reports a failure", async () => {
  const fetcher = vi.fn(
    async () =>
      new Response(
        JSON.stringify({
          success: false,
          message: "No replay",
          data: null,
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 404,
          statusText: "Not Found",
        },
      ),
  );

  await expect(
    requestJson("/api/admin/replays/replay_404", {
      baseUrl: "http://api.test",
      fetcher,
    }),
  ).rejects.toMatchObject({
    message: "No replay",
    status: 404,
    statusText: "Not Found",
  } satisfies Partial<ApiError>);
});

test("requestJson throws ApiError instead of returning malformed successful responses", async () => {
  const fetcher = vi.fn(
    async () =>
      new Response(JSON.stringify([{ id: "error_abc123" }]), {
        headers: { "Content-Type": "application/json" },
        status: 200,
        statusText: "OK",
      }),
  );

  await expect(
    requestJson("/api/admin/errors", {
      baseUrl: "http://api.test",
      fetcher,
    }),
  ).rejects.toMatchObject({
    message: "Unexpected API response format",
    status: 200,
    statusText: "OK",
  } satisfies Partial<ApiError>);
});
