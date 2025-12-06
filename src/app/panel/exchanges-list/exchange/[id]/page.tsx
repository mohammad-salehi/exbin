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
import { GenericHome, GenericSettings, MediaVideo } from '@heathmont/moon-icons-tw';
import { CryptoVolumeTreemap } from "../../../../../../components/Dashboard/CryptoVolumeTreemap/CryptoVolumeTreemap";
import { CryptoTickerBar } from "../../../../../../components/Dashboard/CryptoTickerBar/CryptoTickerBar";
import ProofOfReserveChart from "../../../../../../components/Dashboard/ProofOfReserveChart/ProofOfReserveChart";

const Page = () => {
  const [C1, SetC1] = useState<boolean>(false);
  const [C2, SetC2] = useState<boolean>(false);
  const [C3, SetC3] = useState<boolean>(false);
  const [C4, SetC4] = useState<boolean>(false);
  const [C5, SetC5] = useState<boolean>(false);
  const [Loading, SetLoading] = useState<boolean>(true);

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

  const tickerData = [
    { symbol: 'BTC', name: 'Bitcoin', price: 67234.12, change24h: 2.43 },
    { symbol: 'ETH', name: 'Ethereum', price: 3456.78, change24h: -1.25 },
    { symbol: 'SOL', name: 'Solana', price: 145.32, change24h: 5.9 },
    { symbol: 'BNB', name: 'BNB', price: 412.5, change24h: 0.75 },
    { symbol: 'XRP', name: 'XRP', price: 0.62, change24h: -3.1 },
    // هرچقدر دلت می‌خواد اضافه کن
  ];

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
          <StatsMarquee />
          <div className="p-0 mt-4">
            <CryptoVolumeTreemap data={sampleData} defaultRange="daily" title="حجم معاملات رمزارزها" />
          </div>

          <div className="p-0 mt-4">
            <CryptoVolumeTreemap data={sampleData} defaultRange="daily" title="حجم دارایی رمزارزها" />
          </div>
          <div className="p-0 mt-4">
            <ProofOfReserveChart />
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
