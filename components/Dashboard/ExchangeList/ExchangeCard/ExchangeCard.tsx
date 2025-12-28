// ExchangeCard.tsx
'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';

interface ExchangeCardProps {
    id: string;
    rank: number;
    name: string;
    volume: string | number;
    risk: number; // ✅ اینجا منظور: نسبت دارایی به بدهی (٪)
    coins: number;
    lastUpdate: string; // ✅ جلالی رو همونطور که می‌دی نشون می‌دیم
    logo: string;
}

function toFaNumberWithSep(v: string | number) {
    if (v === null || v === undefined) return '—';
    const raw = typeof v === 'number' ? v : String(v).replaceAll(',', '').replaceAll('٬', '').trim();
    const n = typeof raw === 'number' ? raw : Number(raw);
    if (!Number.isFinite(n)) return String(v);
    return new Intl.NumberFormat('fa-IR').format(n);
}

function toFaInt(v: number) {
    if (!Number.isFinite(v)) return '—';
    return new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(v);
}

function clamp(n: number, a: number, b: number) {
    return Math.min(b, Math.max(a, n));
}

// رنگ بر اساس نسبت دارایی به بدهی: هرچی بیشتر => بهتر
function ratioColor(ratio: number) {
    const r = clamp(ratio, 0, 140);
    // 0..140 => hue 0..135 (red->green)
    const hue = Math.round((r / 140) * 135);
    return `hsl(${hue} 90% 50%)`;
}

function toShortNumberEN(v: string | number) {
    if (v === null || v === undefined) return '—';
  
    const raw = typeof v === 'number' ? v : String(v).replaceAll(',', '').replaceAll('٬', '').trim();
    const n = typeof raw === 'number' ? raw : Number(raw);
    if (!Number.isFinite(n)) return String(v);
  
    const abs = Math.abs(n);
  
    const units = [
      { value: 1e12, suffix: 'T' },
      { value: 1e9, suffix: 'B' },
      { value: 1e6, suffix: 'M' },
      { value: 1e3, suffix: 'K' },
    ];
  
    const LRM = '\u200E'; // Left-to-Right Mark
    const NBSP = '\u00A0'; // فاصله‌ی نشکن (مثل space)
  
    for (const u of units) {
      if (abs >= u.value) {
        const scaled = n / u.value;
  
        const digits = Math.floor(Math.log10(Math.abs(scaled))) + 1;
        const decimals = Math.max(0, 3 - digits);
  
        let s = scaled.toFixed(decimals);
        s = s.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
  
        // ✅ عدد + فاصله + واحد (و جلوگیری از جابجایی در RTL)
        return `${LRM}${s}${NBSP}${u.suffix}`;
      }
    }
  
    // زیر 1000
    return `${LRM}${Math.round(n)}`;
  }
  

function RatioProgress({ value }: { value: number }) {
    const ratio = Number.isFinite(value) ? value : 0;

    // ✅ 0..100 نمایش پرشدن، بالای 100 هم 100% پر
    const fill = clamp(ratio, 0, 100);
    const color = ratioColor(ratio);

    const label = useMemo(() => `${toFaInt(ratio)}٪`, [ratio]);

    return (
        <div className="w-full h-full rounded-2xl border border-boxBorderColor dark:border-boxBorderColor-dark bg-white/60 dark:bg-bgColor-dark/40 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
                <div className="text-[13px] font-semibold text-titleText dark:text-titleText-dark">دارایی به بدهی</div>
                <div className="text-[14px] font-extrabold text-titleText dark:text-titleText-dark">{label}</div>
            </div>

            <div className="mt-3">
                <div className="h-3 rounded-full bg-gray-200/70 dark:bg-gray-800/60 overflow-hidden">
                    <div
                        className="h-full rounded-full transition-[width] duration-300"
                        style={{
                            width: `${fill}%`,
                            background: `linear-gradient(90deg, ${color} 0%, ${color} 60%, rgba(255,255,255,0.25) 100%)`,
                        }}
                    />
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-300">
                    <span>۰٪</span>
                    <span>۱۰۰٪</span>
                </div>
            </div>

            {/* یه نوار خیلی ظریف برای حس “پیشرفته‌تر” */}
            <div className="mt-3 h-px w-full bg-gradient-to-l from-transparent via-gray-300/60 dark:via-gray-700/60 to-transparent" />
        </div>
    );
}

