'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@heathmont/moon-base-tw';
import LoadingComponent from '../../../../components/LoadingComponent/LoadingComponent';
import ExpandableTable from '../../../../components/ExpandableTable/ExpandableTable';
import Pagination from '../../../../components/Pagination/Pagination';
import { GetRequest } from '../../../../functions/GetRequest';
import SearchableSelect from '../../../../components/Select/Select';
import { useSearchParams } from 'next/navigation';

type Company = {
    id: string;
    name: string;
    logo?: string;
    legalName?: string;
    registrationNumber?: string;
    siteAddress?: string;
};

type BalanceRow = {
    id: string;

    exchangeName?: string;
    cryptoBrokerId?: string;

    userId?: string;
    userIdentity?: string;

    updatedTime?: number | string; // iso/string/ts
    accountType?: string;
    currency?: string;

    amount?: number;
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

const BALANCES_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/search/balances`;

type BalanceFilters = {
    userId: string;
    userIdentity: string;
    currency: string;
};

const emptyFilters: BalanceFilters = {
    userId: '',
    userIdentity: '',
    currency: '',
};

const Page = () => {

    const sp = useSearchParams();

    const [usersLoading, setUsersLoading] = useState(false);
    const [loading, setLoading] = useState(false);

    // ✅ exchange dropdown
    const [exchangeSelected, setExchangeSelected] = useState<string>(sp.get('exchange') || '');

    // ✅ modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const modalBackdropRef = useRef<HTMLDivElement | null>(null);

    // ✅ filters (applied/draft)
    const [appliedFilters, setAppliedFilters] = useState<BalanceFilters>(emptyFilters);
    const [draftFilters, setDraftFilters] = useState<BalanceFilters>(emptyFilters);

    // ✅ data & pagination
    const [rows, setRows] = useState<BalanceRow[]>([]);
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

    const translateUserIdentity = (v?: string) => {
        if (!v) return '';
        const map: Record<string, string> = {
            individual: 'حقیقی',
            legalEntity: 'حقوقی',
            nonCitizen: 'اتباع',
            userBot: 'ربات کاربر',
            exchangeBot: 'ربات کارگزار',
            // بعضی بک‌اندها ممکنه "citizen" بفرستن
            citizen: 'ایرانی',
            non_citizen: 'اتباع',
        };
        return map[v] ?? v;
    };

    const translateAccountType = (v?: string) => {
        if (!v) return '';
        const map: Record<string, string> = {
            other: 'سایر',
            spot: 'اسپات',
            margin: 'مارجین',
            funding: 'فاندینگ',
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
                const parsed = new Date(trimmed); // ISO مثل 2025-12-20T07:55:46.592
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

    // ✅ fetch exchanges (مثل صفحه قبلی)
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

    /**
     * ✅ این دقیقاً همون چیزی هست که مشکل رو حل می‌کنه:
     * فیلترها باید Flat باشن:
     * ?currency=BTC&userId=...&exchangeName=...&userIdentity=...&page=0&size=1
     */
    const buildQueryUrl = () => {
        const params = new URLSearchParams();

        // pagination (0-based برای API)
        params.set('page', String(Math.max(0, currentPage - 1)));
        params.set('size', String(pageSize));

        // ✅ فیلترها (Flat)
        if (exchangeSelected) params.set('exchangeId', exchanges.find(item => item.name === exchangeSelected)?.id ?? '');
        if (appliedFilters.userId) params.set('userId', appliedFilters.userId);
        if (appliedFilters.userIdentity) params.set('userIdentity', appliedFilters.userIdentity);
        if (appliedFilters.currency) params.set('currency', appliedFilters.currency);

        return `${BALANCES_URL}?${params.toString()}`;
    };

    const normalizeItemToRow = (item: any, idx: number): BalanceRow => {
        const updatedTime =
            item?.updatedTime ??
            item?.updateTime ??
            item?.updated_at ??
            item?.timestamp ??
            item?.time;

        const rowId =
            String(
                item?.id ??
                `${item?.exchangeName ?? 'ex'}-${item?.userId ?? 'u'}-${item?.currency ?? 'c'}-${idx}`
            ) || `row-${currentPage}-${idx}`;

        return {
            id: rowId,

            exchangeName: item?.exchangeName,
            cryptoBrokerId: item?.cryptoBrokerId,

            userId: item?.userId,
            userIdentity: item?.userIdentity,

            updatedTime,
            accountType: item?.accountType,
            currency: item?.currency,

            amount: item?.amount,
        };
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const url = buildQueryUrl();

            const response: ApiResponse = await GetRequest(url);
            const content = response?.result?.content ?? [];
            const total = Number(response?.result?.totalElements ?? 0);

            setRows(content.map((item: any, idx: number) => normalizeItemToRow(item, idx)));
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
        appliedFilters.currency,
        currentPage,
        pageSize,
    ]);

    // ✅ badges
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
                    setDraftFilters((p) => ({ ...p, userId: '' }));
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

        if (appliedFilters.currency) {
            badges.push({
                key: 'currency',
                label: `ارز ${appliedFilters.currency}`,
                onRemove: () => {
                    setAppliedFilters((p) => ({ ...p, currency: '' }));
                    setDraftFilters((p) => ({ ...p, currency: '' }));
                    setCurrentPage(1);
                },
            });
        }

        return badges;
    }, [exchangeSelected, appliedFilters.userId, appliedFilters.userIdentity, appliedFilters.currency]);

    const columns = useMemo(() => {
        return [
            {
                header: 'کارگزاری',
                accessorKey: 'exchangeName',
                cell: (row: BalanceRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{row?.cryptoBrokerId || ''}</span>
                ),
            },
            {
                header: 'شناسه کاربر',
                accessorKey: 'userId',
                cell: (row: BalanceRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{row?.userId || ''}</span>
                ),
            },
            {
                header: 'هویت کاربر',
                accessorKey: 'userIdentity',
                cell: (row: BalanceRow) => (
                    <span className="text-titleText dark:text-titleText-dark">
                        {translateUserIdentity(row?.userIdentity) || ''}
                    </span>
                ),
            },
            {
                header: 'زمان بروزرسانی',
                accessorKey: 'updatedTime',
                cell: (row: BalanceRow) => (
                    <span className="text-titleText dark:text-titleText-dark">
                        {formatJalaliDateTime(row?.updatedTime) || ''}
                    </span>
                ),
            },
            {
                header: 'نوع حساب',
                accessorKey: 'accountType',
                cell: (row: BalanceRow) => (
                    <span className="text-titleText dark:text-titleText-dark">
                        {translateAccountType(row?.accountType) || row?.accountType || ''}
                    </span>
                ),
            },
            {
                header: 'ارز',
                accessorKey: 'currency',
                cell: (row: BalanceRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{row?.currency || ''}</span>
                ),
            },
            {
                header: 'موجودی',
                accessorKey: 'amount',
                cell: (row: BalanceRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{formatAmount(row?.amount) || ''}</span>
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
                    {/* LEFT (Exchange + More Filters) */}
                    <div className="order-1 w-full lg:w-auto">
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
                            <ExpandableTable<BalanceRow>
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
                                    placeholder="مثلاً user-8395"
                                    className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-buttonBorderColor-dark
                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark outline-none"
                                />
                            </div>

                            {/* currency */}
                            <div className="text-sm text-titleText dark:text-titleText-dark">
                                ارز (Currency)
                                <input
                                    value={draftFilters.currency}
                                    onChange={(e) => setDraftFilters((p) => ({ ...p, currency: e.target.value }))}
                                    placeholder="مثلاً BTC"
                                    className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-buttonBorderColor-dark
                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark outline-none"
                                />
                            </div>

                            {/* userIdentity */}
                            <div className="w-full md:col-span-2">
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
