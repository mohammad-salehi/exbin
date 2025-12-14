"use client";

import React, { useEffect, useState } from "react";
import CeoDetail from "../../../../../../components/Dashboard/Exchange_page/CeoDetail/CeoDetail";
import BoardMemberTable from "../../../../../../components/Dashboard/Exchange_page/BoardMemberInfo/BoardMemberInfo";
import ExchangeAgentInfo from "../../../../../../components/Dashboard/Exchange_page/ExchangeAgentInfo/ExchangeAgentInfo";
import EmployeeInfo from "../../../../../../components/Dashboard/Exchange_page/EmployeeInfo/EmployeeInfo";
import Exchange_info from "../../../../../../components/Dashboard/Exchange_page/Exchange_info/Exchange_info";
import AnimatedText from "../../../../../../components/AnimatedLoading/AnimatedLoading";
import StatsMarquee from "../../../../../../components/Dashboard/Band/Band";
import { PantaTabs, TabItem } from "../../../../../../components/Tabs/Tabs";
import { CryptoVolumeTreemap } from "../../../../../../components/Dashboard/CryptoVolumeTreemap/CryptoVolumeTreemap";
import { CircleChart } from "../../../../../../components/Dashboard/CircleChart/CircleChart";
import SingleLinearChart from "../../../../../../components/Dashboard/SingleLinearChart/SingleLinearChart";
import { GetRequest } from "../../../../../../functions/GetRequest";
import { useParams } from "next/navigation";
import DoubleLinearChart from "../../../../../../components/Dashboard/DoubleLinearChart/DoubleLinearChart";

