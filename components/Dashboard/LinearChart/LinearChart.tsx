"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ControlsChevronDown } from '@heathmont/moon-icons-tw';
import { GenericSearch } from '@heathmont/moon-icons-tw';
import { Dropdown, MenuItem, Button, Input } from "@heathmont/moon-core-tw";

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

  const handleSelectChange = (event: string) => {
    SetFilter(event);
  };
  const [FiltredText, SetFiltredText] = useState<string>('')


  return (
    <div className="p-4 w-full rounded-xl shadow-lg relative bg-boxColor text-titleText dark:bg-boxColor-dark dark:text-titleText-dark border border-boxBorderColor dark:border-boxBorderColor-dark">
      <div className="flex flex-col mb-4">
        <div className="mb-2">
          <h3 className="text-xl">{title}</h3>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-stretch gap-4"> {/* تغییر به items-stretch */}
          <div className="flex items-center w-full">
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

          <div className="inline-block w-full sm:w-72 text-left sm:text-right  flex-grow pb-6 sm:pb-0"> {/* اضافه کردن flex-grow */}
            <Dropdown
              onChange={handleSelectChange}
              value={Filter}>
              <Dropdown.Trigger className="absolute right-0 sm:left-0">
                <Button
                  as="span"
                  role="button"
                  className="flex items-center justify-center gap-2 w-full pl-4 pr-4 py-2 
               text-gray-700 bg-gray-50 border dark:bg-buttonColor-dark border-gray-300 
               rounded-lg dark:border-buttonBorderColor-dark focus:outline-none 
               dark:text-gray-100 appearance-none"
                  variant="ghost"
                >
                  {Filter !== '' ? Filter : 'همه سکو‌ها'}
                  <ControlsChevronDown className="text-xl" />
                </Button>
              </Dropdown.Trigger>

              <Dropdown.Options
                className="absolute left-0 mt-4 w-72 pl-2 pr-2
             text-gray-700 bg-white dark:bg-buttonColor-dark
             border border-gray-300 dark:border-buttonBorderColor-dark 
             rounded-lg dark:text-gray-100 appearance-none z-50
             max-h-60 overflow-y-auto"
              >
                <div className="relative p-2">
                  <Input placeholder="جست‌وجو" className="w-full pr-8" style={{ background: 'none' }} onChange={(e) => { SetFiltredText(e.target.value) }} value={FiltredText} />
                  <GenericSearch className="absolute right-2 top-1/2 -translate-y-1/2 text-titleText dark:text-titleText-dark  " style={{ fontSize: '25px' }} />
                </div>
                <hr />
                <Dropdown.Option value={''} key={'default'}>
                  {({ selected, active }) => (
                    <MenuItem
                      isActive={active}
                      isSelected={selected}
                      className={`border mt-2 mb-1 rounded-md border-gray-100 dark:border-buttonBorderColor-dark ${Filter === '' ? "bg-gray-100 border-gray-200 dark:bg-gray-700" : ""}`}
                    >
                      <MenuItem.Title>همه سکو‌ها</MenuItem.Title>
                    </MenuItem>
                  )}
                </Dropdown.Option>
                {Exchanges.filter((item) =>
                  item.toLowerCase().includes(FiltredText.toLowerCase())
                ).map((item, index) => (
                  <Dropdown.Option value={item} key={index}>
                    {({ selected, active }) => (
                      <MenuItem
                        isActive={active}
                        isSelected={selected}
                        className={`border mt-2 mb-1 rounded-md border-gray-100 dark:border-buttonBorderColor-dark ${Filter === item
                            ? "bg-gray-100 border-gray-200 dark:bg-gray-700"
                            : ""
                          }`}
                      >
                        <MenuItem.Title>{item}</MenuItem.Title>
                      </MenuItem>
                    )}
                  </Dropdown.Option>
                ))}
              </Dropdown.Options>
            </Dropdown>
          </div>
        </div>

      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={selectedPeriod === "ماه" ? MonthlyData : DailyData}
          margin={{ top: 30, right: 0, left: -50, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="0" />
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
            content={(props) => {
              const { active, payload } = props;
              if (active && payload && payload.length) {
                const value = payload[0].value;
                return (
                  <div
                    style={{
                      backgroundColor: "#f8f8f8",
                      borderColor: "#ddd",
                      color: "#606060",
                      borderRadius: "8px",
                      fontSize: "14px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
                      padding: "10px",
                    }}
                  >
                    <p>مقدار: <span className="font-bold">{value.toLocaleString("en-US")}</span></p>
                    <small>{payload[0].payload.date}</small>
                  </div>
                )
              }
              return null
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
            stroke="#73a7de"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>

    </div>
  )
}

export default LineChartExample
