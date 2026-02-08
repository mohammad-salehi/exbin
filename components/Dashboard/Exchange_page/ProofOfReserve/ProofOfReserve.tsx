'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { GetRequest } from '../../../../functions/GetRequest';
import { useParams } from 'next/navigation';

type ExchangeInfoProps = {
    SetLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

type AssetRow = {
    asset: string;
    fullName?: string;
    network?: string;
    reserveRatio: number; // percent
    customerNetBalance: number;
    exchangeBalance: number;
    includedInPoR: boolean;
    updatedAt: string;
    note?: string;
};

type PorApiRow = {
    exchangeId: number;
    currency: string;
    totalAssetAmount: number;
    totalAssetAmountUsd?: number;
    totalLiability: number;
    totalLiabilityUsd?: number;
    updatedAt: string;
};


function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ');
}

function clamp(n: number, a: number, b: number) {
    return Math.min(b, Math.max(a, n));
}

function formatNumberFa(n: number, digits = 2) {
    if (n === null || n === undefined || Number.isNaN(Number(n))) return '—';
    const v = Number(n);
    return v.toLocaleString('fa-IR', { maximumFractionDigits: digits });
}

function formatIntFa(n: number) {
    if (n === null || n === undefined || Number.isNaN(Number(n))) return '—';
    return Number(n).toLocaleString('fa-IR', { maximumFractionDigits: 0 });
}

function ratioTone(ratio: number) {
    if (ratio >= 110) return 'text-emerald-700 dark:text-emerald-300';
    if (ratio >= 100) return 'text-teal-700 dark:text-teal-300';
    if (ratio >= 95) return 'text-amber-700 dark:text-amber-300';
    return 'text-rose-700 dark:text-rose-300';
}

function ratioBarTone(ratio: number) {
    if (ratio >= 110) return 'bg-emerald-500';
    if (ratio >= 100) return 'bg-teal-500';
    if (ratio >= 95) return 'bg-amber-500';
    return 'bg-rose-500';
}

function Pill({
    children,
    tone = 'default',
}: {
    children: React.ReactNode;
    tone?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'brand';
}) {
    const tones: Record<string, string> = {
        default:
            'bg-boxBorderColor/35 dark:bg-boxBorderColor-dark/35 text-titleText dark:text-titleText-dark border-boxBorderColor/70 dark:border-boxBorderColor-dark/70',
        success:
            'bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 border-emerald-500/20',
        warning:
            'bg-amber-500/10 text-amber-800 dark:text-amber-200 border-amber-500/25',
        danger:
            'bg-rose-500/10 text-rose-800 dark:text-rose-200 border-rose-500/25',
        info: 'bg-sky-500/10 text-sky-800 dark:text-sky-200 border-sky-500/20',
        brand: 'bg-primary/10 text-primary border-primary/20',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-tight',
                tones[tone] ?? tones.default
            )}
        >
            {children}
        </span>
    );
}

