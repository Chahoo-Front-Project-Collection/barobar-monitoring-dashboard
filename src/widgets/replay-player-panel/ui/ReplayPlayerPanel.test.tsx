import { render, screen } from "@testing-library/react";

import { ReplayPlayerPanel } from "@/widgets/replay-player-panel/ui/ReplayPlayerPanel";

test("renders a missing replay payload state when events are empty", () => {
  render(<ReplayPlayerPanel events={[]} />);

  expect(screen.getByText("Replay 데이터를 찾을 수 없습니다.")).toBeVisible();
});

test("renders a playback failure state when rrweb-player initialization fails", async () => {
  vi.doMock("rrweb-player", () => ({
    default: class BrokenPlayer {
      constructor() {
        throw new Error("player failed");
      }
    },
  }));

  render(<ReplayPlayerPanel events={[{ type: 4, timestamp: 1_716_790_000_000 }]} />);

  expect(await screen.findByText("Replay 재생 중 오류가 발생했습니다.")).toBeVisible();
  vi.doUnmock("rrweb-player");
});
