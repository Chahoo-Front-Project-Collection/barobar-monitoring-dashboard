import { useEffect, useRef, useState } from "react";

import "rrweb-player/dist/style.css";

type ReplayPlayerPanelProps = {
  events: unknown[];
};

type PlayerInstance = {
  $destroy?: () => void;
};

export function ReplayPlayerPanel({ events }: ReplayPlayerPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (events.length === 0 || !containerRef.current) {
      return;
    }

    let disposed = false;
    let player: PlayerInstance | undefined;

    setFailed(false);

    void import("rrweb-player")
      .then(({ default: Player }) => {
        if (disposed || !containerRef.current) {
          return;
        }

        player = new Player({
          target: containerRef.current,
          props: {
            autoPlay: false,
            events: events as never[],
            height: 520,
            showController: true,
            width: Math.min(containerRef.current.clientWidth || 960, 960),
          },
        }) as unknown as PlayerInstance;
      })
      .catch(() => {
        if (!disposed) {
          setFailed(true);
        }
      });

    return () => {
      disposed = true;
      player?.$destroy?.();
    };
  }, [events]);

  if (events.length === 0) {
    return (
      <section className="grid min-h-[360px] place-items-center border border-stone-200 bg-white p-8 text-center">
        <p className="text-sm font-semibold text-stone-700">Replay 데이터를 찾을 수 없습니다.</p>
      </section>
    );
  }

  if (failed) {
    return (
      <section className="grid min-h-[360px] place-items-center border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-sm font-semibold text-red-900">Replay 재생 중 오류가 발생했습니다.</p>
      </section>
    );
  }

  return (
    <section className="border border-stone-200 bg-white p-3">
      <div ref={containerRef} />
    </section>
  );
}
