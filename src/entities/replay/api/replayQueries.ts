import { queryOptions, useQuery } from "@tanstack/react-query";

import type { ReplayDetail, ReplayHttpRequest } from "@/entities/replay";
import { requestJson, type RequestJsonOptions } from "@/shared/api";

export const replayQueryKeys = {
  all: ["replays"] as const,
  detail: (replayId: string) => [...replayQueryKeys.all, "detail", replayId] as const,
};

export async function fetchReplayDetail(replayId: string, options?: RequestJsonOptions) {
  const response = await requestJson<unknown>(
    `/api/admin/replays/${encodeURIComponent(replayId)}`,
    options,
  );

  return normalizeReplayDetail(response);
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

function normalizeReplayDetail(response: unknown): ReplayDetail {
  const record = readRecord(response);
  const payload = readRecord(record.payload);
  const error = readRecord(record.error);
  const errorEvent = readRecord(record.errorEvent);
  const context = readRecord(record.context);
  const contextUser = readRecord(context.user);
  const contextCompany = readRecord(context.company);
  const contextClient = readRecord(context.client);
  const contextBrowser = readRecord(contextClient.browser);
  const contextOs = readRecord(contextClient.os);
  const contextDevice = readRecord(contextClient.device);
  const payloadUser = readRecord(payload.user);
  const payloadCompany = readRecord(payload.company);
  const payloadClient = readRecord(payload.client);
  const payloadBrowser = readRecord(payloadClient.browser);
  const payloadOs = readRecord(payloadClient.os);
  const payloadDevice = readRecord(payloadClient.device);

  return {
    id: readString(record, ["id"]),
    tenant_id: readString(record, ["tenant_id", "tenantId"]),
    error_event_id:
      readString(record, ["error_event_id", "errorEventId"]) || readString(errorEvent, ["id"]),
    duration_ms: readNumber(record, ["duration_ms", "durationMs"]),
    created_at: readString(record, ["created_at", "createdAt"]),
    error: {
      message: readString(error, ["message"]) || readString(errorEvent, ["message"]),
      status_code:
        readNumber(error, ["status_code", "statusCode"]) ||
        readNumber(errorEvent, ["status_code", "statusCode"]),
      request_url:
        readString(error, ["request_url", "requestUrl"]) ||
        readString(errorEvent, ["request_url", "requestUrl"]),
    },
    context: {
      user: {
        user_id:
          readString(contextUser, ["user_id", "userId"]) ||
          readString(payloadUser, ["user_id", "userId"]) ||
          readString(errorEvent, ["user_id", "userId"]),
        user_name:
          readString(contextUser, ["user_name", "userName"]) ||
          readString(payloadUser, ["user_name", "userName"]) ||
          readString(errorEvent, ["user_name", "userName"]),
      },
      company: {
        company_id:
          readString(contextCompany, ["company_id", "companyId"]) ||
          readString(payloadCompany, ["company_id", "companyId"]) ||
          readString(errorEvent, ["company_id", "companyId"]),
        company_name:
          readString(contextCompany, ["company_name", "companyName"]) ||
          readString(payloadCompany, ["company_name", "companyName"]) ||
          readString(errorEvent, ["company_name", "companyName"]),
      },
      client: {
        browser: {
          name:
            readString(contextBrowser, ["name"]) ||
            readString(payloadBrowser, ["name"]) ||
            readString(errorEvent, ["browser_name", "browserName"]),
          version:
            readString(contextBrowser, ["version"]) ||
            readString(payloadBrowser, ["version"]) ||
            readString(errorEvent, ["browser_version", "browserVersion"]),
          user_agent:
            readString(contextBrowser, ["user_agent", "userAgent"]) ||
            readString(payloadBrowser, ["user_agent", "userAgent"]) ||
            readString(errorEvent, ["user_agent", "userAgent"]),
        },
        os: {
          name:
            readString(contextOs, ["name"]) ||
            readString(payloadOs, ["name"]) ||
            readString(errorEvent, ["os_name", "osName"]),
          version:
            readString(contextOs, ["version"]) ||
            readString(payloadOs, ["version"]) ||
            readString(errorEvent, ["os_version", "osVersion"]),
        },
        device: {
          type:
            readString(contextDevice, ["type"]) ||
            readString(payloadDevice, ["type"]) ||
            readString(errorEvent, ["device_type", "deviceType"]),
        },
      },
    },
    http_requests: readArray(record.http_requests, record.httpRequests, payload.http_requests).map(
      normalizeHttpRequest,
    ),
    events: readArray(record.events, payload.events),
  };
}

function normalizeHttpRequest(value: unknown): ReplayHttpRequest {
  const record = readRecord(value);

  return {
    method: readString(record, ["method"]),
    url: readString(record, ["url"]),
    status_code: readOptionalNumber(record, ["status_code", "statusCode"]),
    started_at: readString(record, ["started_at", "startedAt"]),
    duration_ms: readOptionalNumber(record, ["duration_ms", "durationMs"]),
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
  return readOptionalNumber(record, keys) ?? 0;
}

function readOptionalNumber(record: Record<string, unknown>, keys: string[]) {
  const value = readValue(record, keys);

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function readValue(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) {
      return record[key];
    }
  }

  return undefined;
}
