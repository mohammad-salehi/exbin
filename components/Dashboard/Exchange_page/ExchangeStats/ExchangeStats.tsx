import React, { useEffect, useState } from 'react'
import { CircleChart } from '../../CircleChart/CircleChart'
import { CryptoVolumeTreemap } from '../../CryptoVolumeTreemap/CryptoVolumeTreemap'
import SingleLinearChart from '../../SingleLinearChart/SingleLinearChart'
import DoubleLinearChart from '../../DoubleLinearChart/DoubleLinearChart'
import { GetRequest } from '../../../../functions/GetRequest'
import { useParams } from "next/navigation";
import StatsMarquee from "../../../../components/Dashboard/Band/Band";

type ExchangeInfoProps = {
    SetLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const MemoStatsMarquee = React.memo(StatsMarquee);
const MemoCircleChart = React.memo(CircleChart);
const MemoSingleLinearChart = React.memo(SingleLinearChart);
const MemoDoubleLinearChart = React.memo(DoubleLinearChart);
const MemoTreeMap = React.memo(CryptoVolumeTreemap);
const ExchangeStats = ({ SetLoading }: ExchangeInfoProps) => {

    const params = useParams<{ id: string }>();

    const id = 'source1'

    type dailyActiveUsers = {
        label: string;
        x: number
    }
    type CryptoTradingValueUsers = {
        label: string;
        value: number
    }
    type DoubleLinearChart = {
        label: string;
        x: number,
        y: number
    }
    type TopcryptocurrenciesChart = {
        name: string;
        symbol: string,
        value: number
    }

    const [logo, SetLogo] = useState<string>("");
    const [name, SetName] = useState<string>("");

    const [HeaderData, SetHeaderData] = useState<CryptoTradingValueUsers[]>([])
    const [DailyActiveUsers, SetDailyActiveUsers] = useState<dailyActiveUsers[]>([])
    const [Topcryptocurrencies, SetTopcryptocurrencies] = useState<TopcryptocurrenciesChart[]>([])
    const [TopTradedcryptocurrencies, SetTopTradedcryptocurrencies] = useState<CryptoTradingValueUsers[]>([])
    const [PORHistory, SetPORHistory] = useState<DoubleLinearChart[]>([])
    const [DepWithHistory, SetDepWithHistory] = useState<DoubleLinearChart[]>([])
    const [IRRDepWithHistory, SetIRRDepWithHistory] = useState<DoubleLinearChart[]>([])
    const [TradingVolume, SetTradingVolume] = useState<dailyActiveUsers[]>([])
    const [CryptoList, SetCryptoList] = useState([])
    const [CryptoSelected1, SetCryptoSelected1] = useState('')
    const [CryptoSelected2, SetCryptoSelected2] = useState('')

    const [DailyPOR, SetDailyPOR] = useState<CryptoTradingValueUsers[]>([])
    const [DailyWithDep, SetDailyWithDep] = useState<CryptoTradingValueUsers[]>([])
    const [DailyIRRWithDep, SetDailyIRRWithDep] = useState<CryptoTradingValueUsers[]>([])

    const [C1, SetC1] = useState<boolean>(false);
    const [C2, SetC2] = useState<boolean>(false);
    const [C3, SetC3] = useState<boolean>(false);
    const [C4, SetC4] = useState<boolean>(false);
    const [C5, SetC5] = useState<boolean>(false);
    const [C6, SetC6] = useState<boolean>(false);
    const [C7, SetC7] = useState<boolean>(false);
    const [C8, SetC8] = useState<boolean>(false);
    const [C9, SetC9] = useState<boolean>(false);
    const [C10, SetC10] = useState<boolean>(false);
    const [C11, SetC11] = useState<boolean>(false);
    const [C12, SetC12] = useState<boolean>(false);

    const [IsLoading, SetIsLoading] = useState<boolean>(true);

    const formatJalaliDateTime = (value?: string | number) => {
        if (value === null || value === undefined || value === '') return '';
        let d: Date | null = null;

        // ✅ اگر unix بود: sec یا ms
        if (typeof value === 'number') {
            const ms = value < 10_000_000_000 ? value * 1000 : value; // sec -> ms
            d = new Date(ms);
        } else {
            const trimmed = String(value).trim();
            const asNum = Number(trimmed);
            if (!Number.isNaN(asNum) && trimmed.length >= 10) {
                const ms = asNum < 10_000_000_000 ? asNum * 1000 : asNum;
                d = new Date(ms);
            } else {
                const parsed = new Date(trimmed);
                if (!Number.isNaN(parsed.getTime())) d = parsed;
            }
        }

        if (!d || Number.isNaN(d.getTime())) return String(value);

        const fa = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(d);

        return `${fa}`;
    };

    useEffect(() => {
        if (C1 && C2 && C3 && C4 && C5 && C6 && C7 && C8 && C9 && C10 && C11 && C12) {
            SetIsLoading(false);
        }
    }, [C1, C2, C3, C4, C5, C6, C7, C8, C9, C10, C11, C12]);
    useEffect(() => {
        SetLoading(IsLoading)
    }, [IsLoading])
    // نام و لوگو
    useEffect(() => {
        GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/exchanges/${params.id}`)
            .then((response) => {
                SetLogo(response.result.logo);
                SetName(response.result.name);
                SetC1(true)
            })
            .catch((err) => {
                console.log(err)
                SetC1(true)
            })
    }, [])
    // تعداد کاربران
    useEffect(() => {
        GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/analytics/exchange/${id}/number-of-users`)
            .then((response) => {
                SetHeaderData((prev) => {
                    const item: CryptoTradingValueUsers = {
                        label: "تعداد کاربران",
                        value: Number(response.result.numberOfUsers ?? 0),
                    };

                    const next = prev.filter((x) => x.label !== item.label);
                    return [...next, item];
                });
                SetC2(true)
            })
            .catch((err) => {
                console.log(err)
                SetC2(true)
            })
    }, [])
    // تعداد کاربران فعال ماهانه
    useEffect(() => {
        GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/analytics/exchange/${id}/daily-active-users`)
            .then((response) => {
                const getData = []
                for (let i = 0; i < response.result.length; i++) {
                    getData.push({
                        label: formatJalaliDateTime(response.result[i].loginDate),
                        x: response.result[i].dau
                    })
                }
                getData.sort((a, b) => String(a.label).localeCompare(String(b.label)));
                SetDailyActiveUsers(getData)
                SetC3(true)
            })
            .catch((err) => {
                console.log(err)
                SetC3(true)
            })
    }, [])
    // میانگین زمان تسویه
    useEffect(() => {
        GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/analytics/exchange/${id}/avg-withdrawal-time-24h`)
            .then((response) => {
                SetHeaderData((prev) => {
                    const item: CryptoTradingValueUsers = {
                        label: "میانگین زمان تسویه کاربران(میلی‌ثانیه)",
                        value: Number(response.result.avgWithdrawalDurationMs ?? 0),
                    };

                    const next = prev.filter((x) => x.label !== item.label);
                    return [...next, item];
                });
                SetC4(true)
            })
            .catch((err) => {
                console.log(err)
                SetC4(true)
            })
    }, [])
    // بدهی و دارایی و اثبات ذخیره
    useEffect(() => {
        GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/analytics/exchange/${id}/latest-assets-liabilities`)
            .then((response) => {
                SetHeaderData((prev) => {
                    const item: CryptoTradingValueUsers = {
                        label: "مجموع دارایی(USDT)",
                        value: Number(response.result.totalAssetsUsd ?? 0),
                    };

                    const next = prev.filter((x) => x.label !== item.label);
                    return [...next, item];
                });
                SetHeaderData((prev) => {
                    const item: CryptoTradingValueUsers = {
                        label: "مجموع بدهی(USDT)",
                        value: Number(response.result.totalLiabilitiesUsd ?? 0),
                    };

                    const next = prev.filter((x) => x.label !== item.label);
                    return [...next, item];
                });
                const assets = Number(response?.result?.totalAssetsUsd ?? 0);
                const liabilities = Number(response?.result?.totalLiabilitiesUsd ?? 0);

                const ratioPct = liabilities > 0 ? (assets / liabilities) * 100 : 0;

                SetHeaderData((prev) => {
                    const item: CryptoTradingValueUsers = {
                        label: "نسبت دارایی به بدهی(درصد)",
                        value: Number(ratioPct.toFixed(2)),
                    };

                    const next = prev.filter((x) => x.label !== item.label);
                    return [...next, item];
                });
                SetC5(true)
            })
            .catch((err) => {
                console.log(err)
                SetC5(true)
            })
    }, [])
    // بیشترین رمزارز های معامله شده
    useEffect(() => {
        GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/analytics/exchange/${id}/top-cryptocurrencies`)
            .then((response) => {
                const getData = []
                for (let i = 0; i < response.result.length; i++) {
                    getData.push({
                        label: response.result[i].currencyUnit,
                        value: response.result[i].totalVolumeUsd
                    })
                }
                getData.sort((a, b) => String(a.label).localeCompare(String(b.label)));
                SetTopTradedcryptocurrencies(getData)
                SetC6(true)
            })
            .catch((err) => {
                console.log(err)
                SetC6(true)
            })
    }, [])
    // تاریخچه POR
    useEffect(() => {
        GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/analytics/exchange/${id}/assets-liabilities-historical`)
            .then((response) => {
                const getData = []
                for (let i = 0; i < response.result.length; i++) {
                    getData.push({
                        label: formatJalaliDateTime(response.result[i].date),
                        x: response.result[i].totalAssetsUsd,
                        y: response.result[i].totalLiabilitiesUsd
                    })
                }
                getData.sort((a, b) => String(a.label).localeCompare(String(b.label)));
                SetDailyPOR([
                    {
                        label:'دارایی',
                        value:getData[getData.length-1].x
                    },
                    {
                        label:'بدهی',
                        value:getData[getData.length-1].y
                    }
                ])
                SetPORHistory(getData)
                SetC7(true)
            })
            .catch((err) => {
                console.log(err)
                SetC7(true)
            })
    }, [])
    // حجم دارایی رمزارزها
    useEffect(() => {
        GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/analytics/exchange/${id}/portfolio`)
            .then((response) => {
                const getData = []
                for (let i = 0; i < response.result.length; i++) {
                    getData.push({
                        name: response.result[i].cryptocurrency,
                        symbol: response.result[i].cryptocurrency,
                        value: response.result[i].totalUsdValue
                    })
                }
                SetTopcryptocurrencies(getData)
                SetC8(true)
            })
            .catch((err) => {
                console.log(err)
                SetC8(true)
            })
    }, [])
    //لیست کوین ها
    useEffect(() => {
        GetRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/valid-currencies`)
            .then((response) => {
                SetCryptoList(response.result)
                SetCryptoSelected1(response.result[0].cryptocurrency)
                SetCryptoSelected2(response.result[0].cryptocurrency)
                SetC9(true)
            })
            .catch((err) => {
                console.log(err)
                SetC9(true)
            })
    }, []);
    // لیست معاملات رمزارزها
    useEffect(() => {
        if (CryptoSelected1 !== '') {
            GetRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/exchange/${id}/trading-volume/${CryptoSelected1}`)
                .then((response) => {
                    const getData = []
                    for (let i = 0; i < response.result.length; i++) {
                        getData.push({
                            label: formatJalaliDateTime(response.result[i].date),
                            x: response.result[i].volume
                        })
                    }
                    getData.sort((a, b) => String(a.label).localeCompare(String(b.label)));
                    SetTradingVolume(getData)
                    SetC10(true)
                })
                .catch((err) => {
                    console.log(err)
                    SetC10(true)
                })
        }
    }, [CryptoSelected1]);
    // تاریخچه واریز و برداشت رمزارزی
    useEffect(() => {
        if (CryptoSelected2 !== '') {
            GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/analytics/exchange/${id}/deposits-withdrawals/${CryptoSelected2}`)
                .then((response) => {
                    const getData = []
                    for (let i = 0; i < response.result.length; i++) {
                        getData.push({
                            label: formatJalaliDateTime(response.result[i].date),
                            x: response.result[i].inflow,
                            y: response.result[i].outflow
                        })
                    }
                    getData.sort((a, b) => String(a.label).localeCompare(String(b.label)));
                    SetDailyWithDep(
                        [
                            {
                                label:'واریز',
                                value:getData[getData.length - 1].x
                            },
                            {
                                label:'برداشت',
                                value:getData[getData.length - 1].y
                            }
                        ]
                    )
                    SetDepWithHistory(getData)
                    SetC11(true)
                })
                .catch((err) => {
                    console.log(err)
                    SetC11(true)
                })
        }

    }, [CryptoSelected2])
    // تاریخچه واریز و برداشت ریالی
    useEffect(() => {
        GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/analytics/exchange/${id}/deposits-withdrawals/IRR`)
            .then((response) => {
                const getData = []
                for (let i = 0; i < response.result.length; i++) {
                    getData.push({
                        label: formatJalaliDateTime(response.result[i].date),
                        x: response.result[i].inflow,
                        y: response.result[i].outflow
                    })
                }
                getData.sort((a, b) => String(a.label).localeCompare(String(b.label)));
                SetIRRDepWithHistory(getData)
                SetDailyIRRWithDep(
                    [
                        {
                            label:'واریز',
                            value:getData[getData.length - 1].x
                        },
                        {
                            label:'برداشت',
                            value:getData[getData.length - 1].y
                        }
                    ]
                )
                SetC12(true)
            })
            .catch((err) => {
                console.log(err)
                SetC12(true)
            })
    }, [])

    return (
        <div>
            {logo !== null && logo !== "" ? (
                <img alt="image" className="w-8 inline-block" src={logo} />
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
            <h3 className="inline-block text-2xl text-bold mr-2 text-titleText dark:text-titleText-dark mb-4">
                {name}
            </h3>
            <MemoStatsMarquee data={HeaderData} />
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
                <div className="min-h-full xl:col-span-1">
                    <MemoCircleChart
                        data={TopTradedcryptocurrencies}
                        title="حجم معاملات رمزارزها"
                        unit="USDT"
                    />
                </div>

                <div className="min-h-full xl:col-span-2">
                    <MemoTreeMap data={Topcryptocurrencies} title="حجم دارایی رمزارزها" />
                </div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
                <div className="min-h-full xl:col-span-2">
                    <MemoDoubleLinearChart
                        data={PORHistory}
                        title="تاریخچه اثبات ذخیره دارایی‌ها"
                        unitSuffix="M"
                        assetLabel='دارایی'
                        liabilityLabel='بدهی'
                        useLastItemForNet
                    />
                </div>

                <div className="min-h-full xl:col-span-1">
                    <MemoCircleChart
                        data={DailyPOR}
                        title="نسبت دارایی به بدهی"
                        unit="USDT"
                        description="برایند دارایی‌ها و بدهی‌ها محاسبه شده است!"
                        value={
                            DailyPOR.length !== 0
                            ? DailyPOR[0].value - DailyPOR[1].value
                            : null
                        }
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
                <div className="min-h-full xl:col-span-1">
                    <MemoCircleChart
                        data={DailyWithDep}
                        title="واریز و برداشت‌های رمزارزی روزانه"
                        unit="USDT"
                        description="برایند واریز و برداشت‌ها محاسبه شده است!"
                        value={
                            DailyWithDep.length !== 0
                            ? DailyWithDep[0].value - DailyWithDep[1].value
                            : null
                        }
                    />
                </div>

                <div className="min-h-full xl:col-span-2">
                    <MemoDoubleLinearChart
                        data={DepWithHistory}
                        title="واریز و برداشت های رمزارزی سکو"
                        unitSuffix="M"
                        assetLabel='واریز'
                        liabilityLabel='برداشت'
                        useLastItemForNet
                        List={CryptoList}
                        CryptoSelected={CryptoSelected2}
                        SetCryptoSelected={SetCryptoSelected2}
                        ShowList={true}
                        headerLink={{ href: `/panel/crypto-transfers?exchange=${name}`, title: "جزئیات واریز و برداشت های رمزارزی سکو" }}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
                <div className="min-h-full xl:col-span-2">
                    <MemoDoubleLinearChart
                        data={IRRDepWithHistory}
                        title="واریز و برداشت های ریالی سکو"
                        unitSuffix="M"
                        assetLabel='واریز'
                        liabilityLabel='برداشت'
                        useLastItemForNet
                        headerLink={{ href: `/panel/rial-transfers?exchange=${name}`, title: "جزئیات واریز و برداشت های ریالی سکو" }}
                    />
                </div>

                <div className="min-h-full xl:col-span-1">
                    <MemoCircleChart
                        data={DailyIRRWithDep}
                        title="واریز و برداشت‌های ریالی روزانه"
                        unit="USDT"
                        description="برایند واریز و برداشت‌ها محاسبه شده است!"
                        value={
                            DailyIRRWithDep.length !== 0
                            ? DailyIRRWithDep[0].value - DailyIRRWithDep[1].value
                            : null
                        }
                    />
                </div>
            </div>
            <div className="p-0 mt-4">
                <MemoSingleLinearChart
                    data={TradingVolume}
                    title="حجم معاملات ماهانه"
                    seriesLabel="حجم"
                    unitSuffix="M"
                    List={CryptoList}
                    CryptoSelected={CryptoSelected1}
                    SetCryptoSelected={SetCryptoSelected1}
                    ShowList={true}
                    topLeftLink={{ label: 'جزئیات معاملات کاربران', href: `/panel/crypto-transactions?exchange=${name}` }}
                />
            </div>
            <div className="p-0 mt-4">
                <MemoSingleLinearChart
                    data={DailyActiveUsers}
                    title="کاربران فعال ماهانه"
                    seriesLabel="کاربر"
                    unitSuffix="M"
                    topLeftLink={{ href: `/panel/exchange-users?exchange=${name}`, label: "جزئیات دارایی کاربران" }}
                />
            </div>

        </div>
    )
}

export default ExchangeStats
