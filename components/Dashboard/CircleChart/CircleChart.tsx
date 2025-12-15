'use client';

import React, { useMemo, useRef } from 'react';

import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
} from 'recharts';

type DashboardItem = {
    label: string;
    value: number;
};

type Props = {
    data: DashboardItem[];
    title?: string;
    unit?: string;
    description?: string
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
    unit = '',
    description = ''
}) => {
    const MIN_PERCENT = 1; // حداقل درصد قابل نمایش

    const processedData = useMemo(() => {
        if (!data || data.length === 0) return [];

        const totalRaw = data.reduce(
            (sum, item) => sum + (Number(item.value) || 0),
            0
        );
        if (totalRaw <= 0) return [];

        const visible: DashboardItem[] = [];
        let otherTotal = 0;

        // فیلتر بر اساس ۱٪
        for (const item of data) {
            const value = Number(item.value) || 0;
            const percent = (value / totalRaw) * 100;

            if (percent >= MIN_PERCENT) {
                visible.push({ label: item.label, value });
            } else {
                otherTotal += value;
            }
        }

        // مرتب‌سازی و محدود کردن اسلایس‌ها
        const sorted = visible.sort((a, b) => b.value - a.value);
        const top = sorted.slice(0, MAX_SLICES);
        const rest = sorted.slice(MAX_SLICES);

        const restTotal = rest.reduce((s, x) => s + x.value, 0);
        otherTotal += restTotal;

        const result = [...top];

        // 👈 فقط اگر «سایر» هم حداقل ۱٪ بود اضافه می‌کنیم
        if (otherTotal > 0 && (otherTotal / totalRaw) * 100 >= MIN_PERCENT) {
            result.push({
                label: "سایر",
                value: otherTotal,
            });
        }

        return result;
    }, [data]);

    const total = useMemo(
        () => processedData.reduce((sum, item) => sum + (item.value || 0), 0),
        [processedData]
    );

    // رندر لیبل + خط راهنما

    const lastYRef = useRef<{ left: number; right: number }>({ left: -1e9, right: -1e9 });
    const SMALL_PERCENT = 5;
    const COLLIDE_GAP = 30; // فاصله‌ای که اگر کمتر بود یعنی لیبل‌ها خورده‌اند


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
        const pct = total > 0 ? (value / total) * 100 : (percent * 100);

        // هر رندرِ Pie از اول ریست
        if (index === 0) lastYRef.current = { left: -1e9, right: -1e9 };

        let dy = 0;

        // فقط برای اسلایس‌های کوچک
        if (pct < SMALL_PERCENT) {
            const lastY = side === 'right' ? lastYRef.current.right : lastYRef.current.left;

            // اگر خیلی نزدیک بود → جابه‌جایی
            if (Math.abs(ey - lastY) < COLLIDE_GAP) {
                // "بالاییه" یعنی همونی که y کوچکتری داره (بالای صفحه)
                dy = ey < lastY ? -20 : 20;
            }

            // به‌روزرسانی آخرین Y این سمت با مقدار نهایی
            const newY = ey + dy;
            if (side === 'right') lastYRef.current.right = newY;
            else lastYRef.current.left = newY;
        } else {
            // برای اسلایس‌های بزرگ هم lastY رو آپدیت کن تا ترتیب درست بمونه
            const newY = ey;
            if (side === 'right') lastYRef.current.right = newY;
            else lastYRef.current.left = newY;
        }

        const percentageText = total > 0 ? ((value / total) * 100).toFixed(1) : (percent * 100).toFixed(1);

        // 👈 فقط شکستِ لیبل جابه‌جا میشه، نقطه‌ی اتصال به نمودار ثابت می‌مونه
        const mx2 = mx;          // X ثابت
        const my2 = my + dy;     // فقط Y جابه‌جا
        const ex2 = ex;          // X ثابت
        const ey2 = ey + dy;     // فقط Y جابه‌جا

        return (
            <g>
                <path
                    d={`M${sx},${sy}L${mx2},${my2}L${ex2},${ey2}`}
                    stroke="#9CA3AF"
                    fill="none"
                />
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
                    {/* {unit!== '' ? value.toLocaleString("en-US") +' '+ unit : null}  */}
                    {percentageText}%
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
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-titleText dark:text-titleText-dark">
                        <svg
                            width="50"
                            height="50"
                            viewBox="0 0 312 312"
                            xmlns="http://www.w3.org/2000/svg"
                            className="block"
                        >
                            <g id="empty_inbox" data-name="empty inbox" transform="translate(-2956.982 -3048.416)">
                                <path
                                    id="Path_26"
                                    data-name="Path 26"
                                    d="M3268.982,3078.286a29.869,29.869,0,0,0-29.869-29.87H2986.851a29.869,29.869,0,0,0-29.869,29.87v252.259a29.87,29.87,0,0,0,29.869,29.871h252.262a29.87,29.87,0,0,0,29.869-29.871Zm-281.9-4.87H3239.3a5.378,5.378,0,0,1,5.684,5.268v141.732h-73.54a12.038,12.038,0,0,0-12.114,12.025,47.854,47.854,0,0,1-95.668,1.918,11.273,11.273,0,0,0,.162-1.906,12.049,12.049,0,0,0-12.116-12.037h-70.724V3078.684C2980.982,3075.574,2983.97,3073.416,2987.08,3073.416Zm252.218,263H2987.08c-3.11,0-6.1-2.4-6.1-5.514v-86.486h59.426a72.092,72.092,0,0,0,142.13,0h62.444V3330.9A5.577,5.577,0,0,1,3239.3,3336.416Z"
                                    fill="currentColor"
                                />
                            </g>
                        </svg>

                        <p className="text-center leading-6">
                            اطلاعاتی موجود نیست!
                        </p>
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
                            {/* متن وسط دونات */}
                            {total > 0 && unit !== '' && (
                                <>
                                    {/* عدد */}
                                    <text
                                        x="50%"
                                        y="49%"
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        className="text-moon-14 md:text-moon-16 text-sm fill-current text-titleText dark:text-titleText-dark"
                                    >
                                        {total.toLocaleString('en-US')}
                                    </text>

                                    {/* واحد زیر عدد */}
                                    <text
                                        x="50%"
                                        y="56%"
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        className="text-moon-10 md:text-moon-12 fill-current  text-sm  text-titleText dark:text-titleText-dark"
                                    >
                                        {unit}
                                    </text>
                                </>
                            )}

                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>

            {
                description !== '' ?
                    <small className='text-titleText dark:text-titleText-dark'>
                        * {description}
                    </small>
                    :
                    null
            }
        </div>
    );
};
