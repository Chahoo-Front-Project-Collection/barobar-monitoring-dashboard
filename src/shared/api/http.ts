import { API_URL } from "@/shared/config";

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export type Fetcher = typeof fetch;

export type RequestJsonOptions = {
  baseUrl?: string;
  body?: unknown;
  fetcher?: Fetcher;
  method?: "GET" | "POST";
  params?: QueryParams;
};

export class ApiError extends Error {
  readonly status: number;
  readonly statusText: string;

  constructor(message: string, status: number, statusText: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
  }
}

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T | null;
};

export function buildAdminApiUrl(path: string, params: QueryParams = {}, baseUrl = API_URL) {
  const url = new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

export async function requestJson<T>(
  path: string,
  { baseUrl, body: requestBody, fetcher = fetch, method = "GET", params }: RequestJsonOptions = {},
): Promise<T> {
  const headers: HeadersInit = { Accept: "application/json" };
  const requestInit: RequestInit = {
    credentials: "include",
    headers,
    method,
  };

  if (requestBody !== undefined) {
    headers["Content-Type"] = "application/json";
    requestInit.body = JSON.stringify(requestBody);
  }

  const response = await fetcher(buildAdminApiUrl(path, params, baseUrl), requestInit);
  const responseBody = await readJsonBody(response);

  if (!isApiEnvelope<T>(responseBody)) {
    throw new ApiError("Unexpected API response format", response.status, response.statusText);
  }

  if (!response.ok || !responseBody.success) {
    throw new ApiError(responseBody.message, response.status, response.statusText);
  }

  return responseBody.data as T;
}

async function readJsonBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("Content-Type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => undefined);
  }

  return undefined;
}

function isApiEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.success === "boolean" &&
    typeof candidate.message === "string" &&
    "data" in candidate
  );
}
