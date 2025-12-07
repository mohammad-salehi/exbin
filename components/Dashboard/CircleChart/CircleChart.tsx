'use client';

import React, { useMemo } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
} from 'recharts';

type PieItem = {
    name: string;
    value: number;
};

type Props = {
    data: PieItem[];
    title?: string;
};

const COLORS = [
    '#4F46E5',
    '#06B6D4',
    '#22C55E',
    '#F97316',
    '#EC4899',
    '#A855F7',
];

const MAX_SLICES = 5;

export const CircleChart: React.FC<Props> = ({
    data,
    title = 'تقسیم‌بندی داده‌ها',
}) => {
    const processedData = useMemo(() => {
        if (!data || data.length === 0) return [];

        // بزرگ‌ترها رو جدا می‌کنیم
        const sorted = [...data].sort((a, b) => b.value - a.value);
        const top = sorted.slice(0, MAX_SLICES);
        const rest = sorted.slice(MAX_SLICES);

        if (rest.length === 0) return top;

        const otherTotal = rest.reduce((sum, item) => sum + (item.value || 0), 0);

        return [
            ...top,
            { name: 'سایر', value: otherTotal },
        ];
    }, [data]);

    const total = useMemo(
        () => processedData.reduce((sum, item) => sum + (item.value || 0), 0),
        [processedData]
    );

    // رندر لیبل + خط راهنما
    const renderLabel = (props: any) => {
        const RADIAN = Math.PI / 180;
        const {
            cx,
            cy,
            midAngle,
            innerRadius,
            outerRadius,
            percent,
            index,
            payload,
            value,
        } = props;

        const radius = outerRadius + 16;
        const sin = Math.sin(-RADIAN * midAngle);
        const cos = Math.cos(-RADIAN * midAngle);

        const sx = cx + (outerRadius + 4) * cos;
        const sy = cy + (outerRadius + 4) * sin;
        const mx = cx + (outerRadius + 12) * cos;
        const my = cy + (outerRadius + 12) * sin;
        const ex = cx + (outerRadius + 40) * (cos >= 0 ? 1 : -1);
        const ey = my;

        const textAnchor = cos >= 0 ? 'start' : 'end';

        const name: string = payload?.name ?? '';
        const percentage =
            total > 0 ? ((value / total) * 100).toFixed(1) : (percent * 100).toFixed(1);

        return (
            <g>
                {/* خط راهنما */}
                <path
                    d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
                    stroke="#9CA3AF"
                    fill="none"
                />
                <circle cx={ex} cy={ey} r={2} fill="#9CA3AF" />

                {/* متن (عنوان + مقدار + درصد) */}
                <text
                    x={ex + (cos >= 0 ? 4 : -4)}
                    y={ey - 4}
                    textAnchor={textAnchor}
                    fill="currentColor"
                    className="text-[11px] md:text-[12px] text-titleText dark:text-titleText-dark"
                >
                    {name}
                </text>
                <text
                    x={ex + (cos >= 0 ? 4 : -4)}
                    y={ey + 10}
                    textAnchor={textAnchor}
                    fill="currentColor"
                    className="text-[10px] md:text-[11px] text-titleText dark:text-titleText-dark"
                >
                    {value.toLocaleString('en-US')} ({percentage}%)
                </text>

            </g>
        );
    };

    return (
        <div className="min-h-full w-full rounded-2xl border border-boxBorderColor dark:border-boxBorderColor-dark bg-gohan p-4 bg-boxColor dark:bg-boxColor-dark" dir="rtl">
            <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="textTitle text-moon-18 md:text-moon-20 text-titleText dark:text-titleText-dark">
                    {title}
                </h2>
            </div>

            <div className="h-[260px] md:h-[320px]">
                {processedData.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-mutedText dark:text-mutedText-dark">
                        دیتایی موجود نیست.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={processedData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius="45%"
                                outerRadius="70%"
                                labelLine={false}
                                label={renderLabel}
                                paddingAngle={0}
                            >
                                {processedData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        stroke="#111827"
                                        strokeWidth={1}
                                    />
                                ))}
                            </Pie>

                            {/* متن وسط دونات */}
                            {total > 0 && (
                                <text
                                    x="50%"
                                    y="50%"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    className="text-moon-16 md:text-moon-18 font-semibold fill-current text-titleText dark:text-titleText-dark"
                                >
                                    {total.toLocaleString('en-US')}
                                </text>
                            )}
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};
