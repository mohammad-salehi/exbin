"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface LinearChartProps {
  title: string;
  data: Array<{
    date: string;
    timestamp: number;
    year: number,
    month: number,
    day: number,
    data: Array<{
      name: string;
      value: number;
    }>;
  }>
}

const LineChartExample: React.FC<LinearChartProps> = ({ title, data }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("ماه")
  const [Filter, SetFilter] = useState<string>("")
  const [Exchanges, SetExchanges] = useState<string[]>([]);

  const [DailyData, SetDailytData] = useState<Array<{
    date: string;
    timestamp: number;
    value: number;
  }>>([])
  const [MonthlyData, SetMonthlyData] = useState<Array<{
    date: string;
    timestamp: number;
    value: number;
  }>>([])

  const ProccessDailyData = () => {
    const getData = []
    for (let i = 0; i < data.length; i++) {

      let sum = 0
      for (let j = 0; j < data[i].data.length; j++) {
        if (Filter === "") {
          sum = sum + data[i].data[j].value
        } else {
          if (data[i].data[j].name === Filter) {
            sum = sum + data[i].data[j].value
          }
        }
      }
      getData.push({
        date: data[i].date,
        timestamp: data[i].timestamp,
        value: sum
      })
    }
    SetDailytData(getData)
  }

  function getPersianMonthName(month: number): string {
    const names = [
      "فروردین", "اردیبهشت", "خرداد",
      "تیر", "مرداد", "شهریور",
      "مهر", "آبان", "آذر",
      "دی", "بهمن", "اسفند"
    ];
    return names[month - 1];
  }

  const ProcessMonthlyData = () => {
    const monthlyDataMap = new Map();

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const { year, month } = item;
      const monthKey = `${year}-${month}`;
      let dayTotal = 0;
      for (let j = 0; j < item.data.length; j++) {
        const d = item.data[j];
        if (Filter === "" || d.name === Filter) {
          dayTotal += d.value;
        }
      }
      if (monthlyDataMap.has(monthKey)) {
        const existing = monthlyDataMap.get(monthKey);
        monthlyDataMap.set(monthKey, {
          ...existing,
          value: existing.value + dayTotal,
        });
      } else {
        monthlyDataMap.set(monthKey, {
          year,
          month,
          date: `${getPersianMonthName(month)}${year}`,
          timestamp: item.timestamp,
          value: dayTotal,
        });
      }
    }
    const result = Array.from(monthlyDataMap.values());
    SetMonthlyData(result);
  };

  useEffect(() => {
    ProccessDailyData()
    ProcessMonthlyData()
  }, [data, Filter])

  useEffect(() => {
    const getData: string[] = [];
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].data.length; j++) {
        const name = data[i].data[j].name;
        if (!getData.includes(name)) {
          getData.push(name);
        }
      }
    }
    SetExchanges(getData);
  }, [data]);


  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    SetFilter(value);
  };

  return (
    <div className="p-4 w-full rounded-xl shadow-sm relative bg-boxColor text-titleText dark:bg-boxColor-dark dark:text-titleText-dark">
      <div className="flex flex-col mb-4">
        <div className="mb-2">
          <h3 className="text-xl">{title}</h3>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

          <div className="flex items-center">
            <button
              className={`px-4 py-2 rounded-lg w-24 ${selectedPeriod === "ماه"
                ? "bg-buttonSelectedColor text-black dark:bg-primary-dark dark:text-boxColor-dark border-buttonSelectedBorderColor dark:border-buttonSelectedBorderColor-dark border"
                : "border-buttonBorderColor bg-white dark:bg-buttonColor-dark dark:border-buttonBorderColor-dark border"
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
              className={`px-4 py-2 w-24 rounded-lg ${selectedPeriod === "روز"
                ? "bg-buttonSelectedColor text-black dark:bg-primary-dark dark:text-boxColor-dark border-buttonSelectedBorderColor dark:border-buttonSelectedBorderColor-dark border"
                : "border-buttonBorderColor bg-white dark:bg-buttonColor-dark dark:border-buttonBorderColor-dark border"
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
              onChange={handleSelectChange}
              value={Filter}
              className="block w-full px-4 py-2 text-gray-700 bg-gray-50  border dark:bg-buttonColor-dark border-gray-300 rounded-lg dark:border-buttonBorderColor-dark focus:outline-none focus:ring-2 focus:ring-blue-500  dark:text-gray-100 dark:focus:ring-blue-400 appearance-none"
            >
              <option value="">همه صرافی ها</option>
              {
                Exchanges.map((item, index) => (
                  <option key={index} value={item}>
                    {item}
                  </option>
                ))
              }
            </select>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={selectedPeriod === "ماه" ? MonthlyData : DailyData}
          margin={{ top: 30, right: 0, left: -50, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{
              fill: "#aaaaaa",
              fontSize: 13,
            }}
          />
          <YAxis
            tick={{
              fill: "#aaaaaa",
              fontSize: 13,
            }}
            dx={10}
            dy={-10}
            tickFormatter={(value) => value.toLocaleString("fa-IR")}
          />
          <Tooltip
            formatter={(value) => value.toLocaleString("en-US")}
            contentStyle={{
              backgroundColor: "#fff",
              borderColor: "#ddd",
              color: "#606060",
              borderRadius: "8px",
              fontSize: "14px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            itemStyle={{
              color: "#606060",
            }}
            labelStyle={{
              color: "#606060",
              fontWeight: "bold",
            }}
          />
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
