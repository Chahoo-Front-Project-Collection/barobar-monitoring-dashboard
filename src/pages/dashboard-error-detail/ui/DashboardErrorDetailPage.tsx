import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, Play, RefreshCw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import type { ErrorDetail, ErrorEvent } from "@/entities/error";
import { errorQueryKeys, useDeleteErrorGroup, useErrorDetail } from "@/entities/error";
import {
  replayQueryKeys,
  type DeleteCleanupSummary,
  useDeleteReplay,
  useReplayDetail,
} from "@/entities/replay";
import { ConfirmDialog } from "@/shared/ui";
import { ErrorDetailPanel } from "@/widgets/error-detail-panel";
import { ReplayContextPanel } from "@/widgets/replay-context-panel";
import { ReplayPlayerPanel } from "@/widgets/replay-player-panel";

export function DashboardErrorDetailPage() {
  const { errorId = "" } = useParams();

  return <DashboardErrorDetailContent errorId={errorId} key={errorId} />;
}

function DashboardErrorDetailContent({ errorId }: { errorId: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const query = useErrorDetail(errorId);
  const deleteErrorGroupMutation = useDeleteErrorGroup();
  const deleteReplayMutation = useDeleteReplay();
  const [confirmState, setConfirmState] = useState<
    { type: "error-group" } | { replayId: string; type: "replay" } | null
  >(null);
  const [deletedReplayIds, setDeletedReplayIds] = useState<Set<string>>(() => new Set());
  const [statusMessage, setStatusMessage] = useState<string>("");
  const visibleError = useMemo(
    () => (query.data ? removeDeletedReplayIds(query.data, deletedReplayIds) : null),
    [deletedReplayIds, query.data],
  );
  const latestReplayEvent = useMemo(
    () => (visibleError ? getLatestReplayEvent(visibleError.events) : null),
    [visibleError],
  );
  const [selectedReplayId, setSelectedReplayId] = useState<string>("");
  const activeReplayId =
    selectedReplayId && !deletedReplayIds.has(selectedReplayId)
      ? selectedReplayId
      : latestReplayEvent?.replay_id || "";

  function handleDeleteReplay(replayId: string) {
    setConfirmState({ type: "replay", replayId });
  }

  function confirmDeleteReplay(replayId: string) {
    deleteReplayMutation.mutate(replayId, {
      onSuccess: (result) => {
        setConfirmState(null);
        setDeletedReplayIds((current) => new Set(current).add(replayId));
        setSelectedReplayId((current) => (current === replayId ? "" : current));
        queryClient.setQueryData<ErrorDetail | undefined>(
          errorQueryKeys.detail(errorId),
          (current) => (current ? removeDeletedReplayIds(current, new Set([replayId])) : current),
        );
        queryClient.removeQueries({ queryKey: replayQueryKeys.detail(replayId) });
        void queryClient.invalidateQueries({ queryKey: errorQueryKeys.detail(errorId) });
        setStatusMessage(getDeleteStatusMessage("Replay", result.cleanup));
      },
      onError: (error) => {
        setConfirmState(null);
        setStatusMessage(`Replay 삭제 실패: ${getErrorMessage(error)}`);
      },
    });
  }

  function handleDeleteErrorGroup() {
    setConfirmState({ type: "error-group" });
  }

  function confirmDeleteErrorGroup() {
    deleteErrorGroupMutation.mutate(errorId, {
      onSuccess: (result) => {
        setConfirmState(null);
        queryClient.removeQueries({ queryKey: errorQueryKeys.detail(errorId) });
        void queryClient.invalidateQueries({ queryKey: errorQueryKeys.all });
        setStatusMessage(getDeleteStatusMessage("Error group", result.cleanup));
        navigate("/dashboard/errors");
      },
      onError: (error) => {
        setConfirmState(null);
        setStatusMessage(`Error group 삭제 실패: ${getErrorMessage(error)}`);
      },
    });
  }

  return (
    <section className="grid gap-5">
      <div className="flex items-center justify-between gap-4">
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-text"
          to="/dashboard/errors"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back
        </Link>
        {visibleError ? (
          <button
            aria-label="Delete error group"
            title="Delete error group"
            className="inline-flex items-center gap-2 rounded-lg border border-danger bg-danger-soft px-3 py-2 text-sm font-semibold text-danger-strong disabled:cursor-not-allowed disabled:opacity-50"
            disabled={deleteErrorGroupMutation.isPending}
            onClick={handleDeleteErrorGroup}
            type="button"
          >
            <Trash2 aria-hidden="true" className="size-4" />
          </button>
        ) : null}
      </div>

      {query.isPending ? (
        <div className="border border-subtle bg-surface p-8 text-sm text-text-muted">
          Loading error detail...
        </div>
      ) : query.isError ? (
        <div className="flex items-start justify-between gap-4 border border-danger bg-danger-soft p-4">
          <div className="flex gap-3">
            <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 text-danger" />
            <div>
              <p className="font-semibold text-danger-strong">Failed to load error detail</p>
              <p className="mt-1 text-sm text-danger">{query.error.message}</p>
            </div>
          </div>
          <button
            className="inline-flex items-center gap-2 border border-danger bg-surface px-3 py-2 text-sm font-semibold text-danger-strong"
            onClick={() => void query.refetch()}
            type="button"
          >
            <RefreshCw aria-hidden="true" className="size-4" />
            Retry
          </button>
        </div>
      ) : visibleError ? (
        <>
          <ErrorDetailPanel
            error={visibleError}
            onSelectReplayId={setSelectedReplayId}
            selectedReplayId={activeReplayId}
            replaySection={
              <>
                {statusMessage ? (
                  <p className="rounded-lg border border-warning-soft bg-warning-soft px-4 py-3 text-sm font-semibold text-warning">
                    {statusMessage}
                  </p>
                ) : null}
                {activeReplayId ? (
                  <ReplaySection
                    isDeleting={deleteReplayMutation.isPending}
                    onDeleteReplay={handleDeleteReplay}
                    replayId={activeReplayId}
                  />
                ) : null}
              </>
            }
          />
          <ConfirmDialog
            confirmLabel="삭제"
            description={getConfirmDescription(confirmState, errorId)}
            isOpen={confirmState !== null}
            isPending={deleteErrorGroupMutation.isPending || deleteReplayMutation.isPending}
            onCancel={() => setConfirmState(null)}
            onConfirm={() => {
              if (confirmState?.type === "replay") {
                confirmDeleteReplay(confirmState.replayId);
                return;
              }
              if (confirmState?.type === "error-group") {
                confirmDeleteErrorGroup();
              }
            }}
            title="정말 삭제할까요?"
          />
        </>
      ) : null}
    </section>
  );
}

function getConfirmDescription(
  confirmState: { type: "error-group" } | { replayId: string; type: "replay" } | null,
  errorId: string,
) {
  if (confirmState?.type === "replay") {
    return `Replay ${confirmState.replayId}를 영구 삭제합니다. 삭제 후 복구할 수 없습니다.`;
  }

  if (confirmState?.type === "error-group") {
    return `Error group ${errorId}와 연결된 이벤트, replay 데이터를 영구 삭제합니다. 삭제 후 복구할 수 없습니다.`;
  }

  return "";
}

function ReplaySection({
  isDeleting,
  onDeleteReplay,
  replayId,
}: {
  isDeleting: boolean;
  onDeleteReplay: (replayId: string) => void;
  replayId: string;
}) {
  const query = useReplayDetail(replayId);

  return (
    <section className="overflow-hidden border border-subtle bg-surface rounded-xl">
      <div className="border-b border-subtle px-4 py-3 h-[65px]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex h-full items-center gap-2">
            <Play className="size-5" />
            <h2 className="text-base font-semibold text-text">Session replay</h2>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-text-subtle">Replay ID</p>
              <p className="mt-1 break-all font-mono text-sm text-text">{replayId}</p>
            </div>
            <button
              aria-label="Delete replay"
              title="Delete replay"
              className="inline-flex items-center gap-2 rounded-lg border border-danger bg-danger-soft px-3 py-2 text-sm font-semibold text-danger-strong disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isDeleting}
              onClick={() => onDeleteReplay(replayId)}
              type="button"
            >
              <Trash2 aria-hidden="true" className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {query.isPending ? (
        <div className="p-4 text-sm text-text-muted" style={{ height: "632px" }}>
          Loading latest replay...
        </div>
      ) : query.isError ? (
        <div className="p-4 text-sm text-danger" style={{ height: "632px" }}>
          Failed to load latest replay: {query.error.message}
        </div>
      ) : (
        <div className="grid min-h-[calc(600px+34rem)] grid-rows-[600px_34rem] items-stretch gap-5 py-4 pl-4 pr-2 lg:h-[632px] lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_34rem] lg:grid-rows-none">
          <div className="min-w-0">
            <ReplayPlayerPanel events={query.data.events} />
          </div>
          <ReplayContextPanel className="h-full min-h-0" replay={query.data} />
        </div>
      )}
    </section>
  );
}

function removeDeletedReplayIds(error: ErrorDetail, deletedReplayIds: Set<string>): ErrorDetail {
  if (deletedReplayIds.size === 0) {
    return error;
  }

  return {
    ...error,
    events: error.events.map((event) =>
      event.replay_id && deletedReplayIds.has(event.replay_id)
        ? { ...event, replay_id: "" }
        : event,
    ),
  };
}

function getDeleteStatusMessage(label: string, cleanup: DeleteCleanupSummary) {
  if (cleanup.status === "partial_failed") {
    return `${label} 삭제는 완료됐지만 일부 replay 파일 정리에 실패했습니다.`;
  }

  if (cleanup.status === "complete_with_missing_files") {
    return `${label} 삭제 완료: 일부 replay 파일은 이미 없었습니다.`;
  }

  return `${label} 삭제가 완료되었습니다.`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
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
