'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import RiskSwitch from '../../../../components/Dashboard/ExchangeList/Switch/Switch';
import { Button } from '@heathmont/moon-base-tw';
import LoadingComponent from '../../../../components/LoadingComponent/LoadingComponent';
import ExpandableTable from '../../../../components/ExpandableTable/ExpandableTable';
import Pagination from '../../../../components/Pagination/Pagination';
import { GetRequest } from '../../../../functions/GetRequest';
import SearchableSelect from '../../../../components/Select/Select';
import { useSearchParams } from 'next/navigation';
type TxKind = 'deposit' | 'withdraw';

type Company = {
    id: string;
    name: string;
    logo?: string;
    legalName?: string;
    registrationNumber?: string;
    siteAddress?: string;
};

type CryptoTxRow = {
    id: string;
    subRows?: CryptoTxRow[];

    exchangeName?: string;
    cryptoBrokerId?: string;

    userId?: string;
    userIdentity?: string;

    confirmationTime?: number | string; // unix timestamp (sec/ms) یا string
    cryptocurrency?: string;
    contractAddress?: string;
    network?: string;

    amount?: number;

    transactionId?: string;
    memo?: string;

    transactionDestination?: string;
    transactionSource?: string;
};

type ApiResponse = {
    result?: {
        content?: any[];
        totalElements?: number;
        totalPages?: number;
        size?: number;
        number?: number;
    };
};

const WITHDRAW_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/search/crypto-withdraws`;
const DEPOSIT_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/search/crypto-deposits`;

