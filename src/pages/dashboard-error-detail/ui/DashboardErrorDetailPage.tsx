import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";

import type { ErrorEvent } from "@/entities/error";
import { useErrorDetail } from "@/entities/error";
import { useReplayDetail } from "@/entities/replay";
import { ErrorDetailPanel } from "@/widgets/error-detail-panel";
import { ReplayContextPanel } from "@/widgets/replay-context-panel";
import { ReplayPlayerPanel } from "@/widgets/replay-player-panel";

export function DashboardErrorDetailPage() {
  const { errorId = "" } = useParams();

  return <DashboardErrorDetailContent errorId={errorId} key={errorId} />;
}

function DashboardErrorDetailContent({ errorId }: { errorId: string }) {
  const query = useErrorDetail(errorId);
  const latestReplayEvent = useMemo(
    () => (query.data ? getLatestReplayEvent(query.data.events) : null),
    [query.data],
  );
  const [selectedReplayId, setSelectedReplayId] = useState<string>("");
  const activeReplayId = selectedReplayId || latestReplayEvent?.replay_id || "";

  return (
    <section className="grid gap-5">
      <div>
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-stone-950"
          to="/dashboard/errors"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to errors
        </Link>
      </div>

      {query.isPending ? (
        <div className="border border-stone-200 bg-white p-8 text-sm text-stone-600">
          Loading error detail...
        </div>
      ) : query.isError ? (
        <div className="flex items-start justify-between gap-4 border border-red-200 bg-red-50 p-4">
          <div className="flex gap-3">
            <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 text-red-700" />
            <div>
              <p className="font-semibold text-red-950">Failed to load error detail</p>
              <p className="mt-1 text-sm text-red-800">{query.error.message}</p>
            </div>
          </div>
          <button
            className="inline-flex items-center gap-2 border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-900"
            onClick={() => void query.refetch()}
            type="button"
          >
            <RefreshCw aria-hidden="true" className="size-4" />
            Retry
          </button>
        </div>
      ) : (
        <ErrorDetailPanel
          error={query.data}
          onSelectReplayId={setSelectedReplayId}
          selectedReplayId={selectedReplayId}
          replaySection={
            activeReplayId ? (
              <ReplaySection
                replayId={activeReplayId}
                title={
                  activeReplayId === latestReplayEvent?.replay_id
                    ? "Latest replay"
                    : "Selected replay"
                }
              />
            ) : null
          }
        />
      )}
    </section>
  );
}

function ReplaySection({ replayId, title }: { replayId: string; title: string }) {
  const query = useReplayDetail(replayId);

  return (
    <section className="overflow-hidden border border-stone-200 bg-white">
      <div className="border-b border-stone-200 px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase text-red-700">Session replay</p>
            <h2 className="mt-1 text-base font-semibold text-stone-950">{title}</h2>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-stone-500">Replay ID</p>
            <p className="mt-1 break-all font-mono text-sm text-stone-900">{replayId}</p>
          </div>
        </div>
      </div>

      {query.isPending ? (
        <div className="p-4 text-sm text-stone-600">Loading latest replay...</div>
      ) : query.isError ? (
        <div className="p-4 text-sm text-red-800">
          Failed to load latest replay: {query.error.message}
        </div>
      ) : (
        <div
          className="grid gap-5 py-4 pl-4 pr-2 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-stretch"
          style={{ height: "632px" }}
        >
          <div className="min-w-0">
            <ReplayPlayerPanel events={query.data.events} />
          </div>
          <ReplayContextPanel className="h-full min-h-0" replay={query.data} />
        </div>
      )}
    </section>
  );
}

function getLatestReplayEvent(events: ErrorEvent[]) {
  let latestEvent: ErrorEvent | null = null;
  let latestTimestamp = -Infinity;

  for (const event of events) {
    if (!event.replay_id) {
      continue;
    }

    const timestamp = Date.parse(event.occurred_at);

    if (Number.isNaN(timestamp)) {
      if (!latestEvent) {
        latestEvent = event;
      }
      continue;
    }

    if (timestamp >= latestTimestamp) {
      latestEvent = event;
      latestTimestamp = timestamp;
    }
  }

  return latestEvent;
}
