import { AlertTriangle, OctagonAlert } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import rrwebPlayer from "rrweb-player";
import "rrweb-player/dist/style.css";

type ReplayPlayerPanelProps = {
  events?: unknown[];
};

type PlayerInstance = {
  $destroy?: () => void;
  addEventListener?: (event: string, handler: () => void) => void;
  getReplayer?: () => {
    pause: () => void;
  };
};

type ReplayEventState =
  | { status: "empty"; events: unknown[] }
  | { status: "incomplete"; events: unknown[] }
  | { status: "ready"; events: unknown[] };

type ReplayStatusMessage = {
  description?: string;
  title: string;
  tone: "amber" | "red";
};

const EMPTY_REPLAY_EVENTS: unknown[] = [];
const RRWEB_EVENT_TYPE_FULL_SNAPSHOT = 2;
export const REPLAY_PLAYER_HEIGHT = 520;

const REPLAY_STATUS_TONE_CLASS = {
  amber: {
    description: "text-warning",
    icon: AlertTriangle,
    section: "border-warning bg-warning-soft",
    title: "text-warning",
  },
  red: {
    description: "text-danger",
    icon: OctagonAlert,
    section: "border-danger bg-danger-soft",
    title: "text-danger-strong",
  },
} as const;

export function ReplayPlayerPanel({ events }: ReplayPlayerPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [failed, setFailed] = useState(false);
  const replay = useMemo(() => resolveReplayEvents(events), [events]);
  const statusMessage = getReplayStatusMessage(replay, failed);

  useEffect(() => {
    if (replay.status !== "ready" || !containerRef.current) {
      return;
    }

    let disposed = false;
    let player: PlayerInstance | undefined;

    setFailed(false);

    try {
      player = new rrwebPlayer({
        target: containerRef.current,
        props: {
          events: replay.events as never[],
          width: Math.min(containerRef.current.clientWidth || 960, 960),
          height: REPLAY_PLAYER_HEIGHT,
          autoPlay: false,
          showController: true,
          speedOption: [1, 2, 4],

          skipInactive: false,
          useVirtualDom: false,
          loadTimeout: 3000,
        },
      }) as unknown as PlayerInstance;

      player.addEventListener?.("finish", () => {
        player?.getReplayer?.().pause();
      });
    } catch {
      if (!disposed) {
        queueMicrotask(() => {
          if (!disposed) {
            setFailed(true);
          }
        });
      }
    }

    return () => {
      disposed = true;
      player?.$destroy?.();
    };
  }, [replay]);

  if (statusMessage) {
    return <ReplayStatusMessage {...statusMessage} />;
  }

  return (
    <div
      ref={containerRef}
      className="grid h-full min-h-0 place-items-center overflow-hidden bg-surface-muted [&_.rr-controller\\_\\_btns>.switch]:hidden!"
    />
  );
}

function ReplayStatusMessage({ description, title, tone }: ReplayStatusMessage) {
  const toneClass = REPLAY_STATUS_TONE_CLASS[tone];
  const Icon = toneClass.icon;

  return (
    <section
      className={`grid h-full min-h-0 place-items-center rounded-xl border p-8 text-center ${toneClass.section}`}
    >
      <div className="grid justify-items-center gap-3">
        <Icon aria-hidden="true" className={`size-8 ${toneClass.title}`} />
        <div>
          <p className={`text-sm font-semibold ${toneClass.title}`}>{title}</p>
          {description ? (
            <p className={`mt-2 text-xs font-medium ${toneClass.description}`}>{description}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function getReplayStatusMessage(
  replay: ReplayEventState,
  failed: boolean,
): ReplayStatusMessage | null {
  if (replay.status === "empty") {
    return {
      tone: "amber",
      title: "Replay 데이터를 찾을 수 없습니다.",
    };
  }

  if (replay.status === "incomplete") {
    return {
      description: "FullSnapshot 이벤트가 없어 재생할 수 없습니다.",
      tone: "amber",
      title: "Replay 데이터가 불완전합니다.",
    };
  }

  if (failed) {
    return {
      tone: "red",
      title: "Replay 재생 중 오류가 발생했습니다.",
    };
  }

  return null;
}

function resolveReplayEvents(events: unknown[] | undefined): ReplayEventState {
  const replayEvents = Array.isArray(events) ? events : EMPTY_REPLAY_EVENTS;

  const eventTypes: Record<"EMPTY" | "INCOMPLETE" | "READY", ReplayEventState> = {
    EMPTY: { status: "empty", events: EMPTY_REPLAY_EVENTS },
    INCOMPLETE: { status: "incomplete", events: EMPTY_REPLAY_EVENTS },
    READY: { status: "ready", events: replayEvents },
  };

  if (replayEvents.length === 0) {
    return eventTypes.EMPTY;
  }

  const hasFullSnapshot = replayEvents.some(
    (event) => readEventType(event) === RRWEB_EVENT_TYPE_FULL_SNAPSHOT,
  );
  if (!hasFullSnapshot) {
    return eventTypes.INCOMPLETE;
  }

  return eventTypes.READY;
}

function readEventType(event: unknown) {
  if (!event || typeof event !== "object" || Array.isArray(event)) {
    return undefined;
  }

  const value = (event as { type?: unknown }).type;

  return typeof value === "number" ? value : undefined;
}
