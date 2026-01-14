import { CircleChart } from "../../CircleChart/CircleChart";
import { CryptoVolumeTreemap } from "../../CryptoVolumeTreemap/CryptoVolumeTreemap";
import SingleLinearChart from "../../SingleLinearChart/SingleLinearChart";
import DoubleLinearChart from "../../DoubleLinearChart/DoubleLinearChart";
import { GetRequest } from "../../../../functions/GetRequest";
import { useParams } from "next/navigation";
import StatsMarquee from "../../../../components/Dashboard/Band/Band";
import React, { useEffect, useMemo, useState } from "react";
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

const cx = (...c: Array<string | false | undefined | null>) => c.filter(Boolean).join(" ");

const panelBase =
  "w-full rounded-2xl bg-white dark:bg-bgColor-dark shadow-lg ring-1 ring-black/5 dark:ring-white/5";

const subtleText = "text-sm text-titleText/70 dark:text-titleText-dark/70";

const ExchangeStats = ({ SetLoading }: ExchangeInfoProps) => {
  const params = useParams<{ id: string }>();
  const id = params.id;

  type DailyActiveUsers = { label: string; x: number };
  type CryptoTradingValueUsers = { label: string; value: number };
  type DoubleLinearPoint = { label: string; x: number; y: number };
  type TopCryptocurrenciesChart = { name: string; symbol: string; value: number };

  const [logo, SetLogo] = useState<string>("");
  const [name, SetName] = useState<string>("");

  const [HeaderData, SetHeaderData] = useState<CryptoTradingValueUsers[]>([]);
  const [DailyActiveUsers, SetDailyActiveUsers] = useState<DailyActiveUsers[]>([]);
  const [Topcryptocurrencies, SetTopcryptocurrencies] = useState<TopCryptocurrenciesChart[]>([]);
  const [TopTradedcryptocurrencies, SetTopTradedcryptocurrencies] = useState<CryptoTradingValueUsers[]>([]);
  const [PORHistory, SetPORHistory] = useState<DoubleLinearPoint[]>([]);
  const [DepWithHistory, SetDepWithHistory] = useState<DoubleLinearPoint[]>([]);
  const [IRRDepWithHistory, SetIRRDepWithHistory] = useState<DoubleLinearPoint[]>([]);
  const [TradingVolume, SetTradingVolume] = useState<DailyActiveUsers[]>([]);
  const [CryptoList, SetCryptoList] = useState<any[]>([]);
  const [CryptoSelected1, SetCryptoSelected1] = useState("");
  const [CryptoSelected2, SetCryptoSelected2] = useState("");

  const [DailyPOR, SetDailyPOR] = useState<CryptoTradingValueUsers[]>([]);
  const [DailyWithDep, SetDailyWithDep] = useState<CryptoTradingValueUsers[]>([]);
  const [DailyIRRWithDep, SetDailyIRRWithDep] = useState<CryptoTradingValueUsers[]>([]);

  const [C1, SetC1] = useState(false);
  const [C2, SetC2] = useState(false);
  const [C3, SetC3] = useState(false);
  const [C4, SetC4] = useState(false);
  const [C5, SetC5] = useState(false);
  const [C6, SetC6] = useState(false);
  const [C7, SetC7] = useState(false);
  const [C8, SetC8] = useState(false);
  const [C9, SetC9] = useState(false);
  const [C10, SetC10] = useState(false);
  const [C11, SetC11] = useState(false);
  const [C12, SetC12] = useState(false);

  const [IsLoading, SetIsLoading] = useState(true);

  // ✅ NEW: download loading state (no style changes)
  const [IsDownloading, SetIsDownloading] = useState(false);

  const formatJalaliDateTime = (value?: string | number) => {
    if (value === null || value === undefined || value === "") return "";
    let d: Date | null = null;

    if (typeof value === "number") {
      const ms = value < 10_000_000_000 ? value * 1000 : value;
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

    const fa = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);

    return `${fa}`;
  };

  useEffect(() => {
    if (C1 && C2 && C3 && C4 && C5 && C6 && C7 && C8 && C9 && C10 && C11 && C12) {
      SetIsLoading(false);
    }
  }, [C1, C2, C3, C4, C5, C6, C7, C8, C9, C10, C11, C12]);

  useEffect(() => {
    SetLoading(IsLoading);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [IsLoading]);

  // نام و لوگو
  useEffect(() => {
    GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/exchanges/${params.id}`)
      .then((response) => {
        SetLogo(response.result.logo);
        SetName(response.result.name);
        SetC1(true);
      })
      .catch((err) => {
        console.log(err);
        SetC1(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        SetC2(true);
      })
      .catch((err) => {
        console.log(err);
        SetC2(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // تعداد کاربران فعال روزانه + ماهانه
  useEffect(() => {
    if (!id) return;

    GetRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/exchange/${id}/daily-active-users`)
      .then((response) => {
        const getData: DailyActiveUsers[] = [];
        for (let i = 0; i < response.result.length; i++) {
          getData.push({
            label: formatJalaliDateTime(response.result[i].loginDate),
            x: response.result[i].dau,
          });
        }

        getData.sort((a, b) => String(a.label).localeCompare(String(b.label)));
        SetDailyActiveUsers(getData);

        SetC3(true);
      })
      .catch((err) => {
        console.log(err);
        SetC3(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        SetC4(true);
      })
      .catch((err) => {
        console.log(err);
        SetC4(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // بدهی و دارایی
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

        SetC5(true);
      })
      .catch((err) => {
        console.log(err);
        SetC5(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // بیشترین رمزارزهای معامله شده
  useEffect(() => {
    GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/analytics/exchange/${id}/top-cryptocurrencies`)
      .then((response) => {
        const getData: CryptoTradingValueUsers[] = [];
        for (let i = 0; i < response.result.length; i++) {
          getData.push({
            label: response.result[i].currencyUnit,
            value: response.result[i].totalVolumeUsd,
          });
        }
        getData.sort((a, b) => String(a.label).localeCompare(String(b.label)));
        SetTopTradedcryptocurrencies(getData);
        SetC6(true);
      })
      .catch((err) => {
        console.log(err);
        SetC6(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // تاریخچه POR
  useEffect(() => {
    GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/analytics/exchange/${id}/assets-liabilities-historical`)
      .then((response) => {
        const getData: DoubleLinearPoint[] = [];
        for (let i = 0; i < response.result.length; i++) {
          getData.push({
            label: formatJalaliDateTime(response.result[i].date),
            x: response.result[i].totalAssetsUsd,
            y: response.result[i].totalLiabilitiesUsd,
          });
        }
        getData.sort((a, b) => String(a.label).localeCompare(String(b.label)));

        if (getData.length) {
          SetDailyPOR([
            { label: "دارایی", value: getData[getData.length - 1].x },
            { label: "بدهی", value: getData[getData.length - 1].y },
          ]);
        } else {
          SetDailyPOR([]);
        }

        SetPORHistory(getData);
        SetC7(true);
      })
      .catch((err) => {
        console.log(err);
        SetC7(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // حجم دارایی رمزارزها (portfolio)
  useEffect(() => {
    GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/analytics/exchange/${id}/portfolio`)
      .then((response) => {
        const getData: TopCryptocurrenciesChart[] = [];
        for (let i = 0; i < response.result.length; i++) {
          getData.push({
            name: response.result[i].cryptocurrency,
            symbol: response.result[i].cryptocurrency,
            value: response.result[i].totalUsdValue,
          });
        }
        SetTopcryptocurrencies(getData);
        SetC8(true);
      })
      .catch((err) => {
        console.log(err);
        SetC8(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // لیست کوین‌ها
  useEffect(() => {
    GetRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/valid-currencies?exchangeId=${id}`)
      .then((response) => {
        SetCryptoList(response.result);
        SetCryptoSelected1(response.result?.[0]?.cryptocurrency ?? "");
        SetCryptoSelected2(response.result?.[0]?.cryptocurrency ?? "");
        SetC9(true);
      })
      .catch((err) => {
        console.log(err);
        SetC9(true);
      });
  }, []);

  // لیست معاملات رمزارزها
  useEffect(() => {
    if (CryptoSelected1 !== "") {
      GetRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/exchange/${id}/trading-volume/${CryptoSelected1}`)
        .then((response) => {
          const getData: DailyActiveUsers[] = [];
          for (let i = 0; i < response.result.length; i++) {
            getData.push({
              label: formatJalaliDateTime(response.result[i].date),
              x: response.result[i].volume,
            });
          }
          getData.sort((a, b) => String(a.label).localeCompare(String(b.label)));
          SetTradingVolume(getData);
          SetC10(true);
        })
        .catch((err) => {
          console.log(err);
          SetC10(true);
        });
    }
  }, [CryptoSelected1]);

  // تاریخچه واریز و برداشت رمزارزی
  useEffect(() => {
    if (CryptoSelected2 !== "") {
      GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/analytics/exchange/${id}/deposits-withdrawals/${CryptoSelected2}`)
        .then((response) => {
          const getData: DoubleLinearPoint[] = [];
          for (let i = 0; i < response.result.length; i++) {
            getData.push({
              label: formatJalaliDateTime(response.result[i].date),
              x: response.result[i].inflow,
              y: response.result[i].outflow,
            });
          }
          getData.sort((a, b) => String(a.label).localeCompare(String(b.label)));

          if (getData.length) {
            SetDailyWithDep([
              { label: "واریز", value: getData[getData.length - 1].x },
              { label: "برداشت", value: getData[getData.length - 1].y },
            ]);
          } else {
            SetDailyWithDep([]);
          }

          SetDepWithHistory(getData);
          SetC11(true);
        })
        .catch((err) => {
          console.log(err);
          SetC11(true);
        });
    }
  }, [CryptoSelected2]);

  // تاریخچه واریز و برداشت ریالی
  useEffect(() => {
    GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/analytics/exchange/${id}/deposits-withdrawals/IRR`)
      .then((response) => {
        const getData: DoubleLinearPoint[] = [];
        for (let i = 0; i < response.result.length; i++) {
          getData.push({
            label: formatJalaliDateTime(response.result[i].date),
            x: response.result[i].inflow,
            y: response.result[i].outflow,
          });
        }
        getData.sort((a, b) => String(a.label).localeCompare(String(b.label)));

        if (getData.length) {
          SetDailyIRRWithDep([
            { label: "واریز", value: getData[getData.length - 1].x },
            { label: "برداشت", value: getData[getData.length - 1].y },
          ]);
        } else {
          SetDailyIRRWithDep([]);
        }

        SetIRRDepWithHistory(getData);
        SetC12(true);
      })
      .catch((err) => {
        console.log(err);
        SetC12(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownloadPDF = async () => {
    if (IsDownloading) return;

    SetIsDownloading(true);
    try {
      const toEnNumber = (v: any) => {
        if (v === null || v === undefined || v === "") return "0";
        const s = String(v);
        const map: Record<string, string> = {
          "۰": "0",
          "۱": "1",
          "۲": "2",
          "۳": "3",
          "۴": "4",
          "۵": "5",
          "۶": "6",
          "۷": "7",
          "۸": "8",
          "۹": "9",
          "٫": ".",
          "٬": ",",
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

      // ---- concurrency helper ----
      const mapWithConcurrency = async <T, R>(
        items: T[],
        limit: number,
        worker: (item: T, index: number) => Promise<R>
      ): Promise<R[]> => {
        const results: R[] = new Array(items.length);
        let i = 0;

        const runners = new Array(Math.min(limit, items.length)).fill(0).map(async () => {
          while (true) {
            const idx = i++;
            if (idx >= items.length) break;
            results[idx] = await worker(items[idx], idx);
          }
        });

        await Promise.all(runners);
        return results;
      };

      type SymResult = {
        symbol: string;
        tradingVolume: DailyActiveUsers[];
        depositsWithdrawals: DoubleLinearPoint[];
        error?: string;
      };

      const symbols: string[] = (CryptoList || [])
        .map((x: any) => x?.cryptocurrency)
        .filter(Boolean);

      const fetchPerSymbol = async (symbol: string): Promise<SymResult> => {
        try {
          const [tvRes, dwRes] = await Promise.all([
            GetRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/exchange/${id}/trading-volume/${symbol}`),
            GetRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/exchange/${id}/deposits-withdrawals/${symbol}`),
          ]);

          const tradingVolume: DailyActiveUsers[] = (tvRes?.result || [])
            .map((r: any) => ({
              label: formatJalaliDateTime(r.date),
              x: r.volume,
            }))
            .sort((a: any, b: any) => String(a.label).localeCompare(String(b.label)));

          const depositsWithdrawals: DoubleLinearPoint[] = (dwRes?.result || [])
            .map((r: any) => ({
              label: formatJalaliDateTime(r.date),
              x: r.inflow,
              y: r.outflow,
            }))
            .sort((a: any, b: any) => String(a.label).localeCompare(String(b.label)));

          return { symbol, tradingVolume, depositsWithdrawals };
        } catch (e: any) {
          return {
            symbol,
            tradingVolume: [],
            depositsWithdrawals: [],
            error: e?.message || "fetch failed",
          };
        }
      };

      // ---- PDF ----
      const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const marginX = 14;

      const title = "Exchange Analytics Report";
      const subtitle = `Exchange Name: ${toEnText(name || "Unknown Exchange")}`;

      const logoDataUrl = await urlToDataUrl("/images/shaparak.png");

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

      if (logoDataUrl) {
        try {
          const { w, h } = await getImageSizeFromDataUrl(logoDataUrl);
          const ratio = w / h;

          const logoH = 18;
          const logoW = logoH * ratio;
          const x = pageW - marginX - logoW;
          const y = 10;

          const fmt = getImageFormatFromDataUrl(logoDataUrl);
          doc.addImage(logoDataUrl, fmt as any, x, y, logoW, logoH);
        } catch {
          // ignore
        }
      }

      const headerBottomY = 30;
      doc.setDrawColor(200);
      doc.setLineWidth(0.6);
      doc.line(marginX, headerBottomY + 4, pageW - marginX, headerBottomY + 4);

      let cursorY = headerBottomY + 12;

      addSectionTitle(doc, "Overview Metrics", cursorY);
      cursorY += 3;

      autoTable(doc, {
        startY: cursorY,
        head: [["Metric", "Value"]],
        body: (HeaderData || []).map((x: any) => [
          toEnText(labelToEnglish(String(x.label ?? ""))),
          toEnText(toEnNumber(Number(x.value ?? 0).toLocaleString())),
        ]),
        styles: { font: "helvetica", fontSize: 9 },
        headStyles: { fillColor: [240, 240, 240], textColor: 20 },
        theme: "grid",
        margin: { left: marginX, right: marginX },
        pageBreak: "auto",
      });

      // @ts-ignore
      cursorY = (doc as any).lastAutoTable.finalY + 8;

      addSectionTitle(doc, "Top Traded Cryptocurrencies (USDT)", cursorY);
      cursorY += 3;

      autoTable(doc, {
        startY: cursorY,
        head: [["Currency", "Total Volume (USDT)"]],
        body: (TopTradedcryptocurrencies || []).map((x: any) => [
          toEnText(x.label),
          toEnText(toEnNumber(Number(x.value ?? 0).toLocaleString())),
        ]),
        styles: { font: "helvetica", fontSize: 9 },
        headStyles: { fillColor: [240, 240, 240], textColor: 20 },
        theme: "grid",
        margin: { left: marginX, right: marginX },
        pageBreak: "auto",
      });

      // @ts-ignore
      cursorY = (doc as any).lastAutoTable.finalY + 8;

      addSectionTitle(doc, "Portfolio - Top Assets (USD Value)", cursorY);
      cursorY += 3;

      autoTable(doc, {
        startY: cursorY,
        head: [["Asset", "Symbol", "Total USD Value"]],
        body: (Topcryptocurrencies || []).map((x: any) => [
          toEnText(x.name),
          toEnText(x.symbol),
          toEnText(toEnNumber(Number(x.value ?? 0).toLocaleString())),
        ]),
        styles: { font: "helvetica", fontSize: 9 },
        headStyles: { fillColor: [240, 240, 240], textColor: 20 },
        theme: "grid",
        margin: { left: marginX, right: marginX },
        pageBreak: "auto",
      });

      // @ts-ignore
      cursorY = (doc as any).lastAutoTable.finalY + 8;

      addSectionTitle(doc, "Assets vs Liabilities (Historical)", cursorY);
      cursorY += 3;

      autoTable(doc, {
        startY: cursorY,
        head: [["Date", "Assets (USD)", "Liabilities (USD)"]],
        body: (PORHistory || []).map((x: any) => [
          toEnText(x.label),
          toEnText(toEnNumber(Number(x.x ?? 0).toLocaleString())),
          toEnText(toEnNumber(Number(x.y ?? 0).toLocaleString())),
        ]),
        styles: { font: "helvetica", fontSize: 9 },
        headStyles: { fillColor: [240, 240, 240], textColor: 20 },
        theme: "grid",
        margin: { left: marginX, right: marginX },
        pageBreak: "auto",
      });

      // @ts-ignore
      cursorY = (doc as any).lastAutoTable.finalY + 8;

      // ---- NEW: fetch ALL symbols and put them into ONE shared table with a Symbol column ----
      const allSymbolData = symbols.length ? await mapWithConcurrency(symbols, 4, (sym) => fetchPerSymbol(sym)) : [];

      // Crypto Deposits & Withdrawals - single table
      addSectionTitle(doc, "Crypto Deposits & Withdrawals - All Symbols", cursorY);
      cursorY += 3;

      const depRows: Array<[string, string, string, string]> = [];
      for (const item of allSymbolData) {
        if (item.error) {
          depRows.push([toEnText(item.symbol), "ERROR", toEnText(item.error), ""]);
          continue;
        }
        for (const p of item.depositsWithdrawals || []) {
          depRows.push([
            toEnText(item.symbol),
            toEnText(p.label),
            toEnText(toEnNumber(Number(p.x ?? 0).toLocaleString())),
            toEnText(toEnNumber(Number(p.y ?? 0).toLocaleString())),
          ]);
        }
      }

      autoTable(doc, {
        startY: cursorY,
        head: [["Symbol", "Date", "Deposits", "Withdrawals"]],
        body: depRows,
        styles: { font: "helvetica", fontSize: 8 },
        headStyles: { fillColor: [240, 240, 240], textColor: 20 },
        theme: "grid",
        margin: { left: marginX, right: marginX },
        pageBreak: "auto",
      });

      // @ts-ignore
      cursorY = (doc as any).lastAutoTable.finalY + 8;

      // IRR Deposits & Withdrawals (Historical) - unchanged
      addSectionTitle(doc, "IRR Deposits & Withdrawals (Historical)", cursorY);
      cursorY += 3;

      autoTable(doc, {
        startY: cursorY,
        head: [["Date", "Deposits (IRR)", "Withdrawals (IRR)"]],
        body: (IRRDepWithHistory || []).map((x: any) => [
          toEnText(x.label),
          toEnText(toEnNumber(Number(x.x ?? 0).toLocaleString())),
          toEnText(toEnNumber(Number(x.y ?? 0).toLocaleString())),
        ]),
        styles: { font: "helvetica", fontSize: 9 },
        headStyles: { fillColor: [240, 240, 240], textColor: 20 },
        theme: "grid",
        margin: { left: marginX, right: marginX },
        pageBreak: "auto",
      });

      // @ts-ignore
      cursorY = (doc as any).lastAutoTable.finalY + 8;

      // Trading Volume (Monthly) - single table
      addSectionTitle(doc, "Trading Volume (Monthly) - All Symbols", cursorY);
      cursorY += 3;

      const tvRows: Array<[string, string, string]> = [];
      for (const item of allSymbolData) {
        if (item.error) {
          tvRows.push([toEnText(item.symbol), "ERROR", toEnText(item.error)]);
          continue;
        }
        for (const p of item.tradingVolume || []) {
          tvRows.push([
            toEnText(item.symbol),
            toEnText(p.label),
            toEnText(toEnNumber(Number(p.x ?? 0).toLocaleString())),
          ]);
        }
      }

      autoTable(doc, {
        startY: cursorY,
        head: [["Symbol", "Date", "Volume"]],
        body: tvRows,
        styles: { font: "helvetica", fontSize: 8 },
        headStyles: { fillColor: [240, 240, 240], textColor: 20 },
        theme: "grid",
        margin: { left: marginX, right: marginX },
        pageBreak: "auto",
      });

      // @ts-ignore
      cursorY = (doc as any).lastAutoTable.finalY + 8;

      // Daily Active Users (Time Series) - unchanged
      addSectionTitle(doc, "Daily Active Users (Time Series)", cursorY);
      cursorY += 3;

      autoTable(doc, {
        startY: cursorY,
        head: [["Date", "DAU"]],
        body: (DailyActiveUsers || []).map((x: any) => [
          toEnText(x.label),
          toEnText(toEnNumber(Number(x.x ?? 0).toLocaleString())),
        ]),
        styles: { font: "helvetica", fontSize: 9 },
        headStyles: { fillColor: [240, 240, 240], textColor: 20 },
        theme: "grid",
        margin: { left: marginX, right: marginX },
        pageBreak: "auto",
      });

      const pageCount = doc.getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        doc.setPage(p);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(`Page ${p} of ${pageCount}`, marginX, pageH - 10);

        if (p === pageCount) {
          doc.text("This report was automatically generated by the CED portal system.", marginX, pageH - 16);
        }
      }

      const safeName = (name || "exchange").toString().replace(/\s+/g, "_");
      doc.save(`CED_Report_${toEnText(safeName)}_${toEnText(id || "")}.pdf`);
    } finally {
      SetIsDownloading(false);
    }
  };

  // ✅ wrappers to force equal height per row (items stretch)
  const rowGrid3 = "grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4 items-stretch";
  const rowGrid2_1 = "grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4 items-stretch";
  const cardStretch = "h-full min-h-full flex flex-col";

  const logoNode = useMemo(() => {
    if (logo) return <img alt="logo" className="w-8 h-8 object-contain" src={logo} />;
    return (
      <div
        className={cx(
          "w-10 h-10 rounded-xl grid place-items-center  text-titleText dark:text-titleText-dark",
          "bg-boxColor dark:bg-boxColor-dark",
          "border border-boxBorderColor dark:border-boxBorderColor-dark"
        )}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 7.2C4 6.08 4 5.52 4.218 5.092c.192-.376.498-.682.874-.874C5.52 4 6.08 4 7.2 4h9.6c1.12 0 1.68 0 2.108.218.376.192.682.498.874.874C20 5.52 20 6.08 20 7.2v9.6c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C18.48 20 17.92 20 16.8 20H7.2c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C4 18.48 4 17.92 4 16.8V7.2Z"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path
            d="M8 14.5 10.2 12.3a1 1 0 0 1 1.4 0l1.6 1.6a1 1 0 0 0 1.4 0L18 11.5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }, [logo]);

  return (
    <div className="space-y-4">
      {/* Top header card */}
      <div className={cx(panelBase, "p-5")}>
  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
    <div className="min-w-0">
      <div className="flex items-center gap-2 min-w-0">
        {logoNode}
        <h3 className="text-2xl font-extrabold text-titleText dark:text-titleText-dark truncate mb-0">
          {name}
        </h3>
      </div>
    </div>

    <div className="shrink-0 sm:self-start">
      <button
        onClick={handleDownloadPDF}
        type="button"
        disabled={IsDownloading}
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

          w-full sm:w-auto
          justify-center
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
        <span>{IsDownloading ? "درحال دانلود..." : "دریافت PDF"}</span>
      </button>
    </div>
  </div>
</div>


      <MemoStatsMarquee data={HeaderData} />

      {/* Row 1 */}
      <div className={rowGrid3}>
        <div className={cx(cardStretch, "xl:col-span-1")}>
          <MemoCircleChart data={TopTradedcryptocurrencies} title="حجم معاملات رمزارزها" unit="USDT" />
        </div>
        <div className={cx(cardStretch, "xl:col-span-1")}>
          <MemoCircleChart
            data={DailyPOR}
            title="نسبت دارایی به بدهی"
            unit="USDT"
            description="برایند دارایی‌ها و بدهی‌ها محاسبه شده است!"
            value={DailyPOR.length !== 0 ? DailyPOR[0].value - DailyPOR[1].value : null}
          />
        </div>
        <div className={cx(cardStretch, "xl:col-span-2")}>
          <MemoTreeMap data={Topcryptocurrencies} title="حجم دارایی رمزارزها" />
        </div>
      </div>

      {/* Row 2 */}
      <div className={rowGrid2_1}>
        <div className={cx(cardStretch, "xl:col-span-3")}>
          <MemoDoubleLinearChart
            data={PORHistory}
            title="تاریخچه نسبت دارایی به بدهی"
            unitSuffix="M"
            assetLabel="دارایی"
            liabilityLabel="بدهی"
            ShowSummary={false}
          />
        </div>
      </div>

      {/* Row 3 */}
      <div className={rowGrid3}>
        <div className={cx(cardStretch, "xl:col-span-2")}>
          <MemoDoubleLinearChart
            data={DepWithHistory}
            title="واریز و برداشت های رمزارزی سکو"
            unitSuffix="M"
            assetLabel="واریز"
            liabilityLabel="برداشت"
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

      {/* Row 4 */}
      <div className={rowGrid3}>
        <div className={cx(cardStretch, "xl:col-span-2")}>
          <MemoDoubleLinearChart
            data={IRRDepWithHistory}
            title="واریز و برداشت های ریالی سکو"
            unitSuffix="M"
            assetLabel="واریز"
            liabilityLabel="برداشت"
            useLastItemForNet
            headerLink={{ href: `/panel/rial-transfers?exchange=${name}`, title: "جزئیات واریز و برداشت های ریالی سکو" }}
            ShowSummary={false}
          />
        </div>
      </div>

      {/* Full width charts */}
      <div className={cx(cardStretch, panelBase, "p-0 overflow-hidden")}>
        <MemoSingleLinearChart
          data={TradingVolume}
          title="حجم معاملات ماهانه"
          seriesLabel="حجم"
          unitSuffix="M"
          List={CryptoList}
          CryptoSelected={CryptoSelected1}
          SetCryptoSelected={SetCryptoSelected1}
          ShowList={true}
          topLeftLink={{ label: "جزئیات معاملات کاربران", href: `/panel/crypto-transactions?exchange=${name}` }}
        />
      </div>

      <div className={cx(cardStretch, panelBase, "p-0 overflow-hidden")}>
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
  );
};

export default ExchangeStats;
