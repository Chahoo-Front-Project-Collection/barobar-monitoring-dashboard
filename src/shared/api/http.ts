import { MONITORING_API_BASE_URL } from "@/shared/config";

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export type Fetcher = typeof fetch;

export type RequestJsonOptions = {
  baseUrl?: string;
  fetcher?: Fetcher;
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

export function buildAdminApiUrl(
  path: string,
  params: QueryParams = {},
  baseUrl = MONITORING_API_BASE_URL,
) {
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
  { baseUrl, fetcher = fetch, params }: RequestJsonOptions = {},
): Promise<T> {
  const response = await fetcher(buildAdminApiUrl(path, params, baseUrl), {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status, response.statusText);
  }

  return response.json() as Promise<T>;
}

async function readErrorMessage(response: Response) {
  const contentType = response.headers.get("Content-Type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await response.json().catch(() => undefined)) as
      | { message?: unknown }
      | undefined;

    if (typeof body?.message === "string" && body.message.length > 0) {
      return body.message;
    }
  }

  const text = await response.text().catch(() => "");
  return text.length > 0 ? text : response.statusText;
}