const ExchangeCard: React.FC<ExchangeCardProps> = ({
    id,
    rank,
    name,
    volume,
    risk,
    coins,
    lastUpdate,
    logo,
}) => {
    const volumeFa = useMemo(() => toShortNumberEN(volume), [volume]);
    const coinsFa = useMemo(() => toFaNumberWithSep(coins), [coins]);
    const ratioFa = useMemo(() => toFaInt(risk), [risk]);

    return (
        <Link
            href={`/panel/exchanges-list/exchange/${id}`}
            dir="rtl"
            className="w-full main-animated-border-box rounded-2xl border  bg-boxColor/80 dark:bg-boxColor-dark/70 shadow-sm text-[13px] leading-relaxed cursor-pointer"
        >
            {/* header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-boxBorderColor dark:border-boxBorderColor-dark bg-white/60 dark:bg-bgColor-dark/40 overflow-hidden shrink-0">
                        {logo ? (
                            <img src={logo} className="w-8 h-8 object-contain" alt={name} />
                        ) : (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-titleText dark:text-titleText-dark">
                                <path
                                    d="M5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        )}
                    </div>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[16px] font-extrabold text-titleText dark:text-titleText-dark truncate">
                                {name}
                            </span>

                        </div>

                    </div>
                </div>

                {/* quick mini badge */}
                <div className="shrink-0 rounded-xl border border-boxBorderColor dark:border-boxBorderColor-dark bg-white/50 dark:bg-bgColor-dark/40 px-3 py-2 text-center">
                    <span className="shrink-0 py-0.5 text-[11px] text-titleText dark:text-titleText-dark">
                        رتبه {toFaNumberWithSep(rank)}
                    </span>
                </div>
            </div>

            <div className="mx-4 border-t border-boxBorderColor dark:border-boxBorderColor-dark" />

            {/* body */}
            <div className="p-4">
                {/* ✅ دو ستون هم‌ارتفاع */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
                    {/* left: progress */}
                    <div className="h-full">
                        <RatioProgress value={risk} />
                    </div>

                    {/* right: stats (هم‌ارتفاع با چپ) */}
                    <div className="h-full  flex flex-col justify-between">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-boxBorderColor dark:border-boxBorderColor-dark bg-white/50 dark:bg-bgColor-dark/30 p-3">
                                <div className="text-[11px] text-gray-600 dark:text-gray-300">حجم کل معاملات</div>
                                <div className="mt-1 text-[16px] font-extrabold text-titleText dark:text-titleText-dark rtl">
                                    {volumeFa}
                                    <span className="mr-1 text-[11px] font-semibold text-gray-600 dark:text-gray-300">تتر</span>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-boxBorderColor dark:border-boxBorderColor-dark bg-white/50 dark:bg-bgColor-dark/30 p-3">
                                <div className="text-[11px] text-gray-600 dark:text-gray-300">تعداد ارزها</div>
                                <div className="mt-1 text-[16px] font-extrabold text-titleText dark:text-titleText-dark">
                                    {coinsFa}
                                    <span className="mr-1 text-[11px] font-semibold text-gray-600 dark:text-gray-300">ارز</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 rounded-2xl border border-boxBorderColor dark:border-boxBorderColor-dark bg-white/50 dark:bg-bgColor-dark/30 p-3">
                            <div className="flex items-center justify-between">
                                <div className="text-[11px] text-gray-600 dark:text-gray-300">آخرین بروزرسانی</div>
                                <div className="text-[13px] font-bold text-titleText dark:text-titleText-dark">{lastUpdate}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ExchangeCard;
