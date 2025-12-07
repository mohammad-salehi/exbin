"use client";

import { useEffect, useState } from "react";
import CircularChart from "../../../../components/Dashboard/CircularChart/CircularChart";
import StatsMarquee from "../../../../components/Dashboard/Band/Band";
import { CircleChart } from "../../../../components/Dashboard/CircleChart/CircleChart";
import SingleLinearChart from "../../../../components/Dashboard/SingleLinearChart/SingleLinearChart";
import DoubleLinearChart from "../../../../components/Dashboard/DoubleLinearChart/DoubleLinearChart";
export default function Page() {

  //دیتای تستی برای تعداد سکو های ثبت شده
  const [ChartData, SetChartData] = useState([
    { name: "ثبت شده", value: 60, color: '#f1f1f1' },
    { name: "ثبت نشده", value: 40, color: "#4caf50" },
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

  const data = [
    { title: "تعداد کاربران", value: 1234 },
    { title: "حجم معاملات", value: "۲۳٫۵M" },
    { title: "میانگین سفارش", value: "۴۵۰٬۰۰۰" },
    { title: "سفارشات باز", value: 89 },
    { title: "سیبلیبسل", value: 1234 },
    { title: "شسیبلشسیبشسیبسیشب", value: "۲۳٫۵M" },
    { title: "شسیلاقفل", value: "۴۵۰٬۰۰۰" },
    { title: "شیسبزطربقفب", value: 89 },
  ];

  const data2 = [
    { name: 'BTC', value: 420000 },
    { name: 'ETH', value: 260000 },
    { name: 'USDT', value: 150000 },
    { name: 'SOL', value: 90000 },
    { name: 'BNB', value: 70000 },
    { name: 'XRP', value: 30000 },
    { name: 'DOGE', value: 20000 },
  ];

  const chartData = [
    { label: "فروردین", x: 150 ,  y:150},
    { label: "اردیبهشت", x: 120 },
    { label: "خرداد", x: 180 },
    { label: "تیر", x: 90 },
    { label: "مرداد", x: 80 },
    { label: "شهریور", x: 70 },
    { label: "مهر", x: 150 },
    { label: "آبان", x: 120 },
    { label: "آذر", x: 180 },
    { label: "دی", x: 90 },
    { label: "بهمن", x: 80 },
    { label: "اسفند", x: 70 },
  ];

  const chartData2 = [
    { label: "فروردین", x: 150 ,  y:150},
    { label: "اردیبهشت", x: 120 ,  y:120},
    { label: "خرداد", x: 180 ,  y:180},
    { label: "تیر", x: 90 ,  y:90},
    { label: "مرداد", x: 80 ,  y:80},
    { label: "شهریور", x: 70 ,  y:70},
    { label: "مهر", x: 150 ,  y:150},
    { label: "آبان", x: 120 ,  y:120},
    { label: "آذر", x: 180 ,  y:180},
    { label: "دی", x: 90 ,  y:90},
    { label: "بهمن", x: 80 ,  y:80},
    { label: "اسفند", x: 70 ,  y:70},
  ];
  return (
    <div className="px-4 xl:px-0"> {/* ← فاصله افقی در موبایل، بدون فاصله در دسکتاپ */}
      <StatsMarquee />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">

        <div>
          <CircularChart
            data={ChartData}
            title="سکو های ثبت شده"
          />
        </div>
        <div>
          <CircularChart
            data={ChartData}
            title="سکو های ثبت شده"
          />
        </div>
        <div>
          <CircularChart
            data={ChartData}
            title="سکو های ثبت شده"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-1 gap-4 mt-4 pb-4">
        <div>
          <DoubleLinearChart
            data={chartData2}
            title="نمودار واریز و برداشت روزانه"
            unitSuffix="M"
            assetLabel='واریز'
            liabilityLabel='برداشت'
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-1 gap-4 mt-0 pb-4">
        <div>
          <SingleLinearChart
            data={chartData}
            title="حجم معاملات روزانه"
            seriesLabel="حجم"
            unitSuffix="M"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-0 pb-4">
        <div>
          <CircleChart
            data={data2}
            title="سهم بازار"
          />
        </div>

        <div>
          <CircleChart
            data={data2}
            title="حجم معاملات"
          />
        </div>
      </div>
    </div>
  );
}
