'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import RiskSwitch from '../../../../components/Dashboard/ExchangeList/Switch/Switch';
import { Dropdown, MenuItem } from '@heathmont/moon-core-tw';
import { Button } from '@heathmont/moon-base-tw';
import { ControlsChevronDown } from '@heathmont/moon-icons-tw';
import LoadingComponent from '../../../../components/LoadingComponent/LoadingComponent';
import ExpandableTable from '../../../../components/ExpandableTable/ExpandableTable';
import Pagination from '../../../../components/Pagination/Pagination';
import { GetRequest } from '../../../../functions/GetRequest';
import SearchableSelect from '../../../../components/Select/Select';

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

const WITHDRAW_URL = 'https://sand-em-api.bahfara.ir/api/analytics/search/crypto-withdraws';
const DEPOSIT_URL = 'https://sand-em-api.bahfara.ir/api/analytics/search/crypto-deposits';

const Page = () => {
    const [usersLoading, setUsersLoading] = useState(false);
    const [loading, setLoading] = useState(false);

    // ✅ Switch: all/deposit/withdraw
    const [txKind, setTxKind] = useState<TxKind>('deposit');

    // ✅ exchange dropdown
    const [exchangeSelected, setExchangeSelected] = useState<string>('');
    const [exchangeSearch, setExchangeSearch] = useState<string>('');

    // ✅ modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const modalBackdropRef = useRef<HTMLDivElement | null>(null);

    // ✅ filters (modal)
    const [filterUserId, setFilterUserId] = useState<string>('');
    const [filterUserIdentity, setFilterUserIdentity] = useState<string>('');
    const [filterCryptocurrency, setFilterCryptocurrency] = useState<string>('');
    const [filterTransactionDestination, setFilterTransactionDestination] = useState<string>('');
    const [filterTransactionSource, setFilterTransactionSource] = useState<string>('');
    const [filterTransactionId, setFilterTransactionId] = useState<string>('');

    // ✅ data & pagination
    const [rows, setRows] = useState<CryptoTxRow[]>([]);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1); // 1-based

    // ✅ exchanges
    const [exchanges, setExchanges] = useState<Company[]>([]);

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

    const filteredExchanges = useMemo(() => {
        const q = exchangeSearch.trim().toLowerCase();
        if (!q) return exchanges;
        return exchanges.filter((e) => (e.name ?? '').toLowerCase().includes(q));
    }, [exchanges, exchangeSearch]);

    const buildQueryUrl = (base: string) => {
        const params = new URLSearchParams();
        params.set('page', String(Math.max(0, currentPage - 1)));
        params.set('size', String(pageSize));

        if (exchangeSelected) params.set('exchangeName', exchangeSelected);
        if (filterUserId) params.set('userId', filterUserId);
        if (filterUserIdentity) params.set('userIdentity', filterUserIdentity);
        if (filterCryptocurrency) params.set('cryptocurrency', filterCryptocurrency);
        if (filterTransactionDestination) params.set('transactionDestination', filterTransactionDestination);
        if (filterTransactionSource) params.set('transactionSource', filterTransactionSource);
        if (filterTransactionId) params.set('transactionId', filterTransactionId);

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
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        txKind,
        exchangeSelected,
        filterUserId,
        filterUserIdentity,
        filterCryptocurrency,
        filterTransactionDestination,
        filterTransactionSource,
        filterTransactionId,
        currentPage,
        pageSize,
    ]);

    // ✅ badges (no badge for txKind)
    const appliedBadges = useMemo(() => {
        const badges: { key: string; label: string; onRemove: () => void }[] = [];

        if (exchangeSelected) {
            badges.push({
                key: 'exchangeName',
                label: `صرافی ${exchangeSelected}`,
                onRemove: () => {
                    setExchangeSelected('');
                    setCurrentPage(1);
                },
            });
        }

        if (filterUserId) {
            badges.push({
                key: 'userId',
                label: `شناسه کاربر ${filterUserId}`,
                onRemove: () => {
                    setFilterUserId('');
                    setCurrentPage(1);
                },
            });
        }

        if (filterUserIdentity) {
            badges.push({
                key: 'userIdentity',
                label: `هویت ${translateUserIdentity(filterUserIdentity)}`,
                onRemove: () => {
                    setFilterUserIdentity('');
                    setCurrentPage(1);
                },
            });
        }

        if (filterCryptocurrency) {
            badges.push({
                key: 'cryptocurrency',
                label: `رمزارز ${filterCryptocurrency}`,
                onRemove: () => {
                    setFilterCryptocurrency('');
                    setCurrentPage(1);
                },
            });
        }

        if (filterTransactionDestination) {
            badges.push({
                key: 'transactionDestination',
                label: `مقصد ${filterTransactionDestination}`,
                onRemove: () => {
                    setFilterTransactionDestination('');
                    setCurrentPage(1);
                },
            });
        }

        if (filterTransactionSource) {
            badges.push({
                key: 'transactionSource',
                label: `مبدأ ${filterTransactionSource}`,
                onRemove: () => {
                    setFilterTransactionSource('');
                    setCurrentPage(1);
                },
            });
        }

        if (filterTransactionId) {
            badges.push({
                key: 'transactionId',
                label: `شناسه شبکه ${filterTransactionId}`,
                onRemove: () => {
                    setFilterTransactionId('');
                    setCurrentPage(1);
                },
            });
        }

        return badges;
    }, [
        exchangeSelected,
        filterUserId,
        filterUserIdentity,
        filterCryptocurrency,
        filterTransactionDestination,
        filterTransactionSource,
        filterTransactionId,
    ]);

    const columns = useMemo(() => {
        return [
            {
                header: 'صرافی',
                accessorKey: 'exchangeName',
                cell: (row: CryptoTxRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{row?.exchangeName || ''}</span>
                ),
            },
            {
                header: 'کارگزار رمزارز',
                accessorKey: 'cryptoBrokerId',
                cell: (row: CryptoTxRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{row?.cryptoBrokerId || ''}</span>
                ),
            },
            {
                header: 'شناسه کاربر',
                accessorKey: 'userId',
                cell: (row: CryptoTxRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{row?.userId || ''}</span>
                ),
            },
            {
                header: 'هویت کاربر',
                accessorKey: 'userIdentity',
                cell: (row: CryptoTxRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{translateUserIdentity(row?.userIdentity) || ''}</span>
                ),
            },
            {
                header: 'زمان تایید',
                accessorKey: 'confirmationTime',
                cell: (row: CryptoTxRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{formatJalaliDateTime(row?.confirmationTime) || ''}</span>
                ),
            },
            {
                header: 'رمزارز',
                accessorKey: 'cryptocurrency',
                cell: (row: CryptoTxRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{row?.cryptocurrency || ''}</span>
                ),
            },
            {
                header: 'آدرس قرارداد',
                accessorKey: 'contractAddress',
                cell: (row: CryptoTxRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{row?.contractAddress || ''}</span>
                ),
            },
            {
                header: 'شبکه',
                accessorKey: 'network',
                cell: (row: CryptoTxRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{row?.network || ''}</span>
                ),
            },
            {
                header: 'مقدار',
                accessorKey: 'amount',
                cell: (row: CryptoTxRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{formatAmount(row?.amount) || ''}</span>
                ),
            },
            {
                header: 'شناسه تراکنش',
                accessorKey: 'transactionId',
                cell: (row: CryptoTxRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{row?.transactionId || ''}</span>
                ),
            },
            {
                header: 'Memo',
                accessorKey: 'memo',
                cell: (row: CryptoTxRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{row?.memo || ''}</span>
                ),
            },
            {
                header: 'آدرس مقصد',
                accessorKey: 'transactionDestination',
                cell: (row: CryptoTxRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{row?.transactionDestination || ''}</span>
                ),
            },
            {
                header: 'آدرس مبدا',
                accessorKey: 'transactionSource',
                cell: (row: CryptoTxRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{row?.transactionSource || ''}</span>
                ),
            },
        ];
    }, []);

    const handleBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === modalBackdropRef.current) setIsModalOpen(false);
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

                            {/* more filters */}
                            <div className="w-full sm:w-auto shrink-0">
                                <Button
                                    variant="ghost"
                                    className="w-full sm:w-auto px-4 py-2 bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark
                    border border-gray-300 rounded-lg dark:border-buttonBorderColor-dark outline-none shadow-none"
                                    onClick={() => setIsModalOpen(true)}
                                >
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
                        <div className="min-w-[3000px]">
                            <ExpandableTable<CryptoTxRow>
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
                                onClick={() => setIsModalOpen(false)}
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
                                    value={filterUserId}
                                    onChange={(e) => {
                                        setFilterUserId(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="مثلاً user-2798"
                                    className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-buttonBorderColor-dark
                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark outline-none"
                                />
                            </div>

                            {/* transactionId */}
                            <div className="text-sm text-titleText dark:text-titleText-dark">
                                شناسه تراکنش (TransactionId)
                                <input
                                    value={filterTransactionId}
                                    onChange={(e) => {
                                        setFilterTransactionId(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="مثلاً 0x... یا txid"
                                    className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-buttonBorderColor-dark
                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark outline-none"
                                />
                            </div>

                            {/* userIdentity */}
                            <div className="w-full">
                                <SearchableSelect
                                    label="هویت کاربر"
                                    value={filterUserIdentity}
                                    onChange={(val) => {
                                        setFilterUserIdentity(val);
                                        setCurrentPage(1);
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
                                    value={filterCryptocurrency}
                                    onChange={(e) => {
                                        setFilterCryptocurrency(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="مثلاً BTC"
                                    className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-buttonBorderColor-dark
                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark outline-none"
                                />
                            </div>

                            {/* destination */}
                            <div className="text-sm text-titleText dark:text-titleText-dark">
                                آدرس مقصد
                                <input
                                    value={filterTransactionDestination}
                                    onChange={(e) => {
                                        setFilterTransactionDestination(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="مثلاً 0x... یا bc1..."
                                    className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-buttonBorderColor-dark
                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark outline-none"
                                />
                            </div>

                            {/* source */}
                            <div className="text-sm text-titleText dark:text-titleText-dark">
                                آدرس مبدا
                                <input
                                    value={filterTransactionSource}
                                    onChange={(e) => {
                                        setFilterTransactionSource(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="مثلاً 0x... یا bc1..."
                                    className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-buttonBorderColor-dark
                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark outline-none"
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <Button
                                variant="ghost"
                                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:opacity-90"
                                onClick={() => setIsModalOpen(false)}
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
