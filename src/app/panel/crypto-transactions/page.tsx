'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import RiskSwitch from '../../../../components/Dashboard/ExchangeList/Switch/Switch';
import { Button } from '@heathmont/moon-base-tw';
import LoadingComponent from '../../../../components/LoadingComponent/LoadingComponent';
import ExpandableTable from '../../../../components/ExpandableTable/ExpandableTable';
import Pagination from '../../../../components/Pagination/Pagination';
import { GetRequest } from '../../../../functions/GetRequest';
import SearchableSelect from '../../../../components/Select/Select';

type Company = {
    id: string;
    name: string;
    logo?: string;
    legalName?: string;
    registrationNumber?: string;
    siteAddress?: string;
};

type TradeRow = {
    id: string;
    subRows?: TradeRow[];

    exchangeName?: string;
    cryptoBrokerId?: string;

    userId?: string;
    userIdentity?: string;

    tradeId?: string;
    orderId?: string;

    tradeTime?: string | number;

    givenCurrencyUnit?: string;
    givenCurrencyAmount?: number;

    takenCurrencyUnit?: string;
    takenCurrencyAmount?: number;

    feeCurrency?: string;
    feeAmount?: number;

    marketType?: string;
    transactionType?: string;
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

const TRADES_URL = 'https://sand-em-api.bahfara.ir/api/analytics/search/trades';

type CryptoFilters = {
    userId: string;
    userIdentity: string;
    tradeId: string;

    givenCurrencyUnit: string;
    takenCurrencyUnit: string;

    marketType: string;
    transactionType: string;
};

const emptyFilters: CryptoFilters = {
    userId: '',
    userIdentity: '',
    tradeId: '',
    givenCurrencyUnit: '',
    takenCurrencyUnit: '',
    marketType: '',
    transactionType: '',
};

const Page = () => {
    const [usersLoading, setUsersLoading] = useState(false);
    const [loading, setLoading] = useState(false);

    // ✅ exchange dropdown (with search)
    const [exchangeSelected, setExchangeSelected] = useState<string>('');

    // ✅ modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const modalBackdropRef = useRef<HTMLDivElement | null>(null);

    // ✅ data & pagination
    const [rows, setRows] = useState<TradeRow[]>([]);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1); // 1-based

    // ✅ exchanges
    const [exchanges, setExchanges] = useState<Company[]>([]);

    const userIdentityOptions: { label: string; value: string }[] = [
        { label: 'حقیقی', value: 'individual' },
        { label: 'حقوقی', value: 'legalEntity' },
        { label: 'اتباع', value: 'nonCitizen' },
        { label: 'ربات کاربر', value: 'userBot' },
        { label: 'ربات کارگزار', value: 'exchangeBot' },
    ];

    type MarketType = 'p2p' | 'otc';
    type TransactionType = 'spot' | 'marginal' | 'other';

    const txTypeOptions: { label: string; value: '' | TransactionType }[] = [
        { label: 'همه', value: '' },
        { label: 'عادی (Spot)', value: 'spot' },
        { label: 'تعهدی (Marginal)', value: 'marginal' },
        { label: 'غیره (Other)', value: 'other' },
    ];

    type TradeFilters = {
        userId: string;
        tradeId: string;
        userIdentity: string;
        exchangeName: string;
        givenCurrencyUnit: string;
        takenCurrencyUnit: string;
        marketType: MarketType | '';
        transactionType: '' | TransactionType;
    };

    const emptyTradeFilters: TradeFilters = {
        userId: '',
        tradeId: '',
        userIdentity: '',
        exchangeName: '',
        givenCurrencyUnit: '',
        takenCurrencyUnit: '',
        marketType: '',
        transactionType: '',
    };

    const [appliedFilters, setAppliedFilters] = useState<TradeFilters>(emptyTradeFilters);
    const [draftFilters, setDraftFilters] = useState<TradeFilters>(emptyTradeFilters);

    const marketTypeOptions: { label: string; value: MarketType }[] = [
        { label: 'P2P', value: 'p2p' },
        { label: 'OTC', value: 'otc' },
    ];

    const transactionTypeOptions: { label: string; value: TransactionType }[] = [
        { label: 'عادی (Spot)', value: 'spot' },
        { label: 'تعهدی (Marginal)', value: 'marginal' },
        { label: 'غیره (Other)', value: 'other' },
    ];

    const translateMarketType = (v?: string) => {
        if (!v) return '';
        const map: Record<string, string> = {
            p2p: 'P2P',
            otc: 'OTC',
        };
        return map[v] ?? v;
    };

    const translateTransactionType = (v?: string) => {
        if (!v) return '';
        const map: Record<string, string> = {
            spot: 'عادی (Spot)',
            marginal: 'تعهدی (Marginal)',
            other: 'غیره (Other)',
        };
        return map[v] ?? v;
    };

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
        return `${Number(n).toLocaleString()}`;
    };

    const formatJalaliDateTime = (value?: string | number) => {
        if (value === null || value === undefined || value === '') return '';
        let d: Date | null = null;

        if (typeof value === 'number') {
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

    // ✅ fetch exchanges (same as your other pages)
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

        // exchange dropdown بیرون صفحه
        if (exchangeSelected) params.set('exchangeName', exchangeSelected);

        // modal filters
        if (appliedFilters.userId) params.set('userId', appliedFilters.userId);
        if (appliedFilters.tradeId) params.set('tradeId', appliedFilters.tradeId);
        if (appliedFilters.userIdentity) params.set('userIdentity', appliedFilters.userIdentity);

        if (appliedFilters.givenCurrencyUnit) params.set('givenCurrencyUnit', appliedFilters.givenCurrencyUnit);
        if (appliedFilters.takenCurrencyUnit) params.set('takenCurrencyUnit', appliedFilters.takenCurrencyUnit);

        if (appliedFilters.marketType) params.set('marketType', appliedFilters.marketType);
        if (appliedFilters.transactionType) params.set('transactionType', appliedFilters.transactionType);

        return `${base}?${params.toString()}`;
    };

    const normalizeItemToRow = (item: any, idx: number): TradeRow => {
        const tradeId = item?.tradeId ?? item?.tradeID ?? item?.id ?? item?.trade_id;
        const orderId = item?.orderId ?? item?.orderID ?? item?.order_id;

        const tradeTime = item?.tradeTime ?? item?.time ?? item?.timestamp ?? item?.createdAt;

        const rowId =
            String(tradeId ?? orderId ?? item?.userId ?? `trade-${currentPage}-${idx}`) ||
            `trade-${currentPage}-${idx}`;

        return {
            id: rowId,

            exchangeName: item?.exchangeName,
            cryptoBrokerId: item?.cryptoBrokerId,

            userId: item?.userId,
            userIdentity: item?.userIdentity,

            tradeId: tradeId ? String(tradeId) : undefined,
            orderId: orderId ? String(orderId) : undefined,

            tradeTime,

            givenCurrencyUnit: item?.givenCurrencyUnit,
            givenCurrencyAmount: item?.givenCurrencyAmount,

            takenCurrencyUnit: item?.takenCurrencyUnit,
            takenCurrencyAmount: item?.takenCurrencyAmount,

            feeCurrency: item?.feeCurrency,
            feeAmount: item?.feeAmount,

            marketType: item?.marketType,
            transactionType: item?.transactionType,
        };
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const url = buildQueryUrl(TRADES_URL);
            const response: ApiResponse = await GetRequest(url);
            const content = response?.result?.content ?? [];
            const total = Number(response?.result?.totalElements ?? 0);

            const mapped: TradeRow[] = content.map((item: any, idx: number) => normalizeItemToRow(item, idx));
            setRows(mapped);
            setTotalItems(total);
        } catch {
            setRows([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        exchangeSelected,

        appliedFilters.userId,
        appliedFilters.userIdentity,
        appliedFilters.tradeId,
        appliedFilters.givenCurrencyUnit,
        appliedFilters.takenCurrencyUnit,
        appliedFilters.marketType,
        appliedFilters.transactionType,

        currentPage,
        pageSize,
    ]);

    // ✅ badges
    const appliedBadges = useMemo(() => {
        const badges: { key: string; label: string; onRemove: () => void }[] = [];

        if (exchangeSelected) {
            badges.push({
                key: 'exchangeName',
                label: `سکو ${exchangeSelected}`,
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
                    setDraftFilters((p) => ({ ...p, userId: '' }));
                    setCurrentPage(1);
                },
            });
        }

        if (appliedFilters.tradeId) {
            badges.push({
                key: 'tradeId',
                label: `شناسه معامله ${appliedFilters.tradeId}`,
                onRemove: () => {
                    setAppliedFilters((p) => ({ ...p, tradeId: '' }));
                    setDraftFilters((p) => ({ ...p, tradeId: '' }));
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

        if (appliedFilters.givenCurrencyUnit) {
            badges.push({
                key: 'givenCurrencyUnit',
                label: `ارز پرداختی ${appliedFilters.givenCurrencyUnit}`,
                onRemove: () => {
                    setAppliedFilters((p) => ({ ...p, givenCurrencyUnit: '' }));
                    setDraftFilters((p) => ({ ...p, givenCurrencyUnit: '' }));
                    setCurrentPage(1);
                },
            });
        }

        if (appliedFilters.takenCurrencyUnit) {
            badges.push({
                key: 'takenCurrencyUnit',
                label: `ارز دریافتی ${appliedFilters.takenCurrencyUnit}`,
                onRemove: () => {
                    setAppliedFilters((p) => ({ ...p, takenCurrencyUnit: '' }));
                    setDraftFilters((p) => ({ ...p, takenCurrencyUnit: '' }));
                    setCurrentPage(1);
                },
            });
        }


        if (appliedFilters.marketType) {
            badges.push({
                key: 'marketType',
                label: `نوع بازار ${translateMarketType(appliedFilters.marketType)}`,
                onRemove: () => {
                    setAppliedFilters((p) => ({ ...p, marketType: '' }));
                    setDraftFilters((p) => ({ ...p, marketType: '' }));
                    setCurrentPage(1);
                },
            });
        }

        if (appliedFilters.transactionType) {
            badges.push({
                key: 'transactionType',
                label: `نوع تراکنش ${translateTransactionType(appliedFilters.transactionType)}`,
                onRemove: () => {
                    setAppliedFilters((p) => ({ ...p, transactionType: '' }));
                    setDraftFilters((p) => ({ ...p, transactionType: '' }));
                    setCurrentPage(1);
                },
            });
        }

        return badges;
    }, [
        exchangeSelected,
        appliedFilters.userId,
        appliedFilters.userIdentity,
        appliedFilters.tradeId,
        appliedFilters.givenCurrencyUnit,
        appliedFilters.takenCurrencyUnit,
        appliedFilters.marketType,
        appliedFilters.transactionType,
        appliedFilters.marketType,
        appliedFilters.transactionType,
    ]);

    const columns = useMemo(() => {
        return [
            {
                header: 'سکو',
                accessorKey: 'exchangeName',
                cell: (row: TradeRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{row?.exchangeName || ''}</span>
                ),
            },
            {
                header: 'شناسه کاربر',
                accessorKey: 'userId',
                cell: (row: TradeRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{row?.userId || ''}</span>
                ),
            },
            {
                header: 'هویت کاربر',
                accessorKey: 'userIdentity',
                cell: (row: TradeRow) => (
                    <span className="text-titleText dark:text-titleText-dark">
                        {translateUserIdentity(row?.userIdentity) || ''}
                    </span>
                ),
            },
            {
                header: 'زمان معامله',
                accessorKey: 'tradeTime',
                cell: (row: TradeRow) => (
                    <span className="text-titleText dark:text-titleText-dark">
                        {formatJalaliDateTime(row?.tradeTime) || ''}
                    </span>
                ),
            },
            {
                header: 'شناسه معامله',
                accessorKey: 'tradeId',
                cell: (row: TradeRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{row?.tradeId || ''}</span>
                ),
            },
            {
                header: 'شناسه سفارش',
                accessorKey: 'orderId',
                cell: (row: TradeRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{row?.orderId || ''}</span>
                ),
            },
            {
                header: 'ارز پرداختی',
                accessorKey: 'givenCurrencyUnit',
                cell: (row: TradeRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{row?.givenCurrencyUnit || ''}</span>
                ),
            },
            {
                header: 'مقدار پرداختی',
                accessorKey: 'givenCurrencyAmount',
                cell: (row: TradeRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{formatAmount(row?.givenCurrencyAmount) || ''}</span>
                ),
            },
            {
                header: 'ارز دریافتی',
                accessorKey: 'takenCurrencyUnit',
                cell: (row: TradeRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{row?.takenCurrencyUnit || ''}</span>
                ),
            },
            {
                header: 'مقدار دریافتی',
                accessorKey: 'takenCurrencyAmount',
                cell: (row: TradeRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{formatAmount(row?.takenCurrencyAmount) || ''}</span>
                ),
            },
            {
                header: 'ارز کارمزد',
                accessorKey: 'feeCurrency',
                cell: (row: TradeRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{row?.feeCurrency || ''}</span>
                ),
            },
            {
                header: 'مقدار کارمزد',
                accessorKey: 'feeAmount',
                cell: (row: TradeRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{formatAmount(row?.feeAmount) || ''}</span>
                ),
            },
            {
                header: 'نوع بازار',
                accessorKey: 'marketType',
                cell: (row: TradeRow) => (
                    <span className="text-titleText dark:text-titleText-dark">
                        {translateMarketType(row?.marketType) || row?.marketType || ''}
                    </span>
                ),
            },
            {
                header: 'نوع معامله',
                accessorKey: 'transactionType',
                cell: (row: TradeRow) => (
                    <span className="text-titleText dark:text-titleText-dark">
                        {translateTransactionType(row?.transactionType) || row?.transactionType || ''}
                    </span>
                ),
            },
        ];
    }, []);

    const handleBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === modalBackdropRef.current) {
            setDraftFilters(appliedFilters);
            setIsModalOpen(false);
        }
    };

    return (
        <div className="p-2 sm:p-0">
            <div className="mt-4">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                    {/* RIGHT (placeholder like previous page layout) */}
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
                                {/* اگر خواستی مثل صفحه واریز/برداشت، اینجا RiskSwitch بذاریم (مثلا خرید/فروش) */}
                                <RiskSwitch
                                    value={appliedFilters.transactionType}
                                    onChange={(v: string) => {
                                        const next = (v as '' | TransactionType) ?? '';
                                        setAppliedFilters((p) => ({ ...p, transactionType: next }));
                                        setDraftFilters((p) => ({ ...p, transactionType: next }));
                                        setCurrentPage(1);
                                    }}
                                    options={txTypeOptions.map((x) => ({ label: x.label, value: x.value }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* LEFT (Exchange + More Filters) */}
                    <div className="order-2 lg:order-1 w-full lg:w-auto">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 w-full justify-start">
                            <div className="relative w-full sm:w-80 text-sm text-titleText dark:text-titleText-dark">
                                <SearchableSelect
                                    label="سکو"
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
                                    placeholder="همه سکوها"
                                    allLabel="همه سکوها"
                                    searchable
                                    searchPlaceholder="جستجوی نام سکو..."
                                    className="sm:w-80 text-sm"
                                />
                            </div>

                            <div className="w-full sm:w-auto shrink-0">
                                <Button
                                    variant="ghost"
                                    className="w-full sm:w-auto px-4 py-2 bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark
                    border border-gray-300 rounded-lg dark:border-buttonBorderColor-dark outline-none shadow-none"
                                    onClick={() => {
                                        setDraftFilters(appliedFilters);
                                        setIsModalOpen(true);
                                    }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M19 3H5C3.58579 3 2.87868 3 2.43934 3.4122C2 3.8244 2 4.48782 2 5.81466V6.50448C2 7.54232 2 8.06124 2.2596 8.49142C2.5192 8.9216 2.99347 9.18858 3.94202 9.72255L6.85504 11.3624C7.49146 11.7206 7.80967 11.8998 8.03751 12.0976C8.51199 12.5095 8.80408 12.9935 8.93644 13.5872C9 13.8722 9 14.2058 9 14.8729L9 17.5424C9 18.452 9 18.9067 9.25192 19.2613C9.50385 19.6158 9.95128 19.7907 10.8462 20.1406C12.7248 20.875 13.6641 21.2422 14.3321 20.8244C15 20.4066 15 19.4519 15 17.5424V14.8729C15 14.2058 15 13.8722 15.0636 13.5872C15.1959 12.9935 15.488 12.5095 15.9625 12.0976C16.1903 11.8998 16.5085 11.7206 17.145 11.3624L20.058 9.72255C21.0065 9.18858 21.4808 8.9216 21.7404 8.49142C22 8.06124 22 7.54232 22 6.50448V5.81466C22 4.48782 22 3.8244 21.5607 3.4122C21.1213 3 20.4142 3 19 3Z"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                        />
                                    </svg>
                                    فیلترهای بیشتر
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
                            <ExpandableTable<TradeRow>
                                data={rows}
                                columns={columns as any}
                                rowDetailsMode="row"
                                rowDetailsClassName="rounded-xl p-3"
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
                                className="w-9 h-9 rounded-full flex items-center justify-center
                  bg-boxColor dark:bg-boxColor-dark border border-gray-200 dark:border-buttonBorderColor-dark
                  text-titleText dark:text-titleText-dark"
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
                                    onChange={(e) => setDraftFilters((p) => ({ ...p, userId: e.target.value }))}
                                    placeholder="مثلاً user-2105"
                                    className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-buttonBorderColor-dark
                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark outline-none"
                                />
                            </div>

                            {/* tradeId */}
                            <div className="text-sm text-titleText dark:text-titleText-dark">
                                شناسه معامله (TradeId)
                                <input
                                    value={draftFilters.tradeId}
                                    onChange={(e) => setDraftFilters((p) => ({ ...p, tradeId: e.target.value }))}
                                    placeholder="مثلاً 2233542076"
                                    className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-buttonBorderColor-dark
                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark outline-none"
                                />
                            </div>

                            {/* userIdentity */}
                            <div className="w-full">
                                <SearchableSelect
                                    label="هویت کاربر"
                                    value={draftFilters.userIdentity}
                                    onChange={(val) => setDraftFilters((p) => ({ ...p, userIdentity: val }))}
                                    options={userIdentityOptions.map((x) => ({ label: x.label, value: x.value }))}
                                    placeholder="همه"
                                    allLabel="همه"
                                    searchable={false}
                                    className="text-sm"
                                />
                            </div>

                            {/* marketType */}
                            <div className="w-full">
                                <SearchableSelect
                                    label="نوع بازار"
                                    value={draftFilters.marketType}
                                    onChange={(val) => {
                                        setDraftFilters((p) => ({ ...p, marketType: (val as MarketType) || '' }));
                                    }}
                                    options={marketTypeOptions.map((x) => ({ label: x.label, value: x.value }))}
                                    placeholder="همه"
                                    allLabel="همه"
                                    searchable={false}
                                    className="text-sm"
                                />
                            </div>

                            {/* givenCurrencyUnit */}
                            <div className="text-sm text-titleText dark:text-titleText-dark">
                                ارز پرداختی (givenCurrencyUnit)
                                <input
                                    value={draftFilters.givenCurrencyUnit}
                                    onChange={(e) => setDraftFilters((p) => ({ ...p, givenCurrencyUnit: e.target.value }))}
                                    placeholder="مثلاً BTC"
                                    className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-buttonBorderColor-dark
                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark outline-none"
                                />
                            </div>

                            {/* takenCurrencyUnit */}
                            <div className="text-sm text-titleText dark:text-titleText-dark">
                                ارز دریافتی (takenCurrencyUnit)
                                <input
                                    value={draftFilters.takenCurrencyUnit}
                                    onChange={(e) => setDraftFilters((p) => ({ ...p, takenCurrencyUnit: e.target.value }))}
                                    placeholder="مثلاً ETH"
                                    className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-buttonBorderColor-dark
                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark outline-none"
                                />
                            </div>

                            {/* transactionType */}
                            <div className="w-full">
                                <SearchableSelect
                                    label="نوع تراکنش"
                                    value={draftFilters.transactionType}
                                    onChange={(val) => {
                                        setDraftFilters((p) => ({ ...p, transactionType: (val as TransactionType) || '' }));
                                    }}
                                    options={transactionTypeOptions.map((x) => ({ label: x.label, value: x.value }))}
                                    placeholder="همه"
                                    allLabel="همه"
                                    searchable={false}
                                    className="text-sm"
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <Button
                                variant="ghost"
                                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:opacity-90"
                                onClick={() => {
                                    setAppliedFilters(draftFilters);
                                    setCurrentPage(1);
                                    setIsModalOpen(false);
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
