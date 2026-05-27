import type { ErrorGroupFilters } from "@/entities/error/model/types";

type ErrorFiltersProps = {
  filters: ErrorGroupFilters;
  onApply: (filters: ErrorGroupFilters) => void;
};

export function ErrorFilters({ filters, onApply }: ErrorFiltersProps) {
  return (
    <form
      className="grid gap-3 border border-stone-200 bg-white p-4 md:grid-cols-[repeat(5,minmax(0,1fr))_auto]"
      onSubmit={(event) => {
        event.preventDefault();
        onApply(readFiltersFromForm(event.currentTarget));
      }}
    >
      <label className="grid gap-1 text-sm font-medium text-stone-700">
        Tenant
        <input
          className="h-10 border border-stone-300 px-3 text-stone-950 outline-none focus:border-stone-950"
          defaultValue={filters.tenant_id ?? ""}
          name="tenant_id"
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-stone-700">
        Environment
        <select
          className="h-10 border border-stone-300 bg-white px-3 text-stone-950 outline-none focus:border-stone-950"
          defaultValue={filters.environment ?? ""}
          name="environment"
        >
          <option value="">All</option>
          <option value="production">Production</option>
          <option value="staging">Staging</option>
          <option value="local">Local</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium text-stone-700">
        Release
        <input
          className="h-10 border border-stone-300 px-3 text-stone-950 outline-none focus:border-stone-950"
          defaultValue={filters.release ?? ""}
          name="release"
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-stone-700">
        From
        <input
          className="h-10 border border-stone-300 px-3 text-stone-950 outline-none focus:border-stone-950"
          defaultValue={filters.date_from ?? ""}
          name="date_from"
          type="date"
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-stone-700">
        To
        <input
          className="h-10 border border-stone-300 px-3 text-stone-950 outline-none focus:border-stone-950"
          defaultValue={filters.date_to ?? ""}
          name="date_to"
          type="date"
        />
      </label>
      <button
        className="h-10 self-end border border-stone-950 bg-stone-950 px-4 text-sm font-semibold text-white transition hover:bg-stone-800"
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
