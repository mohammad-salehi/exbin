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

    // ✅ لینک اختیاری بالا-چپ
    link?: ChartLink;
};

const COLORS = ['#4F46E5', '#06B6D4', '#22C55E', '#F97316', '#EC4899', '#A855F7'];
const MAX_SLICES = 5;

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

    const lastYRef = useRef<{ left: number; right: number }>({ left: -1e9, right: -1e9 });
    const SMALL_PERCENT = 5;
    const COLLIDE_GAP = 30;

    const renderLabel = (props: any) => {
        const RADIAN = Math.PI / 180;
        const { cx, cy, midAngle, outerRadius, percent, index, payload, value } = props;

        const sin = Math.sin(-RADIAN * midAngle);
        const cos = Math.cos(-RADIAN * midAngle);

        const sx = cx + (outerRadius + 4) * cos;
        const sy = cy + (outerRadius + 4) * sin;

        const mx = cx + (outerRadius + 12) * cos;
        const my = cy + (outerRadius + 12) * sin;

        const ex = cx + (outerRadius + 40) * (cos >= 0 ? 1 : -1);
        const ey = my;

        const textAnchor = cos >= 0 ? 'start' : 'end';
        const side = cos >= 0 ? 'right' : 'left';

        const label: string = payload?.label ?? '';
        const pct = total > 0 ? (value / total) * 100 : percent * 100;

        if (index === 0) lastYRef.current = { left: -1e9, right: -1e9 };

        let dy = 0;

        if (pct < SMALL_PERCENT) {
            const lastY = side === 'right' ? lastYRef.current.right : lastYRef.current.left;

            if (Math.abs(ey - lastY) < COLLIDE_GAP) {
                dy = ey < lastY ? -20 : 20;
            }

            const newY = ey + dy;
            if (side === 'right') lastYRef.current.right = newY;
            else lastYRef.current.left = newY;
        } else {
            const newY = ey;
            if (side === 'right') lastYRef.current.right = newY;
            else lastYRef.current.left = newY;
        }

        const percentageText =
            total > 0 ? ((value / total) * 100).toFixed(1) : (percent * 100).toFixed(1);

        const mx2 = mx;
        const my2 = my + dy;
        const ex2 = ex;
        const ey2 = ey + dy;

        return (
            <g>
                <path d={`M${sx},${sy}L${mx2},${my2}L${ex2},${ey2}`} stroke="#9CA3AF" fill="none" />
                <circle cx={ex2} cy={ey2} r={2} fill="#9CA3AF" />

                <text
                    x={ex2 + (cos >= 0 ? 4 : -4)}
                    y={ey2 - 4}
                    textAnchor={textAnchor}
                    fill="currentColor"
                    className="text-[11px] md:text-[12px] text-titleText dark:text-titleText-dark"
                >
                    {label}
                </text>

                <text
                    x={ex2 + (cos >= 0 ? 4 : -4)}
                    y={ey2 + 12}
                    textAnchor={textAnchor}
                    fill="currentColor"
                    className="text-[10px] md:text-[11px] text-titleText dark:text-titleText-dark"
                >
                    {percentageText}%
                </text>
            </g>
        );
    };

    return (
        <div
            className="min-h-full w-full rounded-2xl border border-boxBorderColor dark:border-boxBorderColor-dark bg-gohan p-4 bg-boxColor dark:bg-boxColor-dark"
            dir="rtl"
        >
            {/* ✅ هدر: دسکتاپ یک‌خطی | موبایل لینک زیر عنوان */}
            <div className="mb-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="textTitle text-moon-18 md:text-moon-20 text-titleText dark:text-titleText-dark">
                    {title}
                </h2>

                {link?.href && link?.label ? (
                    <a
                        href={link.href}
                        target={link.target ?? "_self"}
                        rel={link.target === "_blank" ? "noopener noreferrer" : undefined}
                        className="
        inline-flex items-center gap-1
        text-sm md:text-[14px]
        text-titleText dark:text-titleText-dark
        hover:opacity-80
        whitespace-nowrap
        sm:ml-2
      "
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="shrink-0"
                        >
                            <path
                                d="M14 12C14 14.7614 11.7614 17 9 17H7C4.23858 17 2 14.7614 2 12C2 9.23858 4.23858 7 7 7H7.5M10 12C10 9.23858 12.2386 7 15 7H17C19.7614 7 22 9.23858 22 12C22 14.7614 19.7614 17 17 17H16.5"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                        <span>{link.label}</span>
                    </a>
                ) : null}
            </div>


            <div className="h-[260px] md:h-[320px]">
                {processedData.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-titleText dark:text-titleText-dark">
                        <p className="text-center leading-6">اطلاعاتی موجود نیست!</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={processedData}
                                dataKey="value"
                                nameKey="label"
                                cx="50%"
                                cy="50%"
                                innerRadius="60%"
                                outerRadius="70%"
                                labelLine={false}
                                label={renderLabel}
                                paddingAngle={3}
                            >
                                {processedData.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        stroke="#111827"
                                        strokeWidth={1}
                                    />
                                ))}
                            </Pie>

                            {/* متن وسط دونات */}
                            {total > 0 && unit !== '' && (
                                <>
                                    <text
                                        x="50%"
                                        y="49%"
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        style={{ direction: 'ltr', unicodeBidi: 'embed' }}
                                        className={`text-moon-14 md:text-moon-16 text-sm fill-current ${value !== null && value > 0
                                                ? 'text-green-400'
                                                : value !== null && value < 0
                                                    ? 'text-red-400'
                                                    : 'text-titleText dark:text-titleText-dark'
                                            }`}
                                    >
                                        {value === null ? total.toLocaleString('en-US') : value.toLocaleString('en-US')}
                                    </text>

                                    <text
                                        x="50%"
                                        y="56%"
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        className={`text-moon-14 md:text-moon-16 text-sm fill-current ${value !== null && value > 0
                                                ? 'text-green-400'
                                                : value !== null && value < 0
                                                    ? 'text-red-400'
                                                    : 'text-titleText dark:text-titleText-dark'
                                            }`}
                                    >
                                        {unit}
                                    </text>
                                </>
                            )}
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>

            {description !== '' ? (
                <small className="text-titleText dark:text-titleText-dark">* {description}</small>
            ) : null}
        </div>
    );
};
