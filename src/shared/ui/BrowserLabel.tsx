import { Globe } from "lucide-react";
import chromeLogo from "@/assets/browsers/chrome.svg";
import firefoxLogo from "@/assets/browsers/firefox.svg";
import safariLogo from "@/assets/browsers/safari.svg";

const BROWSER_LOGOS: { match: string; src: string }[] = [
  { match: "firefox", src: firefoxLogo },
  { match: "chrome", src: chromeLogo },
  { match: "safari", src: safariLogo },
];

function browserLogo(name: string) {
  const normalized = name.toLowerCase();

  return BROWSER_LOGOS.find((logo) => normalized.includes(logo.match))?.src;
}

type BrowserLabelProps = {
  name: string;
  version?: string;
  className?: string;
};

export function BrowserLabel({ name, version, className }: BrowserLabelProps) {
  const label = [name, version].filter(Boolean).join(" ");

  if (!label) {
    return <span className={className}>—</span>;
  }

  const logo = browserLogo(name);

  return (
    <span
      className={["inline-flex items-center gap-1.5", className || ""].filter(Boolean).join(" ")}
    >
      {logo ? (
        <img aria-hidden="true" alt="" className="size-4 shrink-0 object-contain" src={logo} />
      ) : (
        <Globe aria-hidden="true" className="size-4 shrink-0 text-text-subtle" />
      )}
      <span>{label}</span>
    </span>
  );
}
