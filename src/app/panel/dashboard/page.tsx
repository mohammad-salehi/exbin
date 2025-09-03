
"use client";

import { useEffect, useState } from "react";
import CircularChart from "../../../../components/Dashboard/CircularChart/CircularChart";
import LineChartExample from "../../../../components/Dashboard/LinearChart/LinearChart";
export default function page() {
  const [ChartData, SetChartData] = useState([
    { name: "ثبت شده", value: 60 },
    { name: "ثبت نشده", value: 40, color: "#E4E4E4" },
  ])
  const [ExAssetsValue, SetExAssetsValue] = useState([
    { name: "ثبت شده", value: 10 },
    { name: "ثبت نشده", value: 20 },
    { name: "2ثبت نشده", value: 30 },
    { name: "ثبت شده", value: 40 },
    { name: "ثبت نشده", value: 50 },
    { name: "2ثبت نشده", value: 60 },
    { name: "ثبت شده", value: 70 },
    { name: "ثبت نشده", value: 80 },
    { name: "2ثبت نشده", value: 90 },
    { name: "ثبت شده", value: 100 },
    { name: "ثبت نشده", value: 110 },
    { name: "2ثبت نشده", value: 120 },
    { name: "ثبت شده", value: 130 },
    { name: "ثبت نشده", value: 140 },
    { name: "2ثبت نشده", value: 150 },
    { name: "ثبت شده", value: 160 },
    { name: "ثبت نشده", value: 170 },
    { name: "2ثبت نشده", value: 180 },
    { name: "ثبت شده", value: 190 },
    { name: "ثبت نشده", value: 200 },
    { name: "2ثبت نشده", value: 210 },
    { name: "ثبت شده", value: 220 },
    { name: "ثبت نشده", value: 230 },
    { name: "2ثبت نشده", value: 240 },
    { name: "ثبت شده", value: 250 },
    { name: "ثبت نشده", value: 260 },
    { name: "2ثبت نشده", value: 270 },
    { name: "ثبت شده", value: 280 },
    { name: "ثبت نشده", value: 290 },
    { name: "2ثبت نشده", value: 900 },
  ])
  
  const [ExTrNumber, SetExTrNumber] = useState<Array<{
    id: number;
    date: string;
    timestamp: number;
    year:number,
    month:number,
    day:number,
    data: Array<{
      name: string;
      value: number;
    }>;
  }>>([]);

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
        id: index + 1,
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
  },[])

  return (
    <div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="">
          <CircularChart data={ChartData}
            title="صرافی های ثبت شده"
          />
        </div>
        <div className="">
          <CircularChart
            data={ExAssetsValue}
            title="حجم دارایی صرافی‌ها"
            InnerSpace={80}
            height={290}
            Radius={120}
            paddingAngle={1}
            ShowDetails={false}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-1  gap-4 mt-4">
        <div className="">
          <LineChartExample title="مجموع داده های ثبت‌شده توسط صرافی‌ها" data={ExTrNumber} />
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-1  gap-4 mt-4 pb-4">
        <div className="">
          <LineChartExample title="تعداد تراکنش صرافی‌ها" data={ExTrNumber} />
        </div>
      </div>
    </div>
  );
}
