'use client'

import React, { useMemo } from "react";

type StatItem = { label: string; value: number };
type StatsGridProps = { data: StatItem[] };

const formatNumber = (v: number) => {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return "—";
  return Number(v).toLocaleString("fa-IR");
};

const StatsGrid: React.FC<StatsGridProps> = ({ data }) => {
  const items = useMemo(() => data ?? [], [data]);

  const todayFa = new Date().toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section
      dir="rtl"
      className="w-full rounded-xl border bg-boxColor dark:bg-boxColor-dark p-6 shadow-sm text-titleText dark:text-titleText-dark border-boxBorderColor dark:border-boxBorderColor-dark"
    >
      {/* Header line (optional but looks nice) */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-primary/90 shadow-[0_0_0_6px_rgba(0,0,0,0.03)] dark:shadow-[0_0_0_6px_rgba(255,255,255,0.03)]" />
          <h3 className="text-sm sm:text-base font-semibold text-titleText dark:text-titleText-dark">
            آمار کلی
          </h3>
        </div>
        <div className="text-[11px] sm:text-xs text-titleText/60 dark:text-titleText-dark/60">
          آخرین اطلاعات
        </div>
      </div>

      <div
        className="
          grid gap-3
          grid-cols-1
          lg:grid-cols-2
          xl:grid-cols-3
          2xl:grid-cols-4
        "
      >
        {items.map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            className="
              group
              relative overflow-hidden
              rounded-2xl
              bg-white dark:bg-white/5
              border border-[#eeeeee] dark:border-white/10
              p-4
              shadow-[0_1px_0_rgba(0,0,0,0.04)]
              transition
              hover:-translate-y-0.5 hover:shadow-md
            "
          >
            {/* subtle glow */}
            <div
              className="
                pointer-events-none
                absolute -top-20 -left-20 h-40 w-40 rounded-full
                bg-primary/10 blur-2xl opacity-0
                transition
                group-hover:opacity-100
              "
            />

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-full">
                <div
                  className="
                    text-[12px] sm:text-[13px]
                    text-titleText/70 dark:text-titleText-dark/70
                    truncate
                  "
                  title={item.label}
                >
                  {item.label}
                </div>

                <div
                  className="
    mt-2
    text-xl sm:text-2xl
    font-bold
    text-titleText dark:text-titleText-dark
    tracking-tight
    [font-variant-numeric:tabular-nums]
    text-center min-w-full
  "
                  style={{ direction: "ltr" }}
                >
                  {formatNumber(item.value)}
                </div>
              </div>
            </div>

            {/* bottom divider accent */}
            <div className="mt-3 h-px w-full bg-[#f2f2f2] dark:bg-white/10" />

            <div className="mt-3 flex items-center justify-between text-[11px] text-titleText/55 dark:text-titleText-dark/55">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
                تاریخ
              </span>
              <span className="opacity-80">{todayFa}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsGrid;
