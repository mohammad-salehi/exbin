import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

type ProofOfReserveDataItem = {
    label: string; // مثلا "فروردین"
    x: number;     // قبلاً deposit
    y: number;     // قبلاً withdraw
};

type ProofOfReserveChartProps = {
    data: ProofOfReserveDataItem[];
    title?: string;
    assetLabel?: string;       // عنوان سری x (سبز)
    liabilityLabel?: string;   // عنوان سری y (قرمز)
    unitSuffix?: string;       // واحد کنار عدد: مثلا "M" یا "تومان"
    height?: number;           // ارتفاع نمودار (px)
};

const DoubleLinearChart: React.FC<ProofOfReserveChartProps> = ({
    data,
    title = "اثبات ذخیره دارایی‌ها",
    assetLabel = "دارایی",
    liabilityLabel = "بدهی",
    unitSuffix = "M",
    height = 288, // h-72
}) => {
    const totalX = data.reduce((sum, w) => sum + (w.x || 0), 0);
    const totalY = data.reduce((sum, w) => sum + (w.y || 0), 0);
    const net = totalX - totalY;

    return (
        <div
            dir="rtl"
            className="w-full rounded-xl border bg-boxColor dark:bg-boxColor-dark p-6 shadow-sm text-titleText dark:text-titleText-dark border-boxBorderColor dark:border-boxBorderColor-dark"
        >
            {/* هدر */}
            <div className="mb-6 flex items-center justify-between gap-4">
                <div className="flex flex-col items-start gap-1">
                    <h2 className="text-base font-semibold text-titleText dark:text-titleText-dark">
                        {title}
                    </h2>
                </div>
            </div>

            {/* نمودار */}
            <div
                className="w-full text-titleText dark:text-titleText-dark"
                style={{ height }}
            >
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 16, right: 16, left: 0, bottom: 24 }}
                    >
                        <CartesianGrid vertical={false} stroke="#f1f5f9" />

                        <XAxis
                            dataKey="label"
                            tick={{
                                fontSize: 12,
                                fill: "currentColor",
                            }}
                            axisLine={{
                                stroke: "currentColor",
                                strokeOpacity: 0.15,
                            }}
                            tickLine={false}
                        />

                        <YAxis
                            tickFormatter={(val: number) =>
                                unitSuffix ? `${val} ${unitSuffix}` : `${val}`  // همیشه string
                            }
                            tick={{
                                fontSize: 12,
                                fill: "currentColor",
                                dx:-28
                            }}
                            axisLine={{
                                stroke: "currentColor",
                                strokeOpacity: 0.15,
                            }}
                            tickLine={false}
                        />


                        <Tooltip
                            formatter={(value: any, name: any) => {
                                const label =
                                    name === "x" ? assetLabel : name === "y" ? liabilityLabel : "";
                                return [
                                    unitSuffix ? `${value} ${unitSuffix}` : value,
                                    label,
                                ];
                            }}
                            labelFormatter={(label: any) => `${label}`}
                            contentStyle={{
                                direction: "rtl",
                                fontSize: 12,
                                borderRadius: 8,
                            }}
                        />

                        <Bar
                            dataKey="x"
                            name={assetLabel}
                            radius={[4, 4, 0, 0]}
                            fill="#22c55e"
                        />
                        <Bar
                            dataKey="y"
                            name={liabilityLabel}
                            radius={[4, 4, 0, 0]}
                            fill="#ef4444"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* لِجند و خلاصه‌ی پایین */}
            <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-4 text-xs sm:flex-row sm:items-center sm:justify-between text-titleText dark:text-titleText-dark">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        <span>{assetLabel}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        <span>{liabilityLabel}</span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[11px] sm:text-xs text-titleText dark:text-titleText-dark">
                    <span className={net >= 0 ? "text-green-600" : "text-red-600"}>
                        خالص: {net >= 0 ? "+" : "-"}
                        {Math.abs(net)} {unitSuffix}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default DoubleLinearChart;
