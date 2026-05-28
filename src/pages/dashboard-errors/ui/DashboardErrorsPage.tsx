import { AlertTriangle, RefreshCw } from "lucide-react";
import { useMemo } from "react";
import { useSearchParams } from "react-router";

import { useErrorGroups, type ErrorGroupFilters } from "@/entities/error";
import { ErrorFilters } from "@/features/filter-errors";
import { ErrorListTable } from "@/widgets/error-list-table";

const DEFAULT_PAGE_SIZE = 20;

export function DashboardErrorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const query = useErrorGroups(filters);

  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase text-primary">Frontend errors</p>
          <h1 className="mt-1 text-3xl font-semibold text-text">Errors</h1>
        </div>
      </div>

      <ErrorFilters
        filters={filters}
        onApply={(nextFilters) => setSearchParams(serializeFilters(nextFilters))}
      />

      {query.isPending ? (
        <div className="border border-subtle bg-surface p-8 text-sm text-text-muted">
          Loading errors...
        </div>
      ) : query.isError ? (
        <div className="flex items-start justify-between gap-4 border border-danger bg-danger-soft p-4">
          <div className="flex gap-3">
            <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 text-danger" />
            <div>
              <p className="font-semibold text-danger-strong">Failed to load errors</p>
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
      ) : (
        <ErrorListTable
          data={query.data}
          onPageChange={(page) => setSearchParams(serializeFilters({ ...filters, page }))}
        />
      )}
    </section>
  );
}

function parseFilters(searchParams: URLSearchParams): ErrorGroupFilters {
  return {
    tenant_id: searchParams.get("tenant_id") ?? undefined,
    environment: searchParams.get("environment") ?? undefined,
    release: searchParams.get("release") ?? undefined,
    date_from: searchParams.get("date_from") ?? undefined,
    date_to: searchParams.get("date_to") ?? undefined,
    page: parsePositiveInteger(searchParams.get("page")) ?? 1,
    page_size: parsePositiveInteger(searchParams.get("page_size")) ?? DEFAULT_PAGE_SIZE,
  };
}

function serializeFilters(filters: ErrorGroupFilters) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    params.set(key, String(value));
  }

  return params;
}

function parsePositiveInteger(value: string | null) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}
