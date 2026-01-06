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
    return v.toLocaleString('fa-IR', {
        maximumFractionDigits: digits,
    });
}

function ratioTone(ratio: number) {
    if (ratio >= 110) return 'text-emerald-600 dark:text-emerald-400';
    if (ratio >= 100) return 'text-teal-600 dark:text-teal-400';
    if (ratio >= 95) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
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
            'bg-boxBorderColor/40 dark:bg-boxBorderColor-dark/40 text-titleText dark:text-titleText-dark border-boxBorderColor dark:border-boxBorderColor-dark',
        success:
            'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
        warning:
            'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
        danger:
            'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
        info: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20',
        brand: 'bg-primary/10 text-primary border-primary/20',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium',
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
}: {
    title?: React.ReactNode;
    right?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border bg-white dark:bg-boxColor-dark p-6 shadow-sm border-boxBorderColor dark:border-boxBorderColor-dark">
            {(title || right) && (
                <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="text-base font-semibold text-titleText dark:text-titleText-dark">
                            {title}
                        </div>
                    </div>
                    {right ? <div className="shrink-0">{right}</div> : null}
                </div>
            )}
            {children}
        </div>
    );
}

function Metric({
    label,
    value,
    sub,
    tone,
}: {
    label: string;
    value: React.ReactNode;
    sub?: React.ReactNode;
    tone?: 'default' | 'success' | 'warning' | 'danger';
}) {
    const t =
        tone === 'success'
            ? 'text-emerald-700 dark:text-emerald-300'
            : tone === 'warning'
                ? 'text-amber-700 dark:text-amber-300'
                : tone === 'danger'
                    ? 'text-rose-700 dark:text-rose-300'
                    : 'text-titleText dark:text-titleText-dark';

    return (
        <div className="rounded-2xl border p-4 border-boxBorderColor dark:border-boxBorderColor-dark bg-white/60 dark:bg-boxColor-dark/60 backdrop-blur">
            <div className="text-[11px] text-titleText/60 dark:text-titleText-dark/60">
                {label}
            </div>
            <div className={cn('mt-2 text-lg font-extrabold', t)}>{value}</div>
            {sub ? (
                <div className="mt-1 text-[11px] text-titleText/55 dark:text-titleText-dark/55">
                    {sub}
                </div>
            ) : null}
        </div>
    );
}

