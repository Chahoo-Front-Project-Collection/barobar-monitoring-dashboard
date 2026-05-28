import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import type { ReactNode } from "react";

import type { ReplayDetail } from "@/entities/replay";

type ReplayContextPanelProps = {
  className?: string;
  replay: ReplayDetail;
};

export function ReplayContextPanel({ className, replay }: ReplayContextPanelProps) {
  return (
    <aside className={["h-full min-h-0", className || ""].filter(Boolean).join(" ")}>
      <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-scroll pr-1">
        <AccordionSection title="Error summary" defaultOpen>
          <dl className="grid gap-3 text-sm">
            <Metadata label="Message" value={replay.error.message} />
            <Metadata label="Status" value={String(replay.error.status_code)} />
            <Metadata label="Request" value={replay.error.request_url} />
            <Metadata label="Duration" value={`${Math.round(replay.duration_ms / 1000)}s`} />
          </dl>
        </AccordionSection>

        <AccordionSection title="Context" defaultOpen>
          <dl className="grid gap-3 text-sm">
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
        </AccordionSection>

        <AccordionSection title="Recent HTTP requests" defaultOpen>
          {replay.http_requests.length === 0 ? (
            <p className="text-sm text-text-muted">No recent requests recorded.</p>
          ) : (
            <div className="grid gap-2">
              {replay.http_requests.map((request, index) => (
                <div
                  className="border border-subtle p-3 text-sm"
                  key={`${request.method}-${request.url}-${index}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-text">{request.method}</span>
                    {request.status_code ? (
                      <span className="font-semibold text-danger">{request.status_code}</span>
                    ) : null}
                  </div>
                  <p className="mt-1 break-all text-text-muted">{request.url}</p>
                  {request.duration_ms ? (
                    <p className="mt-1 text-xs text-text-subtle">{request.duration_ms}ms</p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </AccordionSection>
      </div>
    </aside>
  );
}

function AccordionSection({
  children,
  defaultOpen = false,
  title,
}: {
  children: ReactNode;
  defaultOpen?: boolean;
  title: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <section className="flex min-h-0 shrink-0 flex-col border border-subtle bg-surface">
      <button
        aria-controls={panelId}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <h2 className="text-base font-semibold text-text">{title}</h2>
        <ChevronDown
          aria-hidden="true"
          className={[
            "size-4 shrink-0 text-text-subtle transition-transform duration-200",
            open ? "rotate-180" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </button>
      {open ? (
        <div id={panelId} className="min-h-0 border-t border-subtle px-4 py-4">
          {children}
        </div>
      ) : null}
    </section>
  );
}

function Metadata({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-text-subtle">{label}</dt>
      <dd className="mt-1 break-all font-medium text-text">{value}</dd>
    </div>
  );
}
