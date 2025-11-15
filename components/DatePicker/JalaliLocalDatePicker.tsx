import React, { useState, useRef } from "react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

type LocalDate = string; // "YYYY-MM-DD"

type Props = {
  value?: LocalDate | null;
  onChange: (val: LocalDate | null) => void;
  placeholder?: string;
  clearable?: boolean;
  disabled?: boolean;
  className?: string;
  menuClassName?: string;
  min?: LocalDate;
  max?: LocalDate;
};

/** ---------- Helpers: UTC-safe ---------- **/
function isoLocalDateToUTCDate(iso?: string | null): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

function toIsoLocalDateUTC(d: Date): LocalDate {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function boundToDate(bound?: LocalDate): Date | undefined {
  const dt = isoLocalDateToUTCDate(bound ?? null);
  return dt ?? undefined;
}

export default function JalaliLocalDatePicker({
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  clearable = true,
  disabled,
  className = "",
  menuClassName = "",
  min,
  max,
}: Props) {
  const datePickerRef = useRef<any>(null);
  const [open, setOpen] = useState(false);

  return (
    <DatePicker
      ref={datePickerRef}
      value={isoLocalDateToUTCDate(value ?? null)}
      onChange={(dateObj: any) => {
        const jsDate: Date | null =
          dateObj?.toDate
            ? dateObj.toDate()
            : dateObj instanceof Date
            ? dateObj
            : null;

        const iso = jsDate ? toIsoLocalDateUTC(jsDate) : null;
        onChange(iso);
      }}
      calendar={persian}
      locale={persian_fa}
      calendarPosition="bottom-right"
      format="YYYY/MM/DD"
      containerClassName="w-full"
      minDate={boundToDate(min)}
      maxDate={boundToDate(max)}
      disabled={disabled}
      className={menuClassName}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      render={(val: string, openCalendar: () => void) => (
        <>
          {/* 👇 این overlay وقتی پیکر بازه کل صفحه رو می‌پوشونه */}
          {open && (
            <div
              className="fixed inset-0 z-10"
              onClick={() => {
                setOpen(false);
                datePickerRef.current?.closeCalendar?.();
              }}
            />
          )}

          <div className="relative w-full z-20">
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                openCalendar();
                setOpen(true);
              }}
              className={[
                "w-full h-10 rounded-md px-3 flex items-center justify-between",
                "bg-boxColor dark:bg-bgColor-dark",
                "bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark",
                "border border-boxBorderColor dark:border-boxBorderColor-dark",
                disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
                className,
              ].join(" ")}
              aria-label="انتخاب تاریخ"
            >
              <span className={val ? "" : "text-gray-400"}>
                {val || placeholder}
              </span>
            </button>

            {clearable && value && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                  setOpen(false);
                  datePickerRef.current?.closeCalendar?.();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:dark:text-gray-300 transition"
                aria-label="پاک کردن تاریخ"
                title="پاک کردن تاریخ"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 6L18 18M6 18L18 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </>
      )}
    />
  );
}

