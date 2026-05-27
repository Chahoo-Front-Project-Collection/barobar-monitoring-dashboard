import { fetchReplayDetail } from "@/entities/replay/api/replayQueries";
import { createReplayDetailFixture } from "@/shared/testing/fixtures";

test("fetchReplayDetail calls the Admin replay detail endpoint", async () => {
  const response = createReplayDetailFixture();
  const fetcher = vi.fn(async () => Response.json(response));

  const result = await fetchReplayDetail("replay_abc123", {
    baseUrl: "http://api.test",
    fetcher,
  });

  expect(result).toEqual(response);
  expect(fetcher).toHaveBeenCalledWith("http://api.test/api/admin/replays/replay_abc123", {
    headers: { Accept: "application/json" },
  });
});