const Page = () => {

    const sp = useSearchParams();

    const [usersLoading, setUsersLoading] = useState(false);
    const [loading, setLoading] = useState(false);

    // ✅ Switch: all/deposit/withdraw
    const [txKind, setTxKind] = useState<TxKind>('deposit');

    // ✅ exchange dropdown
    const [exchangeSelected, setExchangeSelected] = useState<string>(sp.get('exchange') || '');
    const [exchangeSearch, setExchangeSearch] = useState<string>('');

    // ✅ modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const modalBackdropRef = useRef<HTMLDivElement | null>(null);

    // ✅ data & pagination
    const [rows, setRows] = useState<CryptoTxRow[]>([]);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1); // 1-based

    // ✅ exchanges
    const [exchanges, setExchanges] = useState<Company[]>([]);

    type CryptoFilters = {
        userId: string;
        userIdentity: string;
        cryptocurrency: string;
        transactionDestination: string;
        transactionSource: string;
        transactionId: string;
    };

    const emptyFilters: CryptoFilters = {
        userId: '',
        userIdentity: '',
        cryptocurrency: '',
        transactionDestination: '',
        transactionSource: '',
        transactionId: '',
    };

    // ✅ فیلترهای اعمال‌شده روی API
    const [appliedFilters, setAppliedFilters] = useState<CryptoFilters>(emptyFilters);

    // ✅ فیلترهای داخل مودال (تا وقتی Apply نزدی، اعمال نمی‌شن)
    const [draftFilters, setDraftFilters] = useState<CryptoFilters>(emptyFilters);

    const txKindOptions: { label: string; value: TxKind }[] = [
        { label: 'واریز', value: 'deposit' },
        { label: 'برداشت', value: 'withdraw' },
    ];

    const userIdentityOptions: { label: string; value: string }[] = [
        { label: 'حقیقی', value: 'individual' },
        { label: 'حقوقی', value: 'legalEntity' },
        { label: 'اتباع', value: 'nonCitizen' },
        { label: 'ربات کاربر', value: 'userBot' },
        { label: 'ربات کارگزار', value: 'exchangeBot' },
    ];

    const translateUserIdentity = (v?: string) => {
        if (!v) return '';
        const map: Record<string, string> = {
            individual: 'حقیقی',
            legalEntity: 'حقوقی',
            nonCitizen: 'اتباع',
            userBot: 'ربات کاربر',
            exchangeBot: 'ربات کارگزار',
        };
        return map[v] ?? v;
    };

    const formatAmount = (n?: number) => {
        if (n === null || n === undefined || Number.isNaN(Number(n))) return '';
        return `${Number(n).toLocaleString()} `;
    };

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

        const time = new Intl.DateTimeFormat('fa-IR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }).format(d);

        return `${fa} ${time}`;
    };

    // ✅ fetch exchanges (same as your IRR page)
    useEffect(() => {
        setUsersLoading(true);
        GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/exchanges?page=0&size=100`)
            .then((response: any) => {
                const list: Company[] = (response?.result?.content ?? []).map((item: any) => ({
                    id: String(item.id),
                    name: item.name,
                    logo: item.logo,
                    legalName: item.legalName,
                    registrationNumber: item.registrationNumber,
                    siteAddress: item.siteAddress,
                }));
                list.sort((a, b) => Number(b.id) - Number(a.id));
                setExchanges(list);
            })
            .catch(() => { })
            .finally(() => setUsersLoading(false));
    }, []);

    const buildQueryUrl = (base: string) => {
        const params = new URLSearchParams();
        params.set('page', String(Math.max(0, currentPage - 1)));
        params.set('size', String(pageSize));

        if (exchangeSelected) params.set('exchangeId', exchanges.find(item => item.name === exchangeSelected)?.id ?? '');
        if (appliedFilters.userId) params.set('userId', appliedFilters.userId);
        if (appliedFilters.userIdentity) params.set('userIdentity', appliedFilters.userIdentity);
        if (appliedFilters.cryptocurrency) params.set('cryptocurrency', appliedFilters.cryptocurrency);
        if (appliedFilters.transactionDestination) params.set('transactionDestination', appliedFilters.transactionDestination);
        if (appliedFilters.transactionSource) params.set('transactionSource', appliedFilters.transactionSource);
        if (appliedFilters.transactionId) params.set('transactionId', appliedFilters.transactionId);

        return `${base}?${params.toString()}`;
    };

    const normalizeItemToRow = (item: any, idx: number, kind: 'deposit' | 'withdraw'): CryptoTxRow => {
        // ✅ keyهای محتمل (اگر بک‌اند تفاوت داشت، اینجا راحت مپ می‌کنیم)
        const transactionId = item?.transactionId ?? item?.txid ?? item?.hash;
        const confirmationTime = item?.confirmationTime ?? item?.confirmTime ?? item?.timestamp ?? item?.time;

        const rowId =
            String(
                item?.transactionId ??
                item?.txid ??
                item?.hash ??
                item?.userId ??
                `${kind}-${currentPage}-${idx}`
            ) || `${kind}-${currentPage}-${idx}`;

        return {
            id: rowId,

            exchangeName: item?.exchangeName,
            cryptoBrokerId: item?.cryptoBrokerId,

            userId: item?.userId,
            userIdentity: item?.userIdentity,

            confirmationTime,
            cryptocurrency: item?.cryptocurrency,
            contractAddress: item?.contractAddress,
            network: item?.network,

            amount: item?.amount,

            transactionId,
            memo: item?.memo,

            transactionDestination: item?.transactionDestination,
            transactionSource: item?.transactionSource,
        };
    };

    const fetchOne = (base: string, kind: 'deposit' | 'withdraw') => {
        const url = buildQueryUrl(base);
        return GetRequest(url)
            .then((response: ApiResponse) => {
                const content = response?.result?.content ?? [];
                const total = Number(response?.result?.totalElements ?? 0);
                const mapped: CryptoTxRow[] = content.map((item: any, idx: number) => normalizeItemToRow(item, idx, kind));
                return { mapped, total };
            })
            .catch(() => ({ mapped: [] as CryptoTxRow[], total: 0 }));
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            if (txKind === 'deposit') {
                const r = await fetchOne(DEPOSIT_URL, 'deposit');
                setRows(r.mapped);
                setTotalItems(r.total);
            } else if (txKind === 'withdraw') {
                const r = await fetchOne(WITHDRAW_URL, 'withdraw');
                setRows(r.mapped);
                setTotalItems(r.total);
            } else {
                // ✅ all: دو تا request و merge (برای صفحه 1:1 ممکنه دقیق نباشه، ولی UX خوبه)
                // اگر backend endpoint "all" داشته باشی، همینجا جایگزینش می‌کنیم.
                const [d, w] = await Promise.all([
                    fetchOne(DEPOSIT_URL, 'deposit'),
                    fetchOne(WITHDRAW_URL, 'withdraw'),
                ]);

                // برای all، total رو جمع می‌کنیم (تقریبی برای pagination مشترک)
                setRows([...d.mapped, ...w.mapped]);
                setTotalItems((d.total || 0) + (w.total || 0));
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (sp.get('exchange')) {
            if (exchanges.length > 0) {
                fetchData();
            }
        } else {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        txKind,
        exchangeSelected,

        appliedFilters.userId,
        appliedFilters.userIdentity,
        appliedFilters.cryptocurrency,
        appliedFilters.transactionDestination,
        appliedFilters.transactionSource,
        appliedFilters.transactionId,
        exchanges,
        currentPage,
        pageSize,
    ]);

    // ✅ badges (no badge for txKind)
    const appliedBadges = useMemo(() => {
        const badges: { key: string; label: string; onRemove: () => void }[] = [];

        if (exchangeSelected) {
            badges.push({
                key: 'exchangeName',
                label: `کارگزاری ${exchangeSelected}`,
                onRemove: () => {
                    setExchangeSelected('');
                    setCurrentPage(1);
                },
            });
        }

        if (appliedFilters.userId) {
            badges.push({
                key: 'userId',
                label: `شناسه کاربر ${appliedFilters.userId}`,
                onRemove: () => {
                    setAppliedFilters((p) => ({ ...p, userId: '' }));
                    setDraftFilters((p) => ({ ...p, userId: '' })); // ✅ برای همگام بودن UI مودال
                    setCurrentPage(1);
                },
            });
        }

        if (appliedFilters.userIdentity) {
            badges.push({
                key: 'userIdentity',
                label: `هویت ${translateUserIdentity(appliedFilters.userIdentity)}`,
                onRemove: () => {
                    setAppliedFilters((p) => ({ ...p, userIdentity: '' }));
                    setDraftFilters((p) => ({ ...p, userIdentity: '' }));
                    setCurrentPage(1);
                },
            });
        }

        if (appliedFilters.cryptocurrency) {
            badges.push({
                key: 'cryptocurrency',
                label: `رمزارز ${appliedFilters.cryptocurrency}`,
                onRemove: () => {
                    setAppliedFilters((p) => ({ ...p, cryptocurrency: '' }));
                    setDraftFilters((p) => ({ ...p, cryptocurrency: '' }));
                    setCurrentPage(1);
                },
            });
        }

        if (appliedFilters.transactionSource) {
            badges.push({
                key: 'transactionSource',
                label: `آدرس مبدأ ${appliedFilters.transactionSource}`,
                onRemove: () => {
                    setAppliedFilters((p) => ({ ...p, transactionSource: '' }));
                    setDraftFilters((p) => ({ ...p, transactionSource: '' }));
                    setCurrentPage(1);
                },
            });
        }

        if (appliedFilters.transactionDestination) {
            badges.push({
                key: 'transactionDestination',
                label: `آدرس مقصد ${appliedFilters.transactionDestination}`,
                onRemove: () => {
                    setAppliedFilters((p) => ({ ...p, transactionDestination: '' }));
                    setDraftFilters((p) => ({ ...p, transactionDestination: '' }));
                    setCurrentPage(1);
                },
            });
        }

        if (appliedFilters.transactionId) {
            badges.push({
                key: 'transactionId',
                label: `شناسه تراکنش ${appliedFilters.transactionId}`,
                onRemove: () => {
                    setAppliedFilters((p) => ({ ...p, transactionId: '' }));
                    setDraftFilters((p) => ({ ...p, transactionId: '' }));
                    setCurrentPage(1);
                },
            });
        }

        return badges;
    }, [
        exchangeSelected,
        appliedFilters.userId,
        appliedFilters.userIdentity,
        appliedFilters.cryptocurrency,
        appliedFilters.transactionDestination,
        appliedFilters.transactionSource,
        appliedFilters.transactionId,
    ]);

    const columns = useMemo(() => {
        return [
          {
            header: 'کارگزاری',
            accessorKey: 'exchangeName',
            cell: (row: CryptoTxRow) => (
              <span className="font-medium text-titleText dark:text-titleText-dark">
                {row?.cryptoBrokerId || '—'}
              </span>
            ),
          },
          {
            header: 'شناسه کاربر',
            accessorKey: 'userId',
            cell: (row: CryptoTxRow) => (
              <span className="text-sm font-medium text-titleText dark:text-titleText-dark">
                {row?.userId || '—'}
              </span>
            ),
          },
          {
            header: 'هویت کاربر',
            accessorKey: 'userIdentity',
            cell: (row: CryptoTxRow) => (
              <span
                className="
                  inline-flex items-center px-2.5 py-1
                  rounded-full text-xs font-medium
                  bg-slate-100 dark:bg-white/10
                  text-slate-700 dark:text-slate-200
                  whitespace-nowrap max-w-[160px] truncate
                "
              >
                {translateUserIdentity(row?.userIdentity) || '—'}
              </span>
            ),
          },
          {
            header: 'زمان تایید',
            accessorKey: 'confirmationTime',
            cell: (row: CryptoTxRow) => (
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
                {formatJalaliDateTime(row?.confirmationTime) || '—'}
              </span>
            ),
          },
          {
            header: 'رمزارز',
            accessorKey: 'cryptocurrency',
            cell: (row: CryptoTxRow) => (
              <span className="font-semibold uppercase text-titleText dark:text-titleText-dark">
                {row?.cryptocurrency || '—'}
              </span>
            ),
          },
          {
            header: 'آدرس قرارداد',
            accessorKey: 'contractAddress',
            cell: (row: CryptoTxRow) => (
              <span
                className="
                  font-mono text-xs
                  text-slate-700 dark:text-slate-200
                  max-w-[180px] truncate whitespace-nowrap
                "
              >
                {row?.contractAddress || '—'}
              </span>
            ),
          },
          {
            header: 'شبکه',
            accessorKey: 'network',
            cell: (row: CryptoTxRow) => (
              <span
                className="
                  inline-flex items-center px-2.5 py-1
                  rounded-lg text-xs font-semibold
                  bg-[#63C3FF]/10 text-[#63C3FF]
                  dark:bg-[#63C3FF]/20
                "
              >
                {row?.network || '—'}
              </span>
            ),
          },
          {
            header: 'مقدار',
            accessorKey: 'amount',
            cell: (row: CryptoTxRow) => (
              <span
                className="
                  font-semibold tabular-nums
                  text-[#63C3FF]
                "
              >
                {formatAmount(row?.amount) || '—'}
              </span>
            ),
          },
          {
            header: 'شناسه تراکنش',
            accessorKey: 'transactionId',
            cell: (row: CryptoTxRow) => (
              <span
                className="
                  font-mono text-xs
                  text-slate-700 dark:text-slate-200
                  max-w-[200px] truncate whitespace-nowrap
                "
              >
                {row?.transactionId || '—'}
              </span>
            ),
          },
          {
            header: 'پرداخت‌یار',
            accessorKey: 'memo',
            cell: (row: CryptoTxRow) => (
              <span className="text-sm text-slate-700 dark:text-slate-200 whitespace-nowrap">
                {row?.memo || '—'}
              </span>
            ),
          },
          {
            header: 'آدرس مقصد',
            accessorKey: 'transactionDestination',
            cell: (row: CryptoTxRow) => (
              <span
                className="
                  font-mono text-xs
                  text-slate-700 dark:text-slate-200
                  max-w-[200px] truncate whitespace-nowrap
                "
              >
                {row?.transactionDestination || '—'}
              </span>
            ),
          },
          {
            header: 'آدرس مبدا',
            accessorKey: 'transactionSource',
            cell: (row: CryptoTxRow) => (
              <span
                className="
                  font-mono text-xs
                  text-slate-700 dark:text-slate-200
                  max-w-[200px] truncate whitespace-nowrap
                "
              >
                {row?.transactionSource || '—'}
              </span>
            ),
          },
        ];
      }, []);
      

    const handleBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === modalBackdropRef.current) {
            setDraftFilters(appliedFilters); // ✅ برگشت به حالت اعمال‌شده
            setIsModalOpen(false);
        }
    };

    const [open, setOpen] = useState(false);

    const rootRef = useRef<HTMLDivElement | null>(null);

    // ✅ بستن منو با کلیک بیرون
    useEffect(() => {
        if (!open) return;

        const handler = (e: MouseEvent) => {
            if (!rootRef.current) return;
            if (!rootRef.current.contains(e.target as Node)) setOpen(false);
        };

        document.addEventListener("mousedown", handler, true);
        return () => document.removeEventListener("mousedown", handler, true);
    }, [open]);

    return (
        <div className="p-2 sm:p-0">
            <div className="mt-4">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4" >
                    {/* Switch wrapper */}
                    <div className="order-1 lg:order-2 flex w-full lg:w-auto">
                        <div className="mt-5 w-full lg:w-auto">
                            <div
                                className="
        w-full lg:w-auto
        flex justify-start lg:justify-start
        [&_*]:w-full lg:[&_*]:w-auto
        [&_button]:min-w-[92px] sm:[&_button]:min-w-[104px]
        [&_button]:px-4 sm:[&_button]:px-5
        [&_button]:py-2
      "
                            >
                                <RiskSwitch
                                    value={txKind}
                                    onChange={(v: string) => {
                                        const next = (v as TxKind) ?? 'all';
                                        setTxKind(next);
                                        setCurrentPage(1);
                                    }}
                                    options={txKindOptions.map((x) => ({ label: x.label, value: x.value }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* LEFT (Exchange + More Filters) */}
                    <div className="order-2 lg:order-1 w-full lg:w-auto">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 w-full justify-start">
                            {/* exchange */}
                            <div className="relative w-full sm:w-80 text-sm text-titleText dark:text-titleText-dark">
                                <SearchableSelect
                                    label="کارگزاری"
                                    loading={usersLoading}
                                    value={exchangeSelected}
                                    onChange={(val) => {
                                        setExchangeSelected(val);
                                        setCurrentPage(1);
                                    }}
                                    options={exchanges.map((e) => ({
                                        id: e.id,
                                        label: e.name,
                                        value: e.name,
                                    }))}
                                    placeholder="همه کارگزاری‌ها"
                                    allLabel="همه کارگزاری‌ها"
                                    searchable
                                    searchPlaceholder="جستجوی نام کارگزاری..."
                                    className="sm:w-80 text-sm"
                                />
                            </div>

                            {/* more filters */}
                            <div className="w-full sm:w-auto shrink-0">


                                <Button
                                    variant="ghost"
                                    className="
    /* Layout & Spacing */
    w-full sm:w-auto px-5 py-2.5 
    flex items-center justify-center gap-2.5
    
    /* Typography */
    text-sm font-medium text-titleText dark:text-titleText-dark
    
    /* Background & Glassmorphism */
    bg-white/80 dark:bg-white/[0.05]
    backdrop-blur-md
    
    /* Border */
    border border-slate-200 dark:border-white/10
    
    /* Shape & Shadow */
    rounded-xl shadow-sm
    
    /* Interactions (Hover, Active, Focus) */
    transition-all duration-200
    hover:bg-white dark:hover:bg-white/10
    hover:border-[#63C3FF]/50 dark:hover:border-[#63C3FF]/40
    hover:shadow-md hover:shadow-[#63C3FF]/5
    active:scale-[0.97]
    focus:ring-2 focus:ring-[#63C3FF]/30
    
    /* Reset */
    outline-none
  "
                                    onClick={() => {
                                        setDraftFilters(appliedFilters); // ✅ کپی مقدارهای فعلی
                                        setIsModalOpen(true);
                                    }}
                                >
                                    {/* Icon with subtle brand color */}
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        className="text-[#63C3FF] group-hover:rotate-12 transition-transform"
                                    >
                                        <path
                                            d="M19 3H5C3.58579 3 2.87868 3 2.43934 3.4122C2 3.8244 2 4.48782 2 5.81466V6.50448C2 7.54232 2 8.06124 2.2596 8.49142C2.5192 8.9216 2.99347 9.18858 3.94202 9.72255L6.85504 11.3624C7.49146 11.7206 7.80967 11.8998 8.03751 12.0976C8.51199 12.5095 8.80408 12.9935 8.93644 13.5872C9 13.8722 9 14.2058 9 14.8729L9 17.5424C9 18.452 9 18.9067 9.25192 19.2613C9.50385 19.6158 9.95128 19.7907 10.8462 20.1406C12.7248 20.875 13.6641 21.2422 14.3321 20.8244C15 20.4066 15 19.4519 15 17.5424V14.8729C15 14.2058 15 13.8722 15.0636 13.5872C15.1959 12.9935 15.488 12.5095 15.9625 12.0976C16.1903 11.8998 16.5085 11.7206 17.145 11.3624L20.058 9.72255C21.0065 9.18858 21.4808 8.9216 21.7404 8.49142C22 8.06124 22 7.54232 22 6.50448V5.81466C22 4.48782 22 3.8244 21.5607 3.4122C21.1213 3 20.4142 3 19 3Z"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>

                                    <span className="leading-none">فیلترهای بیشتر</span>
                                </Button>

                            </div>
                        </div>
                    </div>
                </div>

                {/* badges */}
                <div className="mt-3 flex flex-wrap gap-2 w-full" dir="rtl">
                    {appliedBadges.map((b) => (
                        <div
                            key={b.key}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-full
                bg-white dark:bg-gray-800
                border border-gray-200 dark:border-buttonBorderColor-dark
                text-titleText dark:text-titleText-dark text-xs"
                        >
                            <span className="whitespace-nowrap">{b.label}</span>
                            <button
                                type="button"
                                onClick={b.onRemove}
                                className="w-5 h-5 rounded-full flex items-center justify-center
                  bg-white dark:bg-gray-800
                  text-titleText dark:text-titleText-dark
                  opacity-70 hover:opacity-100 transition-opacity"
                                aria-label="حذف فیلتر"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* table */}
            <div className="mt-4">
                {loading ? (
                    <LoadingComponent />
                ) : (
                    <div className="mt-4 w-full overflow-x-auto">
                        <div className="">
                            <ExpandableTable<CryptoTxRow>
                                data={rows}
                                columns={columns as any}
                                rowDetailsMode="row"
                                rowDetailsClassName="rounded-xl"
                            />
                        </div>
                    </div>
                )}

                <Pagination
                    rtl
                    totalItems={totalItems}
                    pageSize={pageSize}
                    currentPage={currentPage}
                    onPageChange={(p: number) => setCurrentPage(p)}
                />
            </div>

            {/* modal */}
            {isModalOpen && (
                <div
                    ref={modalBackdropRef}
                    onMouseDown={handleBackdropMouseDown}
                    className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40"
                >
                    <div className="w-[92%] max-w-2xl rounded-2xl bg-white dark:bg-boxColor-dark border border-gray-200 dark:border-buttonBorderColor-dark p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-titleText dark:text-titleText-dark font-semibold">فیلترهای بیشتر</div>
                            <button
                                type="button"
                                onClick={() => {
                                    setDraftFilters(appliedFilters);
                                    setIsModalOpen(false);
                                }}
                                className="
                                w-10 h-10 rounded-xl flex items-center justify-center
                                bg-gray-100 dark:bg-gray-700
                                text-titleText dark:text-titleText-dark
                                border border-gray-200 dark:border-gray-600
                                hover:bg-gray-200 dark:hover:bg-gray-600
                                transition-all
                              "
                                aria-label="بستن"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* userId */}
                            <div className="text-sm text-titleText dark:text-titleText-dark">
                                شناسه کاربر
                                <input
                                    value={draftFilters.userId}
                                    onChange={(e) => {
                                        setDraftFilters((p) => ({ ...p, userId: e.target.value }));
                                    }}
                                    placeholder="مثلاً user-2798"
                                    className="
                                    mt-2 w-full px-3 py-2
                                    rounded-lg
                                    border border-gray-300 dark:border-buttonBorderColor-dark
                                    bg-boxColor dark:bg-boxColor-dark
                                    text-titleText dark:text-titleText-dark
                                    focus:border-[#63C3FF] focus:ring-1 focus:ring-[#63C3FF]
                                    outline-none
                                    transition-all
                                  "
                                />
                            </div>

                            {/* transactionId */}
                            <div className="text-sm text-titleText dark:text-titleText-dark">
                                شناسه تراکنش (TransactionId)
                                <input
                                    value={draftFilters.transactionId}
                                    onChange={(e) => {
                                        setDraftFilters((p) => ({ ...p, transactionId: e.target.value }));
                                    }}

                                    placeholder="مثلاً 0x... یا txid"
                                    className="
                                    mt-2 w-full px-3 py-2
                                    rounded-lg
                                    border border-gray-300 dark:border-buttonBorderColor-dark
                                    bg-boxColor dark:bg-boxColor-dark
                                    text-titleText dark:text-titleText-dark
                                    focus:border-[#63C3FF] focus:ring-1 focus:ring-[#63C3FF]
                                    outline-none
                                    transition-all
                                  "
                                />
                            </div>

                            {/* userIdentity */}
                            <div className="w-full">
                                <SearchableSelect
                                    label="هویت کاربر"
                                    value={draftFilters.userIdentity}
                                    onChange={(val) => {
                                        setDraftFilters((p) => ({ ...p, userIdentity: val }));
                                    }}

                                    options={userIdentityOptions.map((x) => ({ label: x.label, value: x.value }))}
                                    placeholder="همه"
                                    allLabel="همه"
                                    searchable={false}
                                    className="text-sm"
                                />
                            </div>

                            {/* cryptocurrency */}
                            <div className="text-sm text-titleText dark:text-titleText-dark">
                                رمزارز
                                <input
                                    value={draftFilters.cryptocurrency}
                                    onChange={(e) => {
                                        setDraftFilters((p) => ({ ...p, cryptocurrency: e.target.value }));
                                    }}

                                    placeholder="مثلاً BTC"
                                    className="
                                    mt-2 w-full px-3 py-2
                                    rounded-lg
                                    border border-gray-300 dark:border-buttonBorderColor-dark
                                    bg-boxColor dark:bg-boxColor-dark
                                    text-titleText dark:text-titleText-dark
                                    focus:border-[#63C3FF] focus:ring-1 focus:ring-[#63C3FF]
                                    outline-none
                                    transition-all
                                  "
                                />
                            </div>

                            {/* destination */}
                            <div className="text-sm text-titleText dark:text-titleText-dark">
                                آدرس مقصد
                                <input
                                    value={draftFilters.transactionDestination}
                                    onChange={(e) => {
                                        setDraftFilters((p) => ({ ...p, transactionDestination: e.target.value }));
                                    }}

                                    placeholder="مثلاً 0x... یا bc1..."
                                    className="
                                    mt-2 w-full px-3 py-2
                                    rounded-lg
                                    border border-gray-300 dark:border-buttonBorderColor-dark
                                    bg-boxColor dark:bg-boxColor-dark
                                    text-titleText dark:text-titleText-dark
                                    focus:border-[#63C3FF] focus:ring-1 focus:ring-[#63C3FF]
                                    outline-none
                                    transition-all
                                  "
                                />
                            </div>

                            {/* source */}
                            <div className="text-sm text-titleText dark:text-titleText-dark">
                                آدرس مبدا
                                <input
                                    value={draftFilters.transactionSource}
                                    onChange={(e) => {
                                        setDraftFilters((p) => ({ ...p, transactionSource: e.target.value }));
                                    }}

                                    placeholder="مثلاً 0x... یا bc1..."
                                    className="
                                    mt-2 w-full px-3 py-2
                                    rounded-lg
                                    border border-gray-300 dark:border-buttonBorderColor-dark
                                    bg-boxColor dark:bg-boxColor-dark
                                    text-titleText dark:text-titleText-dark
                                    focus:border-[#63C3FF] focus:ring-1 focus:ring-[#63C3FF]
                                    outline-none
                                    transition-all
                                  "
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <Button
                                variant="ghost"
                                className="
            px-5 py-2.5 rounded-xl
            bg-indigo-600 text-white font-medium
            hover:bg-indigo-700
            transition-all
            shadow-sm hover:shadow
          "
                                onClick={() => {
                                    setAppliedFilters(draftFilters); // ✅ اعمال واقعی فیلترها
                                    setCurrentPage(1);              // ✅ ریست صفحه
                                    setIsModalOpen(false);          // ✅ بستن مودال
                                }}
                            >
                                اعمال
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Page;
