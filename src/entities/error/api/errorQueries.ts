import { queryOptions, useQuery } from "@tanstack/react-query";

import type {
  ErrorDetail,
  ErrorEvent,
  ErrorGroup,
  ErrorGroupFilters,
  ErrorGroupsResponse,
} from "@/entities/error";
import { requestJson, type RequestJsonOptions } from "@/shared/api";

export const errorQueryKeys = {
  all: ["errors"] as const,
  groups: (filters: ErrorGroupFilters) => [...errorQueryKeys.all, "groups", filters] as const,
  detail: (errorId: string) => [...errorQueryKeys.all, "detail", errorId] as const,
};

export async function fetchErrorGroups(
  filters: ErrorGroupFilters = {},
  options?: RequestJsonOptions,
) {
  const response = await requestJson<unknown>("/api/admin/errors", {
    ...options,
    params: filters,
  });

  return normalizeErrorGroupsResponse(response, filters);
}

export async function fetchErrorDetail(errorId: string, options?: RequestJsonOptions) {
  const response = await requestJson<unknown>(
    `/api/admin/errors/${encodeURIComponent(errorId)}`,
    options,
  );

  return normalizeErrorDetail(response);
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

function normalizeErrorGroupsResponse(
  response: unknown,
  filters: ErrorGroupFilters,
): ErrorGroupsResponse {
  const responseRecord = readRecord(response);
  const rawItems = Array.isArray(responseRecord.items) ? responseRecord.items : [];
  const pagination = readRecord(responseRecord.pagination);
  const page = readNumber(pagination, ["page"]) || filters.page || 1;
  const pageSize =
    readNumber(pagination, ["page_size", "pageSize", "limit"]) || filters.page_size || 20;
  const total = readNumber(pagination, ["total"]) || rawItems.length;
  const totalPages =
    readNumber(pagination, ["total_pages", "totalPages"]) || Math.ceil(total / pageSize);

  return {
    items: rawItems.map(normalizeErrorGroup),
    pagination: {
      page,
      page_size: pageSize,
      total,
      total_pages: totalPages,
    },
  };
}

function normalizeErrorDetail(response: unknown): ErrorDetail {
  const responseRecord = readRecord(response);
  const rawEvents = readArray(responseRecord.events, responseRecord.errorEvents);

  return {
    ...normalizeErrorGroup(responseRecord),
    stack: readString(responseRecord, ["stack"]),
    events: rawEvents.map(normalizeErrorEvent),
  };
}

function normalizeErrorGroup(value: unknown): ErrorGroup {
  const record = readRecord(value);
  const tenant = readRecord(record.tenant);

  return {
    id: readString(record, ["id"]),
    tenant_id: readString(tenant, ["slug"]) || readString(record, ["tenant_id", "tenantId"]),
    message: readString(record, ["message"]),
    page_url: readString(record, ["page_url", "pageUrl"]),
    request_url: readString(record, ["request_url", "requestUrl"]),
    status_code: readNumber(record, ["status_code", "statusCode"]),
    release: readString(record, ["release"]),
    environment: readString(record, ["environment"]),
    occurrence_count: readNumber(record, ["occurrence_count", "occurrenceCount"]),
    first_seen_at: readString(record, ["first_seen_at", "firstSeenAt"]),
    last_seen_at: readString(record, ["last_seen_at", "lastSeenAt"]),
  };
}

function normalizeErrorEvent(value: unknown): ErrorEvent {
  const record = readRecord(value);
  const replay = readRecord(record.replay);

  return {
    id: readString(record, ["id"]),
    session_id: readString(record, ["session_id", "sessionId"]),
    user_id: readString(record, ["user_id", "userId"]),
    user_name: readString(record, ["user_name", "userName"]),
    company_id: readString(record, ["company_id", "companyId"]),
    company_name: readString(record, ["company_name", "companyName"]),
    browser_name: readString(record, ["browser_name", "browserName"]),
    browser_version: readString(record, ["browser_version", "browserVersion"]),
    os_name: readString(record, ["os_name", "osName"]),
    os_version: readString(record, ["os_version", "osVersion"]),
    device_type: readString(record, ["device_type", "deviceType"]),
    occurred_at: readString(record, ["occurred_at", "occurredAt"]),
    replay_id: readString(record, ["replay_id", "replayId"]) || readString(replay, ["id"]),
  };
}

function readRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readArray(...values: unknown[]) {
  return values.find((value): value is unknown[] => Array.isArray(value)) ?? [];
}

function readString(record: Record<string, unknown>, keys: string[]) {
  const value = readValue(record, keys);

  if (typeof value === "string") {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return "";
}

function readNumber(record: Record<string, unknown>, keys: string[]) {
  const value = readValue(record, keys);

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function readValue(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) {
      return record[key];
    }
  }

  return undefined;
}
