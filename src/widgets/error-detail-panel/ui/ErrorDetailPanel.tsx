import type { ErrorDetail } from "@/entities/error";
import { ReplayLink } from "@/features/navigate-to-replay";

type ErrorDetailPanelProps = {
  error: ErrorDetail;
};

export function ErrorDetailPanel({ error }: ErrorDetailPanelProps) {
  return (
    <div className="grid gap-5">
      <section className="border border-stone-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase text-red-700">HTTP {error.status_code}</p>
            <h1 className="mt-2 text-2xl font-semibold text-stone-950">{error.message}</h1>
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

        <pre className="mt-5 max-h-64 overflow-auto border border-stone-200 bg-stone-950 p-4 text-xs leading-6 text-stone-100">
          {error.stack}
        </pre>
      </section>

      <section className="overflow-hidden border border-stone-200 bg-white">
        <div className="border-b border-stone-200 px-4 py-3">
          <h2 className="text-base font-semibold text-stone-950">Occurrence events</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-stone-100 text-xs font-semibold uppercase text-stone-600">
              <tr>
                <th className="px-4 py-3">Occurred</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Browser</th>
                <th className="px-4 py-3">OS</th>
                <th className="px-4 py-3">Device</th>
                <th className="px-4 py-3">Replay</th>
              </tr>
            </thead>
            <tbody>
              {error.events.map((event) => (
                <tr className="border-t border-stone-200" key={event.id}>
                  <td className="px-4 py-3 text-stone-700">{formatDateTime(event.occurred_at)}</td>
                  <td className="px-4 py-3 font-medium text-stone-950">{event.user_name}</td>
                  <td className="px-4 py-3 text-stone-700">{event.company_name}</td>
                  <td className="px-4 py-3 text-stone-700">
                    {event.browser_name} {event.browser_version}
                  </td>
                  <td className="px-4 py-3 text-stone-700">
                    {event.os_name} {event.os_version}
                  </td>
                  <td className="px-4 py-3 text-stone-700">{event.device_type}</td>
                  <td className="px-4 py-3">
                    <ReplayLink replayId={event.replay_id} />
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
    <div className="border border-stone-200 px-3 py-2">
      <p className="text-xs font-semibold uppercase text-stone-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-stone-950">{value}</p>
    </div>
  );
}

function Metadata({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-stone-500">{label}</dt>
      <dd className="mt-1 break-all text-sm text-stone-900">{value}</dd>
    </div>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