const Page = () => {
  const params = useParams<{ id: string }>();

  const [C1, SetC1] = useState<boolean>(false);
  const [C2, SetC2] = useState<boolean>(false);
  const [C3, SetC3] = useState<boolean>(false);
  const [C4, SetC4] = useState<boolean>(false);
  const [C5, SetC5] = useState<boolean>(false);
  const [Loading, SetLoading] = useState<boolean>(true);
  const [logo, SetLogo] = useState<string>("");
  const [name, SetName] = useState<string>("");

  useEffect(() => {
    if (C1 && C2 && C3 && C4 && C5) {
      SetLoading(false);
    }
  }, [C1, C2, C3, C4, C5]);

  // اختیاری: برای اینکه اگر یکی از بخش‌ها fail شد گیر نکنه
  useEffect(() => {
    const fallback = setTimeout(() => SetLoading(false), 15000);
    return () => clearTimeout(fallback);
  }, []);

  useEffect(() => {
    GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/exchanges/${params.id}`)
      .then((response) => {
        SetLogo(response.result.logo);
        SetName(response.result.name);
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  const sampleData = {
    daily: [
      { name: 'Bitcoin', symbol: 'BTC', value: 42000000 },
      { name: 'Ethereum', symbol: 'ETH', value: 26000000 },
      { name: 'Tether', symbol: 'USDT', value: 15000000 },
      { name: 'Solana', symbol: 'SOL', value: 8000000 },
      { name: 'BNB', symbol: 'BNB', value: 6000000 },
      { name: 'BNB', symbol: 'BNB', value: 6000000 },
      { name: 'BNB', symbol: 'BNB', value: 6000000 },
      { name: 'BNB', symbol: 'BNB', value: 6000000 },
      { name: 'BNB', symbol: 'BNB', value: 6000000 },
      { name: 'BNB', symbol: 'BNB', value: 6000000 },
      { name: 'BNB', symbol: 'BNB', value: 6000000 },
      { name: 'BNB', symbol: 'BNB', value: 6000000 },
      { name: 'BNB', symbol: 'BNB', value: 6000000 },
      { name: 'BNB', symbol: 'BNB', value: 6000000 },
      { name: 'BNB', symbol: 'BNB', value: 6000000 },
    ],
    weekly: [
      { name: 'Bitcoin', symbol: 'BTC', value: 210000000 },
      { name: 'Ethereum', symbol: 'ETH', value: 150000000 },
      { name: 'Tether', symbol: 'USDT', value: 90000000 },
      { name: 'Solana', symbol: 'SOL', value: 45000000 },
      { name: 'BNB', symbol: 'BNB', value: 30000000 },
      { name: 'XRP', symbol: 'XRP', value: 20000000 },
    ],
    monthly: [
      { name: 'Bitcoin', symbol: 'BTC', value: 900000000 },
      { name: 'Ethereum', symbol: 'ETH', value: 600000000 },
      { name: 'Tether', symbol: 'USDT', value: 400000000 },
      { name: 'Solana', symbol: 'SOL', value: 220000000 },
      { name: 'BNB', symbol: 'BNB', value: 180000000 },
      { name: 'XRP', symbol: 'XRP', value: 120000000 },
      { name: 'DOGE', symbol: 'DOGE', value: 80000000 },
    ],
  };

  const data = [
    { label: 'BTC', value: 420000 },
    { label: 'ETH', value: 260000 },
    { label: 'USDT', value: 150000 },
    { label: 'SOL', value: 90000 },
    { label: 'BNB', value: 70000 },
    { label: 'XRP', value: 30000 },
    { label: 'DOGE', value: 20000 },
  ];

  const chartData = [
    { label: "فروردین", x: 150 },
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
    { label: "فروردین", x: 150, y: 150 },
    { label: "اردیبهشت", x: 120, y: 120 },
    { label: "خرداد", x: 180, y: 180 },
    { label: "تیر", x: 90, y: 90 },
    { label: "مرداد", x: 80, y: 80 },
    { label: "شهریور", x: 70, y: 70 },
    { label: "مهر", x: 150, y: 150 },
    { label: "آبان", x: 120, y: 120 },
    { label: "آذر", x: 180, y: 180 },
    { label: "دی", x: 90, y: 90 },
    { label: "بهمن", x: 80, y: 80 },
    { label: "اسفند", x: 70, y: 70 },
  ];

  const tabs: TabItem[] = [
    {
      id: 'overview',
      label: 'اطلاعات هویتی',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 16V12M12 8H12.01M2 8.52274V15.4773C2 15.7218 2 15.8441 2.02763 15.9592C2.05213 16.0613 2.09253 16.1588 2.14736 16.2483C2.2092 16.3492 2.29568 16.4357 2.46863 16.6086L7.39137 21.5314C7.56432 21.7043 7.6508 21.7908 7.75172 21.8526C7.84119 21.9075 7.93873 21.9479 8.04077 21.9724C8.15586 22 8.27815 22 8.52274 22H15.4773C15.7218 22 15.8441 22 15.9592 21.9724C16.0613 21.9479 16.1588 21.9075 16.2483 21.8526C16.3492 21.7908 16.4357 21.7043 16.6086 21.5314L21.5314 16.6086C21.7043 16.4357 21.7908 16.3492 21.8526 16.2483C21.9075 16.1588 21.9479 16.0613 21.9724 15.9592C22 15.8441 22 15.7218 22 15.4773V8.52274C22 8.27815 22 8.15586 21.9724 8.04077C21.9479 7.93873 21.9075 7.84119 21.8526 7.75172C21.7908 7.6508 21.7043 7.56432 21.5314 7.39137L16.6086 2.46863C16.4357 2.29568 16.3492 2.2092 16.2483 2.14736C16.1588 2.09253 16.0613 2.05213 15.9592 2.02763C15.8441 2 15.7218 2 15.4773 2H8.52274C8.27815 2 8.15586 2 8.04077 2.02763C7.93873 2.05213 7.84119 2.09253 7.75172 2.14736C7.6508 2.2092 7.56432 2.29568 7.39137 2.46863L2.46863 7.39137C2.29568 7.56432 2.2092 7.6508 2.14736 7.75172C2.09253 7.84119 2.05213 7.93873 2.02763 8.04077C2 8.15586 2 8.27815 2 8.52274Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>,
      content: (
        <div>
          <Exchange_info SetC1={SetC1} />
          <CeoDetail SetC2={SetC2} />
          <BoardMemberTable SetC3={SetC3} />
          <ExchangeAgentInfo SetC4={SetC4} />
          <EmployeeInfo SetC5={SetC5} />
        </div>
      ),
    },
    {
      id: 'analytics',
      label: 'اطلاعات آماری',
      icon: <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="none">
        <path fill="currentColor" d="M9 17a1 1 0 102 0H9zm2-14a1 1 0 10-2 0h2zM3 17a1 1 0 102 0H3zm2-7a1 1 0 00-2 0h2zm10 7a1 1 0 102 0h-2zm2-10a1 1 0 10-2 0h2zm-6 10V3H9v14h2zm-6 0v-7H3v7h2zm12 0V7h-2v10h2z" />
      </svg>,
      content: (
        <div>
          {logo !== null && logo !== "" ? (
            <img alt="image" className="w-8 h-8 inline-block" src={logo} />
          ) : (
            <div
              className=" items-center text-titleText dark:text-titleText-dark inline-block "
              style={{ marginBottom: "-6px" }}
            >
              <svg
                width="30px"
                height="30px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.2639 15.9376L12.5958 14.2835C11.7909 13.4852 11.3884 13.0861 10.9266 12.9402C10.5204 12.8119 10.0838 12.8166 9.68048 12.9537C9.22188 13.1096 8.82814 13.5173 8.04068 14.3327L4.04409 18.2802M14.2639 15.9376L14.6053 15.5991C15.4112 14.7999 15.8141 14.4003 16.2765 14.2544C16.6831 14.1262 17.12 14.1312 17.5236 14.2688C17.9824 14.4252 18.3761 14.834 19.1634 15.6515L20 16.4936M14.2639 15.9376L18.275 19.9566M20.9992 6.00011H14.9992M11 3.99951L7.2 4.00011C6.07989 4.00011 5.51984 4.00011 5.09202 4.21809C4.71569 4.40984 4.40973 4.7158 4.21799 5.09213C4 5.51995 4 6.08 4 7.20011V16.8001C4 17.4576 4 17.9222 4.04409 18.2802M20 9.99951V16.4936M4.04409 18.2802C4.07512 18.5322 4.12796 18.7314 4.21799 18.9081C4.40973 19.2844 4.71569 19.5904 5.09202 19.7821C5.51984 20.0001 6.07989 20.0001 7.2 20.0001H16.8C17.9201 20.0001 18.4802 20.0001 18.908 19.7821C19.2843 19.5904 19.5903 19.2844 19.782 18.9081C20 18.4803 20 17.9202 20 16.8001V16.4936"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
          <h3 className="inline-block text-2xl text-bold mr-2 text-titleText dark:text-titleText-dark">
            {name}
          </h3>
          {/* <StatsMarquee /> */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
            <div className="min-h-full">
              <CircleChart
                data={data}
                title="حجم معاملات رمزارزها"
              />
            </div>
            <div className="min-h-full">
              <SingleLinearChart
                data={chartData}
                title="حجم معاملات روزانه"
                seriesLabel="حجم"
                unitSuffix="M"
              />
            </div>
          </div>
          <div className="p-0 mt-4">
            <CryptoVolumeTreemap data={sampleData} defaultRange="daily" title="حجم دارایی رمزارزها" />
          </div>
          <div className="p-0 mt-4">
            <DoubleLinearChart
              data={chartData2}
              title="اثبات ذخیره دارایی‌ها"
              unitSuffix="M"
              assetLabel='دارایی'
              liabilityLabel='بدهی'
            />
          </div>
        </div>
      ),
    }
  ];


  return (
    <div className="relative px-4 xl:px-0 mb-4">
      {Loading && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-white/70 dark:bg-bgColor-dark/70 backdrop-blur-sm">
          <div className="pointer-events-none">
            <AnimatedText />
          </div>
        </div>
      )}

      <div className="p-0">
        <PantaTabs items={tabs} defaultId="overview" />
      </div>

    </div>
  );
};

export default Page;
