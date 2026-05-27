import { AlertTriangle, RefreshCw } from "lucide-react";
import { useParams } from "react-router";

import { useReplayDetail } from "@/entities/replay/api/replayQueries";
import { ReplayContextPanel } from "@/widgets/replay-context-panel/ui/ReplayContextPanel";
import { ReplayPlayerPanel } from "@/widgets/replay-player-panel/ui/ReplayPlayerPanel";

export function DashboardReplayDetailPage() {
  const { replayId = "" } = useParams();
  const query = useReplayDetail(replayId);

  return (
    <section className="grid gap-5">
      <div>
        <p className="text-sm font-semibold uppercase text-red-700">Session replay</p>
        <h1 className="mt-1 text-3xl font-semibold text-stone-950">Replay {replayId}</h1>
      </div>

      {query.isPending ? (
        <div className="border border-stone-200 bg-white p-8 text-sm text-stone-600">
          Loading replay...
        </div>
      ) : query.isError ? (
        <div className="flex items-start justify-between gap-4 border border-red-200 bg-red-50 p-4">
          <div className="flex gap-3">
            <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 text-red-700" />
            <div>
              <p className="font-semibold text-red-950">Failed to load replay</p>
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
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <ReplayPlayerPanel events={query.data.events} />
          <ReplayContextPanel replay={query.data} />
        </div>
      )}
    </section>
  );
}
