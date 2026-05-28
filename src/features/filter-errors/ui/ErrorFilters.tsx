import type { ErrorGroupFilters } from "@/entities/error";

type ErrorFiltersProps = {
  filters: ErrorGroupFilters;
  onApply: (filters: ErrorGroupFilters) => void;
};

export function ErrorFilters({ filters, onApply }: ErrorFiltersProps) {
  return (
    <form
      className="grid gap-3 border border-subtle bg-surface p-4 md:grid-cols-[repeat(5,minmax(0,1fr))_auto]"
      onSubmit={(event) => {
        event.preventDefault();
        onApply(readFiltersFromForm(event.currentTarget));
      }}
    >
      <label className="grid gap-1 text-sm font-medium text-text-muted">
        Tenant
        <input
          className="h-10 border border-strong px-3 text-text outline-none focus:border-primary"
          defaultValue={filters.tenant_id ?? ""}
          name="tenant_id"
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-text-muted">
        Environment
        <select
          className="h-10 border border-strong bg-surface px-3 text-text outline-none focus:border-primary"
          defaultValue={filters.environment ?? ""}
          name="environment"
        >
          <option value="">All</option>
          <option value="production">Production</option>
          <option value="staging">Staging</option>
          <option value="local">Local</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium text-text-muted">
        Release
        <input
          className="h-10 border border-strong px-3 text-text outline-none focus:border-primary"
          defaultValue={filters.release ?? ""}
          name="release"
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-text-muted">
        From
        <input
          className="h-10 border border-strong px-3 text-text outline-none focus:border-primary"
          defaultValue={filters.date_from ?? ""}
          name="date_from"
          type="date"
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-text-muted">
        To
        <input
          className="h-10 border border-strong px-3 text-text outline-none focus:border-primary"
          defaultValue={filters.date_to ?? ""}
          name="date_to"
          type="date"
        />
      </label>
      <button
        className="h-10 self-end border border-primary bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
        type="submit"
      >
        Apply filters
      </button>
    </form>
  );
}

function readFiltersFromForm(form: HTMLFormElement): ErrorGroupFilters {
  const formData = new FormData(form);

  return {
    tenant_id: readString(formData, "tenant_id"),
    environment: readString(formData, "environment"),
    release: readString(formData, "release"),
    date_from: readString(formData, "date_from"),
    date_to: readString(formData, "date_to"),
    page: 1,
  };
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
