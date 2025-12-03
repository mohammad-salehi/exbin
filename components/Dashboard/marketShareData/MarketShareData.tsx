import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type MarketShareItem = {
    name: string;
    value: number;
    color: string;
};

const marketShareData: MarketShareItem[] = [
    { name: "BTC", value: 35, color: "#ef4444" }, // قرمز
    { name: "ETH", value: 42, color: "#3b82f6" }, // آبی
    { name: "LTC", value: 25, color: "#eab308" }, // زرد/طلایی
    { name: "XRP", value: 18, color: "#f97316" }, // نارنجی
];

const MarketShareCard: React.FC = () => {
    return (
        <div
            dir="rtl"
            className="w-full rounded-xl border border-boxBorderColor dark:border-boxBorderColor-dark bg-boxColor dark:bg-boxColor-dark p-4 sm:p-6 shadow-sm text-titleText dark:text-titleText-dark"
        >
            <div className="mb-4 flex justify-start">
                <h2 className="text-sm font-semibold">سهم بازار</h2>
            </div>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col items-start gap-2 text-xs sm:text-sm">
                    {marketShareData.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                            <span>
                                {item.name} {item.value}%
                            </span>
                        </div>
                    ))}
                </div>

                <div className="h-40 w-40 sm:h-52 sm:w-52">
                    <ResponsiveContainer width="100%" height="100%" >
                        <PieChart>
                            <Pie
                                data={marketShareData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius="80%"
                                strokeWidth={0}
                                stroke="none"      // 👈 هیچ outline ای
                            >
                                {marketShareData.map((entry, index): React.JSX.Element => (
                                    <Cell key={`cell-${index}`} fill={entry.color}
                                        style={{
                                            outline: "none",   // غیرفعال کردن outline
                                            boxShadow: "none", // غیرفعال کردن box-shadow
                                        }} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>


            </div>
        </div>
    );
};

export default MarketShareCard;
