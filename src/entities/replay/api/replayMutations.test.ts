import { deleteReplay } from "@/entities/replay";

test("deleteReplay calls the Admin replay DELETE endpoint", async () => {
  const fetcher = vi.fn(async () =>
    Response.json({
      success: true,
      message: "OK",
      data: {
        deleted: true,
        id: "replay_abc123",
        cleanup: { status: "complete", deleted: [], missing: [], failed: [] },
      },
    }),
  );

  const result = await deleteReplay("replay_abc123", {
    baseUrl: "http://api.test",
    fetcher,
  });

  expect(fetcher).toHaveBeenCalledWith("http://api.test/api/admin/replays/replay_abc123", {
    credentials: "include",
    headers: { Accept: "application/json" },
    method: "DELETE",
  });
  expect(result.cleanup.status).toBe("complete");
});
