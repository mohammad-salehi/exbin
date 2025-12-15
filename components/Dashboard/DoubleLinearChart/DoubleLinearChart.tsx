import React, { useMemo, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Button, Dropdown, MenuItem } from "@heathmont/moon-core-tw";
import { ControlsChevronDown } from '@heathmont/moon-icons-tw';

type ProofOfReserveDataItem = {
    label: string; // مثلا "فروردین"
    x: number;     // قبلاً deposit
    y: number;     // قبلاً withdraw
};

type CryptoItem = {
    cryptocurrency: string; // یا اگر می‌خوای محدودش کنی: 'BTC' | 'BNB' | ...
};
type ProofOfReserveChartProps = {
    data: ProofOfReserveDataItem[];
    title?: string;
    assetLabel?: string;       // عنوان سری x (سبز)
    liabilityLabel?: string;   // عنوان سری y (قرمز)
    unitSuffix?: string;       // واحد کنار عدد: مثلا "M" یا "تومان"
    height?: number;           // ارتفاع نمودار (px)
    List?: CryptoItem[];
    ShowList?: boolean;
    CryptoSelected: string;
    SetCryptoSelected: React.Dispatch<React.SetStateAction<string>>;
};

const DoubleLinearChart: React.FC<ProofOfReserveChartProps> = ({
    data,
    title = "اثبات ذخیره دارایی‌ها",
    assetLabel = "دارایی",
    liabilityLabel = "بدهی",
    unitSuffix = "M",
    height = 288, // h-72
    List = [],
    CryptoSelected = '',
    SetCryptoSelected,
    ShowList = false
}) => {
    const totalX = data.reduce((sum, w) => sum + (w.x || 0), 0);
    const totalY = data.reduce((sum, w) => sum + (w.y || 0), 0);
    const net = totalX - totalY;

    const [search, setSearch] = useState("");

    const filteredList = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return List;
        return List.filter((x) =>
            (x.cryptocurrency || "").toLowerCase().includes(q)
        );
    }, [List, search]);

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
                {
                    ShowList &&
                    <div className="relative w-full mt-2 max-w-[200px]">
                        <Dropdown
                            onChange={(e) => { if (typeof e === "string") SetCryptoSelected(e) }}
                            value={CryptoSelected}
                        >
                            <Dropdown.Trigger className="w-full ">
                                <Button
                                    as="span"
                                    role="button"
                                    variant="ghost"
                                    className="flex items-center justify-between w-full pl-10 py-2
        text-gray-700 border border-gray-300 rounded-lg
        dark:border-buttonBorderColor-dark dark:text-gray-100
        appearance-none relative bg-boxColor dark:bg-boxColor-dark outline-none shadow-none"
                                >
                                    <span>{CryptoSelected !== "" ? CryptoSelected : "درحال دریافت..."}</span>
                                </Button>
                            </Dropdown.Trigger>

                            <Dropdown.Options
                                className="absolute left-0 mt-2 w-72 pl-2 pr-2 py-0
      text-gray-700 bg-white dark:bg-buttonColor-dark
      border border-gray-300 dark:border-buttonBorderColor-dark
      rounded-lg dark:text-gray-100 appearance-none z-50
      max-h-60 overflow-y-auto outline-none shadow-none"
                            >
                                {/* ✅ Search input */}
                                <div className="sticky top-0 z-50 -mx-2 px-2 pt-2 pb-2 bg-white dark:bg-buttonColor-dark border-b border-gray-200 dark:border-buttonBorderColor-dark">
                                    <input
                                        value={search}
                                        onChange={(ev) => setSearch(ev.target.value)}
                                        placeholder="جستجو..."
                                        className="w-full px-3 py-2 text-sm rounded-md
      border border-gray-200 dark:border-buttonBorderColor-dark
      bg-bgColor dark:bg-boxColor-dark
      text-titleText dark:text-titleText-dark
      outline-none"
                                    />
                                </div>

                                {/* ✅ Filtered items */}
                                {filteredList.length > 0 ? (
                                    filteredList.map((item, index) => (
                                        <Dropdown.Option value={item.cryptocurrency} key={`option${index}`}>
                                            {({ selected, active }) => (
                                                <MenuItem
                                                    isActive={active}
                                                    isSelected={selected}
                                                    className={`border mt-2 mb-1 rounded-md border-gray-100 dark:border-buttonBorderColor-dark ${CryptoSelected === item.cryptocurrency
                                                        ? "bg-gray-100 border-gray-200 dark:bg-gray-700"
                                                        : ""
                                                        }`}
                                                >
                                                    <MenuItem.Title>{item.cryptocurrency}</MenuItem.Title>
                                                </MenuItem>
                                            )}
                                        </Dropdown.Option>
                                    ))
                                ) : (
                                    <div className="py-3 text-center text-sm opacity-70">
                                        موردی پیدا نشد
                                    </div>
                                )}
                            </Dropdown.Options>
                        </Dropdown>

                        {/* فلش سمت راست */}
                        <ControlsChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-titleText dark:text-titleText-dark pointer-events-none" />

                    </div>
                }

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
                                dx: -28
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
