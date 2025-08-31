"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { Combobox, MenuItem } from "@heathmont/moon-core-tw";
import { ControlsChevronDownSmall } from "@heathmont/moon-icons-tw";

const people = [
  { id: 1, label: "Wade Cooper", value: "Wade Cooper" },
  { id: 2, label: "Arlene Mccoy", value: "Arlene Mccoy" },
  { id: 3, label: "Devon Webb", value: "Devon Webb" },
  { id: 4, label: "Tom Cook", value: "Tom Cook" },
  { id: 5, label: "Tanya Fox", value: "Tanya Fox" },
  { id: 6, label: "Hellen Schmidt", value: "Hellen Schmidt" },
];

const data = [
  { month: "فروردین", value: 150 },
  { month: "اردیبهشت", value: 220 },
  { month: "خرداد", value: 350 },
  { month: "تیر", value: 270 },
  { month: "مرداد", value: 350 },
  { month: "شهریور", value: 400 },
  { month: "مهر", value: 420 },
  { month: "آبان", value: 550 },
  { month: "آذر", value: 300 },
  { month: "دی", value: 450 },
  { month: "بهمن", value: 600 },
  { month: "اسفند", value: 800 },
];

const LineChartExample = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("ماه"); // انتخاب بازه زمانی (ماه یا روز)
  const [DarkMode, setDarkMode] = useState<boolean>(false);
  const [TextColor, setTextColor] = useState<string>('');

  // تعیین رنگ‌ها برای دارک و لایت تم
  useEffect(() => {
    const storedTheme = localStorage.getItem("dark-mode");
    const currentTheme = storedTheme ? true : false;
    setDarkMode(currentTheme);
    const tickColor = currentTheme ? "#dcdcdc" : "#606060";
    setTextColor(tickColor)
  }, []);

  const filter = (
    query: string,
    people: { id: number; label: string; value: string }[],
  ) => {
    return query === ""
      ? people
      : people.filter(({ value }) =>
        value
          .toLowerCase()
          .replace(/\s+/g, "")
          .includes(query.toLowerCase().replace(/\s+/g, "")),
      );
  };

  const [selected1, setSelected1] = useState({});

  const [query1, setQuery1] = useState<string>("");
  const filteredPeople1 = filter(query1, people);

  return (
    <div className="p-4 w-full rounded-xl shadow-lg relative bg-boxColor text-titleText dark:bg-boxColor-dark dark:text-titleText-dark">
      <div className="flex flex-col mb-4">
        <div className="mb-2">
          <h3 className="text-xl">مجموع داده‌های ثبت شده توسط صرافی‌ها</h3>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button
              className={`px-4 py-2 rounded w-24 ${selectedPeriod === "ماه"
                ? "bg-primary text-white dark:bg-primary-dark dark:text-boxColor-dark"
                : "bg-gray-100 dark:bg-gray-600 dark:border-gray-600 border"
                }`}
              onClick={() => setSelectedPeriod("ماه")}
              style={{
                borderTopLeftRadius: "0px",
                borderBottomLeftRadius: "0px",
              }}
            >
              ماه
            </button>
            <button
              className={`px-4 py-2 w-24 rounded ${selectedPeriod === "روز"
                ? "bg-primary text-white dark:bg-primary-dark dark:text-boxColor-dark"
                : "bg-gray-100 dark:bg-gray-600 dark:border-gray-600 border"
                }`}
              onClick={() => setSelectedPeriod("روز")}
              style={{
                borderTopRightRadius: "0px",
                borderBottomRightRadius: "0px",
              }}
            >
              روز
            </button>
          </div>

          <div className="relative inline-block w-48 ">
            <select
              className="block w-full px-4 py-2 text-gray-700 bg-gray-100  border dark:bg-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500  dark:text-gray-100 dark:border-gray-600 dark:focus:ring-blue-400 appearance-none"
            >
              <option value="">همه صرافی ها</option>
              <option value="1">گزینه اول</option>
              <option value="2">گزینه دوم</option>
              <option value="3">گزینه سوم</option>
            </select>
          </div>



        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fill: TextColor }} />
          <YAxis tick={{ fill: TextColor }} dx={-25} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2B6CB0"
            strokeWidth={2}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartExample;
