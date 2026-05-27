import { ApiError, buildAdminApiUrl, requestJson } from "@/shared/api/http";

test("buildAdminApiUrl joins the base URL, path, and non-empty query params", () => {
  const url = buildAdminApiUrl("/api/admin/errors", {
    tenant_id: "demo",
    environment: "",
    release: undefined,
    page: 2,
  }, "http://localhost:4000/");

  expect(url).toBe("http://localhost:4000/api/admin/errors?tenant_id=demo&page=2");
});

test("requestJson returns parsed JSON from the configured Admin API", async () => {
  const fetcher = vi.fn(async () => Response.json({ ok: true }));

  const result = await requestJson<{ ok: boolean }>("/api/admin/errors", {
    baseUrl: "http://api.test",
    fetcher,
    params: { page: 1 },
  });

  expect(result).toEqual({ ok: true });
  expect(fetcher).toHaveBeenCalledWith("http://api.test/api/admin/errors?page=1", {
    headers: { Accept: "application/json" },
  });
});

test("requestJson throws ApiError when the server responds with a failure", async () => {
  const fetcher = vi.fn(
    async () =>
      new Response(JSON.stringify({ message: "No replay" }), {
        headers: { "Content-Type": "application/json" },
        status: 404,
        statusText: "Not Found",
      }),
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
