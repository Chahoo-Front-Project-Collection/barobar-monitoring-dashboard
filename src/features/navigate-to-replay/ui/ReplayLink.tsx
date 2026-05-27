import { Play } from "lucide-react";
import { Link } from "react-router";

type ReplayLinkProps = {
  replayId: string;
};

export function ReplayLink({ replayId }: ReplayLinkProps) {
  return (
    <Link
      className="inline-flex items-center gap-2 border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-900 hover:border-stone-950"
      to={`/dashboard/replays/${replayId}`}
    >
      <Play aria-hidden="true" className="size-4" />
      Open replay
    </Link>
  );
}
