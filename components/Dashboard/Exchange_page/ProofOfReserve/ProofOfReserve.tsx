'use client';

import React, { useMemo, useState } from 'react';

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

function ratioBadgeTone(ratio: number): 'success' | 'warning' | 'danger' | 'info' {
    if (ratio >= 100) return 'success';
    if (ratio >= 95) return 'warning';
    return 'danger';
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

function Metric({
    label,
    value,
    sub,
    tone,
    icon,
}: {
    label: string;
    value: React.ReactNode;
    sub?: React.ReactNode;
    tone?: 'default' | 'success' | 'warning' | 'danger';
    icon?: React.ReactNode;
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
        <div
            className={cn(
                'group relative overflow-hidden rounded-3xl border p-4 md:p-5',
                'border-boxBorderColor dark:border-boxBorderColor-dark',
                'bg-white/65 dark:bg-boxColor-dark/60 backdrop-blur',
                'shadow-sm hover:shadow-md transition'
            )}
        >
            <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl opacity-70" />
            <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="text-[11px] text-titleText/60 dark:text-titleText-dark/60">{label}</div>
                    <div className={cn('mt-2 text-xl md:text-2xl font-extrabold tracking-tight', t)}>{value}</div>
                    {sub ? (
                        <div className="mt-1 text-[11px] text-titleText/55 dark:text-titleText-dark/55">{sub}</div>
                    ) : null}
                </div>
                {icon ? (
                    <div className="shrink-0 rounded-2xl border bg-white/60 dark:bg-boxColor-dark/60 px-3 py-2 text-xs font-semibold border-boxBorderColor dark:border-boxBorderColor-dark">
                        {icon}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function AssetPorCard({ row }: { row: AssetRow }) {
    const ratio = row.reserveRatio;
    const badgeTone = ratioBadgeTone(ratio);

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
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border bg-white/70 dark:bg-boxColor-dark/70 shadow-sm border-boxBorderColor dark:border-boxBorderColor-dark">
                            <span className="text-base font-extrabold tracking-tight">{row.asset}</span>
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
                        {(ratio).toLocaleString()}٪
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
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-3xl border p-4 border-boxBorderColor dark:border-boxBorderColor-dark bg-white/60 dark:bg-boxColor-dark/60 backdrop-blur">
                            <div className="text-[11px] text-titleText/60 dark:text-titleText-dark/60">خالص دارایی کاربران</div>
                            <div className="mt-2 font-mono text-sm font-extrabold text-titleText dark:text-titleText-dark">
                                {row.customerNetBalance.toLocaleString()}
                            </div>
                        </div>

                        <div className="rounded-3xl border p-4 border-boxBorderColor dark:border-boxBorderColor-dark bg-white/60 dark:bg-boxColor-dark/60 backdrop-blur">
                            <div className="text-[11px] text-titleText/60 dark:text-titleText-dark/60">موجودی سکو</div>
                            <div className="mt-2 font-mono text-sm font-extrabold text-titleText dark:text-titleText-dark">
                                {row.exchangeBalance.toLocaleString()}
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
                        {realStart > 2 ? (
                            <span className="px-1 text-titleText/50 dark:text-titleText-dark/50">…</span>
                        ) : null}
                    </>
                ) : null}

                {pages.map((p) => (
                    <Btn key={p} onClick={() => onPage(p)} active={p === page}>
                        {p.toLocaleString('fa-IR')}
                    </Btn>
                ))}

                {end < totalPages ? (
                    <>
                        {end < totalPages - 1 ? (
                            <span className="px-1 text-titleText/50 dark:text-titleText-dark/50">…</span>
                        ) : null}
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

const ProofOfReserve: React.FC<ExchangeInfoProps> = () => {
    const staticMeta = useMemo(
        () => ({
            auditTime: '۲۰۲۶/۰۱/۰۶ - ۱۲:۳۰',
            verifier: 'Third-Party Auditor (Demo)',
            verificationMechanism: 'Snapshot-based درصد ضریب پوشش',
            scope: 'موجودی کیف پول‌های نگه‌داری (Custody) در زمان اسنپ‌شات + خالص دارایی کاربران (Demo)',
            riskNote: 'درصد ضریب پوشش به‌تنهایی جایگزین حسابرسی کامل بدهی‌ها و ریسک‌های خارج از زنجیره نیست.',
        }),
        []
    );

    const assets: AssetRow[] = useMemo(
        () => [
            {
                asset: 'BTC',
                fullName: 'Bitcoin',
                reserveRatio: 102.11,
                customerNetBalance: 617_620.1234,
                exchangeBalance: 630_650.8821,
                includedInPoR: true,
                updatedAt: '2026-01-06T12:30:00Z',
                note: 'Cold + Hot wallets (demo)',
            },
            {
                asset: 'ETH',
                fullName: 'Ethereum',
                reserveRatio: 100.02,
                customerNetBalance: 4_012_340.5123,
                exchangeBalance: 4_013_143.0812,
                includedInPoR: true,
                updatedAt: '2026-01-06T12:30:00Z',
            },
            {
                asset: 'USDT',
                fullName: 'Tether',
                network: 'ERC20 / TRC20',
                reserveRatio: 109.16,
                customerNetBalance: 9_804_120_345.22,
                exchangeBalance: 10_703_560_432.11,
                includedInPoR: true,
                updatedAt: '2026-01-06T12:30:00Z',
            },
            {
                asset: 'USDC',
                fullName: 'USD Coin',
                reserveRatio: 137.7,
                customerNetBalance: 1_243_120_000.0,
                exchangeBalance: 1_711_200_000.0,
                includedInPoR: true,
                updatedAt: '2026-01-06T12:30:00Z',
            },
            {
                asset: 'BNB',
                fullName: 'BNB',
                reserveRatio: 112.32,
                customerNetBalance: 36_402_120.55,
                exchangeBalance: 40_890_112.88,
                includedInPoR: true,
                updatedAt: '2026-01-06T12:30:00Z',
            },
            {
                asset: 'XRP',
                fullName: 'XRP',
                reserveRatio: 99.4,
                customerNetBalance: 920_000_000,
                exchangeBalance: 914_480_000,
                includedInPoR: true,
                updatedAt: '2026-01-06T12:30:00Z',
                note: 'کمی پایین‌تر از ۱:۱ (دمو)',
            },
            // extras for pagination demo
            {
                asset: 'SOL',
                fullName: 'Solana',
                reserveRatio: 104.22,
                customerNetBalance: 88_120_000.12,
                exchangeBalance: 91_843_210.8,
                includedInPoR: true,
                updatedAt: '2026-01-06T12:30:00Z',
            },
            {
                asset: 'ADA',
                fullName: 'Cardano',
                reserveRatio: 101.08,
                customerNetBalance: 1_204_000_000,
                exchangeBalance: 1_217_000_000,
                includedInPoR: true,
                updatedAt: '2026-01-06T12:30:00Z',
            },
            {
                asset: 'DOGE',
                fullName: 'Dogecoin',
                reserveRatio: 111.5,
                customerNetBalance: 6_120_000_000,
                exchangeBalance: 6_820_000_000,
                includedInPoR: true,
                updatedAt: '2026-01-06T12:30:00Z',
            },
            {
                asset: 'TRX',
                fullName: 'TRON',
                reserveRatio: 98.2,
                customerNetBalance: 3_540_000_000,
                exchangeBalance: 3_476_000_000,
                includedInPoR: true,
                updatedAt: '2026-01-06T12:30:00Z',
            },
            {
                asset: 'MATIC',
                fullName: 'Polygon',
                reserveRatio: 120.1,
                customerNetBalance: 560_000_000,
                exchangeBalance: 672_560_000,
                includedInPoR: true,
                updatedAt: '2026-01-06T12:30:00Z',
            },
            {
                asset: 'AVAX',
                fullName: 'Avalanche',
                reserveRatio: 106.9,
                customerNetBalance: 42_000_000,
                exchangeBalance: 44_898_000,
                includedInPoR: true,
                updatedAt: '2026-01-06T12:30:00Z',
            },
        ],
        []
    );

    const headlineRatios = useMemo(() => {
        const min = Math.min(...assets.map((a) => a.reserveRatio));
        const max = Math.max(...assets.map((a) => a.reserveRatio));
        const avg = assets.reduce((s, a) => s + a.reserveRatio, 0) / Math.max(assets.length, 1);
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

    return (
        <section dir="rtl" className="w-full text-titleText dark:text-titleText-dark">
            {/* HERO */}
            <div className="relative overflow-hidden rounded-[32px] border bg-white dark:bg-boxColor-dark border-boxBorderColor dark:border-boxBorderColor-dark shadow-sm">
                {/* decorative */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-28 -right-28 h-[520px] w-[520px] rounded-full bg-primary/12 blur-3xl" />
                    <div className="absolute -bottom-36 -left-36 h-[560px] w-[560px] rounded-full bg-emerald-500/10 blur-3xl opacity-80" />
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/55 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/35 to-transparent" />
                </div>

                <div className="relative p-5 md:p-10 xl:p-12">
                    <div className="flex flex-col gap-6 md:gap-7">
                        <div className="flex flex-wrap items-center gap-2">
                            <Pill tone="info">اثبات ذخیره دارایی‌ها</Pill>
                        </div>

                        <div className="flex flex-col gap-3">
                            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.15]">
                                امنیت دارایی کاربران با سرویس{' '}
                                <span className='text-primary dark:text-primary-dark'>اثبات ذخیره دارایی‌ها</span>
                            </h1>
                            <p className="max-w-3xl text-sm md:text-base text-titleText/70 dark:text-titleText-dark/70 leading-7">
                                این صفحه وضعیت پشتوانه دارایی‌های سکو را نشان می‌دهد
                            </p>
                        </div>

                        {/* Exchange overview (richer + nicer) */}
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                            <div className="lg:col-span-12">
                                <Card
                                    className="bg-white/60 dark:bg-boxColor-dark/60 backdrop-blur"
                                    title={
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-titleText/60 dark:text-titleText-dark/60">نمای کلی سکو</span>
                                        </div>
                                    }
                                    right={
                                        <Pill tone={headlineRatios.min >= 100 ? 'success' : 'warning'}>
                                            {headlineRatios.min >= 100 ? 'امنیت مناسب' : 'نیاز به بررسی'}
                                        </Pill>
                                    }
                                >
                                    <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-4">
                                        <Metric
                                            label="دارایی‌های پوشش‌داده‌شده"
                                            value={formatIntFa(headlineRatios.includedCount)}
                                            sub="Included assets"
                                            icon="Assets"
                                        />
                                        <Metric
                                            label="میانگین ضریب پوشش"
                                            value={<span className={ratioTone(headlineRatios.avg)}>{formatNumberFa(headlineRatios.avg)}٪</span>}
                                            sub="Average"
                                            icon="Avg"
                                        />
                                        <Metric
                                            label="کمترین ضریب پوشش"
                                            value={<span className={ratioTone(headlineRatios.min)}>{formatNumberFa(headlineRatios.min)}٪</span>}
                                            sub="Minimum"
                                            tone={headlineRatios.min >= 100 ? 'success' : 'warning'}
                                            icon="Min"
                                        />
                                        <Metric
                                            label="بیشترین ضریب پوشش"
                                            value={<span className={ratioTone(headlineRatios.max)}>{formatNumberFa(headlineRatios.max)}٪</span>}
                                            sub="Maximum"
                                            icon="Max"
                                        />
                                    </div>

                                </Card>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Assets cards */}
            <div className="mt-6">
                <Card
                    title="دارایی‌ها"
                    right={
                        <div className="flex flex-wrap items-center gap-2">
                            <Pill tone="info">تاریخ: {staticMeta.auditTime}</Pill>
                            <Pill tone="default">{formatIntFa(PAGE_SIZE).toLocaleString()} مورد در هر صفحه</Pill>
                            <Pill tone="info">کل: {formatIntFa(assets.length)}</Pill>
                        </div>
                    }
                >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {currentItems.map((row, idx) => (
                            <AssetPorCard key={`${row.asset}-${idx}`} row={row} />
                        ))}
                    </div>

                    <Pagination page={safePage} totalPages={totalPages} onPage={(p) => setPage(clamp(p, 1, totalPages))} />
                </Card>
            </div>

            {/* FAQ + notes */}
            {/* FAQ */}
            <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-1">
                <Card title="سوالات متداول">
                    <div className="space-y-3">
                        {[
                            {
                                q: 'آیا درصد ضریب پوشش کافی یعنی سکو کاملاً سالم است؟',
                                a: 'درصد ضریب پوشش معمولاً نشان می‌دهد دارایی‌های قابل گزارش برای پوشش موجودی کاربران وجود دارد، اما لزوماً همه بدهی‌ها یا تعهدات خارج از زنجیره را پوشش نمی‌دهد. بنابراین درصد ضریب پوشش به‌تنهایی معیار سلامت کامل سکو نیست.',
                            },
                            {
                                q: 'درصد ضریب پوشش بالای ۱۰۰٪ یعنی چه؟',
                                a: 'به این معناست که موجودی گزارش‌شده سکو برای آن دارایی، بیشتر از خالص دارایی کاربران است. این حالت می‌تواند نشان‌دهنده وجود ذخایر مازاد یا سیاست‌های محافظه‌کارانه در نگه‌داری دارایی باشد.',
                            },
                            {
                                q: 'چرا ممکن است نسبت یک دارایی زیر ۱۰۰٪ باشد؟',
                                a: 'این موضوع می‌تواند به دلایلی مانند محدودیت دامنه اسنپ‌شات، تأخیر در همگام‌سازی داده‌ها یا روش محاسبه مرتبط باشد. در این صفحه، مقادیر صرفاً برای نمایش نمونه‌ای درج شده‌اند.',
                            },
                            {
                                q: 'آیا اطلاعات ارائه‌شده در درصد ضریب پوشش جایگزین گزارش‌های رسمی نظارتی است؟',
                                a: 'خیر. اطلاعات درصد ضریب پوشش صرفاً به‌عنوان یک گزارش شفافیت تکمیلی ارائه می‌شود و جایگزین گزارش‌های رسمی، حسابرسی‌های قانونی یا الزامات افشای اطلاعات مورد مطالبه نهاد ناظر نخواهد بود.',
                            },
                            {
                                q: 'مسئولیت صحت و کفایت اطلاعات درصد ضریب پوشش بر عهده چه نهادی است؟',
                                a: 'مسئولیت صحت، جامعیت و انطباق اطلاعات ارائه‌شده با الزامات قانونی و مقررات ابلاغی، بر عهده سکو بوده و بررسی، راستی‌آزمایی و ارزیابی کفایت آن در چارچوب اختیارات نهاد ناظر انجام می‌پذیرد.',
                            },
                        ].map((item, i) => (
                            <details
                                key={i}
                                className="group rounded-3xl border bg-white/60 dark:bg-boxColor-dark/60 backdrop-blur p-5 border-boxBorderColor dark:border-boxBorderColor-dark shadow-sm hover:shadow-md transition"
                            >
                                <summary className="cursor-pointer list-none">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="text-sm font-extrabold tracking-tight">
                                            {item.q}
                                        </div>
                                        <div className="rounded-2xl border px-3 py-2 text-xs text-titleText/70 dark:text-titleText-dark/70 border-boxBorderColor dark:border-boxBorderColor-dark group-open:rotate-180 transition">
                                            ⌄
                                        </div>
                                    </div>
                                </summary>
                                <div className="mt-3 text-sm leading-7 text-titleText/75 dark:text-titleText-dark/75">
                                    {item.a}
                                </div>
                            </details>
                        ))}
                    </div>
                </Card>
            </div>

        </section>
    );
};

export default ProofOfReserve;
