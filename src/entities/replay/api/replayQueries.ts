import { queryOptions, useQuery } from "@tanstack/react-query";

import type { ReplayDetail } from "@/entities/replay/model/types";
import { requestJson, type RequestJsonOptions } from "@/shared/api/http";

export const replayQueryKeys = {
  all: ["replays"] as const,
  detail: (replayId: string) => [...replayQueryKeys.all, "detail", replayId] as const,
};

export function fetchReplayDetail(replayId: string, options?: RequestJsonOptions) {
  return requestJson<ReplayDetail>(`/api/admin/replays/${encodeURIComponent(replayId)}`, options);
}

export function replayDetailQueryOptions(replayId: string) {
  return queryOptions({
    enabled: replayId.length > 0,
    queryKey: replayQueryKeys.detail(replayId),
    queryFn: () => fetchReplayDetail(replayId),
  });
}

export function useReplayDetail(replayId: string) {
  return useQuery(replayDetailQueryOptions(replayId));
}
