import React, { useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button, Dropdown, MenuItem } from "@heathmont/moon-core-tw";
import { ControlsChevronDown } from "@heathmont/moon-icons-tw";

export type SingleLinearDataItem = {
  label: string;
  x: number;
};

type CryptoItem = {
  cryptocurrency: string;
};

type TopLeftLink = {
  href: string;
  label: string;
  target?: "_self" | "_blank";
};

type SingleLinearChartProps = {
  data: SingleLinearDataItem[];
  title?: string;
  seriesLabel?: string;
  unitSuffix?: string;
  height?: number;
  List?: CryptoItem[];
  CryptoSelected?: string;
  ShowList?: boolean;
  SetCryptoSelected?: React.Dispatch<React.SetStateAction<string>>;

  // ✅ NEW: لینک اختیاری بالا سمت چپ
  topLeftLink?: TopLeftLink;
  ShowSummary?: boolean
};

const SingleLinearChart: React.FC<SingleLinearChartProps> = ({
  data,
  title = "نمودار تک‌سری",
  seriesLabel = "مقدار",
  unitSuffix = "M",
  height = 288,
  List = [],
  CryptoSelected = "",
  SetCryptoSelected,
  ShowList = false,
  ShowSummary = true,
  // ✅ NEW
  topLeftLink,
}) => {
  const totalX = data.reduce((sum, w) => sum + (w.x || 0), 0);

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handler = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };

    document.addEventListener("mousedown", handler, true);
    return () => document.removeEventListener("mousedown", handler, true);
  }, [open]);

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return List;
    return List.filter((x) => (x.cryptocurrency || "").toLowerCase().includes(q));
  }, [List, search]);

  const formatCompact = (n: number) => {
    const abs = Math.abs(n);

    if (abs >= 1_000_000_000) {
      const v = n / 1_000_000_000;
      return `${Number(v.toFixed(v % 1 === 0 ? 0 : 1))}B`;
    }

    if (abs >= 1_000_000) {
      const v = n / 1_000_000;
      return `${Number(v.toFixed(v % 1 === 0 ? 0 : 1))}M`;
    }

    if (abs >= 1_000) {
      const v = n / 1_000;
      return `${Number(v.toFixed(v % 1 === 0 ? 0 : 1))}K`;
    }

    return `${n}`;
  };

  return (
    <div
      dir="rtl"
      className="w-full rounded-xl border bg-boxColor dark:bg-boxColor-dark p-6 shadow-sm text-titleText dark:text-titleText-dark border-boxBorderColor dark:border-boxBorderColor-dark"
    >
      {/* هدر */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 min-w-0">
        {/* Title */}
        <div className="flex flex-col items-start gap-1 w-full lg:w-auto min-w-0">
          <h2 className="text-base font-semibold text-titleText dark:text-titleText-dark break-words">
            {title}
          </h2>
        </div>

        {/* Left side (Dropdown + Link) */}
        <div className="flex flex-col items-stretch lg:items-end gap-2 w-full lg:w-auto min-w-0">
          {/* Dropdown */}
          {ShowList && (
            <div
              ref={rootRef}
              className="relative w-full lg:w-[260px] min-w-0"
            >
              <Dropdown
                onChange={(e) => {
                  if (typeof e === "string" && SetCryptoSelected) {
                    SetCryptoSelected(e);
                  }
                }}
                value={CryptoSelected}
              >
                <Dropdown.Trigger className="w-full">
                  <Button
                    as="span"
                    role="button"
                    variant="ghost"
                    onClick={() => setOpen((v) => !v)}
                    className="flex items-center justify-between w-full pl-10 py-2
                text-gray-700 border border-gray-300 rounded-lg
                dark:border-buttonBorderColor-dark dark:text-gray-100
                appearance-none relative bg-boxColor dark:bg-boxColor-dark outline-none shadow-none
                min-w-0"
                  >
                    <span className="truncate">
                      {CryptoSelected !== "" ? CryptoSelected : "درحال دریافت..."}
                    </span>
                  </Button>
                </Dropdown.Trigger>

                {open && (
                  <div
                    className="absolute left-0 mt-2 w-full lg:w-72 pl-2 pr-2 py-0
                text-gray-700 bg-white dark:bg-buttonColor-dark
                border border-gray-300 dark:border-buttonBorderColor-dark
                rounded-lg dark:text-gray-100 appearance-none z-50
                max-h-60 overflow-y-auto outline-none shadow-none"
                  >
                    <div className="sticky top-0 z-50 -mx-2 px-2 pt-2 pb-2 bg-white dark:bg-buttonColor-dark border-b border-gray-200 dark:border-buttonBorderColor-dark">
                      <input
                        value={search}
                        onChange={(ev) => setSearch(ev.target.value)}
                        placeholder="جستجو..."
                        className="w-full px-3 py-2 text-sm rounded-md
                    border border-gray-200 dark:border-buttonBorderColor-dark
                    bg-bgColor dark:bg-boxColor-dark
                    text-titleText dark:text-titleText-dark
                    outline-none"
                      />
                    </div>

                    {filteredList.length > 0 ? (
                      filteredList.map((item, index) => (
                        <div
                          key={`option${index}`}
                          onClick={() => {
                            SetCryptoSelected?.(item.cryptocurrency);
                            setOpen(false);
                          }}
                        >
                          <MenuItem
                            isActive={false}
                            isSelected={CryptoSelected === item.cryptocurrency}
                            className={`border mt-2 mb-1 rounded-md border-gray-100 dark:border-buttonBorderColor-dark ${CryptoSelected === item.cryptocurrency
                              ? "bg-gray-100 border-gray-200 dark:bg-gray-700"
                              : ""
                              }`}
                          >
                            <MenuItem.Title>{item.cryptocurrency}</MenuItem.Title>
                          </MenuItem>
                        </div>
                      ))
                    ) : (
                      <div className="py-3 text-center text-sm opacity-70">
                        موردی پیدا نشد
                      </div>
                    )}
                  </div>
                )}
              </Dropdown>

              <ControlsChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-titleText dark:text-titleText-dark pointer-events-none" />
            </div>
          )}

          {/* Link (ALWAYS under dropdown on desktop; on mobile it will be under it too) */}
          {topLeftLink?.href && topLeftLink?.label ? (
            <Link
              href={topLeftLink.href}
              target={topLeftLink.target ?? "_self"}
              className="
          w-full lg:w-auto
          text-sm md:text-[14px]
          text-primary hover:text-primary
          dark:text-primary-dark dark:hover:text-primary-dark
          whitespace-nowrap
          lg:self-end
        "
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="inline-block ml-1"
              >
                <path
                  d="M14 12C14 14.7614 11.7614 17 9 17H7C4.23858 17 2 14.7614 2 12C2 9.23858 4.23858 7 7 7H7.5M10 12C10 9.23858 12.2386 7 15 7H17C19.7614 7 22 9.23858 22 12C22 14.7614 19.7614 17 17 17H16.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              {topLeftLink.label}
            </Link>
          ) : null}
        </div>
      </div>


      {/* نمودار */}
      <div className="w-full text-titleText dark:text-titleText-dark" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 24 }}>
            <CartesianGrid vertical={false} stroke="#f1f5f9" />

            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "currentColor" }}
              axisLine={{ stroke: "currentColor", strokeOpacity: 0.15 }}
              tickLine={false}
            />

            <YAxis
              orientation="left"
              width={50}
              tickFormatter={formatCompact}
              tick={{ fontSize: 12, fill: "currentColor", dx: -20 }}
              axisLine={{ stroke: "currentColor", strokeOpacity: 0.15 }}
              tickLine={false}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;

                const raw = payload[0]?.value ?? 0;
                const val = Number(raw) || 0;

                return (
                  <div className="rounded-lg border border-gray-200 dark:border-buttonBorderColor-dark bg-white dark:bg-buttonColor-dark px-3 py-2 text-xs text-titleText dark:text-titleText-dark">
                    <div className="mb-2 font-semibold">{String(label)}</div>
                    <div className="flex items-center justify-between gap-4">
                      <span>{seriesLabel}</span>
                      <span dir="ltr">{formatCompact(val)}</span>
                    </div>
                  </div>
                );
              }}
            />

            <Bar dataKey="x" name={seriesLabel} radius={[4, 4, 0, 0]} fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* خلاصه‌ی پایین */}
      <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-4 text-xs sm:flex-row sm:items-center sm:justify-between text-titleText dark:text-titleText-dark">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="h-4 w-4 rounded-full bg-green-500" />
            <span>{seriesLabel}</span>
          </div>
        </div>
        {
          ShowSummary ?
            <div className="flex flex-wrap items-center gap-4 text-[11px] sm:text-xs text-titleText dark:text-titleText-dark">
              <span className="text-green-500">
                مجموع: {totalX.toLocaleString()} {unitSuffix}
              </span>
            </div>
            :
            null
        }

      </div>
    </div>
  );
};

export default SingleLinearChart;
