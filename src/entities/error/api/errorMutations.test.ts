import { deleteErrorGroup } from "@/entities/error";

test("deleteErrorGroup calls the Admin error DELETE endpoint", async () => {
  const fetcher = vi.fn(async () =>
    Response.json({
      success: true,
      message: "OK",
      data: {
        deleted: true,
        id: "error_abc123",
        cleanup: { status: "complete", deleted: [], missing: [], failed: [] },
      },
    }),
  );

  const result = await deleteErrorGroup("error_abc123", {
    baseUrl: "http://api.test",
    fetcher,
  });

  expect(fetcher).toHaveBeenCalledWith("http://api.test/api/admin/errors/error_abc123", {
    credentials: "include",
    headers: { Accept: "application/json" },
    method: "DELETE",
  });
  expect(result.id).toBe("error_abc123");
});
