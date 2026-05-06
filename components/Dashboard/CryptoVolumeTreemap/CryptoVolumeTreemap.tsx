'use client';

import React, { useMemo } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

type VolumeItem = {
  name: string;
  symbol: string;
  value: number;
};

type Props = {
  data: VolumeItem[];
  title: string;
  height?: number; // اختیاری برای کنترل ارتفاع (مثل بقیه چارت‌ها)
};

const TREEMAP_COLORS = [
  '#4F46E5', '#6366F1', '#818CF8', '#0EA5E9', '#06B6D4',
  '#14B8A6', '#22C55E', '#16A34A', '#84CC16', '#A3E635',
  '#FACC15', '#EAB308', '#F97316', '#FB923C', '#EF4444',
  '#F43F5E', '#EC4899', '#D946EF', '#A855F7', '#8B5CF6',
];

const formatEN = (n: number) => {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '—';
  return Number(n).toLocaleString('en-US');
};

const formatFA = (n: number) => {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '—';
  return Number(n).toLocaleString('fa-IR');
};

const CustomTreemapCell: React.FC<any> = (props) => {
  const { x, y, width, height, name, payload, index, depth, total, value } = props;

  const symbol = payload?.symbol ?? name ?? '';
  const cellValue: number = Number(payload?.value ?? value ?? 0);

  const baseColor =
    depth === 1 ? TREEMAP_COLORS[index % TREEMAP_COLORS.length] : 'rgba(255,255,255,0.08)';

  // جلوگیری از شلوغی: نمایش متن فقط وقتی جا هست
  const showMain = width > 80 && height > 46;
  const showSub = width > 110 && height > 72;

  const percent = total ? (cellValue / total) * 100 : 0;

  const cx = x + width / 2;
  const cy = y + height / 2;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={baseColor}
        stroke="rgba(255,255,255,0.9)"
        strokeWidth={1}
        rx={12}
        ry={12}
      />

      {/* لایه‌ی لطیف برای خوانایی متن */}
      <rect
        x={x + 6}
        y={y + 6}
        width={Math.max(0, width - 12)}
        height={Math.max(0, height - 12)}
        fill="rgba(0,0,0,0.06)"
        rx={10}
        ry={10}
        opacity={showMain ? 1 : 0}
      />

      {showMain && (
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#FFFFFF"
          style={{
            paintOrder: 'stroke',
            stroke: 'rgba(0,0,0,0.25)',
            strokeWidth: 3,
          }}
        >
          <tspan x={cx} dy={showSub ? '-0.8em' : '-0.25em'} fontSize={14} fontWeight={700}>
            {symbol}
          </tspan>

          {showSub && (
            <>
              <tspan x={cx} dy="1.35em" fontSize={11} fontWeight={500} opacity={0.95}>
                {formatEN(cellValue)} USDT
              </tspan>

              <tspan x={cx} dy="1.2em" fontSize={11} fontWeight={400} opacity={0.85}>
                {percent.toFixed(1)}٪
              </tspan>
            </>
          )}
        </text>
      )}
    </g>
  );
};

export const CryptoVolumeTreemap: React.FC<Props> = ({ data, title, height = 340 }) => {
  const currentData = data ?? [];

  const totalValue = useMemo(
    () => currentData.reduce((sum, item) => sum + Number(item.value || 0), 0),
    [currentData]
  );

  const formattedTotal = `${formatEN(totalValue)} USDT`;

  return (
    <div
      dir="rtl"
      className="
        w-full h-full min-h-full
        rounded-[32px]
        border border-white/30 dark:border-white/10
        bg-gradient-to-br from-white/90 via-white/70 to-white/60
        dark:from-[#0b0f15]/95 dark:via-[#0d131c]/85 dark:to-[#0a0f15]/90
        backdrop-blur-2xl
        shadow-[0_25px_70px_-35px_rgba(0,0,0,0.55)]
        p-5 md:p-6
        text-titleText dark:text-titleText-dark
        flex flex-col
        transition
        hover:shadow-[0_35px_90px_-40px_rgba(0,0,0,0.6)]
      "
    >
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="
              h-11 w-11 rounded-2xl
              bg-white/70 dark:bg-white/5
              border border-white/40 dark:border-white/10
              shadow-[0_8px_25px_-15px_rgba(0,0,0,0.6)]
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
            <h2 className="text-moon-18 md:text-moon-20 font-bold truncate">{title}</h2>
          </div>
        </div>

        {/* Total chip */}
        <div
          className="
            inline-flex items-center gap-2
            rounded-full
            border border-white/40 dark:border-white/10
            bg-white/70 dark:bg-white/5
            px-3 py-2
            text-xs
            self-start sm:self-auto
            shadow-[0_8px_20px_-14px_rgba(0,0,0,0.6)]
            backdrop-blur-xl
          "
        >
          <span className="opacity-70">مجموع</span>
          <span dir="ltr" className="font-semibold">
            {formattedTotal}
          </span>
        </div>
      </div>

      {/* Chart area — flex-1 برای پر کردن ارتفاع ردیف */}
      <div className="flex-1 min-h-[220px] w-full">
        <div
          className="
            relative
            h-full w-full
            rounded-[28px]
            border border-white/40 dark:border-white/10
            bg-white/75 dark:bg-white/[0.04]
            backdrop-blur-xl
            p-3 md:p-4
            shadow-[0_12px_30px_-20px_rgba(0,0,0,0.6)]
          "
          style={{ height: Math.max(220, height) }}
        >
          {/* soft glows */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
            <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-primary/15 blur-[80px]" />
            <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-cyan-500/12 blur-[80px]" />
            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
          </div>

          <div className="relative h-full w-full">
            {currentData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-titleText/70 dark:text-titleText-dark/70">
                اطلاعاتی برای نمایش موجود نیست.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  data={currentData}
                  dataKey="value"
                  nameKey="symbol"
                  stroke="rgba(255,255,255,0.9)"
                  aspectRatio={4 / 3}
                  content={(props) => <CustomTreemapCell {...props} total={totalValue} />}
                >
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload[0]) return null;
                      const d = payload[0].payload as any;

                      const v = Number(d.value || 0);
                      const pct = totalValue > 0 ? (v / totalValue) * 100 : 0;

                      return (
                        <div className="rounded-2xl border border-white/40 dark:border-white/10 bg-white/95 dark:bg-[#0b0f15] px-3 py-2 text-xs text-titleText dark:text-titleText-dark shadow-[0_18px_40px_-22px_rgba(0,0,0,0.7)] backdrop-blur-xl">
                          <div className="mb-1 font-semibold">
                            {d.name} <span className="opacity-70">({d.symbol})</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="opacity-80">حجم</span>
                            <span dir="ltr" className="font-semibold">
                              {formatEN(v)} USDT
                            </span>
                          </div>
                          <div className="mt-1 flex items-center justify-between gap-4">
                            <span className="opacity-80">سهم</span>
                            <span dir="ltr" className="font-semibold">
                              {pct.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      );
                    }}
                  />
                </Treemap>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Footer (اختیاری: خیلی سبک) */}
      <div className="mt-5 pt-4 border-t border-white/30 dark:border-white/10 text-[11px] sm:text-xs text-titleText/70 dark:text-titleText-dark/70">
        تعداد آیتم‌ها:{" "}
        <span className="font-semibold text-titleText dark:text-titleText-dark">
          {formatFA(currentData.length)}
        </span>
      </div>
    </div>
  );

};
