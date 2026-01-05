'use client';

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
  CryptoListLoading?: boolean;
  topLeftLink?: TopLeftLink;
  ShowSummary?: boolean;
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
  CryptoListLoading = false,
  topLeftLink,
}) => {
  const totalX = useMemo(() => data.reduce((sum, w) => sum + (w.x || 0), 0), [data]);

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
      className="
        w-full h-full min-h-full
        rounded-2xl
        border border-boxBorderColor dark:border-boxBorderColor-dark
        bg-boxColor dark:bg-boxColor-dark
        shadow-sm
        p-5 md:p-6
        text-titleText dark:text-titleText-dark
        flex flex-col
        transition
        hover:shadow-md
      "
    >
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            {/* Icon chip */}
            <div
              className="
                h-10 w-10 rounded-2xl
                bg-white/60 dark:bg-white/10
                border border-black/5 dark:border-white/10
                flex items-center justify-center
                shrink-0
              "
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 19V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="text-titleText dark:text-titleText-dark"
                />
                <path
                  d="M8 17v-5m4 5V7m4 10v-3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="text-titleText dark:text-titleText-dark"
                />
              </svg>
            </div>

            <div className="min-w-0">
              <h2 className="text-moon-18 md:text-moon-20 font-bold truncate">
                {title}
              </h2>
              <p className="mt-0.5 text-[12px] text-titleText/60 dark:text-titleText-dark/60">
                {ShowSummary ? `مجموع: ${totalX.toLocaleString()} ${unitSuffix}` : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-stretch lg:items-end gap-2 w-full lg:w-auto">
          {ShowList && (
            <div ref={rootRef} className="relative w-full lg:w-[280px]">
              <Dropdown
                onChange={(e) => {
                  if (typeof e === "string" && SetCryptoSelected) SetCryptoSelected(e);
                }}
                value={CryptoSelected}
              >
                <Dropdown.Trigger className="w-full">
                  <Button
                    as="span"
                    role="button"
                    variant="ghost"
                    onClick={() => setOpen((v) => !v)}
                    className="
    w-full
    flex items-center justify-between
    rounded-xl
    px-3 py-2
    border border-black/10 dark:border-white/10
    bg-white/50 dark:bg-white/5
    hover:bg-white/70 dark:hover:bg-white/10
    transition
    min-w-0
  "
                  >
                    {/* RIGHT: badge + text */}
                    <span className="flex items-center gap-2 min-w-0">
                      {/* عدد */}
                      <span
                        className="
        shrink-0
        text-[10px]
        px-2 py-1
        rounded-full
        border border-black/10 dark:border-white/10
        bg-white/60 dark:bg-white/5
        text-titleText/60 dark:text-titleText-dark/60
      "
                      >
                        {List.length}
                      </span>

                      {/* متن */}
                      <span className="truncate text-sm">
                        {CryptoSelected
                          ? CryptoSelected
                          : CryptoListLoading
                            ? "درحال دریافت..."
                            : "انتخاب کنید"}
                      </span>
                    </span>

                    {/* LEFT: chevron */}
                    <ControlsChevronDown
                      className="
      shrink-0
      text-titleText/70 dark:text-titleText-dark/70
    "
                    />
                  </Button>

                </Dropdown.Trigger>

                {open && (
                  <div
                    className="
                      absolute left-0 mt-2 w-full lg:w-[320px]
                      rounded-2xl
                      border border-black/10 dark:border-white/10
                      bg-white dark:bg-buttonColor-dark
                      shadow-lg
                      z-50
                      max-h-72 overflow-y-auto
                      p-2
                    "
                  >
                    <div className="sticky top-0 z-50 bg-white dark:bg-buttonColor-dark pb-2">
                      <div className="relative">
                        <input
                          value={search}
                          onChange={(ev) => setSearch(ev.target.value)}
                          placeholder="جستجو..."
                          className="
                            w-full
                            px-3 py-2
                            text-sm
                            rounded-xl
                            border border-black/10 dark:border-white/10
                            bg-bgColor dark:bg-boxColor-dark
                            text-titleText dark:text-titleText-dark
                            outline-none
                            focus:ring-2 focus:ring-primary/40
                          "
                        />
                      </div>
                    </div>

                    {filteredList.length > 0 ? (
                      filteredList.map((item, index) => (
                        <div
                          key={`option${index}`}
                          onClick={() => {
                            SetCryptoSelected?.(item.cryptocurrency);
                            setOpen(false);
                          }}
                          className="mt-2"
                        >
                          <MenuItem
                            isActive={false}
                            isSelected={CryptoSelected === item.cryptocurrency}
                            className={`
                              rounded-xl
                              border border-black/5 dark:border-white/10
                              ${CryptoSelected === item.cryptocurrency
                                ? "bg-black/5 dark:bg-white/10"
                                : "bg-white dark:bg-white/0 hover:bg-black/5 dark:hover:bg-white/10"
                              }
                            `}
                          >
                            <MenuItem.Title>{item.cryptocurrency}</MenuItem.Title>
                          </MenuItem>
                        </div>
                      ))
                    ) : (
                      <div className="py-4 text-center text-sm opacity-70">
                        موردی پیدا نشد
                      </div>
                    )}
                  </div>
                )}
              </Dropdown>

              <ControlsChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-titleText/80 dark:text-titleText-dark/80 pointer-events-none" />
            </div>
          )}

          {topLeftLink?.href && topLeftLink?.label ? (
            <Link
              href={topLeftLink.href}
              target={topLeftLink.target ?? "_self"}
              className="
                inline-flex items-center justify-center gap-2
                rounded-xl
                border border-black/10 dark:border-white/10
                bg-white/50 dark:bg-white/5
                px-3 py-2
                text-sm
                text-titleText dark:text-titleText-dark
                hover:bg-white/70 dark:hover:bg-white/10
                transition
                lg:self-end
              "
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M10 14L21 3M21 3h-7M21 3v7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="whitespace-nowrap">{topLeftLink.label}</span>
            </Link>
          ) : null}
        </div>
      </div>

      {/* Chart area — مهم: flex-1 تا قد ردیف را پر کند */}
      <div className="flex-1 min-h-[220px] w-full">
        <div
          className="
            h-full w-full
            rounded-2xl
            border border-black/5 dark:border-white/10
            bg-white/40 dark:bg-white/5
            p-3 md:p-4
          "
          style={{ height: Math.max(220, height) }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 18 }}>
              <CartesianGrid vertical={false} stroke="currentColor" opacity={0.08} />

              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "currentColor" }}
                axisLine={{ stroke: "currentColor", strokeOpacity: 0.15 }}
                tickLine={false}
              />

              <YAxis
                orientation="left"
                width={56}
                tickFormatter={formatCompact}
                tick={{ fontSize: 12, fill: "currentColor", dx: -18 }}
                axisLine={{ stroke: "currentColor", strokeOpacity: 0.15 }}
                tickLine={false}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const raw = payload[0]?.value ?? 0;
                  const val = Number(raw) || 0;

                  return (
                    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-buttonColor-dark px-3 py-2 text-xs text-titleText dark:text-titleText-dark shadow-lg">
                      <div className="mb-2 font-semibold">{String(label)}</div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="opacity-80">{seriesLabel}</span>
                        <span dir="ltr" className="font-semibold">
                          {formatCompact(val)}
                        </span>
                      </div>
                    </div>
                  );
                }}
              />

              <Bar
                dataKey="x"
                name={seriesLabel}
                radius={[10, 10, 4, 4]}
                fill="currentColor"
                className="fill-green-500"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            <span className="text-titleText/80 dark:text-titleText-dark/80">{seriesLabel}</span>
          </div>

          {ShowSummary ? (
            <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
              <span
                className="
                  inline-flex items-center gap-2
                  rounded-full
                  border border-black/10 dark:border-white/10
                  bg-white/50 dark:bg-white/5
                  px-3 py-1.5
                  text-titleText/80 dark:text-titleText-dark/80
                "
              >
                مجموع:
                <span className="font-semibold text-titleText dark:text-titleText-dark">
                  {totalX.toLocaleString()}
                </span>
                <span className="opacity-70">{unitSuffix}</span>
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default SingleLinearChart;
