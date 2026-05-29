import { ChevronDown, RotateCcw, Search } from "lucide-react";
import type { MouseEvent } from "react";

import type { ErrorGroupFilters } from "@/entities/error";

type ErrorFiltersProps = {
  filters: ErrorGroupFilters;
  onApply: (filters: ErrorGroupFilters) => void;
};

const FIELD_CLASS =
  "h-11 w-full rounded-lg border border-subtle bg-surface-muted px-3 text-sm text-text outline-none transition-colors placeholder:text-text-subtle focus:border-primary focus:bg-surface";

const FIELD_LABEL_CLASS = "text-xs font-semibold uppercase tracking-wide text-text-subtle";

export function ErrorFilters({ filters, onApply }: ErrorFiltersProps) {
  // Re-mount on external filter changes (apply / reset / back button) so the
  // uncontrolled inputs stay in sync with the active filters.
  const formKey = JSON.stringify(filters);

  return (
    <form
      key={formKey}
      className="flex flex-wrap items-end gap-3 rounded-xl border border-subtle bg-surface p-3"
      onSubmit={(event) => {
        event.preventDefault();
        onApply(readFiltersFromForm(event.currentTarget));
      }}
    >
      <label className="grid min-w-[220px] flex-1 gap-1.5">
        <span className={FIELD_LABEL_CLASS}>에러 메시지 검색</span>
        <span className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-subtle"
          />
          <input
            className={`${FIELD_CLASS} pl-9`}
            defaultValue={filters.message ?? ""}
            name="message"
            placeholder="Search message"
          />
        </span>
      </label>

      <label className="grid w-40 gap-1.5">
        <span className={FIELD_LABEL_CLASS}>환경</span>
        <span className="relative">
          <select
            className={`${FIELD_CLASS} cursor-pointer appearance-none pr-9`}
            defaultValue={filters.environment ?? ""}
            name="environment"
          >
            <option value="">All</option>
            <option value="production">Production</option>
            <option value="development">Development</option>
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2"
          />
        </span>
      </label>

      <label className="grid w-32 gap-1.5">
        <span className={FIELD_LABEL_CLASS}>버전</span>
        <input
          className={FIELD_CLASS}
          defaultValue={filters.version ?? ""}
          name="version"
          placeholder="e.g. 3.2.0"
        />
      </label>

      <div className="grid gap-1.5">
        <span className={FIELD_LABEL_CLASS}>기간</span>
        <div className="flex h-11 items-center gap-1 rounded-lg border border-subtle bg-surface-muted px-3 transition-colors focus-within:border-primary focus-within:bg-surface">
          <input
            aria-label="From"
            className="w-30 cursor-pointer bg-transparent text-sm text-text outline-none"
            defaultValue={filters.date_from ?? ""}
            name="date_from"
            onClick={openDatePicker}
            type="date"
          />
          <span aria-hidden="true" className="text-text-subtle">
            →
          </span>
          <input
            aria-label="To"
            className="w-30 cursor-pointer bg-transparent text-sm text-text outline-none"
            defaultValue={filters.date_to ?? ""}
            name="date_to"
            onClick={openDatePicker}
            type="date"
          />
        </div>
      </div>

      <div className="ml-auto flex items-end gap-2">
        <button
          aria-label="Reset"
          className="grid size-11 place-items-center rounded-lg text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
          onClick={() => onApply({ page: 1 })}
          title="Reset"
          type="button"
        >
          <RotateCcw aria-hidden="true" className="size-4" />
        </button>
        <button
          className="h-11 rounded-lg bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          type="submit"
        >
          Apply
        </button>
      </div>
    </form>
  );
}

// Native date inputs only open the calendar from the indicator icon; this lets
// a click anywhere on the field (including the placeholder text) open it.
function openDatePicker(event: MouseEvent<HTMLInputElement>) {
  try {
    event.currentTarget.showPicker();
  } catch {
    // showPicker can throw in unsupported browsers; the native icon still works.
  }
}

function readFiltersFromForm(form: HTMLFormElement): ErrorGroupFilters {
  const formData = new FormData(form);

  return {
    message: readString(formData, "message"),
    environment: readString(formData, "environment"),
    version: readString(formData, "version"),
    date_from: readString(formData, "date_from"),
    date_to: readString(formData, "date_to"),
    page: 1,
  };
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