function Card({
    title,
    right,
    children,
    className,
}: {
    title?: React.ReactNode;
    right?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-3xl border bg-white dark:bg-boxColor-dark shadow-sm',
                'border-boxBorderColor dark:border-boxBorderColor-dark',
                className
            )}
        >
            {/* soft background */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl opacity-70" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
            </div>

            <div className="relative p-5 md:p-6">
                {(title || right) && (
                    <div className="mb-5 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="text-base md:text-lg font-extrabold text-titleText dark:text-titleText-dark tracking-tight">
                                {title}
                            </div>
                        </div>
                        {right ? <div className="shrink-0">{right}</div> : null}
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}

function MetricText({
    label,
    value,
    tone,
}: {
    label: string;
    value: React.ReactNode;
    tone?: 'default' | 'success' | 'warning' | 'danger';
}) {
    const t =
        tone === 'success'
            ? 'text-emerald-800 dark:text-emerald-200'
            : tone === 'warning'
                ? 'text-amber-800 dark:text-amber-200'
                : tone === 'danger'
                    ? 'text-rose-800 dark:text-rose-200'
                    : 'text-titleText dark:text-titleText-dark';

    return (
        <div className="min-w-0">
            <div className="text-[11px] text-titleText/55 dark:text-titleText-dark/55">{label}</div>
            <div className={cn('mt-1 text-lg md:text-xl font-extrabold tracking-tight', t)}>{value}</div>
        </div>
    );
}

function AssetPorCard({ row }: { row: AssetRow }) {
    const ratio = row.reserveRatio;

    const pct = clamp(ratio, 0, 140);
    const fill = (pct / 140) * 100;

    return (
        <div
            className={cn(
                'group relative overflow-hidden rounded-[28px] border bg-white dark:bg-boxColor-dark',
                'border-boxBorderColor dark:border-boxBorderColor-dark',
                'p-5 shadow-sm transition',
                'hover:-translate-y-0.5 hover:shadow-md'
            )}
        >
            {/* glow + gradient edge */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-20 -left-20 h-52 w-52 rounded-full bg-primary/12 blur-3xl opacity-80" />
                <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl opacity-70" />
                <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent opacity-70" />
            </div>

            {/* header */}
            <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-3">
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl  bg-white/70 dark:bg-boxColor-dark/70 shadow-sm border-boxBorderColor dark:border-boxBorderColor-dark">
                            <span className="text-base font-extrabold tracking-tight"><img src={`/images/${row.asset}.png`} /></span>
                            <span className="absolute -bottom-2 left-1/2 h-1.5 w-8 -translate-x-1/2 rounded-full bg-primary/40 blur-[1px]" />
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="text-base font-extrabold tracking-tight truncate text-titleText dark:text-titleText-dark">
                                    {row.asset}
                                </div>
                                {row.fullName ? (
                                    <span className="text-xs text-titleText/60 dark:text-titleText-dark/60 truncate">
                                        {row.fullName}
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="shrink-0 text-left">
                    <div className="text-[11px] text-titleText/60 dark:text-titleText-dark/60">درصد ضریب پوشش</div>
                    <div className={cn('mt-1 text-2xl font-extrabold tracking-tight', ratioTone(ratio))}>
                        {formatNumberFa(ratio)}٪
                    </div>
                </div>
            </div>

            {/* bar */}
            <div className="relative mt-5">
                <div className="flex items-center justify-between text-[11px] text-titleText/55 dark:text-titleText-dark/55">
                    <span>۰٪</span>
                    <span>۱۴۰٪</span>
                </div>

                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-boxBorderColor/40 dark:bg-boxBorderColor-dark/40">
                    <div className={cn('h-full rounded-full', ratioBarTone(ratio))} style={{ width: `${fill}%` }} />
                </div>

                {/* numbers */}
                <div className="mt-4 grid grid-cols-1 gap-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-1">
                        <div className="rounded-3xl border p-4 border-boxBorderColor dark:border-boxBorderColor-dark bg-white/60 dark:bg-boxColor-dark/60 backdrop-blur">
                            <div className="text-[11px] text-titleText/60 dark:text-titleText-dark/60">موجودی کارگزاری</div>
                            <div className="mt-2 font-mono text-sm font-extrabold text-titleText dark:text-titleText-dark">
                                {row.exchangeBalance.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-1">
                        <div className="rounded-3xl border p-4 border-boxBorderColor dark:border-boxBorderColor-dark bg-white/60 dark:bg-boxColor-dark/60 backdrop-blur">
                            <div className="text-[11px] text-titleText/60 dark:text-titleText-dark/60">خالص دارایی کاربران</div>
                            <div className="mt-2 font-mono text-sm font-extrabold text-titleText dark:text-titleText-dark">
                                {row.customerNetBalance.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Pagination({
    page,
    totalPages,
    onPage,
}: {
    page: number;
    totalPages: number;
    onPage: (p: number) => void;
}) {
    const canPrev = page > 1;
    const canNext = page < totalPages;

    const windowSize = 5;
    const start = Math.max(1, page - Math.floor(windowSize / 2));
    const end = Math.min(totalPages, start + windowSize - 1);
    const realStart = Math.max(1, end - windowSize + 1);

    const pages: number[] = [];
    for (let p = realStart; p <= end; p++) pages.push(p);

    const Btn = ({
        children,
        disabled,
        onClick,
        active,
    }: {
        children: React.ReactNode;
        disabled?: boolean;
        onClick?: () => void;
        active?: boolean;
    }) => (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={cn(
                'h-11 min-w-[44px] rounded-2xl border px-4 text-sm font-extrabold shadow-sm transition',
                active
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white dark:bg-boxColor-dark text-titleText dark:text-titleText-dark border-boxBorderColor dark:border-boxBorderColor-dark hover:opacity-90',
                disabled && 'opacity-50 cursor-not-allowed'
            )}
        >
            {children}
        </button>
    );

    return (
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-titleText/60 dark:text-titleText-dark/60">
                صفحه {page.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Btn disabled={!canPrev} onClick={() => onPage(page - 1)}>
                    قبلی
                </Btn>

                {realStart > 1 ? (
                    <>
                        <Btn onClick={() => onPage(1)} active={page === 1}>
                            ۱
                        </Btn>
                        {realStart > 2 ? <span className="px-1 text-titleText/50 dark:text-titleText-dark/50">…</span> : null}
                    </>
                ) : null}

                {pages.map((p) => (
                    <Btn key={p} onClick={() => onPage(p)} active={p === page}>
                        {p.toLocaleString('fa-IR')}
                    </Btn>
                ))}

                {end < totalPages ? (
                    <>
                        {end < totalPages - 1 ? <span className="px-1 text-titleText/50 dark:text-titleText-dark/50">…</span> : null}
                        <Btn onClick={() => onPage(totalPages)} active={page === totalPages}>
                            {totalPages.toLocaleString('fa-IR')}
                        </Btn>
                    </>
                ) : null}

                <Btn disabled={!canNext} onClick={() => onPage(page + 1)}>
                    بعدی
                </Btn>
            </div>
        </div>
    );
}

const ProofOfReserve = ({ SetLoading }: ExchangeInfoProps) => {
    const staticMeta = useMemo(
        () => ({
            auditTime: '۲۰۲۶/۰۱/۰۶ - ۱۲:۳۰',
            verifier: 'Third-Party Auditor (Demo)',
            verificationMechanism: 'گزارش درصد پوشش دارایی‌های کارگزاری',
            scope: 'موجودی کیف پول‌های نگه‌داری (Custody) + خالص دارایی کاربران',
            riskNote: 'درصد ضریب پوشش به‌تنهایی جایگزین حسابرسی کامل بدهی‌ها و ریسک‌های خارج از زنجیره نیست.',
        }),
        []
    );

    const [assets, setAssets] = useState<AssetRow[]>([]);
    const [porLoaded, setPorLoaded] = useState(false);

    const headlineRatios = useMemo(() => {
        if (!assets.length) return { min: 0, max: 0, avg: 0, includedCount: 0 };
      
        const min = Math.min(...assets.map((a) => a.reserveRatio));
        const max = Math.max(...assets.map((a) => a.reserveRatio));
        const avg = assets.reduce((s, a) => s + a.reserveRatio, 0) / assets.length;
        const includedCount = assets.filter((a) => a.includedInPoR).length;
      
        return { min, max, avg, includedCount };
      }, [assets]);


      

    // pagination
    const PAGE_SIZE = 8;
    const [page, setPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(assets.length / PAGE_SIZE));
    const safePage = clamp(page, 1, totalPages);

    const currentItems = useMemo(() => {
        const start = (safePage - 1) * PAGE_SIZE;
        return assets.slice(start, start + PAGE_SIZE);
    }, [assets, safePage]);


    const panelBase =
        "w-full rounded-2xl bg-white dark:bg-bgColor-dark shadow-lg ring-1 ring-black/5 dark:ring-white/5";
    const params = useParams<{ id: string }>();
    const id = params.id;
    const [C1, SetC1] = useState(false);
    const [IsLoading, SetIsLoading] = useState(true);

    useEffect(() => {
        SetLoading(IsLoading);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [IsLoading]);
    // نام و لوگو
    useEffect(() => {
        GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/exchanges/${params.id}`)
            .then((response) => {
                SetLogo(response.result.logo);
                SetName(response.result.name);
                SetC1(true);
            })
            .catch((err) => {
                console.log(err);
                SetC1(true);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const cx = (...c: Array<string | false | undefined | null>) => c.filter(Boolean).join(" ");
    const [logo, SetLogo] = useState<string>("");
    const [name, SetName] = useState<string>("");
    const logoNode = useMemo(() => {
        if (logo) return <img alt="logo" className="w-8 h-8 object-contain" src={logo} />;
        return (
            <div
                className={cx(
                    "w-10 h-10 rounded-xl grid place-items-center  text-titleText dark:text-titleText-dark",
                    "bg-boxColor dark:bg-boxColor-dark",
                    "border border-boxBorderColor dark:border-boxBorderColor-dark"
                )}
            >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M4 7.2C4 6.08 4 5.52 4.218 5.092c.192-.376.498-.682.874-.874C5.52 4 6.08 4 7.2 4h9.6c1.12 0 1.68 0 2.108.218.376.192.682.498.874.874C20 5.52 20 6.08 20 7.2v9.6c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C18.48 20 17.92 20 16.8 20H7.2c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C4 18.48 4 17.92 4 16.8V7.2Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                    />
                    <path
                        d="M8 14.5 10.2 12.3a1 1 0 0 1 1.4 0l1.6 1.6a1 1 0 0 0 1.4 0L18 11.5"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
        );
    }, [logo]);

    useEffect(() => {
        setPorLoaded(false);
      
        GetRequest(
          process.env.NEXT_PUBLIC_API_URL +
            `/api/analytics/exchange/${params.id}/latest-por-for-cryptos`
        )
          .then((response) => {
            const rows: PorApiRow[] = response?.result ?? [];
      
            const mapped: AssetRow[] = rows
              .filter((r) => r?.currency)
              .map((r) => {
                const exchangeBalance = Number(r.totalAssetAmount ?? 0); // ✅ مقدار خود ارز
                const customerNetBalance = Number(r.totalLiability ?? 0); // ✅ مقدار خود ارز
      
                const reserveRatio =
                  customerNetBalance > 0
                    ? (exchangeBalance / customerNetBalance) * 100
                    : 0;
      
                return {
                  asset: String(r.currency).toUpperCase(),
                  reserveRatio,
                  customerNetBalance,
                  exchangeBalance,
                  includedInPoR: true,
                  updatedAt: r.updatedAt,
                };
              });
      
            setAssets(mapped);
            setPage(1);
            setPorLoaded(true);
          })
          .catch((err) => {
            console.log(err);
            setAssets([]);
            setPorLoaded(true);
          });
      
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [params.id]);
      

      useEffect(() => {
        // وقتی هم اطلاعات صرافی (C1) اومد هم porLoaded true شد، لودینگ false
        if (C1 && porLoaded) SetIsLoading(false);
      }, [C1, porLoaded]);
      

    return (
        <section dir="rtl" className="w-full text-titleText dark:text-titleText-dark">

            <div className={cx(panelBase, "p-5")}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                            {logoNode}
                            <h3 className="text-2xl font-extrabold text-titleText dark:text-titleText-dark truncate mb-0">
                                {name}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>
            <div className="relative w-full overflow-hidden rounded-[28px] border border-boxBorderColor dark:border-none mt-4">
                <div className="absolute inset-0 bg-white dark:bg-[#121822]" />

                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-24 -left-24 h-[520px] w-[520px] rounded-full bg-primary/16 blur-3xl dark:hidden" />
                    <div className="absolute -bottom-28 -right-28 h-[560px] w-[560px] rounded-full bg-emerald-500/14 blur-3xl dark:hidden" />
                    <div className="absolute inset-0 bg-gradient-to-l from-primary/8 via-transparent to-emerald-500/6 dark:hidden" />
                    <div className="hidden dark:block absolute -top-28 -left-28 h-[560px] w-[560px] rounded-full bg-primary/14 blur-3xl" />
                    <div className="hidden dark:block absolute -bottom-32 -right-32 h-[620px] w-[620px] rounded-full bg-emerald-500/12 blur-3xl" />
                    <div className="hidden dark:block absolute inset-0 bg-gradient-to-l from-primary/12 via-transparent to-emerald-500/10" />
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-boxBorderColor/70 to-transparent dark:via-white/10" />
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-boxBorderColor/50 to-transparent dark:via-white/10" />
                </div>

                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -right-28 top-6 h-80 w-80 rotate-[14deg] rounded-[36px] bg-primary/14 dark:bg-white/7" />
                    <div className="absolute right-16 top-20 h-72 w-72 rotate-[14deg] rounded-[34px] bg-emerald-500/14 dark:bg-white/6" />
                    <div className="absolute right-52 top-24 h-[420px] w-[420px] rotate-[14deg] rounded-[40px] bg-primary/10 dark:bg-white/5" />
                    <div className="absolute -right-10 top-72 h-56 w-[520px] rotate-[14deg] rounded-[40px] bg-emerald-500/10 dark:bg-white/6" />

                    <div className="absolute -right-28 top-6 h-80 w-80 rotate-[14deg] rounded-[36px] ring-1 ring-titleText/10 dark:ring-white/10" />
                    <div className="absolute right-16 top-20 h-72 w-72 rotate-[14deg] rounded-[34px] ring-1 ring-titleText/10 dark:ring-white/10" />
                    <div className="absolute right-52 top-24 h-[420px] w-[420px] rotate-[14deg] rounded-[40px] ring-1 ring-titleText/10 dark:ring-white/10" />
                    <div className="absolute -right-10 top-72 h-56 w-[520px] rotate-[14deg] rounded-[40px] ring-1 ring-titleText/10 dark:ring-white/10" />

                    <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.08)_32%,transparent_60%)] opacity-30 dark:opacity-20" />
                </div>

                <div className="relative grid grid-cols-1 items-center gap-10 px-6 py-9 md:px-10 md:py-12 lg:grid-cols-12">
                    <div className="lg:col-span-7">
                        <div className="flex flex-wrap items-center gap-2">
                            <Pill tone="info">Proof of Reserves</Pill>
                            <Pill tone="info">تاریخ: {staticMeta.auditTime}</Pill>
                            <Pill tone={headlineRatios.min >= 100 ? 'success' : 'warning'}>
                                {headlineRatios.min >= 100 ? 'امنیت مناسب' : 'نیاز به بررسی'}
                            </Pill>
                        </div>

                        <h1 className="mt-6 text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.12] text-titleText dark:text-white">
                            امنیت دارایی کاربران با سرویس{' '}
                            <span className="text-primary dark:text-primary-dark">اثبات ذخیره دارایی‌ها</span>
                        </h1>

                        {/* <div className="mt-8 flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                className={cn(
                                    'h-11 rounded-2xl px-6 text-sm font-extrabold transition',
                                    'bg-primary text-white hover:opacity-95',
                                    'focus:outline-none focus:ring-2 focus:ring-primary/50'
                                )}
                            >
                                مشاهده گزارش
                            </button>
                            <span className="text-xs text-titleText/55 dark:text-white/55">{staticMeta.verificationMechanism}</span>
                        </div> */}
                    </div>

                    <div className="lg:col-span-5 flex justify-center lg:justify-end">
                        <div className="relative translate-y-2 md:translate-y-4">
                            <img
                                src="/images/pantaLogo.png"
                                alt="Panta"
                                className="w-[130px] h-auto md:w-[200px] lg:w-[240px] select-none drop-shadow-[0_18px_60px_rgba(0,0,0,0.28)] dark:drop-shadow-[0_22px_70px_rgba(0,0,0,0.55)]"
                                draggable={false}
                            />
                        </div>
                    </div>
                </div>

                <div className="relative px-6 pb-8 md:px-10 md:pb-10">
                    {/* metrics row */}
                    <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        <MetricText
                            label="میانگین ضریب پوشش"
                            value={
                                <span className={ratioTone(headlineRatios.avg)}>
                                    {formatNumberFa(headlineRatios.avg)}٪
                                </span>
                            }
                        />
                        <MetricText
                            label="کمترین ضریب پوشش"
                            value={
                                <span className={ratioTone(headlineRatios.min)}>
                                    {formatNumberFa(headlineRatios.min)}٪
                                </span>
                            }
                            tone={headlineRatios.min >= 100 ? 'success' : 'warning'}
                        />
                        <MetricText
                            label="بیشترین ضریب پوشش"
                            value={
                                <span className={ratioTone(headlineRatios.max)}>
                                    {formatNumberFa(headlineRatios.max)}٪
                                </span>
                            }
                        />
                        <MetricText
                            label="تعداد دارایی‌های پوشش‌داده‌شده"
                            value={formatIntFa(headlineRatios.includedCount)}
                        />
                    </div>
                </div>
            </div>

            <Card
                className="bg-white dark:bg-boxColor-dark w-full mt-4"
                title={
                    <div></div>
                }
            >

                <div className="">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <Pill tone="info">دارایی‌ها</Pill>
                        <div className="flex flex-wrap items-center gap-2">
                            <Pill tone="info">کل: {formatIntFa(assets.length)} ارز</Pill>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {currentItems.map((row, idx) => (
                            <AssetPorCard key={`${row.asset}-${idx}`} row={row} />
                        ))}
                    </div>

                    <Pagination page={safePage} totalPages={totalPages} onPage={(p) => setPage(clamp(p, 1, totalPages))} />
                </div>
            </Card>
        </section>
    );
};

export default ProofOfReserve;
