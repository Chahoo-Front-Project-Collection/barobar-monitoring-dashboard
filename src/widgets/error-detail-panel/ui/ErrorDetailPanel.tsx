import { ChartNoAxesGantt } from "lucide-react";
import type { ReactNode } from "react";
import type { ErrorDetail } from "@/entities/error";
import { CompanyBadge } from "@/shared/ui";

type ErrorDetailPanelProps = {
  error: ErrorDetail;
  replaySection?: ReactNode;
  selectedReplayId: string;
  onSelectReplayId: (replayId: string) => void;
};

const TH_CLASS = "px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-subtle";
const TD_CLASS = "px-5 py-3.5 align-middle";

export function ErrorDetailPanel({
  error,
  replaySection,
  selectedReplayId,
  onSelectReplayId,
}: ErrorDetailPanelProps) {
  const tableHeadings = [
    { label: "Occurred", key: "occurred_at" },
    { label: "User", key: "user_name" },
    { label: "Company", key: "company_name" },
    { label: "Browser", key: "browser_name" },
    { label: "OS", key: "os_name" },
    { label: "Device", key: "device_type" },
    { label: "Replay ID", key: "replay_id" },
  ];

  return (
    <div className="grid gap-5">
      <section className="rounded-xl border border-subtle bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums ${statusBadgeClass(error.status_code)}`}
            >
              HTTP {error.status_code}
            </span>
            <h1 className="mt-3 break-all text-2xl font-bold text-text">{error.message}</h1>
          </div>
          <div className="flex shrink-0 items-start gap-6">
            <Metadata label="Version" value={error.version} />
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
                Environment
              </dt>
              <dd className="mt-1.5">
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${envBadgeClass(error.environment)}`}
                >
                  {error.environment}
                </span>
              </dd>
            </div>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 rounded-lg border border-subtle bg-surface-muted p-4 md:grid-cols-2">
          <Metadata label="Page URL" value={error.page_url} />
          <Metadata label="Request URL" value={error.request_url} />
          <Metadata label="Tenant" value={error.tenant_id} />
          <Metadata label="Occurrences" value={String(error.occurrence_count)} />
        </dl>

        <div className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-subtle">
            Stack trace
          </p>
          <pre className="max-h-64 overflow-auto rounded-lg bg-surface-strong p-4 font-mono text-xs leading-6 text-white">
            {error.stack}
          </pre>
        </div>
      </section>

      {replaySection}

      <section className="overflow-hidden rounded-xl border border-subtle bg-surface">
        <div className="flex items-center gap-2 border-b border-subtle px-5 py-3.5">
          <ChartNoAxesGantt aria-hidden="true" className="size-5 text-text-muted" />
          <h2 className="text-base font-semibold text-text">Occurrence events</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="border-b border-subtle bg-surface-muted">
              <tr>
                {tableHeadings.map((heading) => (
                  <th className={TH_CLASS} key={heading.key}>
                    {heading.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {error.events.map((event) => {
                const selected = event.replay_id === selectedReplayId;

                return (
                  <tr
                    aria-selected={selected}
                    className={[
                      "border-t border-subtle transition-colors",
                      event.replay_id ? "cursor-pointer hover:bg-surface-muted" : "",
                      selected ? "bg-primary-soft hover:bg-primary-soft" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    key={event.id}
                    onClick={() => {
                      if (event.replay_id) {
                        onSelectReplayId(event.replay_id);
                      }
                    }}
                    onKeyDown={(eventKey) => {
                      if (event.replay_id && (eventKey.key === "Enter" || eventKey.key === " ")) {
                        eventKey.preventDefault();
                        onSelectReplayId(event.replay_id);
                      }
                    }}
                    role={event.replay_id ? "button" : undefined}
                    tabIndex={event.replay_id ? 0 : undefined}
                  >
                    <td className={`${TD_CLASS} whitespace-nowrap text-text-muted`}>
                      {formatDateTime(event.occurred_at)}
                    </td>
                    <td className={`${TD_CLASS} font-medium text-text`}>{event.user_name}</td>
                    <td className={TD_CLASS}>
                      <CompanyBadge companyName={event.company_name} />
                    </td>
                    <td className={`${TD_CLASS} text-text-muted`}>
                      {event.browser_name} {event.browser_version}
                    </td>
                    <td className={`${TD_CLASS} text-text-muted`}>
                      {event.os_name} {event.os_version}
                    </td>
                    <td className={`${TD_CLASS} text-text-muted`}>{event.device_type}</td>
                    <td className={`${TD_CLASS} font-mono text-xs text-text-muted`}>
                      {event.replay_id || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Metadata({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-text-subtle">{label}</dt>
      <dd className="mt-1.5 break-all text-sm font-medium text-text">{value}</dd>
    </div>
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
