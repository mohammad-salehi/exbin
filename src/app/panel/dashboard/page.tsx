"use client";

import { useEffect, useState } from "react";
import CircularChart from "../../../../components/Dashboard/CircularChart/CircularChart";
import LineChartExample from "../../../../components/Dashboard/LinearChart/LinearChart";
import MarketVolumeChart from "../../../../components/Dashboard/MarketVolumeChart/MarketVolumeChart";
import ComingSoon from "../../../../components/ComingSoon/ComingSoon";
export default function Page() {

  //دیتای تستی برای تعداد سکو های ثبت شده
  const [ChartData, SetChartData] = useState([
    { name: "ثبت شده", value: 60, color:'#f1f1f1' },
    { name: "ثبت نشده", value: 40, color: "#4caf50" },
  ])

  //دیتای تستی برای دارایی سکو ها
  const [ExAssetsValue, SetExAssetsValue] = useState([
 
    { name: "ثبت شده", value: 50 },
    { name: "ثبت شده", value: 50 },
    { name: "ثبت شده", value: 50 },
    { name: "ثبت شده", value: 50 },
    { name: "ثبت شده", value: 50 },
    { name: "ثبت شده", value: 50 },
    { name: "ثبت شده", value: 50 },
    { name: "ثبت شده", value: 50 },
    { name: "ثبت شده", value: 50 },
    { name: "ثبت شده", value: 50 },
    { name: "ثبت شده", value: 50 },
    { name: "ثبت شده", value: 50 },
    { name: "ثبت شده", value: 50 },
    { name: "ثبت شده", value: 50 },
    { name: "ثبت شده", value: 50 },
    { name: "ثبت شده", value: 50 },
    { name: "بیت24", value: 90 },
    { name: "آبان‌تتر", value: 170 },
    { name: "اکسکوینو", value: 240 },
    { name: "والکس", value: 700 },
    { name: "نوبیتکس", value: 8000 },
  ])

  const [ExTrNumber, SetExTrNumber] = useState<Array<{
    date: string;
    timestamp: number;
    year: number,
    month: number,
    day: number,
    data: Array<{
      name: string;
      value: number;
    }>;
  }>>([]);

  //ساخت دیتا برای نمودار های خطی
  const generateExchangeData = () => {
    const startDate = new Date("2023-01-01");
    const data = Array.from({ length: 365 }, (_, index) => {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + index);
      const formattedDate = currentDate.toLocaleDateString("fa-IR", {
        numberingSystem: "latn",
      });
      const [year, month, day] = formattedDate.split("/").map(Number);
      const dayData = {
        date: formattedDate,
        timestamp: currentDate.getTime(),
        year,
        month,
        day,
        data: [
          {
            name: "نوبیتکس",
            value: Math.floor(Math.random() * (1000000 - 10000 + 1)) + 10000,
          },
          {
            name: "والکس",
            value: Math.floor(Math.random() * (1000000 - 10000 + 1)) + 10000,
          },
          {
            name: "رمزینکس",
            value: Math.floor(Math.random() * (1000000 - 10000 + 1)) + 10000,
          },
          {
            name: "او ام پی فینکس",
            value: Math.floor(Math.random() * (1000000 - 10000 + 1)) + 10000,
          },
          {
            name: "تبدیل",
            value: Math.floor(Math.random() * (1000000 - 10000 + 1)) + 10000,
          },
          {
            name: "بیت24",
            value: Math.floor(Math.random() * (1000000 - 10000 + 1)) + 10000,
          },
          {
            name: "آبان‌تتر",
            value: Math.floor(Math.random() * (1000000 - 10000 + 1)) + 10000,
          },
        ],
      };
      return dayData;
    });
    return data;
  };

  useEffect(() => {
    SetExTrNumber(generateExchangeData())
  }, [])

  return (
    <div className="px-4 xl:px-0"> {/* ← فاصله افقی در موبایل، بدون فاصله در دسکتاپ */}

      {/* <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div>
          <CircularChart
            data={ChartData}
            title="سکو های ثبت شده"
          />
        </div>
        <div>
          <MarketVolumeChart
            data={ExAssetsValue}
            title="حجم دارایی سکو‌ها"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-1 gap-4 mt-4">
        <div>
          <LineChartExample
            title="مجموع داده های ثبت‌شده توسط سکو‌ها"
            data={ExTrNumber}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-1 gap-4 mt-4 pb-4">
        <div>
          <LineChartExample
            title="تعداد تراکنش سکو‌ها"
            data={ExTrNumber}
          />
        </div>
      </div> */}

      <ComingSoon/>

    </div>
  );
}
