'use client';

import React, { useMemo, useState, useRef, useEffect } from "react";
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

type ProofOfReserveDataItem = {
  label: string;
  x: number;
  y: number;
};

type CryptoItem = {
  cryptocurrency: string;
};

type HeaderLink = {
  title: string;
  href: string;
  target?: "_self" | "_blank";
};

type ProofOfReserveChartProps = {
  data: ProofOfReserveDataItem[];
  title?: string;
  assetLabel?: string;
  liabilityLabel?: string;
  unitSuffix?: string;
  height?: number;
  List?: CryptoItem[];
  ShowList?: boolean;
  CryptoSelected?: string;
  SetCryptoSelected?: React.Dispatch<React.SetStateAction<string>>;
  CryptoListLoading?: boolean;
  useLastItemForNet?: boolean;
  headerLink?: HeaderLink;
  ShowSummary?: boolean;
};

const DoubleLinearChart: React.FC<ProofOfReserveChartProps> = ({
  data,
  title = "اثبات ذخیره دارایی‌ها",
  assetLabel = "دارایی",
  liabilityLabel = "بدهی",
  unitSuffix = "M",
  height = 288,
  List = [],
  CryptoSelected = "",
  SetCryptoSelected,
  ShowList = false,
  useLastItemForNet = false,
  ShowSummary = true,
  CryptoListLoading = false,
  headerLink,
}) => {
  const { totalX, totalY, net } = useMemo(() => {
    if (!data || data.length === 0) return { totalX: 0, totalY: 0, net: 0 };

    if (useLastItemForNet) {
      const last = data[data.length - 1];
      const x = Number(last?.x || 0);
      const y = Number(last?.y || 0);
      return { totalX: x, totalY: y, net: x - y };
    }

    const sx = data.reduce((sum, w) => sum + (Number(w.x) || 0), 0);
    const sy = data.reduce((sum, w) => sum + (Number(w.y) || 0), 0);
    return { totalX: sx, totalY: sy, net: sx - sy };
  }, [data, useLastItemForNet]);

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
                  d="M12 3v18M3 12h18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="text-titleText dark:text-titleText-dark"
                />
                <path
                  d="M7 16h2M7 12h5M7 8h9"
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
                مجموع {assetLabel}: {totalX.toLocaleString()} {unitSuffix} • مجموع {liabilityLabel}: {totalY.toLocaleString()} {unitSuffix}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-stretch lg:items-end gap-2 w-full lg:w-auto">
          {ShowList && (
            <div ref={rootRef} className="relative w-full lg:w-[280px]">
              <Dropdown
                value={CryptoSelected}
                onChange={(e) => {
                  if (typeof e === "string" && SetCryptoSelected) SetCryptoSelected(e);
                }}
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

          {headerLink?.href ? (
            <a
              href={headerLink.href}
              target={headerLink.target ?? "_self"}
              rel={headerLink.target === "_blank" ? "noopener noreferrer" : undefined}
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
              <span className="whitespace-nowrap">{headerLink.title}</span>
            </a>
          ) : null}
        </div>
      </div>

      {/* Chart area — flex-1 برای پر کردن ارتفاع ردیف */}
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
                tickFormatter={formatCompact}
                tick={{ fontSize: 12, fill: "currentColor", dx: -18 }}
                axisLine={{ stroke: "currentColor", strokeOpacity: 0.15 }}
                tickLine={false}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;

                  const xVal = payload.find((p: any) => p.dataKey === "x")?.value ?? 0;
                  const yVal = payload.find((p: any) => p.dataKey === "y")?.value ?? 0;

                  return (
                    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-buttonColor-dark px-3 py-2 text-xs text-titleText dark:text-titleText-dark shadow-lg">
                      <div className="mb-2 font-semibold">{String(label)}</div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className="opacity-80">{assetLabel}</span>
                          <span dir="ltr" className="font-semibold">
                            {formatCompact(Number(xVal))}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="opacity-80">{liabilityLabel}</span>
                          <span dir="ltr" className="font-semibold">
                            {formatCompact(Number(yVal))}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />

              <Bar dataKey="x" name={assetLabel} radius={[10, 10, 4, 4]} fill="currentColor" className="fill-green-500" />
              <Bar dataKey="y" name={liabilityLabel} radius={[10, 10, 4, 4]} fill="currentColor" className="fill-red-500" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 px-3 py-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              <span className="opacity-85">{assetLabel}</span>
            </span>

            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 px-3 py-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="opacity-85">{liabilityLabel}</span>
            </span>
          </div>

          {ShowSummary ? (
            <div className="text-[11px] sm:text-xs">
              <span
                className={`
                  inline-flex items-center gap-2
                  rounded-full
                  border border-black/10 dark:border-white/10
                  bg-white/50 dark:bg-white/5
                  px-3 py-1.5
                  ${net >= 0 ? "text-green-500" : "text-red-500"}
                `}
              >
                مجموع فعلی:
                <span className="font-semibold" dir="ltr">
                  {net >= 0 ? "+" : "-"}{Math.abs(net).toLocaleString()}
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

export default DoubleLinearChart;
