import { Link } from "react-router";

import type { ErrorGroup, ErrorGroupsResponse } from "@/entities/error";

type ErrorListTableProps = {
  data: ErrorGroupsResponse;
  onPageChange: (page: number) => void;
};

export function ErrorListTable({ data, onPageChange }: ErrorListTableProps) {
  const { items, pagination } = data;
  const pageCount = Math.max(1, Math.ceil(pagination.total / pagination.page_size));

  if (items.length === 0) {
    return (
      <div className="border border-stone-200 bg-white p-8 text-center text-sm text-stone-600">
        No errors match the current filters.
      </div>
    );
  }

  return (
    <section className="overflow-hidden border border-stone-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-stone-100 text-xs font-semibold uppercase text-stone-600">
            <tr>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Request URL</th>
              <th className="px-4 py-3">Count</th>
              <th className="px-4 py-3">Last seen</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <ErrorRow item={item} key={item.id} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 px-4 py-3 text-sm">
        <p className="font-medium text-stone-700">
          Page {pagination.page} of {pageCount}
        </p>
        <div className="flex gap-2">
          <button
            className="border border-stone-300 px-3 py-2 font-medium text-stone-700 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
            type="button"
          >
            Previous
          </button>
          <button
            className="border border-stone-300 px-3 py-2 font-medium text-stone-700 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={pagination.page >= pageCount}
            onClick={() => onPageChange(pagination.page + 1)}
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

function ErrorRow({ item }: { item: ErrorGroup }) {
  return (
    <tr className="border-t border-stone-200">
      <td className="max-w-[28rem] px-4 py-3 font-medium text-stone-950">
        <Link
          className="underline decoration-stone-300 underline-offset-4"
          to={`/dashboard/errors/${item.id}`}
        >
          {item.message}
        </Link>
      </td>
      <td className="px-4 py-3 text-red-700">{item.status_code}</td>
      <td className="px-4 py-3 text-stone-700">{item.request_url}</td>
      <td className="px-4 py-3 text-stone-700">{item.occurrence_count}</td>
      <td className="px-4 py-3 text-stone-700">{formatDateTime(item.last_seen_at)}</td>
    </tr>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
