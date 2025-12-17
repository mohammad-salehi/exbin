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

  // ✅ NEW
  useLastItemForNet?: boolean;
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

  // ✅ NEW
  useLastItemForNet = false,
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

  // ✅ بستن منو با کلیک بیرون
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
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex flex-col items-start gap-1">
          <h2 className="text-base font-semibold text-titleText dark:text-titleText-dark">
            {title}
          </h2>
        </div>

        {ShowList && (
          <div ref={rootRef} className="relative w-full mt-2 max-w-[200px]">
            <Dropdown
              value={CryptoSelected}
              onChange={(e) => {
                if (typeof e === "string" && SetCryptoSelected) {
                  SetCryptoSelected(e);
                }
              }}
            >
              <Dropdown.Trigger className="w-full ">
                <Button
                  as="span"
                  role="button"
                  variant="ghost"
                  onClick={() => setOpen((v) => !v)} // ✅ فقط کنترل باز/بسته
                  className="flex items-center justify-between w-full pl-10 py-2
        text-gray-700 border border-gray-300 rounded-lg
        dark:border-buttonBorderColor-dark dark:text-gray-100
        appearance-none relative bg-boxColor dark:bg-boxColor-dark outline-none shadow-none"
                >
                  <span>{CryptoSelected !== "" ? CryptoSelected : "درحال دریافت..."}</span>
                </Button>
              </Dropdown.Trigger>

              {/* ✅ اینجا به جای Dropdown.Options: همون کلاس‌ها، همون UI، ولی بدون scroll-lock */}
              {open && (
                <div
                  className="absolute left-0 mt-2 w-72 pl-2 pr-2 py-0
      text-gray-700 bg-white dark:bg-buttonColor-dark
      border border-gray-300 dark:border-buttonBorderColor-dark
      rounded-lg dark:text-gray-100 appearance-none z-50
      max-h-60 overflow-y-auto outline-none shadow-none"
                >
                  {/* ✅ Search input */}
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

                  {/* ✅ Filtered items */}
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
                    <div className="py-3 text-center text-sm opacity-70">موردی پیدا نشد</div>
                  )}
                </div>
              )}
            </Dropdown>

            {/* فلش سمت راست */}
            <ControlsChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-titleText dark:text-titleText-dark pointer-events-none" />
          </div>
        )}
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
              tickFormatter={formatCompact}
              tick={{ fontSize: 12, fill: "currentColor", dx: -20 }}
              axisLine={{ stroke: "currentColor", strokeOpacity: 0.15 }}
              tickLine={false}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const xVal = payload.find((p: any) => p.dataKey === "x")?.value ?? 0;
                const yVal = payload.find((p: any) => p.dataKey === "y")?.value ?? 0;

                return (
                  <div className="rounded-lg border border-gray-200 dark:border-buttonBorderColor-dark bg-white dark:bg-buttonColor-dark px-3 py-2 text-xs text-titleText dark:text-titleText-dark">
                    <div className="mb-2 font-semibold">{String(label)}</div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-4">
                        <span>{assetLabel}</span>
                        <span dir="ltr">{formatCompact(Number(xVal))}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span>{liabilityLabel}</span>
                        <span dir="ltr">{formatCompact(Number(yVal))}</span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />

            <Bar dataKey="x" name={assetLabel} radius={[4, 4, 0, 0]} fill="#22c55e" />
            <Bar dataKey="y" name={liabilityLabel} radius={[4, 4, 0, 0]} fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* خلاصه پایین */}
      <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-4 text-xs sm:flex-row sm:items-center sm:justify-between text-titleText dark:text-titleText-dark">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span>{assetLabel}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span>{liabilityLabel}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] sm:text-xs text-titleText dark:text-titleText-dark">
          <span className={net >= 0 ? "text-green-500" : "text-red-500"}>
            مجموع فعلی: {net >= 0 ? "+" : "-"}
            {Math.abs(net).toLocaleString()} {unitSuffix}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DoubleLinearChart;
