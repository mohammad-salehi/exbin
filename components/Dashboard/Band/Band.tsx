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
      className="w-full rounded-[32px] border border-white/30 dark:border-white/10 bg-gradient-to-br from-white/90 via-white/70 to-white/60 dark:from-[#0b0f15]/95 dark:via-[#0d131c]/85 dark:to-[#0a0f15]/90 backdrop-blur-2xl p-7 md:p-8 shadow-[0_25px_70px_-35px_rgba(0,0,0,0.55)] text-titleText dark:text-titleText-dark"
    >
      {/* Header line */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary/90 shadow-[0_0_0_8px_rgba(0,0,0,0.04)] dark:shadow-[0_0_0_8px_rgba(255,255,255,0.04)]" />
          <h3 className="text-sm sm:text-base font-semibold tracking-tight">
            آمار کلی
          </h3>
        </div>
        <div className="text-[11px] sm:text-xs text-titleText/60 dark:text-titleText-dark/60">
          آخرین اطلاعات
        </div>
      </div>

      <div
        className="
          grid gap-4
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
              group relative overflow-hidden
              rounded-[28px]
              border border-white/40 dark:border-white/10
              bg-white/75 dark:bg-white/[0.04]
              p-5
              backdrop-blur-xl
              shadow-[0_12px_30px_-20px_rgba(0,0,0,0.6)]
              transition
              hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-22px_rgba(0,0,0,0.7)]
            "
          >
            {/* subtle glow */}
            <div className="pointer-events-none absolute -top-24 -left-24 h-48 w-48 rounded-full bg-primary/15 blur-[70px] opacity-0 transition group-hover:opacity-100" />
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-full">
                <div
                  className="text-[12px] sm:text-[13px] text-titleText/70 dark:text-titleText-dark/70"
                  title={item.label}
                >
                  {item.label}
                </div>

                <div
                  className="
                    mt-2
                    text-xl sm:text-2xl
                    font-bold
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
            <div className="mt-4 h-px w-full bg-white/60 dark:bg-white/10" />

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
