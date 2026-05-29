import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { useNavigate } from "react-router";

import type { ErrorGroupsResponse } from "@/entities/error";

type ErrorListTableProps = {
  data: ErrorGroupsResponse;
  onPageChange: (page: number) => void;
};

const TH_CLASS =
  "px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-subtle text-nowrap";
const TD_CLASS = "px-5 py-3.5 align-middle";

export function ErrorListTable({ data, onPageChange }: ErrorListTableProps) {
  const navigate = useNavigate();

  const { items, pagination } = data;
  const pageCount = Math.max(1, Math.ceil(pagination.total / pagination.page_size));

  if (items.length === 0) {
    return (
      <div className="grid place-items-center gap-3 rounded-xl border border-subtle bg-surface px-6 py-16 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-surface-muted text-text-subtle">
          <Inbox aria-hidden="true" className="size-6" />
        </span>
        <p className="text-sm font-medium text-text-muted">필터에 맞는 항목이 없습니다.</p>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-subtle bg-surface">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="border-b border-subtle bg-surface-muted">
            <tr>
              <th className={TH_CLASS}>에러 메시지</th>
              <th className={`${TH_CLASS} text-center`}>Status</th>
              <th className={TH_CLASS}>Request URL</th>
              <th className={`${TH_CLASS} text-center`}>Replay 수</th>
              <th className={`${TH_CLASS} text-center`}>버전</th>
              <th className={`${TH_CLASS} text-center`}>환경</th>
              <th className={TH_CLASS}>마지막 발생 시간</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="cursor-pointer border-t border-subtle transition-colors first:border-t-0 hover:bg-surface-muted"
                onClick={() => {
                  navigate(`/dashboard/errors/${item.id}`);
                }}
              >
                <td className={`${TD_CLASS} font-medium text-text`}>
                  <span className="block max-w-88 truncate" title={item.message}>
                    {item.message}
                  </span>
                </td>
                <td className={`${TD_CLASS} text-center`}>
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums ${statusBadgeClass(item.status_code)}`}
                  >
                    {item.status_code}
                  </span>
                </td>
                <td className={`${TD_CLASS} text-text-muted`}>
                  <span className="block max-w-[18rem] truncate" title={item.request_url}>
                    {item.request_url}
                  </span>
                </td>
                <td className={`${TD_CLASS} text-center tabular-nums text-text-muted`}>
                  {item.occurrence_count}
                </td>
                <td className={`${TD_CLASS} text-center tabular-nums text-text-muted`}>
                  {item.version}
                </td>
                <td className={`${TD_CLASS} text-center`}>
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${envBadgeClass(item.environment)}`}
                  >
                    {item.environment}
                  </span>
                </td>
                <td className={`${TD_CLASS} whitespace-nowrap text-text-subtle`}>
                  {formatDateTime(item.last_seen_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-subtle px-5 py-3.5 text-sm">
        <p className="font-medium text-text-muted">
          Page {pagination.page} / {pageCount}
        </p>
        <div className="flex gap-2">
          <button
            className="inline-flex items-center gap-1 rounded-lg border border-subtle px-3 py-2 font-medium text-text-muted transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
            type="button"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
            이전
          </button>
          <button
            className="inline-flex items-center gap-1 rounded-lg border border-subtle px-3 py-2 font-medium text-text-muted transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            disabled={pagination.page >= pageCount}
            onClick={() => onPageChange(pagination.page + 1)}
            type="button"
          >
            다음
            <ChevronRight aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

function statusBadgeClass(code: number) {
  if (code >= 500) {
    return "bg-danger-soft text-danger-strong";
  }
  if (code >= 400) {
    return "bg-warning-soft text-warning";
  }
  return "bg-surface-muted text-text-muted";
}

function envBadgeClass(environment: string) {
  return environment === "production"
    ? "bg-primary-soft text-primary"
    : "bg-surface-muted text-text-muted";
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