function AssetPorCard({ row }: { row: AssetRow }) {
    const ratio = row.reserveRatio;
    const badgeTone =
        ratio >= 100 ? 'success' : ratio >= 95 ? 'warning' : 'danger';

    const pct = clamp(ratio, 0, 140);
    const fill = (pct / 140) * 100;

    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-3xl border bg-white dark:bg-boxColor-dark p-5 shadow-sm',
                'border-boxBorderColor dark:border-boxBorderColor-dark',
                'hover:shadow-md transition'
            )}
        >
            {/* subtle glow */}
            <div className="pointer-events-none absolute -top-20 -left-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl opacity-70" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl opacity-60" />

            {/* header */}
            <div className="relative flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border bg-white/70 dark:bg-boxColor-dark/70 shadow-sm border-boxBorderColor dark:border-boxBorderColor-dark">
                        <span className="text-base font-extrabold">{row.asset}</span>
                        <span className="absolute -bottom-2 left-1/2 h-1.5 w-8 -translate-x-1/2 rounded-full bg-primary/40 blur-[1px]" />
                    </div>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="text-base font-semibold truncate">{row.asset}</div>
                            {row.fullName ? (
                                <span className="text-xs text-titleText/60 dark:text-titleText-dark/60 truncate">
                                    {row.fullName}
                                </span>
                            ) : null}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            <Pill tone={badgeTone}>{ratio >= 100 ? '≥ ۱:۱' : '< ۱:۱'}</Pill>
                            {row.network ? <Pill tone="default">{row.network}</Pill> : null}
                            <Pill tone="info">
                                {new Date(row.updatedAt).toLocaleString('fa-IR')}
                            </Pill>
                        </div>
                    </div>
                </div>

                <div className="shrink-0 text-left">
                    <div className="text-[11px] text-titleText/60 dark:text-titleText-dark/60">
                        Reserve Ratio
                    </div>
                    <div className={cn('mt-1 text-2xl font-extrabold', ratioTone(ratio))}>
                        {formatNumberFa(ratio)}٪
                    </div>
                </div>
            </div>

            {/* bar */}
            <div className="relative mt-4">
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-boxBorderColor/40 dark:bg-boxBorderColor-dark/40">
                    <div
                        className={cn('h-full rounded-full', ratioBarTone(ratio))}
                        style={{ width: `${fill}%` }}
                    />
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3">
                    <div className="rounded-2xl border p-4 border-boxBorderColor dark:border-boxBorderColor-dark bg-white/60 dark:bg-boxColor-dark/60 backdrop-blur">
                        <div className="text-[11px] text-titleText/60 dark:text-titleText-dark/60">
                            خالص دارایی کاربران
                        </div>
                        <div className="mt-2 font-mono text-sm font-semibold">
                            {row.customerNetBalance.toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3">
                    <div className="rounded-2xl border p-4 border-boxBorderColor dark:border-boxBorderColor-dark bg-white/60 dark:bg-boxColor-dark/60 backdrop-blur">
                        <div className="text-[11px] text-titleText/60 dark:text-titleText-dark/60">
                            موجودی صرافی
                        </div>
                        <div className="mt-2 font-mono text-sm font-semibold">
                            {row.exchangeBalance.toLocaleString()}
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

    const pages = [];
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
                'h-11 min-w-[44px] rounded-2xl border px-4 text-sm font-semibold shadow-sm transition',
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
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
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
                            <span className="px-1 text-titleText/50 dark:text-titleText-dark/50">
                                …
                            </span>
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
                            <span className="px-1 text-titleText/50 dark:text-titleText-dark/50">
                                …
                            </span>
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
            verificationMechanism: 'Snapshot-based PoR',
            scope:
                'موجودی کیف پول‌های نگه‌داری (Custody) در زمان اسنپ‌شات + خالص دارایی کاربران (Demo)',
            transparencyNote:
                'این صفحه صرفاً UI استاتیک برای دموی PoR است (بدون اتصال به API و بدون نمایش آدرس‌ها).',
            riskNote:
                'PoR به‌تنهایی جایگزین حسابرسی کامل بدهی‌ها و ریسک‌های خارج از زنجیره نیست.',
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
        const avg =
            assets.reduce((s, a) => s + a.reserveRatio, 0) / Math.max(assets.length, 1);
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
            <div className="relative overflow-hidden rounded-3xl border bg-white dark:bg-boxColor-dark border-boxBorderColor dark:border-boxBorderColor-dark shadow-sm">
                {/* decorative */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-28 -right-28 h-96 w-96 rounded-full bg-primary/12 blur-3xl" />
                    <div className="absolute -bottom-32 -left-32 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-3xl" />
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                </div>

                <div className="relative p-6 md:p-12">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-wrap items-center gap-2">
                            <Pill tone="brand">Proof of Reserves</Pill>
                            <Pill tone="default">{staticMeta.verificationMechanism}</Pill>
                            <Pill tone={headlineRatios.min >= 100 ? 'success' : 'warning'}>
                                حداقل نسبت: {formatNumberFa(headlineRatios.min)}٪
                            </Pill>
                            <Pill tone="info">Snapshot: {staticMeta.auditTime}</Pill>
                        </div>

                        <div className="flex flex-col gap-3">
                            <h1 className="text-3xl md:text-4xl xl:text-5xl font-extrabold tracking-tight">
                                شفافیت دارایی‌ها با Proof of Reserves
                            </h1>
                            <p className="max-w-3xl text-sm md:text-base text-titleText/70 dark:text-titleText-dark/70 leading-7">
                                این صفحه وضعیت پشتوانه دارایی‌ها را در یک اسنپ‌شات مشخص نشان می‌دهد.
                                داده‌ها در این نسخه <span className="font-semibold">استاتیک</span> هستند و
                                <span className="font-semibold"> آدرس‌های کیف پول نمایش داده نمی‌شوند</span>.
                            </p>
                        </div>

                        {/* Exchange overview (richer + nicer) */}
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                            <div className="lg:col-span-5 rounded-3xl border bg-white/60 dark:bg-boxColor-dark/60 p-6 shadow-sm backdrop-blur border-boxBorderColor dark:border-boxBorderColor-dark">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="text-xs text-titleText/60 dark:text-titleText-dark/60">
                                            نمای کلی سکو (Demo)
                                        </div>
                                        <div className="mt-2 text-lg font-bold">
                                            Ced Exchange — Proof of Reserves
                                        </div>
                                        <div className="mt-2 text-sm text-titleText/70 dark:text-titleText-dark/70 leading-7">
                                            اسنپ‌شات براساس خالص دارایی کاربران و موجودی نگه‌داری‌شده در کیف پول‌های Custody.
                                        </div>
                                    </div>

                                    <div className="shrink-0 rounded-3xl border bg-white/60 dark:bg-boxColor-dark/60 p-4 shadow-sm border-boxBorderColor dark:border-boxBorderColor-dark">
                                        <div className="text-[11px] text-titleText/60 dark:text-titleText-dark/60">
                                            Status
                                        </div>
                                        <div className="mt-1">
                                            <Pill tone={headlineRatios.min >= 100 ? 'success' : 'warning'}>
                                                {headlineRatios.min >= 100 ? 'Healthy' : 'Needs Review'}
                                            </Pill>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 grid grid-cols-2 gap-3">
                                    <Metric
                                        label="دارایی‌های پوشش‌داده‌شده"
                                        value={headlineRatios.includedCount.toLocaleString('fa-IR')}
                                        sub="Included assets"
                                    />
                                    <Metric
                                        label="میانگین Reserve Ratio"
                                        value={<span className={ratioTone(headlineRatios.avg)}>{formatNumberFa(headlineRatios.avg)}٪</span>}
                                        sub="Average"
                                    />
                                    <Metric
                                        label="کمترین Reserve Ratio"
                                        value={<span className={ratioTone(headlineRatios.min)}>{formatNumberFa(headlineRatios.min)}٪</span>}
                                        sub="Minimum"
                                        tone={headlineRatios.min >= 100 ? 'success' : 'warning'}
                                    />
                                    <Metric
                                        label="بیشترین Reserve Ratio"
                                        value={<span className={ratioTone(headlineRatios.max)}>{formatNumberFa(headlineRatios.max)}٪</span>}
                                        sub="Maximum"
                                    />
                                </div>

                                <div className="mt-5 rounded-2xl border p-4 border-boxBorderColor dark:border-boxBorderColor-dark bg-boxBorderColor/10 dark:bg-boxBorderColor-dark/20">
                                    <div className="text-xs text-titleText/70 dark:text-titleText-dark/70 leading-6">
                                        {staticMeta.scope}
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-7 rounded-3xl border bg-white/60 dark:bg-boxColor-dark/60 p-6 shadow-sm backdrop-blur border-boxBorderColor dark:border-boxBorderColor-dark">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="text-xs text-titleText/60 dark:text-titleText-dark/60">
                                            Reserve Ratio چیست؟
                                        </div>
                                        <div className="mt-2 text-sm leading-7 text-titleText/80 dark:text-titleText-dark/80">
                                            Reserve Ratio یعنی نسبت <span className="font-semibold">موجودی صرافی</span> به{' '}
                                            <span className="font-semibold">خالص دارایی کاربران</span> برای یک دارایی در زمان اسنپ‌شات.
                                            عدد <span className="font-semibold">≥ ۱۰۰٪</span> یعنی پشتوانه ۱:۱ یا بیشتر.
                                        </div>
                                    </div>

                                    <div className="shrink-0">
                                        <Pill tone="info">{staticMeta.verifier}</Pill>
                                    </div>
                                </div>

                                <div className="mt-5 rounded-2xl border p-4 border-boxBorderColor dark:border-boxBorderColor-dark">
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs text-titleText/60 dark:text-titleText-dark/60">
                                            وضعیت حداقل نسبت (۰ تا ۱۴۰٪)
                                        </div>
                                        <div className={cn('text-sm font-bold', ratioTone(headlineRatios.min))}>
                                            {formatNumberFa(headlineRatios.min)}٪
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        {/* keep the small scale labels */}
                                        <div className="w-full">
                                            <div className="flex items-center justify-between text-[11px] text-titleText/60 dark:text-titleText-dark/60">
                                                <span>۰٪</span>
                                                <span>۱۴۰٪</span>
                                            </div>
                                            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-boxBorderColor/40 dark:bg-boxBorderColor-dark/40">
                                                <div
                                                    className={cn('h-full rounded-full', ratioBarTone(headlineRatios.min))}
                                                    style={{
                                                        width: `${(clamp(headlineRatios.min, 0, 140) / 140) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                                        <div className="rounded-2xl border p-4 border-boxBorderColor dark:border-boxBorderColor-dark">
                                            <div className="text-[11px] text-titleText/60 dark:text-titleText-dark/60">
                                                فرمول
                                            </div>
                                            <div className="mt-2 font-mono text-sm">
                                                (Exchange / Customer) × 100
                                            </div>
                                        </div>
                                        <div className="rounded-2xl border p-4 border-boxBorderColor dark:border-boxBorderColor-dark">
                                            <div className="text-[11px] text-titleText/60 dark:text-titleText-dark/60">
                                                نکته
                                            </div>
                                            <div className="mt-2 text-xs leading-6 text-titleText/70 dark:text-titleText-dark/70">
                                                {staticMeta.riskNote}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 text-xs text-titleText/60 dark:text-titleText-dark/60">
                                    {staticMeta.transparencyNote}
                                </div>
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
                            <Pill tone="default">نمایش کارت‌محور</Pill>
                            <Pill tone="default">۸ مورد در هر صفحه</Pill>
                        </div>
                    }
                >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {currentItems.map((row, idx) => (
                            <AssetPorCard key={`${row.asset}-${idx}`} row={row} />
                        ))}
                    </div>

                    <Pagination
                        page={safePage}
                        totalPages={totalPages}
                        onPage={(p) => setPage(clamp(p, 1, totalPages))}
                    />
                </Card>
            </div>

            {/* FAQ + notes */}
            <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
                <Card title="سوالات متداول">
                    <div className="space-y-3">
                        {[
                            {
                                q: 'آیا PoR یعنی صرافی کاملاً سالم است؟',
                                a: 'PoR معمولاً نشان می‌دهد دارایی‌های قابل گزارش برای پوشش موجودی کاربران وجود دارد، اما لزوماً همه بدهی‌ها/تعهدات خارج از زنجیره را پوشش نمی‌دهد. (اینجا UI استاتیک است.)',
                            },
                            {
                                q: 'Reserve Ratio بالای ۱۰۰٪ یعنی چه؟',
                                a: 'یعنی موجودی صرافی بیشتر از خالص دارایی کاربران است (Over-collateralized). در عمل ممکن است این تفاوت ناشی از ذخایر اضافه، کیف پول‌های عملیاتی یا سیاست ریسک باشد.',
                            },
                            {
                                q: 'چرا ممکن است نسبت یک دارایی زیر ۱۰۰٪ باشد؟',
                                a: 'در حالت واقعی می‌تواند به دامنه اسنپ‌شات، تأخیر همگام‌سازی یا نحوه گزارش مرتبط باشد. در این دمو صرفاً برای نمایش حالت هشدار درج شده است.',
                            },
                        ].map((item, i) => (
                            <details
                                key={i}
                                className="group rounded-2xl border bg-white dark:bg-boxColor-dark p-5 border-boxBorderColor dark:border-boxBorderColor-dark"
                            >
                                <summary className="cursor-pointer list-none">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="text-sm font-semibold">{item.q}</div>
                                        <div className="rounded-xl border px-3 py-2 text-xs text-titleText/70 dark:text-titleText-dark/70 border-boxBorderColor dark:border-boxBorderColor-dark group-open:rotate-180 transition">
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

                <Card title="توضیحات و نکات">
                    <div className="space-y-4 text-sm leading-7 text-titleText/80 dark:text-titleText-dark/80">
                        <div className="rounded-2xl border p-5 border-boxBorderColor dark:border-boxBorderColor-dark">
                            <div className="font-semibold">فرمول محاسبه</div>
                            <div className="mt-2 font-mono text-sm">
                                Reserve Ratio = (Exchange Balance / Customer Net Balance) × 100
                            </div>
                            <div className="mt-3 text-xs text-titleText/60 dark:text-titleText-dark/60">
                                دامنه دارایی‌ها و نحوه محاسبه ممکن است بسته به سیاست نگه‌داری متفاوت باشد.
                            </div>
                        </div>

                        <div className="rounded-2xl border p-5 border-boxBorderColor dark:border-boxBorderColor-dark bg-boxBorderColor/10 dark:bg-boxBorderColor-dark/20">
                            <div className="text-xs text-titleText/70 dark:text-titleText-dark/70 leading-6">
                                توجه: دیتای این صفحه استاتیک است و فقط برای ساخت UI مشابه PoR استفاده شده است.
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </section>
    );
};

export default ProofOfReserve;
