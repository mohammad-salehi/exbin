"use client";

import { useEffect, useRef, useState } from "react";
import StatsMarquee from "../../../../components/Dashboard/Band/Band";
import { CircleChart } from "../../../../components/Dashboard/CircleChart/CircleChart";
import SingleLinearChart from "../../../../components/Dashboard/SingleLinearChart/SingleLinearChart";
import DoubleLinearChart from "../../../../components/Dashboard/DoubleLinearChart/DoubleLinearChart";
import { GetRequest } from "../../../../functions/GetRequest";
export default function Page() {

  type DashboardItem = {
    label: string;
    value: number;
  };

  //دیتای تستی برای تعداد سکو های ثبت شده
  const [DashboardData, SetDashboardData] = useState<DashboardItem[]>([])
  const [ProofOfReserve, SetProofOfReserve] = useState<DashboardItem[]>([])
  const [IRRtoUSDT, SetIRRtoUSDT] = useState<DashboardItem[]>([])
  const [USDTBuyerData, SetUSDTBuyerData] = useState<DashboardItem[]>([])
  const [MarketShare, SetMarketShare] = useState<DashboardItem[]>([])
  const [CryptoShare, SetCryptoShare] = useState<DashboardItem[]>([])

  const data2 = [
    { label: 'BTC', value: 420000 },
    { label: 'ETH', value: 260000 },
    { label: 'USDT', value: 150000 },
    { label: 'SOL', value: 90000 },
    { label: 'BNB', value: 70000 },
    { label: 'XRP', value: 30000 },
    { label: 'DOGE', value: 20000 },
  ];

  const chartData = [
    { label: "فروردین", x: 150, y: 150 },
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

  const usersNumberRef = useRef(false);
  const totalTradeNumberRef = useRef(false);
  const totalExchangeNumberRef = useRef(false);
  const totalVolumeRef = useRef(false);
  const totalTradeVolumeRef = useRef(false);
  const PRRef = useRef(false);
  const IRRUSDTRef = useRef(false);
  const USDTBuyerRef = useRef(false);
  const MarketShareRef = useRef(false);
  const CryptoShareRef = useRef(false);

  //تعداد کاربران صرافی‌ها
  useEffect(() => {
    if (usersNumberRef.current) return;
    usersNumberRef.current = true;

    GetRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/total-number-of-users`)
      .then((response) => {
        SetDashboardData((prev) => {
          const item: DashboardItem = {
            label: "تعداد کاربران",
            value: Number(response?.result?.totalUsers ?? 0),
          };

          const next = prev.filter((x) => x.label !== item.label);
          return [...next, item];
        });
      })
      .catch(console.log);
  }, []);
  //تعداد و حجم معاملات
  useEffect(() => {
    if (totalTradeNumberRef.current) return;
    totalTradeNumberRef.current = true;

    GetRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/total-trade-count-avg/${1}`)
      .then((response) => {
        SetDashboardData((prev) => {
          const item1: DashboardItem = {
            label: "تعداد معاملات روزانه",
            value: Number(response?.result.totalTradesCount ?? 0),
          };

          const item2: DashboardItem = {
            label: "میانگین معاملات روزانه (USDT)",
            value: Number(response?.result.avgTradeVolumeUsd ?? 0),
          };

          const next = prev.filter((x) => x.label !== item1.label);
          return [...next, item1, item2];
        });
      })
      .catch(console.log);
  }, []);
  //تعداد سکوها
  useEffect(() => {
    if (totalExchangeNumberRef.current) return;
    totalExchangeNumberRef.current = true;

    GetRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/exchanges?page=0&size=1`)
      .then((response) => {
        SetDashboardData((prev) => {
          const item1: DashboardItem = {
            label: "سکوهای ثبت‌شده",
            value: Number(response?.result?.totalElements ?? 0),
          };

          const next = prev.filter((x) => x.label !== item1.label);
          return [...next, item1];
        });
      })
      .catch(console.log);
  }, []);
  //حجم معاملات روزانه
  useEffect(() => {
    if (totalVolumeRef.current) return;
    totalVolumeRef.current = true;

    GetRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/total-trade-volume-usdt-irr/${1}`)
      .then((response) => {
        SetDashboardData((prev) => {
          const item1: DashboardItem = {
            label: "حجم معاملات روزانه بازار تتر",
            value: Number(response?.result?.totalVolumeUsdt ?? 0),
          };
          const item2: DashboardItem = {
            label: "حجم معاملات روزانه بازار ریال",
            value: Number(response?.result?.totalVolumeIrr ?? 0),
          };
          const next = prev.filter((x) => x.label !== item1.label);
          return [...next, item1, item2];
        });
      })
      .catch(console.log);
  }, []);
  //حجم معاملات روزانه
  useEffect(() => {
    if (totalTradeVolumeRef.current) return;
    totalTradeVolumeRef.current = true;

    GetRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/total-trade-volume/${1}`)
      .then((response) => {
        SetDashboardData((prev) => {
          const item1: DashboardItem = {
            label: "حجم معاملات روزانه (USD)",
            value: Number(response?.result?.totalVolumeUsd ?? 0),
          };
          const next = prev.filter((x) => x.label !== item1.label);
          return [...next, item1];
        });
      })
      .catch(console.log);
  }, []);
  //نسبت دارایی به بدهی
  useEffect(() => {
    if (PRRef.current) return;
    PRRef.current = true;
    GetRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/all-exchange-por-ratio`)
      .then((response) => {
        SetProofOfReserve(
          [
            {
              label: 'دارایی',
              value: response.result.totalAssetsUsd,
            },
            {
              label: 'بدهی',
              value: response.result.totalLiabilitiesUsd,
            }
          ]
        )
      })
      .catch(console.log);
  }, []);
  //نسبت تومان به تتر
  useEffect(() => {
    if (IRRUSDTRef.current) return;
    IRRUSDTRef.current = true;
    GetRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/irr-to-usdt-ratio`)
      .then((response) => {
        SetIRRtoUSDT(
          [
            {
              label: 'معاملات ریالی',
              value: response.result.volumeIrr24h,
            },
            {
              label: 'معاملات تتری',
              value: response.result.volumeUsdt24h,
            }
          ]
        )
      })
      .catch(console.log);
  }, []);
  //نسبت خریداران تتر
  useEffect(() => {
    if (USDTBuyerRef.current) return;
    USDTBuyerRef.current = true;
    GetRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/usdt-buyer-ratio-24h`)
      .then((response) => {
        const getData = []
        for(let i = 0; i < response.result.length; i++) {
          getData.push(
            {
              label:response.result[i].userIdentity,
              value:response.result[i].totalUsdtVolume
            }
          )
        }
        SetUSDTBuyerData(getData)
      })
      .catch(console.log);
  }, []);
  //سهم بازار صرافی ها
  useEffect(() => {
    if (MarketShareRef.current) return;
    MarketShareRef.current = true;
    GetRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/market-share`)
      .then((response) => {
        const getData = []
        for(let i = 0; i < response.result.length; i++) {
          getData.push(
            {
              label:response.result[i].exchangeName,
              value:response.result[i].marketSharePercent
            }
          )
        }
        SetMarketShare(getData)
      })
      .catch(console.log);
  }, []);
    //سهم بازار صرافی ها
    useEffect(() => {
      if (CryptoShareRef.current) return;
      CryptoShareRef.current = true;
      GetRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/crypto-volume-share-30d`)
        .then((response) => {
          console.log(response)
          const getData = []
          for(let i = 0; i < response.result.length; i++) {
            getData.push(
              {
                label:response.result[i].crypto,
                value:response.result[i].volumeUsd
              }
            )
          }
          SetCryptoShare(getData)
        })
        .catch(console.log);
    }, []);
  return (
    <div className="px-4 xl:px-0"> {/* ← فاصله افقی در موبایل، بدون فاصله در دسکتاپ */}
      <StatsMarquee data={DashboardData} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">

        <div>
          <CircleChart
            data={ProofOfReserve}
            title="نسبت دارایی به بدهی"
          />
        </div>
        <div>
          <CircleChart
            data={IRRtoUSDT}
            title="نسبت معاملات تومان به تتر"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4 pb-4">
        <div>
          <CircleChart
            data={MarketShare}
            title="سهم بازار"
          />
        </div>

        <div>
          <CircleChart
            data={CryptoShare}
            title="حجم معاملات"
          />
        </div>

        <div>
          <CircleChart
            data={USDTBuyerData}
            title="نسبت خریداران تتر"
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
    </div>
  );
}
