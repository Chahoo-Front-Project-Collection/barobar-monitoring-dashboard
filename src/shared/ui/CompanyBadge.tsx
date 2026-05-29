const COMPANY_BADGE_COLORS: Record<string, string> = {
  dw: "bg-amber-50 text-amber-700",
  gs: "bg-green-50 text-green-700",
  xi: "bg-sky-50 text-sky-700",
  wm: "bg-violet-50 text-violet-700",
  hl: "bg-orange-50 text-orange-700",
  hec: "bg-cyan-50 text-cyan-700",
  hdec: "bg-purple-50 text-purple-700",
  jh: "bg-fuchsia-50 text-fuchsia-700",
  kcc: "bg-indigo-50 text-indigo-700",
  sk: "bg-red-50 text-red-700",
  promotion: "bg-teal-50 text-teal-700",
};

const COMPANY_BADGE_FALLBACK = "bg-surface-muted text-text-muted";

// Strips the "barobar_" and dev-server "dev_" prefixes to get the brand key.
function companyBrand(companyName: string) {
  return companyName
    .toLowerCase()
    .replace(/^barobar_/, "")
    .replace(/^dev_/, "");
}

// Display label keeps the dev marker: barobar_dev_gs -> DEV_GS, barobar_gs -> GS.
function companyLabel(companyName: string) {
  return companyName.replace(/^barobar_/, "").toUpperCase();
}

type CompanyBadgeProps = {
  companyName: string;
  className?: string;
};

export function CompanyBadge({ companyName, className }: CompanyBadgeProps) {
  const color = COMPANY_BADGE_COLORS[companyBrand(companyName)] ?? COMPANY_BADGE_FALLBACK;

  return (
    <span
      className={[
        "inline-flex w-fit items-center rounded-md px-2 py-0.5 text-xs font-semibold uppercase",
        color,
        className || "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {companyLabel(companyName)}
    </span>
  );
}
