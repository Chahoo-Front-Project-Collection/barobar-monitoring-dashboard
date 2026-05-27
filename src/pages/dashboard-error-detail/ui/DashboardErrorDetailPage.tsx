import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { Link, useParams } from "react-router";

import { useErrorDetail } from "@/entities/error";
import { ErrorDetailPanel } from "@/widgets/error-detail-panel";

export function DashboardErrorDetailPage() {
  const { errorId = "" } = useParams();
  const query = useErrorDetail(errorId);

  return (
    <section className="grid gap-5">
      <div>
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-stone-950"
          to="/dashboard/errors"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to errors
        </Link>
      </div>

      {query.isPending ? (
        <div className="border border-stone-200 bg-white p-8 text-sm text-stone-600">
          Loading error detail...
        </div>
      ) : query.isError ? (
        <div className="flex items-start justify-between gap-4 border border-red-200 bg-red-50 p-4">
          <div className="flex gap-3">
            <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 text-red-700" />
            <div>
              <p className="font-semibold text-red-950">Failed to load error detail</p>
              <p className="mt-1 text-sm text-red-800">{query.error.message}</p>
            </div>
          </div>
          <button
            className="inline-flex items-center gap-2 border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-900"
            onClick={() => void query.refetch()}
            type="button"
          >
            <RefreshCw aria-hidden="true" className="size-4" />
            Retry
          </button>
        </div>
      ) : (
        <ErrorDetailPanel error={query.data} />
      )}
    </section>
  );
}
