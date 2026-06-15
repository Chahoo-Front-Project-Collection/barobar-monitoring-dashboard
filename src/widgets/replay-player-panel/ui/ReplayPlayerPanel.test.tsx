import { render, screen } from "@testing-library/react";

import { ReplayPlayerPanel } from "@/widgets/replay-player-panel";

const { mockRrwebPlayer } = vi.hoisted(() => ({
  mockRrwebPlayer: vi.fn(function MockRrwebPlayer() {
    return { $destroy: vi.fn() };
  }),
}));

vi.mock("rrweb-player", () => ({
  default: mockRrwebPlayer,
}));

beforeEach(() => {
  mockRrwebPlayer.mockClear();
  mockRrwebPlayer.mockImplementation(function MockRrwebPlayer() {
    return { $destroy: vi.fn() };
  });
});

test("renders a missing replay payload state when events are empty", () => {
  render(<ReplayPlayerPanel events={[]} />);

  expect(screen.getByText("Replay 데이터를 찾을 수 없습니다.")).toBeVisible();
  expect(mockRrwebPlayer).not.toHaveBeenCalled();
});

test("renders a playback failure state when rrweb-player initialization fails", async () => {
  mockRrwebPlayer.mockImplementation(function BrokenPlayer() {
    throw new Error("player failed");
  });

  render(<ReplayPlayerPanel events={createPlayableReplayEvents()} />);

  expect(await screen.findByText("Replay 재생 중 오류가 발생했습니다.")).toBeVisible();
});

test("renders an incomplete replay payload state when events do not include a full snapshot", () => {
  render(
    <ReplayPlayerPanel
      events={[
        {
          type: 3,
          data: { source: 0, attributes: [{ id: 467, attributes: { style: "" } }] },
          timestamp: 1_779_865_185_487,
        },
      ]}
    />,
  );

  expect(screen.getByText("Replay 데이터가 불완전합니다.")).toBeVisible();
  expect(mockRrwebPlayer).not.toHaveBeenCalled();
});

test("pauses the replayer on finish so recorded CSS animations stop", () => {
  const addEventListener = vi.fn();
  const pause = vi.fn();

  mockRrwebPlayer.mockImplementation(function MockPlayer() {
    return {
      $destroy: vi.fn(),
      addEventListener,
      getReplayer: () => ({ pause }),
    };
  });

  render(<ReplayPlayerPanel events={createPlayableReplayEvents()} />);

  expect(addEventListener).toHaveBeenCalledWith("finish", expect.any(Function));

  const finishHandler = addEventListener.mock.calls.find(([event]) => event === "finish")?.[1];
  finishHandler();

  expect(pause).toHaveBeenCalled();
});

test("passes the full events array to rrweb-player without trimming events before full snapshot", () => {
  const events = [
    {
      type: 3,
      data: { source: 0 },
      timestamp: 1_716_789_999_999,
    },
    ...createPlayableReplayEvents(),
  ];

  render(<ReplayPlayerPanel events={events} />);

  expect(mockRrwebPlayer).toHaveBeenCalledWith(
    expect.objectContaining({
      props: expect.objectContaining({
        events,
      }),
    }),
  );
});

function createPlayableReplayEvents() {
  return [
    {
      type: 4,
      data: { href: "http://localhost:8080/orders", width: 1280, height: 720 },
      timestamp: 1_716_790_000_000,
    },
    {
      type: 2,
      data: {
        initialOffset: { left: 0, top: 0 },
        node: {
          type: 0,
          childNodes: [],
          id: 1,
        },
      },
      timestamp: 1_716_790_000_001,
    },
  ];
}
