import type { ReactNode } from "react";

import type { ErrorDetail } from "@/entities/error";

type ErrorDetailPanelProps = {
  error: ErrorDetail;
  replaySection?: ReactNode;
  selectedReplayId: string;
  onSelectReplayId: (replayId: string) => void;
};

export function ErrorDetailPanel({
  error,
  replaySection,
  selectedReplayId,
  onSelectReplayId,
}: ErrorDetailPanelProps) {
  return (
    <div className="grid gap-5">
      <section className="border border-subtle bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase text-primary">HTTP {error.status_code}</p>
            <h1 className="mt-2 text-2xl font-semibold text-text">{error.message}</h1>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Badge label="Release" value={error.release} />
            <Badge label="Environment" value={error.environment} />
          </div>
        </div>

        <dl className="mt-5 grid gap-4 md:grid-cols-2">
          <Metadata label="Page URL" value={error.page_url} />
          <Metadata label="Request URL" value={error.request_url} />
          <Metadata label="Tenant" value={error.tenant_id} />
          <Metadata label="Occurrences" value={String(error.occurrence_count)} />
        </dl>

        <pre className="mt-5 max-h-64 overflow-auto border border-subtle bg-surface-strong p-4 text-xs leading-6 text-white">
          {error.stack}
        </pre>
      </section>

      {replaySection}

      <section className="overflow-hidden border border-subtle bg-surface">
        <div className="border-b border-subtle px-4 py-3">
          <h2 className="text-base font-semibold text-text">Occurrence events</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-surface-muted text-xs font-semibold uppercase text-text-muted">
              <tr>
                <th className="px-4 py-3">Occurred</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Browser</th>
                <th className="px-4 py-3">OS</th>
                <th className="px-4 py-3">Device</th>
                <th className="px-4 py-3">Replay ID</th>
              </tr>
            </thead>
            <tbody>
              {error.events.map((event) => (
                <tr
                  aria-selected={event.replay_id === selectedReplayId}
                  className={[
                    "border-t border-subtle",
                    event.replay_id ? "cursor-pointer hover:bg-surface-muted" : "",
                    event.replay_id === selectedReplayId ? "bg-surface-muted" : "",
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
                  <td className="px-4 py-3 text-text-muted">{formatDateTime(event.occurred_at)}</td>
                  <td className="px-4 py-3 font-medium text-text">{event.user_name}</td>
                  <td className="px-4 py-3 text-text-muted">{event.company_name}</td>
                  <td className="px-4 py-3 text-text-muted">
                    {event.browser_name} {event.browser_version}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {event.os_name} {event.os_version}
                  </td>
                  <td className="px-4 py-3 text-text-muted">{event.device_type}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">
                    {event.replay_id || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-subtle px-3 py-2">
      <p className="text-xs font-semibold uppercase text-text-subtle">{label}</p>
      <p className="mt-1 text-sm font-semibold text-text">{value}</p>
    </div>
  );
}

function Metadata({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-text-subtle">{label}</dt>
      <dd className="mt-1 break-all text-sm text-text">{value}</dd>
    </div>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
