'use client';

import React, { useState } from 'react';
import {
    Treemap,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';

type Timeframe = 'daily' | 'weekly' | 'monthly';

type VolumeItem = {
    name: string;
    symbol: string;
    value: number;
};

type VolumeDataByRange = {
    daily: VolumeItem[];
    weekly: VolumeItem[];
    monthly: VolumeItem[];
};

type Props = {
    data: VolumeDataByRange;
    defaultRange?: Timeframe;
    title: string;
};

const timeframeOptions: { id: Timeframe; label: string }[] = [
    { id: 'daily', label: 'روزانه' },
    { id: 'weekly', label: 'هفتگی' },
    { id: 'monthly', label: 'ماهانه' },
];

const TREEMAP_COLORS = [
    '#4F46E5',
    '#6366F1',
    '#818CF8',
    '#0EA5E9',
    '#06B6D4',
    '#14B8A6',
    '#22C55E',
    '#16A34A',
    '#84CC16',
    '#A3E635',
    '#FACC15',
    '#EAB308',
    '#F97316',
    '#FB923C',
    '#EF4444',
    '#F43F5E',
    '#EC4899',
    '#D946EF',
    '#A855F7',
    '#8B5CF6',
];

const CustomTreemapCell: React.FC<any> = (props) => {
    const {
        x,
        y,
        width,
        height,
        name,
        payload,
        stroke,
        index,
        depth,
        total,
        value,
    } = props;

    const symbol = payload?.symbol ?? name;

    const cellValue: number = Number(payload?.value ?? value ?? 0);

    const baseColor =
        depth === 1
            ? TREEMAP_COLORS[index % TREEMAP_COLORS.length]
            : '#E5E7EB';

    const showLabel = width > 70 && height > 40;

    const percent = total ? (cellValue / total) * 100 : 0;
    const percentLabel = `${percent.toFixed(1)}٪`;

    const formattedValue = `${cellValue.toLocaleString('en-US')} USDT`;

    const centerX = x + width / 2;
    const centerY = y + height / 2;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={baseColor}
                stroke={stroke || '#ffffff'}
                rx={6}
                ry={6}
            />
            {showLabel && (
                <text
                    x={centerX}
                    y={centerY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#FFFFFF"
                    stroke="none"
                    style={{ paintOrder: 'normal' }}
                >
                    {/* نماد */}
                    <tspan
                        x={centerX}
                        dy="-0.6em"
                        fontSize={14}
                        fontWeight={500}
                    >
                        {symbol}
                    </tspan>

                    {/* مقدار واقعی با واحد USDT */}
                    <tspan
                        x={centerX}
                        dy="1.2em"
                        fontSize={11}
                        fontWeight={400}
                    >
                        {formattedValue}
                    </tspan>

                    {/* درصد از کل */}
                    <tspan
                        x={centerX}
                        dy="1.2em"
                        fontSize={11}
                        fontWeight={300}
                    >
                        {percentLabel}
                    </tspan>
                </text>
            )}
        </g>
    );
};

export const CryptoVolumeTreemap: React.FC<Props> = ({
    data,
    defaultRange = 'daily',
    title,
}) => {
    const [range, setRange] = useState<Timeframe>(defaultRange);

    const currentData = data[range] ?? [];
    const totalValue = currentData.reduce(
        (sum, item) => sum + Number(item.value || 0),
        0
    );

    const formattedTotal = `${totalValue.toLocaleString('en-US')} USDT`;

    return (
        <div
            className="w-full rounded-2xl border border-boxBorderColor dark:border-boxBorderColor-dark bg-gohan p-4 bg-boxColor dark:bg-boxColor-dark"
            dir="rtl"
        >
            {/* هدر: عنوان + مجموع کل کنار هم */}
            <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-baseline gap-2">
                    <h2 className="text-titleText dark:text-titleText-dark mb-1">
                        {title}
                    </h2>

                </div>

                <div className="inline-flex items-center gap-1 rounded-full bg-goku px-1 py-1">
                    {timeframeOptions.map((opt) => {
                        const isActive = opt.id === range;
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => setRange(opt.id)}
                                className={[
                                    'px-3 py-1 text-xs md:text-sm rounded-full transition-all duration-150 whitespace-nowrap',
                                    isActive
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'text-titleText dark:text-titleText-dark hover:bg-beerus/60',
                                ].join(' ')}
                            >
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* نمودار TreeMap */}
            <div className="h-[260px] md:h-[340px]">
                {currentData.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-mutedText dark:text-mutedText-dark">
                        دیتایی برای این بازه زمانی موجود نیست.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <Treemap
                            data={currentData}
                            dataKey="value"
                            nameKey="symbol"
                            stroke="#ffffff"
                            aspectRatio={4 / 3}
                            content={(props) => (
                                <CustomTreemapCell
                                    {...props}
                                    total={totalValue}
                                />
                            )}
                        >
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (!active || !payload || !payload[0]) return null;
                                    const d = payload[0].payload as any;
                                    return (
                                        <div className="rounded-xl border border-boxBorderColor dark:border-boxBorderColor-dark px-3 py-2 text-xs shadow-lg bg-bgColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark">
                                            <div className="text-moon-14 mb-1">
                                                {d.name} ({d.symbol})
                                            </div>
                                            <div className="text-moon-12 text-mutedText dark:text-mutedText-dark">
                                                حجم معامله:{" "}
                                                {d.value.toLocaleString('en-US')} USDT
                                            </div>
                                        </div>
                                    );
                                }}
                            />
                        </Treemap>
                    </ResponsiveContainer>
                )}
            </div>
            <div className='mt-2'>
                <span className="text-xs md:text-sm text-titleText dark:text-titleText-dark mt-4">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='inline-block ml-1'>
                        <path d="M12 17V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                        <circle cx="1" cy="1" r="1" transform="matrix(1 0 0 -1 11 9)" fill="currentColor" />
                        <path d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                    </svg>
                    مجموع:{" "}
                    <span className="font-semibold text-titleText dark:text-titleText-dark mr-2">
                        {formattedTotal}
                    </span>
                </span>
            </div>

        </div>
    );
};
