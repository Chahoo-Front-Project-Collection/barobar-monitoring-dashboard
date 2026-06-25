import { useMutation } from "@tanstack/react-query";

import { requestJson, type RequestJsonOptions } from "@/shared/api";

export type DeleteCleanupSummary = {
  status: "complete" | "complete_with_missing_files" | "partial_failed";
  deleted: ReplayStorageCleanupEntry[];
  missing: ReplayStorageCleanupEntry[];
  failed: ReplayStorageCleanupEntry[];
};

export type DeleteErrorGroupResponse = {
  deleted: true;
  id: string;
  cleanup: DeleteCleanupSummary;
};

export type ReplayStorageCleanupEntry = {
  replayId?: string;
  status: "deleted" | "failed" | "missing";
  storageKey: string;
  message?: string;
};

export function deleteErrorGroup(errorId: string, options?: RequestJsonOptions) {
  return requestJson<DeleteErrorGroupResponse>(`/api/admin/errors/${encodeURIComponent(errorId)}`, {
    ...options,
    method: "DELETE",
  });
}

export function useDeleteErrorGroup() {
  return useMutation({
    mutationFn: (errorId: string) => deleteErrorGroup(errorId),
  });
}
