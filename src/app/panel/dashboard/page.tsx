"use client";
import React from "react";
import { useEffect, useRef, useState } from "react";
import StatsMarquee from "../../../../components/Dashboard/Band/Band";
import { CircleChart } from "../../../../components/Dashboard/CircleChart/CircleChart";
import SingleLinearChart from "../../../../components/Dashboard/SingleLinearChart/SingleLinearChart";
import DoubleLinearChart from "../../../../components/Dashboard/DoubleLinearChart/DoubleLinearChart";
import { GetRequest } from "../../../../functions/GetRequest";

const MemoStatsMarquee = React.memo(StatsMarquee);
const MemoCircleChart = React.memo(CircleChart);
const MemoSingleLinearChart = React.memo(SingleLinearChart);
const MemoDoubleLinearChart = React.memo(DoubleLinearChart);

export default function Page() {

  type DashboardItem = {
    label: string;
    value: number;
  };
  type DoubleChartItem = {
    label: string;
    x: number;
    y: number;
  };
  type SingleChartItem = {
    label: string;
    x: number;
  };

  //دیتای تستی برای تعداد سکو های ثبت شده
  const [DashboardData, SetDashboardData] = useState<DashboardItem[]>([])
  const [ProofOfReserve, SetProofOfReserve] = useState<DashboardItem[]>([])
  const [IRRtoUSDT, SetIRRtoUSDT] = useState<DashboardItem[]>([])
  const [USDTBuyerData, SetUSDTBuyerData] = useState<DashboardItem[]>([])
  const [MarketShare, SetMarketShare] = useState<DashboardItem[]>([])
  const [CryptoShare, SetCryptoShare] = useState<DashboardItem[]>([])
  const [DepWitList, SetDepWitList] = useState<DoubleChartItem[]>([])
  const [DailyTradingList, SetDailyTradingList] = useState<SingleChartItem[]>([])
  const [CryptoList, SetCryptoList] = useState([])
  const [CryptoSelected1, SetCryptoSelected1] = useState('')
  const [CryptoSelected2, SetCryptoSelected2] = useState('')

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
  const CryptoListRef = useRef(false);

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
            label: "حجم معاملات روزانه بازار تتری",
            value: Number(response?.result?.totalVolumeUsdt ?? 0),
          };
          const item2: DashboardItem = {
            label: "حجم معاملات روزانه بازار ریالی",
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
        for (let i = 0; i < response.result.length; i++) {
          getData.push(
            {
              label: response.result[i].userIdentity,
              value: response.result[i].totalUsdtVolume
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
        for (let i = 0; i < response.result.length; i++) {
          getData.push(
            {
              label: response.result[i].exchangeName,
              value: response.result[i].marketSharePercent
            }
          )
        }
        SetMarketShare(getData)
      })
      .catch(console.log);
  }, []);
  //حجم معاملات 
  useEffect(() => {
    if (CryptoShareRef.current) return;
    CryptoShareRef.current = true;
    GetRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/crypto-volume-share-30d`)
      .then((response) => {
        const getData = []
        for (let i = 0; i < response.result.length; i++) {
          getData.push(
            {
              label: response.result[i].crypto,
              value: response.result[i].volumeUsd
            }
          )
        }
        SetCryptoShare(getData)
      })
      .catch(console.log);
  }, []);
  //لیست کوین ها
  useEffect(() => {
    if (CryptoListRef.current) return;
    CryptoListRef.current = true;
    GetRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/valid-currencies`)
      .then((response) => {
        SetCryptoList(response.result)
        SetCryptoSelected1(response.result[0].cryptocurrency)
        SetCryptoSelected2(response.result[0].cryptocurrency)
      })
      .catch(console.log);
  }, []);
  //واریز و برداشت ماهانه
  useEffect(() => {
    if (CryptoSelected1 !== '') {
      GetRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/daily-deposits-withdrawals/${CryptoSelected1}`)
      .then((response) => {
        const getData = []
        for (let i = 0; i < response.result.length; i++) {
          getData.push(
            {
              label: response.result[i].date,
              x: response.result[i].inflow,
              y: response.result[i].outflow
            }
          )
        }
        SetDepWitList(getData)
      })
      .catch(console.log);
    }

  }, [,CryptoSelected1]);
  //حجم معاملات ماهانه
  useEffect(() => {
    if (CryptoSelected2 !== '') {
      GetRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/daily-trading-volume/${CryptoSelected2}`)
      .then((response) => {
        const getData = []
        for (let i = 0; i < response.result.length; i++) {
          getData.push(
            {
              label: response.result[i].date,
              x: response.result[i].volume,
            }
          )
        }
        SetDailyTradingList(getData)
      })
      .catch(console.log);
    }

  }, [,CryptoSelected2]);

  return (
    <div className="px-4 xl:px-0">
      {/* ← فاصله افقی در موبایل، بدون فاصله در دسکتاپ */}
      <MemoStatsMarquee data={DashboardData} />
  
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
        <div>
          <MemoCircleChart
            data={ProofOfReserve}
            title="نسبت دارایی به بدهی"
            unit="USDT"
            value={
              ProofOfReserve.length !== 0
                ? ProofOfReserve[0].value - ProofOfReserve[1].value
                : null
            }
          />
        </div>
  
        <div>
          <MemoCircleChart
            data={MarketShare}
            title="سهم بازار"
            description="سهم بازار با ضریب 0.35 از تعداد کاربران و 0.65 از حجم دارایی‌ها محاسبه شده است!"
          />
        </div>
      </div>
  
      <div className="grid grid-cols-1 xl:grid-cols-1 gap-4 mt-4 pb-4">
        <div>
          <MemoDoubleLinearChart
            data={DepWitList}
            title="نمودار واریز و برداشت ماهانه"
            unitSuffix="M"
            assetLabel="واریز"
            liabilityLabel="برداشت"
            List={CryptoList}
            CryptoSelected={CryptoSelected1}
            SetCryptoSelected={SetCryptoSelected1}
            ShowList={true}
          />
        </div>
      </div>
  
      <div className="grid grid-cols-1 xl:grid-cols-1 gap-4 mt-0 pb-4">
        <div>
          <MemoSingleLinearChart
            data={DailyTradingList}
            title="حجم معاملات ماهانه"
            seriesLabel="حجم"
            unitSuffix="M"
            List={CryptoList}
            CryptoSelected={CryptoSelected2}
            SetCryptoSelected={SetCryptoSelected2}
            ShowList={true}
          />
        </div>
      </div>
  
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4 pb-4">
        <div>
          <MemoCircleChart
            data={IRRtoUSDT}
            title="نسبت معاملات تومان به تتر"
            unit="USDT"
          />
        </div>
  
        <div>
          <MemoCircleChart data={CryptoShare} title="حجم معاملات" unit="USDT" />
        </div>
  
        <div>
          <MemoCircleChart
            data={USDTBuyerData}
            title="نسبت خریداران تتر"
            unit="USDT"
          />
        </div>
      </div>
    </div>
  );
  
}
