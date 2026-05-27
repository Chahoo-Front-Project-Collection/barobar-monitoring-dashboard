import type { ReplayDetail } from "@/entities/replay/model/types";

type ReplayContextPanelProps = {
  replay: ReplayDetail;
};

export function ReplayContextPanel({ replay }: ReplayContextPanelProps) {
  return (
    <aside className="grid gap-4">
      <section className="border border-stone-200 bg-white p-4">
        <h2 className="text-base font-semibold text-stone-950">Error summary</h2>
        <dl className="mt-4 grid gap-3 text-sm">
          <Metadata label="Message" value={replay.error.message} />
          <Metadata label="Status" value={String(replay.error.status_code)} />
          <Metadata label="Request" value={replay.error.request_url} />
          <Metadata label="Duration" value={`${Math.round(replay.duration_ms / 1000)}s`} />
        </dl>
      </section>

      <section className="border border-stone-200 bg-white p-4">
        <h2 className="text-base font-semibold text-stone-950">Context</h2>
        <dl className="mt-4 grid gap-3 text-sm">
          <Metadata label="User" value={replay.context.user.user_name} />
          <Metadata label="Company" value={replay.context.company.company_name} />
          <Metadata
            label="Browser"
            value={`${replay.context.client.browser.name} ${replay.context.client.browser.version}`}
          />
          <Metadata
            label="OS"
            value={`${replay.context.client.os.name} ${replay.context.client.os.version}`}
          />
          <Metadata label="Device" value={replay.context.client.device.type} />
        </dl>
      </section>

      <section className="border border-stone-200 bg-white p-4">
        <h2 className="text-base font-semibold text-stone-950">Recent HTTP requests</h2>
        {replay.http_requests.length === 0 ? (
          <p className="mt-3 text-sm text-stone-600">No recent requests recorded.</p>
        ) : (
          <div className="mt-3 grid gap-2">
            {replay.http_requests.map((request, index) => (
              <div className="border border-stone-200 p-3 text-sm" key={`${request.method}-${request.url}-${index}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-stone-950">{request.method}</span>
                  {request.status_code ? (
                    <span className="font-semibold text-red-700">{request.status_code}</span>
                  ) : null}
                </div>
                <p className="mt-1 break-all text-stone-700">{request.url}</p>
                {request.duration_ms ? (
                  <p className="mt-1 text-xs text-stone-500">{request.duration_ms}ms</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </aside>
  );
}

function Metadata({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-stone-500">{label}</dt>
      <dd className="mt-1 break-all font-medium text-stone-900">{value}</dd>
    </div>
  );
}
