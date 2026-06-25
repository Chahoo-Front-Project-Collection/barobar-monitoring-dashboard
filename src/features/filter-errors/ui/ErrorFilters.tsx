import { ChevronDown, RotateCcw, Search } from "lucide-react";
import { useRef, useState, type MouseEvent } from "react";

import type { ErrorGroupFilters } from "@/entities/error";

type ErrorFiltersProps = {
  filters: ErrorGroupFilters;
  onApply: (filters: ErrorGroupFilters) => void;
};

const FIELD_CLASS =
  "h-9 w-full rounded-lg border border-subtle bg-surface-muted px-2 text-[12px] outline-none transition-colors placeholder:text-[12px] focus:border-primary focus:bg-surface sm:h-11 sm:px-3 sm:text-sm sm:placeholder:text-sm";

const FIELD_LABEL_CLASS =
  "text-[9px] font-semibold uppercase tracking-wide text-text-subtle sm:text-xs";

const DATE_FIELD_CLASS =
  "w-[6rem] cursor-pointer bg-transparent text-[12px] text-text outline-none placeholder:text-[12px] [&::-webkit-date-and-time-value]:text-[12px] [&::-webkit-datetime-edit-day-field]:text-[12px] [&::-webkit-datetime-edit-fields-wrapper]:text-[12px] [&::-webkit-datetime-edit-month-field]:text-[12px] [&::-webkit-datetime-edit-text]:text-[12px] [&::-webkit-datetime-edit-year-field]:text-[12px] sm:w-30 sm:text-xs sm:placeholder:text-xs sm:[&::-webkit-date-and-time-value]:text-xs sm:[&::-webkit-datetime-edit-day-field]:text-xs sm:[&::-webkit-datetime-edit-fields-wrapper]:text-xs sm:[&::-webkit-datetime-edit-month-field]:text-xs sm:[&::-webkit-datetime-edit-text]:text-xs sm:[&::-webkit-datetime-edit-year-field]:text-xs";

const SELECT_FRAME_CLASS =
  "relative flex h-9 w-full items-center rounded-lg border border-subtle bg-surface-muted transition-colors focus-within:border-primary focus-within:bg-surface sm:h-11";

const SELECT_VALUE_CLASS =
  "pointer-events-none min-w-0 flex-1 truncate px-2 pr-8 text-[12px] leading-none text-text sm:px-3 sm:pr-9 sm:text-sm";

const SELECT_NATIVE_CLASS =
  "absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0  [font-size:12px] [&_option]:text-[12px] sm:text-[14px] sm:[&_option]:text-[14px]";

export function ErrorFilters({ filters, onApply }: ErrorFiltersProps) {
  const formKey = JSON.stringify(filters);
  const formRef = useRef<HTMLFormElement>(null);

  const handleResetFilter = () => {
    clearFormControls(formRef.current);
    onApply({ page: 1 });
  };

  return (
    <form
      key={formKey}
      ref={formRef}
      className="flex flex-wrap items-end gap-2 rounded-xl border border-subtle bg-surface p-2 sm:gap-3 sm:p-3"
      onSubmit={(event) => {
        event.preventDefault();
        onApply(readFiltersFromForm(event.currentTarget));
      }}
    >
      <label className="grid min-w-[150px] flex-1 gap-1 sm:min-w-[220px] sm:gap-1.5">
        <span className={FIELD_LABEL_CLASS}>에러 메시지 검색</span>
        <span className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-text-subtle sm:left-3 sm:size-4"
          />
          <input
            className={`${FIELD_CLASS} pl-8 sm:pl-9`}
            defaultValue={filters.message ?? ""}
            name="message"
            placeholder="Search message"
          />
        </span>
      </label>

      <label className="grid w-28 gap-1 sm:w-40 sm:gap-1.5">
        <span className={FIELD_LABEL_CLASS}>환경</span>
        <EnvironmentSelect key={filters.environment ?? ""} value={filters.environment ?? ""} />
      </label>

      <label className="grid w-24 gap-1 sm:w-32 sm:gap-1.5">
        <span className={FIELD_LABEL_CLASS}>버전</span>
        <input
          className={FIELD_CLASS}
          defaultValue={filters.version ?? ""}
          name="version"
          placeholder="e.g. 3.2.0"
        />
      </label>

      <div className="grid gap-1 sm:gap-1.5">
        <span className={FIELD_LABEL_CLASS}>기간</span>
        <div className="flex h-9 items-center gap-1 rounded-lg border border-subtle bg-surface-muted px-2 transition-colors focus-within:border-primary focus-within:bg-surface sm:h-11 sm:px-3">
          <input
            aria-label="From"
            className={DATE_FIELD_CLASS}
            defaultValue={filters.date_from ?? ""}
            name="date_from"
            onClick={openDatePicker}
            type="date"
          />
          <span aria-hidden="true" className="text-[9px] text-text-subtle sm:text-xs">
            →
          </span>
          <input
            aria-label="To"
            className={DATE_FIELD_CLASS}
            defaultValue={filters.date_to ?? ""}
            name="date_to"
            onClick={openDatePicker}
            type="date"
          />
        </div>
      </div>

      <div className="ml-auto flex items-end gap-1.5 sm:gap-2">
        <button
          aria-label="Reset"
          className="grid size-9 place-items-center rounded-lg text-text-muted transition-colors hover:bg-surface-muted hover:text-text sm:size-11"
          onClick={handleResetFilter}
          title="Reset"
          type="button"
        >
          <RotateCcw aria-hidden="true" className="size-3.5 sm:size-4" />
        </button>
        <button
          className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover sm:h-11 sm:px-6"
          type="submit"
        >
          검색
        </button>
      </div>
    </form>
  );
}

function clearFormControls(form: HTMLFormElement | null) {
  if (!form) {
    return;
  }

  for (const element of Array.from(form.elements)) {
    if (!(element instanceof HTMLInputElement || element instanceof HTMLSelectElement)) {
      continue;
    }

    if (element.type === "button" || element.type === "submit") {
      continue;
    }

    element.value = "";
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

function EnvironmentSelect({ value: initialValue }: { value: string }) {
  const [value, setValue] = useState(initialValue);

  return (
    <span className={SELECT_FRAME_CLASS}>
      <span aria-hidden="true" className={SELECT_VALUE_CLASS}>
        {getEnvironmentLabel(value)}
      </span>
      <select
        aria-label="환경"
        className={SELECT_NATIVE_CLASS}
        name="environment"
        onChange={(event) => setValue(event.currentTarget.value)}
        value={value}
      >
        <option value="">All</option>
        <option value="production">Production</option>
        <option value="development">Development</option>
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 sm:right-3 sm:size-4"
      />
    </span>
  );
}

function getEnvironmentLabel(value: string) {
  if (value === "production") {
    return "Production";
  }

  if (value === "development") {
    return "Development";
  }

  return "All";
}

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
