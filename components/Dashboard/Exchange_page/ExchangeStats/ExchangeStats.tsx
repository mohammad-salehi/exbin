import { CircleChart } from '../../CircleChart/CircleChart'
import { CryptoVolumeTreemap } from '../../CryptoVolumeTreemap/CryptoVolumeTreemap'
import SingleLinearChart from '../../SingleLinearChart/SingleLinearChart'
import DoubleLinearChart from '../../DoubleLinearChart/DoubleLinearChart'
import { GetRequest } from '../../../../functions/GetRequest'
import { useParams } from "next/navigation";
import StatsMarquee from "../../../../components/Dashboard/Band/Band";
import React, { useEffect, useState, useMemo } from 'react';


import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";



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

    const id = params.id

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
        if (!id) return;

        GetRequest(
            `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/exchange/${id}/daily-active-users`
        )
            .then((response) => {
                const getData: dailyActiveUsers[] = [];

                for (let i = 0; i < response.result.length; i++) {
                    getData.push({
                        label: formatJalaliDateTime(response.result[i].loginDate),
                        x: response.result[i].dau,
                    });
                }

                // اگر label تاریخِ فرمت‌شده‌ست، مرتب‌سازی متنی همیشه دقیق نیست.
                // ولی برای اینکه مثل خودت بمونه:
                getData.sort((a, b) =>
                    String(a.label).localeCompare(String(b.label))
                );

                SetDailyActiveUsers(getData);

                SetHeaderData((prev) => {
                    const lastX = getData.length ? Number(getData[getData.length - 1].x ?? 0) : 0;
                    const item: CryptoTradingValueUsers = {
                        label: "کاربران فعال روزانه",
                        value: lastX,
                    };
                    const next = prev.filter((x) => x.label !== item.label);
                    return [...next, item];
                });

                SetHeaderData((prev) => {
                    const sumX = getData.reduce((acc, cur) => acc + Number(cur.x ?? 0), 0);

                    const item = {
                        label: "کاربران فعال ماهانه",
                        value: sumX,
                    };

                    const next = prev.filter((x) => x.label !== item.label);
                    return [...next, item];
                });

                SetC3(true);
            })
            .catch((err) => {
                console.log(err);
                SetC3(true);
            });
    }, []);

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
                SetHeaderData((prev) => {
                    const item: CryptoTradingValueUsers = {
                        label: "میانگین زمان تسویه کاربران(میلی‌ثانیه)",
                        value: Number(0),
                    };

                    const next = prev.filter((x) => x.label !== item.label);
                    return [...next, item];
                });
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
                        label: 'دارایی',
                        value: getData[getData.length - 1].x
                    },
                    {
                        label: 'بدهی',
                        value: getData[getData.length - 1].y
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
                                label: 'واریز',
                                value: getData[getData.length - 1].x
                            },
                            {
                                label: 'برداشت',
                                value: getData[getData.length - 1].y
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
                            label: 'واریز',
                            value: getData[getData.length - 1].x
                        },
                        {
                            label: 'برداشت',
                            value: getData[getData.length - 1].y
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












    // ---------- helpers ----------
    const urlToDataUrl = async (url: string): Promise<string | null> => {
        try {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.decoding = "async";

            const dataUrl = await new Promise<string>((resolve, reject) => {
                img.onload = () => {
                    try {
                        const canvas = document.createElement("canvas");
                        canvas.width = img.naturalWidth || img.width;
                        canvas.height = img.naturalHeight || img.height;

                        const ctx = canvas.getContext("2d");
                        if (!ctx) return reject(new Error("Canvas context not available"));

                        ctx.drawImage(img, 0, 0);
                        // Force PNG (jsPDF safe)
                        resolve(canvas.toDataURL("image/png", 1.0));
                    } catch (e) {
                        reject(e);
                    }
                };
                img.onerror = reject;
                img.src = url;
            });

            return dataUrl;
        } catch {
            return null;
        }
    };
    const handleDownloadPDF = async () => {
        // ---------- helpers ----------
        const toEnNumber = (v: any) => {
            if (v === null || v === undefined || v === "") return "0";
            const s = String(v);
            const map: Record<string, string> = {
              "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
              "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
              "٫": ".", "٬": ",",
            };
            return s.replace(/[۰-۹٫٬]/g, (ch) => map[ch] ?? ch);
          };
        
          const toEnText = (v: any) => {
            if (v === null || v === undefined) return "";
            return toEnNumber(String(v));
          };
        
          const labelToEnglish = (label: string) => {
            const s = (label || "").trim();
            const dict: Record<string, string> = {
              "تعداد کاربران": "Number of Users",
              "کاربران فعال روزانه": "Daily Active Users",
              "کاربران فعال ماهانه": "Monthly Active Users (Sum)",
              "میانگین زمان تسویه کاربران(میلی‌ثانیه)": "Avg Settlement Time (ms)",
              "مجموع دارایی(USDT)": "Total Assets (USDT)",
              "مجموع بدهی(USDT)": "Total Liabilities (USDT)",
              "دارایی": "Assets",
              "بدهی": "Liabilities",
              "واریز": "Deposits",
              "برداشت": "Withdrawals",
            };
            return dict[s] ?? toEnText(s);
          };
        
          const addSectionTitle = (doc: any, title: string, y: number) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text(toEnText(title), 14, y);
            doc.setFont("helvetica", "normal");
          };
        
          // ✅ local url -> dataURL
          const urlToDataUrl = async (url: string): Promise<string | null> => {
            try {
              const res = await fetch(url);
              const blob = await res.blob();
              return await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result));
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(blob);
              });
            } catch {
              return null;
            }
          };
        
          // ✅ read image size from dataURL (for aspect ratio)
          const getImageSizeFromDataUrl = (dataUrl: string) =>
            new Promise<{ w: number; h: number }>((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve({ w: img.naturalWidth || img.width, h: img.naturalHeight || img.height });
              img.onerror = reject;
              img.src = dataUrl;
            });
        
          const getImageFormatFromDataUrl = (dataUrl: string) => {
            const m = /^data:image\/(png|jpeg|jpg|webp);/i.exec(dataUrl);
            const t = (m?.[1] || "png").toLowerCase();
            if (t === "jpg") return "JPEG";
            if (t === "jpeg") return "JPEG";
            if (t === "webp") return "WEBP";
            return "PNG";
          };
        
          // ---------- PDF init ----------
          const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
          const pageW = doc.internal.pageSize.getWidth();
          const pageH = doc.internal.pageSize.getHeight();
          const marginX = 14;
        
          // ---------- Header ----------
          const title = "Exchange Analytics Report";
          const subtitle = `Exchange Name: ${toEnText(name || "Unknown Exchange")}`;
        
          // ✅ use local logo from public/images/shaparak.webp
          const logoDataUrl = await urlToDataUrl("/images/shaparak.webp");
        
          doc.setFont("helvetica", "bold");
          doc.setFontSize(16);
          doc.text(toEnText(title), marginX, 16);
        
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.text(toEnText(subtitle), marginX, 22);
        
          doc.setFontSize(9);
          doc.text(
            `Report Date: ${new Intl.DateTimeFormat("en-CA", { dateStyle: "medium" }).format(new Date())}`,
            marginX,
            27
          );
        
          // ✅ logo (top-right) with auto width (keep aspect ratio)
          if (logoDataUrl) {
            try {
              const { w, h } = await getImageSizeFromDataUrl(logoDataUrl);
              const ratio = w / h;
        
              const logoH = 18;              // فقط ارتفاع ثابت
              const logoW = logoH * ratio;   // عرض خودکار
              const x = pageW - marginX - logoW;
              const y = 10;
        
              const fmt = getImageFormatFromDataUrl(logoDataUrl); // WEBP/PNG/JPEG
              doc.addImage(logoDataUrl, fmt as any, x, y, logoW, logoH);
            } catch {
              // ignore image errors
            }
          }
        
          // ✅ divider line under header
          const headerBottomY = 30;
          doc.setDrawColor(200);
          doc.setLineWidth(0.6);
          doc.line(marginX, headerBottomY + 4, pageW - marginX, headerBottomY + 4);

        let cursorY = headerBottomY + 12;

        // ---------- 1) Overview (HeaderData) ----------
        addSectionTitle(doc, "Overview Metrics", cursorY);
        cursorY += 3;

        autoTable(doc, {
            startY: cursorY,
            head: [["Metric", "Value"]],
            body: (HeaderData || []).map((x: any) => [
                toEnText(labelToEnglish(String(x.label ?? ""))),
                toEnText(toEnNumber(x.value)),
            ]),
            styles: { font: "helvetica", fontSize: 9 },
            headStyles: { fillColor: [240, 240, 240], textColor: 20 },
            theme: "grid",
            margin: { left: marginX, right: marginX },
            pageBreak: "auto",
        });

        // @ts-ignore
        cursorY = (doc as any).lastAutoTable.finalY + 8;

        // ---------- 2) Top traded cryptocurrencies ----------
        addSectionTitle(doc, "Top Traded Cryptocurrencies (USDT)", cursorY);
        cursorY += 3;

        autoTable(doc, {
            startY: cursorY,
            head: [["Currency", "Total Volume (USDT)"]],
            body: (TopTradedcryptocurrencies || []).map((x: any) => [
                toEnText(x.label),
                toEnText(toEnNumber(x.value)),
            ]),
            styles: { font: "helvetica", fontSize: 9 },
            headStyles: { fillColor: [240, 240, 240], textColor: 20 },
            theme: "grid",
            margin: { left: marginX, right: marginX },
            pageBreak: "auto",
        });

        // @ts-ignore
        cursorY = (doc as any).lastAutoTable.finalY + 8;

        // ---------- 3) Portfolio ----------
        addSectionTitle(doc, "Portfolio - Top Assets (USD Value)", cursorY);
        cursorY += 3;

        autoTable(doc, {
            startY: cursorY,
            head: [["Asset", "Symbol", "Total USD Value"]],
            body: (Topcryptocurrencies || []).map((x: any) => [
                toEnText(x.name),
                toEnText(x.symbol),
                toEnText(toEnNumber(x.value)),
            ]),
            styles: { font: "helvetica", fontSize: 9 },
            headStyles: { fillColor: [240, 240, 240], textColor: 20 },
            theme: "grid",
            margin: { left: marginX, right: marginX },
            pageBreak: "auto",
        });

        // @ts-ignore
        cursorY = (doc as any).lastAutoTable.finalY + 8;

        // ---------- 4) Assets vs Liabilities (Historical) ----------
        addSectionTitle(doc, "Assets vs Liabilities (Historical)", cursorY);
        cursorY += 3;

        autoTable(doc, {
            startY: cursorY,
            head: [["Date", "Assets (USD)", "Liabilities (USD)"]],
            body: (PORHistory || []).map((x: any) => [
                toEnText(x.label),
                toEnText(toEnNumber(x.x)),
                toEnText(toEnNumber(x.y)),
            ]),
            styles: { font: "helvetica", fontSize: 9 },
            headStyles: { fillColor: [240, 240, 240], textColor: 20 },
            theme: "grid",
            margin: { left: marginX, right: marginX },
            pageBreak: "auto",
        });

        // @ts-ignore
        cursorY = (doc as any).lastAutoTable.finalY + 8;

        // ---------- 5) Crypto deposits/withdrawals ----------
        addSectionTitle(doc, `Crypto Deposits & Withdrawals - ${toEnText(CryptoSelected2 || "N/A")}`, cursorY);
        cursorY += 3;

        autoTable(doc, {
            startY: cursorY,
            head: [["Date", "Deposits", "Withdrawals"]],
            body: (DepWithHistory || []).map((x: any) => [
                toEnText(x.label),
                toEnText(toEnNumber(x.x)),
                toEnText(toEnNumber(x.y)),
            ]),
            styles: { font: "helvetica", fontSize: 9 },
            headStyles: { fillColor: [240, 240, 240], textColor: 20 },
            theme: "grid",
            margin: { left: marginX, right: marginX },
            pageBreak: "auto",
        });

        // @ts-ignore
        cursorY = (doc as any).lastAutoTable.finalY + 8;

        // ---------- 6) IRR deposits/withdrawals ----------
        addSectionTitle(doc, "IRR Deposits & Withdrawals (Historical)", cursorY);
        cursorY += 3;

        autoTable(doc, {
            startY: cursorY,
            head: [["Date", "Deposits (IRR)", "Withdrawals (IRR)"]],
            body: (IRRDepWithHistory || []).map((x: any) => [
                toEnText(x.label),
                toEnText(toEnNumber(x.x)),
                toEnText(toEnNumber(x.y)),
            ]),
            styles: { font: "helvetica", fontSize: 9 },
            headStyles: { fillColor: [240, 240, 240], textColor: 20 },
            theme: "grid",
            margin: { left: marginX, right: marginX },
            pageBreak: "auto",
        });

        // @ts-ignore
        cursorY = (doc as any).lastAutoTable.finalY + 8;

        // ---------- 7) Trading volume ----------
        addSectionTitle(doc, `Trading Volume (Monthly) - ${toEnText(CryptoSelected1 || "N/A")}`, cursorY);
        cursorY += 3;

        autoTable(doc, {
            startY: cursorY,
            head: [["Date", "Volume"]],
            body: (TradingVolume || []).map((x: any) => [
                toEnText(x.label),
                toEnText(toEnNumber(x.x)),
            ]),
            styles: { font: "helvetica", fontSize: 9 },
            headStyles: { fillColor: [240, 240, 240], textColor: 20 },
            theme: "grid",
            margin: { left: marginX, right: marginX },
            pageBreak: "auto",
        });

        // @ts-ignore
        cursorY = (doc as any).lastAutoTable.finalY + 8;

        // ---------- 8) Daily Active Users ----------
        addSectionTitle(doc, "Daily Active Users (Time Series)", cursorY);
        cursorY += 3;

        autoTable(doc, {
            startY: cursorY,
            head: [["Date", "DAU"]],
            body: (DailyActiveUsers || []).map((x: any) => [
                toEnText(x.label),
                toEnText(toEnNumber(x.x)),
            ]),
            styles: { font: "helvetica", fontSize: 9 },
            headStyles: { fillColor: [240, 240, 240], textColor: 20 },
            theme: "grid",
            margin: { left: marginX, right: marginX },
            pageBreak: "auto",
        });

        // ---------- Footer + page numbers ----------
        const pageCount = doc.getNumberOfPages();

        for (let p = 1; p <= pageCount; p++) {
            doc.setPage(p);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);

            doc.text(`Page ${p} of ${pageCount}`, marginX, pageH - 10);

            if (p === pageCount) {
                doc.text(
                    "This report was automatically generated by the CED portal system.",
                    marginX,
                    pageH - 16
                );
            }
        }

        const safeName = (name || "exchange").toString().replace(/\s+/g, "_");
        doc.save(`CED_Report_${toEnText(safeName)}_${toEnText(id || "")}.pdf`);
    };

    return (
        <div>
            <div className="flex items-center justify-between gap-3 mb-4">


                {/* RIGHT: Logo + Name */}
                <div className="flex items-center gap-2 min-w-0">
                    {logo ? (
                        <img alt="logo" className="w-8 h-8 object-contain" src={logo} />
                    ) : (
                        <div
                            className="text-titleText dark:text-titleText-dark "
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

                    <h3 className="text-2xl font-bold text-titleText dark:text-titleText-dark truncate mb-0">
                        {name}
                    </h3>
                </div>

                {/* LEFT: Download button */}
                <div className="shrink-0">
                    <button
                        onClick={handleDownloadPDF}
                        type="button"
                        className="
    inline-flex items-center gap-2
    rounded-xl px-4 py-2.5
    text-sm font-semibold
    text-white
    bg-gradient-to-r from-sky-600 to-indigo-600
    shadow-sm shadow-indigo-600/20
    hover:from-sky-500 hover:to-indigo-500 hover:shadow-md hover:shadow-indigo-600/30
    active:scale-[0.98]
    transition-all duration-200
    focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
    focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0B1220]
    disabled:opacity-60 disabled:cursor-not-allowed
  "
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="opacity-95"
                        >
                            <path
                                d="M12 3v10m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>

                        <span>دریافت  PDF</span>
                    </button>

                </div>
            </div>

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
                        title="تاریخچه نسبت دارایی به بدهی"
                        unitSuffix="M"
                        assetLabel='دارایی'
                        liabilityLabel='بدهی'
                        ShowSummary={false}
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
                        ShowSummary={false}
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
                        ShowSummary={false}
                    />
                </div>

                <div className="min-h-full xl:col-span-1">
                    <MemoCircleChart
                        data={DailyIRRWithDep}
                        title="واریز و برداشت‌های ریالی روزانه"
                        unit="IRR"
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
                    ShowSummary={false}
                />
            </div>

        </div>
    )
}

export default ExchangeStats
