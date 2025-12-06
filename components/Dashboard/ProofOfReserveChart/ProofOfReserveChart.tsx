import { Button, Dropdown, MenuItem } from "@heathmont/moon-core-tw";
import { ControlsChevronDown } from "@heathmont/moon-icons-tw";
import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type WeeklyData = {
  weekLabel: string;
  deposit: number;
  withdraw: number;
};

const weeklyData: WeeklyData[] = [
  { weekLabel: "فروردین", deposit: 150, withdraw: 50 },
  { weekLabel: "اردیبهشت", deposit: 120, withdraw: 40 },
  { weekLabel: "خرداد", deposit: 180, withdraw: 50 },
  { weekLabel: "تیر", deposit: 90, withdraw: 70 },
  { weekLabel: "مرداد", deposit: 80, withdraw: 80 },
  { weekLabel: "شهریور", deposit: 70, withdraw: 80 },
  { weekLabel: "مهر", deposit: 110, withdraw: 70 },
  { weekLabel: "آبان", deposit: 140, withdraw: 90 },
  { weekLabel: "آذر", deposit: 190, withdraw: 120 },
  { weekLabel: "دی", deposit: 210, withdraw: 150 },
  { weekLabel: "بهمن", deposit: 220, withdraw: 190 },
  { weekLabel: "اسفند", deposit: 230, withdraw: 210 },

];

const months = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور"];
const exchanges = ["نوبیتکس", "بایننس", "کوکوین"];

const ProofOfReserveChart: React.FC = () => {
  const totalDeposit = weeklyData.reduce((sum, w) => sum + w.deposit, 0);
  const totalWithdraw = weeklyData.reduce((sum, w) => sum + w.withdraw, 0);
  const net = totalDeposit - totalWithdraw;

  const [month, setMonth] = useState<string>("");

  const [selectedExchange, setSelectedExchange] = useState<string>(exchanges[0]);
  const [selectedMonth, setSelectedMonth] = useState<string>(months[0]);

  return (
    <div
      dir="rtl"
      className="w-full rounded-xl border bg-boxColor dark:bg-boxColor-dark p-6 shadow-sm text-titleText dark:text-titleText-dark border-boxBorderColor dark:border-boxBorderColor-dark"
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex flex-col items-start gap-1">
          <h2 className="text-base font-semibold text-titleText dark:text-titleText-dark">
            اثبات ذخیره دارایی‌ها
          </h2>
        </div>

      </div>

      <div className="h-72 w-full text-titleText dark:text-titleText-dark">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={weeklyData}
            margin={{ top: 16, right: 16, left: 0, bottom: 24 }}
          >
            <CartesianGrid vertical={false} stroke="#f1f5f9" />

            <XAxis
              dataKey="weekLabel"
              tick={{
                fontSize: 12,
                fill: "currentColor",        // 👈 رنگ از کلاس‌های والد
              }}
              axisLine={{
                stroke: "currentColor",
                strokeOpacity: 0.15,         // خط محورها کم‌رنگ‌تر
              }}
              tickLine={false}
            />

            <YAxis
              tickFormatter={(val: number) => `${val} M`}
              tick={{
                fontSize: 12,
                fill: "currentColor",        // 👈 این هم از متن والد
              }}
              axisLine={{
                stroke: "currentColor",
                strokeOpacity: 0.15,
              }}
              tickLine={false}
            />

            <Tooltip
              formatter={(value: any) => [`${value} M`, ""]}
              contentStyle={{
                direction: "rtl",
                fontSize: 12,
                borderRadius: 8,
              }}
            />

            <Bar
              dataKey="deposit"
              name="واریز"
              radius={[4, 4, 0, 0]}
              fill="#22c55e"
            />
            <Bar
              dataKey="withdraw"
              name="برداشت"
              radius={[4, 4, 0, 0]}
              fill="#ef4444"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-4 text-xs  sm:flex-row sm:items-center sm:justify-between text-titleText dark:text-titleText-dark">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span>دارایی</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span>بدهی</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] sm:text-xs text-titleText dark:text-titleText-dark">
          <span className={net >= 0 ? "text-green-600" : "text-red-600"}>
            خالص: {net >= 0 ? "+" : "-"}
            {Math.abs(net)} M
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProofOfReserveChart;
