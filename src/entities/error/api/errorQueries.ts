import { queryOptions, useQuery } from "@tanstack/react-query";

import type { ErrorDetail, ErrorGroupFilters, ErrorGroupsResponse } from "@/entities/error";
import { requestJson, type RequestJsonOptions } from "@/shared/api";

export const errorQueryKeys = {
  all: ["errors"] as const,
  groups: (filters: ErrorGroupFilters) => [...errorQueryKeys.all, "groups", filters] as const,
  detail: (errorId: string) => [...errorQueryKeys.all, "detail", errorId] as const,
};

export function fetchErrorGroups(filters: ErrorGroupFilters = {}, options?: RequestJsonOptions) {
  return requestJson<ErrorGroupsResponse>("/api/admin/errors", {
    ...options,
    params: filters,
  });
}

export function fetchErrorDetail(errorId: string, options?: RequestJsonOptions) {
  return requestJson<ErrorDetail>(`/api/admin/errors/${encodeURIComponent(errorId)}`, options);
}

export function errorGroupsQueryOptions(filters: ErrorGroupFilters) {
  return queryOptions({
    queryKey: errorQueryKeys.groups(filters),
    queryFn: () => fetchErrorGroups(filters),
  });
}

export function errorDetailQueryOptions(errorId: string) {
  return queryOptions({
    enabled: errorId.length > 0,
    queryKey: errorQueryKeys.detail(errorId),
    queryFn: () => fetchErrorDetail(errorId),
  });
}

export function useErrorGroups(filters: ErrorGroupFilters) {
  return useQuery(errorGroupsQueryOptions(filters));
}

export function useErrorDetail(errorId: string) {
  return useQuery(errorDetailQueryOptions(errorId));
}
