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

const CryptoDepositWithdrawCard: React.FC = () => {
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
            واریز و برداشت رمز ارز
          </h2>
        </div>

      </div>
      <div className="mt-4 flex w-full items-center justify-between gap-3">
        {/* Dropdown صرافی - سمت راست (در RTL) */}
        <div className="relative w-full max-w-[200px]">
          <Dropdown
            value={selectedExchange}
            onChange={(e) => {
              if (typeof e === "string") {
                setSelectedExchange(e);
              }
            }}
          >
            <Dropdown.Trigger className="w-full">
              <Button
                as="span"
                role="button"
                variant="ghost"
                className="flex items-center justify-between w-full pl-10 py-2 
            text-gray-700 border border-gray-300 
            rounded-lg dark:border-buttonBorderColor-dark focus:outline-none 
            dark:text-gray-100 appearance-none relative bg-boxColor dark:bg-boxColor-dark"
              >
                <span>
                  {selectedExchange !== "" ? selectedExchange : "انتخاب صرافی"}
                </span>
              </Button>
            </Dropdown.Trigger>

            <Dropdown.Options
              className="absolute left-0 mt-2 w-72 pl-2 pr-2
          text-gray-700 bg-white dark:bg-buttonColor-dark
          border border-gray-300 dark:border-buttonBorderColor-dark 
          rounded-lg dark:text-gray-100 appearance-none z-50
          max-h-60 overflow-y-auto"
            >
              {exchanges.map((ex, index) => (
                <Dropdown.Option value={ex} key={`exchange-${index}`}>
                  {({ selected, active }) => (
                    <MenuItem
                      isActive={active}
                      isSelected={selected}
                      className={`border mt-2 mb-1 rounded-md border-gray-100 dark:border-buttonBorderColor-dark ${selectedExchange === ex
                          ? "bg-gray-100 border-gray-200 dark:bg-gray-700"
                          : ""
                        }`}
                    >
                      <MenuItem.Title>{ex}</MenuItem.Title>
                    </MenuItem>
                  )}
                </Dropdown.Option>
              ))}
            </Dropdown.Options>
          </Dropdown>

          <ControlsChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-titleText dark:text-titleText-dark pointer-events-none" />
        </div>

        {/* Dropdown ماه - سمت چپ (در RTL) */}
        <div className="relative w-full max-w-[200px]">
          <Dropdown
            value={selectedMonth}
            onChange={(e) => {
              if (typeof e === "string") {
                setSelectedMonth(e);
              }
            }}
          >
            <Dropdown.Trigger className="w-full">
              <Button
                as="span"
                role="button"
                variant="ghost"
                className="flex items-center justify-between w-full pl-10 py-2 
            text-gray-700 border border-gray-300 
            rounded-lg dark:border-buttonBorderColor-dark focus:outline-none 
            dark:text-gray-100 appearance-none relative bg-boxColor dark:bg-boxColor-dark"
              >
                <span>{selectedMonth !== "" ? selectedMonth : "انتخاب ماه"}</span>
              </Button>
            </Dropdown.Trigger>

            <Dropdown.Options
              className="absolute left-0 mt-2 w-72 pl-2 pr-2
          text-gray-700 bg-white dark:bg-buttonColor-dark
          border border-gray-300 dark:border-buttonBorderColor-dark 
          rounded-lg dark:text-gray-100 appearance-none z-50
          max-h-60 overflow-y-auto"
            >
              {months.map((m, index) => (
                <Dropdown.Option value={m} key={`month-${index}`}>
                  {({ selected, active }) => (
                    <MenuItem
                      isActive={active}
                      isSelected={selected}
                      className={`border mt-2 mb-1 rounded-md border-gray-100 dark:border-buttonBorderColor-dark ${selectedMonth === m
                          ? "bg-gray-100 border-gray-200 dark:bg-gray-700"
                          : ""
                        }`}
                    >
                      <MenuItem.Title>{m}</MenuItem.Title>
                    </MenuItem>
                  )}
                </Dropdown.Option>
              ))}
            </Dropdown.Options>
          </Dropdown>

          <ControlsChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-titleText dark:text-titleText-dark pointer-events-none" />
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
            <span>واریز</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span>برداشت</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] sm:text-xs text-titleText dark:text-titleText-dark">
          <span>برداشت: {totalWithdraw} M</span>
          <span>واریز: {totalDeposit} M</span>
          <span className={net >= 0 ? "text-green-600" : "text-red-600"}>
            خالص: {net >= 0 ? "+" : "-"}
            {Math.abs(net)} M
          </span>
        </div>
      </div>
    </div>
  );
};

export default CryptoDepositWithdrawCard;
