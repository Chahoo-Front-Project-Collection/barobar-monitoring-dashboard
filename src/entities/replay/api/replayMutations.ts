import { useMutation } from "@tanstack/react-query";

import { requestJson, type RequestJsonOptions } from "@/shared/api";

export type ReplayStorageCleanupEntry = {
  replayId?: string;
  status: "deleted" | "failed" | "missing";
  storageKey: string;
  message?: string;
};

export type DeleteCleanupSummary = {
  status: "complete" | "complete_with_missing_files" | "partial_failed";
  deleted: ReplayStorageCleanupEntry[];
  missing: ReplayStorageCleanupEntry[];
  failed: ReplayStorageCleanupEntry[];
};

export type DeleteReplayResponse = {
  deleted: true;
  id: string;
  cleanup: DeleteCleanupSummary;
};

export function deleteReplay(replayId: string, options?: RequestJsonOptions) {
  return requestJson<DeleteReplayResponse>(`/api/admin/replays/${encodeURIComponent(replayId)}`, {
    ...options,
    method: "DELETE",
  });
}

export function useDeleteReplay() {
  return useMutation({
    mutationFn: (replayId: string) => deleteReplay(replayId),
  });
}
