'use client';

import React, { useMemo, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

type DashboardItem = {
    label: string;
    value: number;
};

type ChartLink = {
    label: string;
    href: string;
    target?: '_blank' | '_self';
};

type Props = {
    data: DashboardItem[];
    title?: string;
    unit?: string;
    description?: string;
    value?: number | null;
    link?: ChartLink;
};

const COLORS = ['#4F46E5', '#06B6D4', '#22C55E', '#F97316', '#EC4899', '#A855F7'];
const MAX_SLICES = 5;

const formatNumberFA = (n: number) => {
    if (n === null || n === undefined || Number.isNaN(Number(n))) return '—';
    return Number(n).toLocaleString('fa-IR');
};

const formatNumberEN = (n: number) => {
    if (n === null || n === undefined || Number.isNaN(Number(n))) return '—';
    return Number(n).toLocaleString('en-US');
};

export const CircleChart: React.FC<Props> = ({
    data,
    title = 'تقسیم‌بندی داده‌ها',
    unit = '',
    description = '',
    value = null,
    link,
}) => {
    const MIN_PERCENT = 1;

    const processedData = useMemo(() => {
        if (!data || data.length === 0) return [];

        const totalRaw = data.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
        if (totalRaw <= 0) return [];

        const visible: DashboardItem[] = [];
        let otherTotal = 0;

        for (const item of data) {
            const v = Number(item.value) || 0;
            const percent = (v / totalRaw) * 100;
            if (percent >= MIN_PERCENT) visible.push({ label: item.label, value: v });
            else otherTotal += v;
        }

        const sorted = visible.sort((a, b) => b.value - a.value);
        const top = sorted.slice(0, MAX_SLICES);
        const rest = sorted.slice(MAX_SLICES);

        otherTotal += rest.reduce((s, x) => s + x.value, 0);

        const result = [...top];
        if (otherTotal > 0 && (otherTotal / totalRaw) * 100 >= MIN_PERCENT) {
            result.push({ label: 'سایر', value: otherTotal });
        }
        return result;
    }, [data]);

    const total = useMemo(
        () => processedData.reduce((sum, item) => sum + (item.value || 0), 0),
        [processedData]
    );

    // لیبل‌های بیرونی (همون منطق قبلی، با کمی نرم‌سازی)
    const lastYRef = useRef<{ left: number; right: number }>({ left: -1e9, right: -1e9 });
    const SMALL_PERCENT = 5;
    const COLLIDE_GAP = 28;

    const renderLabel = (props: any) => {
        const RADIAN = Math.PI / 180;
        const { cx, cy, midAngle, outerRadius, percent, index, payload, value: sliceValue } = props;

        const sin = Math.sin(-RADIAN * midAngle);
        const cos = Math.cos(-RADIAN * midAngle);

        const sx = cx + (outerRadius + 6) * cos;
        const sy = cy + (outerRadius + 6) * sin;

        const mx = cx + (outerRadius + 16) * cos;
        const my = cy + (outerRadius + 16) * sin;

        const ex = cx + (outerRadius + 44) * (cos >= 0 ? 1 : -1);
        const ey = my;

        const textAnchor = cos >= 0 ? 'start' : 'end';
        const side = cos >= 0 ? 'right' : 'left';

        if (index === 0) lastYRef.current = { left: -1e9, right: -1e9 };

        const pct = total > 0 ? (sliceValue / total) * 100 : percent * 100;

        let dy = 0;
        if (pct < SMALL_PERCENT) {
            const lastY = side === 'right' ? lastYRef.current.right : lastYRef.current.left;
            if (Math.abs(ey - lastY) < COLLIDE_GAP) dy = ey < lastY ? -18 : 18;
            const newY = ey + dy;
            if (side === 'right') lastYRef.current.right = newY;
            else lastYRef.current.left = newY;
        } else {
            const newY = ey;
            if (side === 'right') lastYRef.current.right = newY;
            else lastYRef.current.left = newY;
        }

        const percentageText =
            total > 0 ? ((sliceValue / total) * 100).toFixed(1) : (percent * 100).toFixed(1);

        const mx2 = mx;
        const my2 = my + dy;
        const ex2 = ex;
        const ey2 = ey + dy;

        return (
            <g>
                <path
                    d={`M${sx},${sy}L${mx2},${my2}L${ex2},${ey2}`}
                    stroke="currentColor"
                    opacity={0.35}
                    fill="none"
                />
                <circle cx={ex2} cy={ey2} r={2} fill="currentColor" opacity={0.45} />

                <text
                    x={ex2 + (cos >= 0 ? 6 : -6)}
                    y={ey2 - 2}
                    textAnchor={textAnchor}
                    fill="currentColor"
                    className="text-[11px] md:text-[12px] text-titleText dark:text-titleText-dark"
                >
                    {payload?.label ?? ''}
                </text>

                <text
                    x={ex2 + (cos >= 0 ? 6 : -6)}
                    y={ey2 + 14}
                    textAnchor={textAnchor}
                    fill="currentColor"
                    className="text-[10px] md:text-[11px] text-titleText/70 dark:text-titleText-dark/70"
                >
                    {percentageText}%
                </text>
            </g>
        );
    };

    const centerNumber = value === null ? total : value;
    const centerTone =
        value !== null && value > 0 ? 'text-green-400' : value !== null && value < 0 ? 'text-red-400' : '';

        return (
            <div
                dir="rtl"
                className="
            w-full min-h-full
            rounded-[32px]
            border border-white/30 dark:border-white/10
            bg-gradient-to-br from-white/90 via-white/70 to-white/60
            dark:from-[#0b0f15]/95 dark:via-[#0d131c]/85 dark:to-[#0a0f15]/90
            backdrop-blur-2xl
            p-5 md:p-6
            shadow-[0_25px_70px_-35px_rgba(0,0,0,0.55)]
            text-titleText dark:text-titleText-dark
          "
            >
                {/* هدر جدید: تمیزتر + لینک خوش‌فرم */}
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="
                  h-11 w-11 rounded-2xl
                  bg-white/70 dark:bg-white/5
                  border border-white/40 dark:border-white/10
                  shadow-[0_8px_25px_-15px_rgba(0,0,0,0.6)]
                  flex items-center justify-center
                "
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path
                                    d="M4 13.5V20h16v-6.5M7 10l5-6 5 6"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-titleText dark:text-titleText-dark"
                                />
                            </svg>
                        </div>
    
                        <div className="min-w-0">
                            <h2 className="text-moon-18 md:text-moon-20 font-bold tracking-tight truncate">
                                {title}
                            </h2>
                            <p className="mt-0.5 text-[12px] text-titleText/60 dark:text-titleText-dark/60">
                                {total > 0 ? `مجموع: ${formatNumberFA(total)} ${unit}` : '—'}
                            </p>
                        </div>
                    </div>
    
                    {link?.href && link?.label ? (
                        <a
                            href={link.href}
                            target={link.target ?? '_self'}
                            rel={link.target === '_blank' ? 'noopener noreferrer' : undefined}
                            className="
                  inline-flex items-center gap-2
                  rounded-2xl
                  border border-white/40 dark:border-white/10
                  bg-white/70 dark:bg-white/5
                  px-3.5 py-2
                  text-sm
                  shadow-[0_10px_28px_-18px_rgba(0,0,0,0.6)]
                  hover:bg-white/90 dark:hover:bg-white/10
                  transition
                  whitespace-nowrap
                "
                        >
                            <span>{link.label}</span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path
                                    d="M10 14L21 3M21 3h-7M21 3v7"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </a>
                    ) : null}
                </div>
    
                {/* بدنه: چارت + لیست (زیر هم) */}
                <div className="flex flex-col gap-5">
                    {/* نمودار */}
                    <div
                        className="
          relative
          rounded-[28px]
          border border-white/40 dark:border-white/10
          bg-white/75 dark:bg-white/[0.04]
          backdrop-blur-xl
          p-4 md:p-5
          shadow-[0_12px_30px_-20px_rgba(0,0,0,0.6)]
        "
                    >
                        {/* بک‌گراند گرادیانی نرم */}
                        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
                            <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-primary/15 blur-[80px]" />
                            <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-cyan-500/12 blur-[80px]" />
                            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
                        </div>
    
                        <div className="relative h-[260px] md:h-[320px]">
                            {processedData.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-titleText dark:text-titleText-dark">
                                    <p className="text-center leading-6">اطلاعاتی موجود نیست!</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        {/* گرادیان برای حلقه */}
                                        <defs>
                                            {processedData.map((_, idx) => (
                                                <linearGradient
                                                    key={`grad-${idx}`}
                                                    id={`grad-${idx}`}
                                                    x1="0"
                                                    y1="0"
                                                    x2="1"
                                                    y2="1"
                                                >
                                                    <stop offset="0%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.95} />
                                                    <stop offset="100%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.6} />
                                                </linearGradient>
                                            ))}
                                            <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
                                                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.18" />
                                            </filter>
                                        </defs>
    
                                        <Pie
                                            data={processedData}
                                            dataKey="value"
                                            nameKey="label"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius="62%"
                                            outerRadius="74%"
                                            paddingAngle={3}
                                            labelLine={false}
                                            // روی موبایل لیبل‌های بیرونی خاموش تا شلوغ نشه
                                            label={({ viewBox, ...p }: any) => {
                                                const w = viewBox?.width ?? 0;
                                                if (w && w < 420) return null;
                                                return renderLabel(p);
                                            }}
                                            isAnimationActive
                                            animationDuration={650}
                                            filter="url(#softShadow)"
                                        >
                                            {processedData.map((_, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={`url(#grad-${index})`}
                                                    stroke="rgba(17,24,39,0.35)"
                                                    strokeWidth={1}
                                                />
                                            ))}
                                        </Pie>
    
                                        {/* متن وسط */}
                                        {total > 0 ? (
                                            <>
                                                <text
                                                    x="50%"
                                                    y="48%"
                                                    textAnchor="middle"
                                                    dominantBaseline="central"
                                                    style={{ direction: 'ltr', unicodeBidi: 'embed' }}
                                                    className={`text-moon-18 md:text-moon-20 font-bold fill-current ${centerTone}`}
                                                >
                                                    {formatNumberEN(centerNumber)}
                                                </text>
    
                                                {unit ? (
                                                    <text
                                                        x="50%"
                                                        y="57%"
                                                        textAnchor="middle"
                                                        dominantBaseline="central"
                                                        className="text-moon-14 md:text-moon-16 fill-current text-titleText/70 dark:text-titleText-dark/70"
                                                    >
                                                        {unit}
                                                    </text>
                                                ) : null}
    
                                                <text
                                                    x="50%"
                                                    y="66%"
                                                    textAnchor="middle"
                                                    dominantBaseline="central"
                                                    className="text-[11px] md:text-xs fill-current text-titleText/55 dark:text-titleText-dark/55"
                                                >
                                                    سهم از کل
                                                </text>
                                            </>
                                        ) : null}
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    
};
