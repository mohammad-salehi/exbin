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
  index: number
}

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}

// رنگ بر اساس نسبت دارایی به بدهی: هرچی بیشتر => بهتر
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

function RatioProgress({ value, uniqueUserCount }: { value: number, uniqueUserCount: number }) {
  const ratio = Number.isFinite(value) ? Number(value) : NaN;

  const isKnown = Number.isFinite(ratio) && ratio !== 0;

  // امنیت دارایی: 0..100 (اگر ratio > 100 => 100)
  const safety = isKnown ? clamp(ratio, 0, 100) : 0;

  // رنگ بر اساس safety (۰..۱۰۰)
  const safetyColor = ratioColor(safety);

  const ratioLabel = useMemo(() => formatNumberWithUnit(ratio), [ratio]);

  return (
    <div className="h-full w-full flex flex-col gap-3">
      {/* 1) امنیت دارایی کاربران */}
      <div
        className="
            rounded-2xl
            border border-boxBorderColor dark:border-boxBorderColor-dark
            bg-white/60 dark:bg-bgColor-dark/35
            p-4
            relative overflow-hidden
          "
      >
        {/* glow */}
        <div
          className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full blur-3xl opacity-60"
          style={{
            background: `radial-gradient(circle, ${safetyColor}33 0%, transparent 70%)`,
          }}
        />

        <div className="relative flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[12px] font-semibold text-titleText dark:text-titleText-dark">
              امنیت دارایی کاربران
            </div>
          </div>

          <div
            className="
                shrink-0
                h-10 px-3
                rounded-2xl
                border border-black/5 dark:border-white/10
                bg-white/60 dark:bg-white/5
                flex items-center justify-center
                text-[12px] font-extrabold
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
                className="h-full rounded-full transition-[width] duration-300"
                style={{
                  width: `${safety}%`,
                  background: `linear-gradient(90deg, ${safetyColor} 0%, ${safetyColor} 65%, rgba(255,255,255,0.25) 100%)`,
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

      {/* 2) نسبت دارایی به بدهی */}
      <div
        className="
             items-start justify-between gap-3 grid grid-cols-1 xl:grid-cols-2
          "
      >
        <div className="min-w-0 p-4 rounded-2xl
        min-h-full
            border border-boxBorderColor dark:border-boxBorderColor-dark
            bg-white/60 dark:bg-bgColor-dark/35">
          <div className="text-[12px] font-semibold text-titleText dark:text-titleText-dark">
            نسبت دارایی به بدهی
          </div>
          {isKnown ? (
            <div
              className="mt-3 text-[18px] font-extrabold text-titleText dark:text-titleText-dark text-center"
              dir="ltr"
            >
              {ratioLabel}
            </div>
          ) : (
            <div className="mt-3 text-[12px] font-semibold text-titleText/60 dark:text-titleText-dark/60 text-center">
              نامشخص
            </div>
          )}
        </div>
        <div className="min-w-0 p-4 rounded-2xl
          min-h-full
            border border-boxBorderColor dark:border-boxBorderColor-dark
            bg-white/60 dark:bg-bgColor-dark/35">
          <div className="text-[12px] font-semibold text-titleText dark:text-titleText-dark">
            تعداد کاربران
          </div>
          {uniqueUserCount ? (
            <div
              className="mt-3 text-[18px] font-extrabold text-titleText dark:text-titleText-dark text-center"
              dir="ltr"
            >
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

  return (
    <Link
      href={`/panel/exchanges-list/exchange/${id}`}
      dir="rtl"
      id={name}
      className={`
        block w-full
        ${index % 3 === 1 ? "border-y border-x border-boxBorderColor dark:border-boxBorderColor-dark" : 'border-y border-boxBorderColor dark:border-boxBorderColor-dark'}
         hover:bg-boxColor hover:dark:bg-[#3e4044]
        transition
        overflow-hidden

      `}
    >
      {/* Top glow */}
      <div className="pointer-events-none absolute hidden" />

      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="
                flex h-11 w-11 items-center justify-center
                rounded-2xl
                border border-boxBorderColor dark:border-boxBorderColor-dark
                bg-white/70 dark:bg-bgColor-dark/35
                overflow-hidden shrink-0
              "
            >
              {logo ? (
                <img src={logo} className="w-9 h-9 object-contain" alt={name} />
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-titleText dark:text-titleText-dark"
                  />
                </svg>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[18px] md:text-[18px] font-extrabold text-titleText dark:text-titleText-dark truncate">
                  {name}
                </span>
                {/* tiny status dot */}
                <span className="h-2 w-2 rounded-full bg-primary/80 shrink-0" />
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[12px] md:text-[12px] font-extrabold text-[#6b6b6b] dark:text-[#bebebe] truncate">
                  {legalName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-black/5 dark:bg-white/10" />

      {/* Body */}
      <div className="p-4">
        <div className=" items-stretch">
          {/* Stats */}
          <div className=" h-full flex flex-col gap-3">
            {/* Legal name card (compact) */}
            <div className="grid grid-cols-1 gap-3 flex-1">
              <RatioProgress value={reserveRatio} uniqueUserCount={uniqueUserCount} />
            </div>
          </div>

          {/* Ratio card */}
          <div className="h-full">
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ExchangeCard;
