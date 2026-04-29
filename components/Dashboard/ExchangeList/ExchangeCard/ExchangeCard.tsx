// ExchangeCard.tsx
'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';

interface ExchangeCardProps {
  id: string;
  name: string;
  legalName: string;
  logo: string;
  registrationNumber: number;
  reserveRatio: number;
  siteAddress: string;
  uniqueCoins: number;
  uniqueUserCount: number;
  index: number;
}

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}

function ratioColor(ratio: number) {
  const r = clamp(ratio, 0, 140);
  const hue = Math.round((r / 140) * 135); // red -> green
  return `hsl(${hue} 90% 50%)`;
}

function formatNumberWithUnit(num: number) {
  if (!Number.isFinite(num)) return 'نامشخص';

  const absNum = Math.abs(num);
  let value: string;
  let unit = '';

  if (absNum >= 1_000_000_000) {
    value = (num / 1_000_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 });
    unit = 'B';
  } else if (absNum >= 1_000_000) {
    value = (num / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 });
    unit = 'M';
  } else if (absNum >= 1_000) {
    value = (num / 1_000).toLocaleString(undefined, { maximumFractionDigits: 1 });
    unit = 'K';
  } else {
    value = num.toLocaleString();
  }

  return `${value}${unit} %`;
}

function RatioProgress({ value, uniqueUserCount }: { value: number; uniqueUserCount: number }) {
  const ratio = Number.isFinite(value) ? Number(value) : NaN;
  const isKnown = Number.isFinite(ratio) && ratio !== 0;

  // امنیت دارایی: 0..100 (اگر ratio > 100 => 100)
  const safety = isKnown ? clamp(ratio, 0, 100) : 0;
  const safetyColor = ratioColor(safety);
  const ratioLabel = useMemo(() => formatNumberWithUnit(ratio), [ratio]);

  return (
    <div className="h-full w-full flex flex-col gap-3">
      {/* 1) امنیت دارایی کاربران */}
      <div
        className="
          relative overflow-hidden
          rounded-2xl
          border border-boxBorderColor/80 dark:border-boxBorderColor-dark/80
          bg-white/70 dark:bg-bgColor-dark/40
          p-4
          shadow-[0_10px_30px_-20px_rgba(0,0,0,0.35)]
        "
      >
        {/* subtle texture */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.55] dark:opacity-[0.35]">
          <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full blur-3xl"
            style={{ background: `radial-gradient(circle, ${safetyColor}22 0%, transparent 70%)` }}
          />
          <div className="absolute -bottom-28 -left-28 h-72 w-72 rounded-full blur-3xl"
            style={{ background: `radial-gradient(circle, ${safetyColor}14 0%, transparent 72%)` }}
          />
        </div>

        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[12px] font-semibold text-titleText dark:text-titleText-dark">
              امنیت دارایی کاربران
            </div>
            <div className="mt-1 text-[11px] text-titleText/60 dark:text-titleText-dark/60">
              برآورد بر اساس نسبت دارایی به بدهی
            </div>
          </div>

          <div
            className="
              shrink-0
              h-10 px-3
              rounded-2xl
              border border-black/5 dark:border-white/10
              bg-white/70 dark:bg-white/5
              backdrop-blur
              flex items-center justify-center
              text-[12px] font-extrabold
              shadow-sm
            "
            style={{ color: safetyColor }}
            dir="ltr"
            title="امنیت"
          >
            {isKnown ? `${Math.round(safety)}%` : '—'}
          </div>
        </div>

        {isKnown ? (
          <div className="relative mt-4">
            <div className="h-3 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${safety}%`,
                  background: `linear-gradient(90deg, ${safetyColor} 0%, ${safetyColor} 70%, rgba(255,255,255,0.35) 100%)`,
                }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-titleText/60 dark:text-titleText-dark/60">
              <span>۰</span>
              <span>۱۰۰</span>
            </div>
          </div>
        ) : (
          <div className="relative mt-5 text-center text-[12px] font-semibold text-titleText/60 dark:text-titleText-dark/60">
            نامشخص
          </div>
        )}

        <div className="mt-4 h-px w-full bg-gradient-to-l from-transparent via-black/10 dark:via-white/10 to-transparent" />
      </div>

      {/* 2) نسبت دارایی به بدهی + تعداد کاربران */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 items-stretch">
        <div
          className="
            min-w-0 p-4 rounded-2xl
            border border-boxBorderColor/80 dark:border-boxBorderColor-dark/80
            bg-white/70 dark:bg-bgColor-dark/40
            shadow-[0_8px_26px_-22px_rgba(0,0,0,0.35)]
            flex flex-col justify-between
          "
        >
          <div className="text-[12px] font-semibold text-titleText dark:text-titleText-dark">
            نسبت دارایی به بدهی
          </div>

          {isKnown ? (
            <div className="mt-3 text-[18px] font-extrabold text-titleText dark:text-titleText-dark text-center" dir="ltr">
              {ratioLabel}
            </div>
          ) : (
            <div className="mt-3 text-[12px] font-semibold text-titleText/60 dark:text-titleText-dark/60 text-center">
              نامشخص
            </div>
          )}

        </div>

        <div
          className="
            min-w-0 p-4 rounded-2xl
            border border-boxBorderColor/80 dark:border-boxBorderColor-dark/80
            bg-white/70 dark:bg-bgColor-dark/40
            shadow-[0_8px_26px_-22px_rgba(0,0,0,0.35)]
            flex flex-col justify-between
          "
        >
          <div className="text-[12px] font-semibold text-titleText dark:text-titleText-dark">
            تعداد کاربران
          </div>

          {uniqueUserCount ? (
            <div className="mt-3 text-[18px] font-extrabold text-titleText dark:text-titleText-dark text-center" dir="ltr">
              {uniqueUserCount.toLocaleString()}
            </div>
          ) : (
            <div className="mt-3 text-[12px] font-semibold text-titleText/60 dark:text-titleText-dark/60 text-center">
              نامشخص
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

const ExchangeCard: React.FC<ExchangeCardProps> = ({
  id,
  name,
  legalName,
  logo,
  index,
  reserveRatio,
  siteAddress,
  uniqueCoins,
  uniqueUserCount,
}) => {
  const safeSite = siteAddress || '';

  const borderClass =
    index % 3 === 1
      ? 'border-y border-x border-boxBorderColor/80 dark:border-boxBorderColor-dark/80'
      : 'border-y border-boxBorderColor/80 dark:border-boxBorderColor-dark/80';

      return (
        <Link
          href={`/panel/exchanges-list/exchange/${id}`}
          dir="rtl"
          id={name}
          className={`
            group relative block w-full overflow-hidden 
            border border-white/10 dark:border-white/5
            bg-white/60 dark:bg-bgColor-dark/30
            backdrop-blur-xl
            shadow-[0_4px_20px_rgba(0,0,0,0.04)]
            transition-all duration-300 ease-out
      
            hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.25)]
            hover:-translate-y-0.5
            hover:bg-white/70 hover:dark:bg-bgColor-dark/40
      
            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60
            focus-visible:ring-offset-2 focus-visible:ring-offset-white
            dark:focus-visible:ring-offset-bgColor-dark
          `}
        >
          {/* Glow subtle highlight */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/30 dark:from-white/10 to-transparent opacity-60" />
      
          {/* Blue aura on hover */}
          <div
            className="
              pointer-events-none absolute inset-0  opacity-0
              group-hover:opacity-30 transition duration-300
              bg-[radial-gradient(circle_at_top_right,rgba(99,195,255,0.35),transparent_60%)]
            "
          />
      
          {/* Header */}
          <div className="relative px-5 pt-5 pb-4">
            <div className="flex items-start justify-between gap-4">
      
              {/* Left block (logo + names) */}
              <div className="flex items-center gap-4 min-w-0">
      
                {/* Logo */}
                <div
                  className={`
                    relative flex h-12 w-12 items-center justify-center shrink-0
                    rounded-2xl
                    bg-white/80 dark:bg-bgColor-dark/50 backdrop-blur-sm
                    border border-white/40 dark:border-white/10
                    shadow-md
                    overflow-hidden
                  `}
                >
                  {/* glow */}
                  <div className="pointer-events-none absolute inset-0 opacity-50">
                    <div className="absolute -top-8 -right-8 h-20 w-20 rounded-full blur-2xl bg-primary/20" />
                  </div>
      
                  {logo ? (
                    <img src={logo} className="w-10 h-10 object-contain relative" alt={name} />
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" className="text-titleText dark:text-titleText-dark">
                      <path
                        d="M5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      />
                    </svg>
                  )}
                </div>
      
                {/* Texts */}
                <div className="min-w-0 flex flex-col">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[18px] font-extrabold text-titleText dark:text-titleText-dark truncate">
                      {name}
                    </span>
      
                    {/* status dot */}
                    <span className="h-2 w-2 rounded-full bg-primary/80 shrink-0" />
                  </div>
      
                  <span className="mt-0.5 text-[12px] font-semibold text-[#6b6b6b] dark:text-[#cfcfcf] truncate">
                    {legalName}
                  </span>
                </div>
              </div>
      
              {/* right badge */}
              <div
                className="
                  shrink-0 rounded-xl
                  border border-white/20 dark:border-white/10
                  bg-white/70 dark:bg-white/5 backdrop-blur-lg
                  px-3 py-1.5
                  text-[11px] font-semibold
                  text-titleText/70 dark:text-titleText-dark/70
                  shadow-sm
                  group-hover:bg-primary/10 group-hover:text-primary transition
                "
              >
                {uniqueCoins ? `${uniqueCoins.toLocaleString()} کوین` : '—'}
              </div>
            </div>
          </div>
      
          {/* Divider */}
          <div className="mx-5 h-px bg-black/5 dark:bg-white/10" />
      
          {/* Body */}
          <div className="p-5">
            <div className="flex flex-col">
              <RatioProgress value={reserveRatio} uniqueUserCount={uniqueUserCount} />
            </div>
          </div>
        </Link>
      );
      
};

export default ExchangeCard;
