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
        <div className="w-full h-full rounded-2xl border text-titleText dark:text-titleText-dark border-boxBorderColor dark:border-boxBorderColor-dark bg-white/60 dark:bg-bgColor-dark/40 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
                <div className="text-[13px] font-semibold text-titleText dark:text-titleText-dark">دارایی به بدهی</div>
                {
                    value ?
                        <div className="text-[14px] font-extrabold text-titleText dark:text-titleText-dark">{label}</div>
                        :
                        <div className="text-[14px] font-extrabold text-titleText dark:text-titleText-dark">نامشخص</div>

                }
            </div>
            {
                value ?
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
                    :
                    <div className='text-center w-full items-center m-auto align-middle'>
                        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='m-auto'>
                            <path d="M10.5 15L13.5 12M13.5 15L10.5 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                            <path d="M22 11.7979C22 9.16554 22 7.84935 21.2305 6.99383C21.1598 6.91514 21.0849 6.84024 21.0062 6.76946C20.1506 6 18.8345 6 16.2021 6H15.8284C14.6747 6 14.0979 6 13.5604 5.84678C13.2651 5.7626 12.9804 5.64471 12.7121 5.49543C12.2237 5.22367 11.8158 4.81578 11 4L10.4497 3.44975C10.1763 3.17633 10.0396 3.03961 9.89594 2.92051C9.27652 2.40704 8.51665 2.09229 7.71557 2.01738C7.52976 2 7.33642 2 6.94975 2C6.06722 2 5.62595 2 5.25839 2.06935C3.64031 2.37464 2.37464 3.64031 2.06935 5.25839C2 5.62595 2 6.06722 2 6.94975M21.9913 16C21.9554 18.4796 21.7715 19.8853 20.8284 20.8284C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.8284C2 19.6569 2 17.7712 2 14V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                        </svg>
                    </div>

            }


            {/* یه نوار خیلی ظریف برای حس “پیشرفته‌تر” */}
            <div className="mt-3 h-px w-full bg-gradient-to-l from-transparent via-gray-300/60 dark:via-gray-700/60 to-transparent" />
        </div>
    );
}

const ExchangeCard: React.FC<ExchangeCardProps> = ({
    id,
    name,
    legalName,
    logo,
    registrationNumber,
    reserveRatio,
    siteAddress,
    uniqueCoins,
    uniqueUserCount,
}) => {

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
                        <div className="flex items-center gap-1 min-w-0">
                            <span className="text-[20px] font-extrabold text-titleText dark:text-titleText-dark truncate">
                                {name}
                            </span>

                        </div>

                    </div>
                </div>

            </div>

            <div className="mx-4 border-t border-boxBorderColor dark:border-boxBorderColor-dark" />

            {/* body */}
            <div className="p-4">
                {/* ✅ دو ستون هم‌ارتفاع */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
                    {/* left: progress */}


                    {/* right: stats (هم‌ارتفاع با چپ) */}
                    <div className="h-full  flex flex-col justify-between">
                        <div className=" rounded-2xl border border-boxBorderColor dark:border-boxBorderColor-dark bg-white/50 dark:bg-bgColor-dark/30 p-3">
                            <div className="flex items-center justify-between">
                                <div className="text-[13px] font-bold text-titleText dark:text-titleText-dark">{legalName}</div>
                            </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-boxBorderColor dark:border-boxBorderColor-dark bg-white/50 dark:bg-bgColor-dark/30 p-3">
                                <div className="text-[11px] text-gray-600 dark:text-gray-300">تعداد کاربران</div>
                                <div className="mt-1 text-[16px] font-extrabold text-titleText dark:text-titleText-dark rtl">
                                    {
                                        uniqueUserCount ?
                                            <div>
                                                {uniqueUserCount.toLocaleString()}
                                            </div>
                                            :
                                            <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">نامشخص</span>

                                    }
                                </div>
                            </div>

                            <div className="rounded-2xl border border-boxBorderColor dark:border-boxBorderColor-dark bg-white/50 dark:bg-bgColor-dark/30 p-3">
                                <div className="text-[11px] text-gray-600 dark:text-gray-300">تعداد ارزها</div>
                                <div className="mt-1 text-[16px] font-extrabold text-titleText dark:text-titleText-dark">
                                    {
                                        uniqueCoins ?
                                            <div>
                                                {uniqueCoins}
                                                <span className="mr-1 text-[11px] font-semibold text-gray-600 dark:text-gray-300">ارز</span>
                                            </div>
                                            :
                                            <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">نامشخص</span>
                                    }

                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="h-full">

                        <RatioProgress value={reserveRatio} />
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ExchangeCard;
