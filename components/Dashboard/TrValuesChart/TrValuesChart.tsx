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
  { weekLabel: "هفته اول", deposit: 150, withdraw: 50 },
  { weekLabel: "هفته دوم", deposit: 40, withdraw: 70 },
  { weekLabel: "هفته سوم", deposit: 20, withdraw: 10 },
  { weekLabel: "هفته چهارم", deposit: 90, withdraw: 40 },
  { weekLabel: "هفته اول", deposit: 150, withdraw: 50 },
  { weekLabel: "هفته دوم", deposit: 40, withdraw: 70 },
  { weekLabel: "هفته سوم", deposit: 20, withdraw: 10 },
  { weekLabel: "هفته چهارم", deposit: 90, withdraw: 40 },
];

const months = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور"];
const exchanges = ["نوبیتکس", "بایننس", "کوکوین"];

const TrValuesChart: React.FC = () => {
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
            معاملات 30 روزه
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
              radius={[2, 2, 0, 0]}
              fill="#22c55e"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrValuesChart;
