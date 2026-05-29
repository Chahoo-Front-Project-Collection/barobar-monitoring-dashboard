import { useNavigate } from "react-router";

import type { ErrorGroupsResponse } from "@/entities/error";

type ErrorListTableProps = {
  data: ErrorGroupsResponse;
  onPageChange: (page: number) => void;
};

export function ErrorListTable({ data, onPageChange }: ErrorListTableProps) {
  const navigate = useNavigate();

  const { items, pagination } = data;
  const pageCount = Math.max(1, Math.ceil(pagination.total / pagination.page_size));

  if (items.length === 0) {
    return (
      <div className="border border-subtle bg-surface p-8 text-center text-sm text-text-muted">
        No errors match the current filters.
      </div>
    );
  }

  return (
    <section className="overflow-hidden border border-subtle bg-surface">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-slate-200/50 text-xs font-semibold uppercase text-text-muted">
            <tr>
              <th className="px-4 py-3">에러 메시지</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3">Request URL</th>
              <th className="px-4 py-3 text-center">Replay 수</th>
              <th className="px-4 py-3 text-center">버전</th>
              <th className="px-4 py-3 text-center">환경</th>
              <th className="px-4 py-3">마지막 발생 시간</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr
                className="border-t border-subtle cursor-pointer hover:bg-slate-50"
                onClick={() => {
                  navigate(`/dashboard/errors/${item.id}`);
                }}
              >
                <td className="max-w-md px-4 py-3 font-medium text-text">{item.message}</td>
                <td className="px-4 py-3 text-danger text-center">{item.status_code}</td>
                <td className="px-4 py-3 text-text-muted">{item.request_url}</td>
                <td className="px-4 py-3 text-text-muted text-center">{item.occurrence_count}</td>
                <td className="px-4 py-3 text-text-muted text-center">{item.version}</td>
                <td className="px-4 py-3 text-text-muted text-center">
                  {item.environment.slice(0, 3)}
                </td>
                <td className="px-4 py-3 text-text-muted">{formatDateTime(item.last_seen_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-subtle px-4 py-3 text-sm">
        <p className="font-medium text-text-muted">
          Page {pagination.page} of {pageCount}
        </p>
        <div className="flex gap-2">
          <button
            className="border border-strong px-3 py-2 font-medium text-text-muted disabled:cursor-not-allowed disabled:opacity-40"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
            type="button"
          >
            Previous
          </button>
          <button
            className="border border-strong px-3 py-2 font-medium text-text-muted disabled:cursor-not-allowed disabled:opacity-40"
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

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const hours24 = date.getHours();
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = String(hours24 % 12 || 12).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}.${month}.${day} ${hours12}:${minutes}:${seconds} ${period}`;
}
