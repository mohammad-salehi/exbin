import React, { useEffect, useState } from 'react'
import { CircleChart } from '../../CircleChart/CircleChart'
import { CryptoVolumeTreemap } from '../../CryptoVolumeTreemap/CryptoVolumeTreemap'
import SingleLinearChart from '../../SingleLinearChart/SingleLinearChart'
import DoubleLinearChart from '../../DoubleLinearChart/DoubleLinearChart'
import { GetRequest } from '../../../../functions/GetRequest'
import { useParams } from "next/navigation";

const ExchangeStats = () => {

    const params = useParams<{ id: string }>();

    const id = 'source1'

    type dailyActiveUsers = {
        label: string;
        x: number
    }

    const [logo, SetLogo] = useState<string>("");
    const [name, SetName] = useState<string>("");
    const [numberOfUsers, SetnumberOfUsers] = useState<number>(0)
    const [WithdrawAvg, SetWithdrawAvg] = useState<number>(0)
    const [totalAssets, SettotalAssets] = useState<number>(0)
    const [totalLiabilities, SettotalLiabilities] = useState<number>(0)
    const [POR, SetPOR] = useState<number>(0)
    const [DailyActiveUsers, SetDailyActiveUsers] = useState<dailyActiveUsers[]>([])
    const [Topcryptocurrencies, SetTopcryptocurrencies] = useState<dailyActiveUsers[]>([])
    // نام و لوگو
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
    // تعداد کاربران
    useEffect(() => {
        GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/analytics/exchange/${id}/number-of-users`)
            .then((response) => {
                SetnumberOfUsers(response.result.numberOfUsers)
            })
            .catch((err) => {
                console.log(err)
            })
    }, [])
    // تعداد کاربران فعال
    useEffect(() => {
        GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/analytics/exchange/${id}/daily-active-users`)
            .then((response) => {
                const getData = []
                for (let i = 0; i < response.result.length; i++) {
                    getData.push({
                        label: response.result[i].loginDate,
                        x: response.result[i].dau
                    })
                }
                getData.sort((a, b) => String(a.label).localeCompare(String(b.label)));
                SetDailyActiveUsers(getData)
            })
            .catch((err) => {
                console.log(err)
            })
    }, [])
    // میانگین زمان تسویه
    useEffect(() => {
        GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/analytics/exchange/${id}/avg-withdrawal-time-24h`)
            .then((response) => {
                SetWithdrawAvg(response.result.avgWithdrawalDurationMs)
            })
            .catch((err) => {
                console.log(err)
            })
    }, [])
    // بدهی و دارایی و اثبات ذخیره
    useEffect(() => {
        GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/analytics/exchange/${id}/latest-assets-liabilities`)
            .then((response) => {
                SettotalAssets(response.result.totalAssetsUsd)
                SettotalLiabilities(response.result.totalLiabilitiesUsd)
                SetPOR((response.result.totalAssetsUsd / response.result.totalLiabilitiesUsd) * 100)
            })
            .catch((err) => {
                console.log(err)
            })
    }, [])
    // دارایی های برتر
    useEffect(() => {
        GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/analytics/exchange/${id}/top-cryptocurrencies`)
            .then((response) => {
                const getData = []
                for (let i = 0; i < response.result.length; i++) {
                    getData.push({
                        label: response.result[i].currencyUnit,
                        x: response.result[i].totalVolumeUsd
                    })
                }
                getData.sort((a, b) => String(a.label).localeCompare(String(b.label)));
                SetTopcryptocurrencies(getData)
            })
            .catch((err) => {
                console.log(err)
            })
    }, [])
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

    return (
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
                        unit="USDT"
                    />
                </div>
                <div className="min-h-full">
                    <CryptoVolumeTreemap data={sampleData} defaultRange="daily" title="حجم دارایی رمزارزها" />
                </div>
            </div>
            <div className="p-0 mt-4">
                <SingleLinearChart
                    data={chartData}
                    title="حجم معاملات ماهانه"
                    seriesLabel="حجم"
                    unitSuffix="M"
                />
            </div>
            <div className="p-0 mt-4">
                <SingleLinearChart
                    data={DailyActiveUsers}
                    title="کاربران فعال ماهانه"
                    seriesLabel="کاربر"
                    unitSuffix="M"
                />
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
    )
}

export default ExchangeStats
