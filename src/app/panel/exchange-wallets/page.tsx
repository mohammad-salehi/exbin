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
    registrationNumber?: string | number;
    siteAddress?: string;
};

type AddressRow = {
    id: string;
    subRows?: AddressRow[];

    exchangeId: number;
    cryptoBrokerId?: string | null;
    network?: string | null;
    address: string;
    addressType?: string | null;
    userId?: string | null;
    userIdentity?: string | null;
    status?: string | null;
    updatedTime?: string | null;
    createdAt?: string | null;
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

type MoreFilters = {
    userId: string;
    addressType: string; // userWallet | coldWallet | hotWallet
    status: string; // expired | active
};

const emptyFilters: MoreFilters = {
    userId: '',
    addressType: '',
    status: '',
};

const ADDRESS_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/search/addresses`;

const addressTypeOptions: { id: string; label: string; value: string }[] = [
    { id: 'userWallet', label: 'userWallet', value: 'userWallet' },
    { id: 'coldWallet', label: 'coldWallet', value: 'coldWallet' },
    { id: 'hotWallet', label: 'hotWallet', value: 'hotWallet' },
];

const statusOptions: { id: string; label: string; value: string }[] = [
    { id: 'active', label: 'active', value: 'active' },
    { id: 'expired', label: 'expired', value: 'expired' },
];

const Page = () => {
    const sp = useSearchParams();

    const [usersLoading, setUsersLoading] = useState(false);
    const [loading, setLoading] = useState(false);

    // ✅ exchange dropdown (در UI name نگه می‌داریم مثل نمونه شما)
    const [exchangeSelected, setExchangeSelected] = useState<string>(sp.get('exchange') || '');

    // ✅ modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const modalBackdropRef = useRef<HTMLDivElement | null>(null);

    // ✅ data & pagination
    const [rows, setRows] = useState<AddressRow[]>([]);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1); // 1-based

    // ✅ exchanges
    const [exchanges, setExchanges] = useState<Company[]>([]);

    // ✅ فیلترهای اعمال‌شده روی API
    const [appliedFilters, setAppliedFilters] = useState<MoreFilters>(emptyFilters);

    // ✅ فیلترهای داخل مودال (تا وقتی Apply نزدی، اعمال نمی‌شن)
    const [draftFilters, setDraftFilters] = useState<MoreFilters>(emptyFilters);

    // ✅ fetch exchanges (مثل نمونه)
    useEffect(() => {
        setUsersLoading(true);
        GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/exchanges?page=0&size=1000`)
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

    const normalizeItemToRow = (item: any, idx: number): AddressRow => {
        const exchangeIdNum = Number(item?.exchangeId ?? 0);

        const id =
            String(
                item?.id ??
                item?.address ??
                `${exchangeIdNum}-${item?.addressType ?? ''}-${item?.status ?? ''}-${currentPage}-${idx}`
            ) || `${exchangeIdNum}-${currentPage}-${idx}`;

        return {
            id,
            exchangeId: exchangeIdNum,
            cryptoBrokerId: item?.cryptoBrokerId ?? null,
            network: item?.network ?? null,
            address: item?.address ?? '',
            addressType: item?.addressType ?? null,
            userId: item?.userId ?? null,
            userIdentity: item?.userIdentity ?? null,
            status: item?.status ?? null,
            updatedTime: item?.updatedTime ?? null,
            createdAt: item?.createdAt ?? null,
        };
    };

    const formatJalaliDateTime = (value?: string | number | null) => {
        if (!value) return '-';

        let d: Date | null = null;

        // اگر number بود (timestamp)
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

        const dateFa = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(d);

        const timeFa = new Intl.DateTimeFormat('fa-IR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }).format(d);

        return `${timeFa} ${dateFa} `;
    };


    const buildQueryUrl = () => {
        const params = new URLSearchParams();
        params.set('page', String(Math.max(0, currentPage - 1)));
        params.set('size', String(pageSize));

        // exchangeId (از روی نام انتخابی)
        if (exchangeSelected) {
            const exId = exchanges.find((item) => item.name === exchangeSelected)?.id ?? '';
            if (exId) params.set('exchangeId', exId);
        }

        // applied filters
        if (appliedFilters.userId) params.set('userId', appliedFilters.userId);
        if (appliedFilters.addressType) params.set('addressType', appliedFilters.addressType);
        if (appliedFilters.status) params.set('status', appliedFilters.status);

        return `${ADDRESS_URL}?${params.toString()}`;
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const url = buildQueryUrl();
            const response: ApiResponse = await GetRequest(url);

            const content = response?.result?.content ?? [];
            const total = Number(response?.result?.totalElements ?? 0);

            const mapped: AddressRow[] = content.map((item: any, idx: number) => normalizeItemToRow(item, idx));

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
        appliedFilters.addressType,
        appliedFilters.status,
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
                label: `کاربر ${appliedFilters.userId}`,
                onRemove: () => {
                    setAppliedFilters((p) => ({ ...p, userId: '' }));
                    setDraftFilters((p) => ({ ...p, userId: '' }));
                    setCurrentPage(1);
                },
            });
        }

        if (appliedFilters.addressType) {
            badges.push({
                key: 'addressType',
                label: `نوع کیف پول ${appliedFilters.addressType}`,
                onRemove: () => {
                    setAppliedFilters((p) => ({ ...p, addressType: '' }));
                    setDraftFilters((p) => ({ ...p, addressType: '' }));
                    setCurrentPage(1);
                },
            });
        }

        if (appliedFilters.status) {
            badges.push({
                key: 'status',
                label: `وضعیت ${appliedFilters.status}`,
                onRemove: () => {
                    setAppliedFilters((p) => ({ ...p, status: '' }));
                    setDraftFilters((p) => ({ ...p, status: '' }));
                    setCurrentPage(1);
                },
            });
        }

        return badges;
    }, [exchangeSelected, appliedFilters.userId, appliedFilters.addressType, appliedFilters.status]);


    const normalizeStatus = (s?: string | null) => (s ?? '').toString().trim().toLowerCase();

    const renderStatusBadge = (status?: string | null) => {
        const v = normalizeStatus(status);

        const isActive = v === 'active';
        const isInactive = v === 'inactive' || v === 'deactive' || v === 'diactive' || v === 'disabled';
        const isExpired = v === 'expired';

        const label =
            isActive ? 'فعال' :
                isInactive ? 'غیرفعال' :
                    isExpired ? 'منقضی' :
                        (status ?? '-');

        const cls =
            isActive
                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/40'
                : (isInactive || isExpired)
                    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/40'
                    : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/40 dark:text-gray-200 dark:border-buttonBorderColor-dark';

        return (
            <span
                className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs border whitespace-nowrap ${cls}`}
            >
                {label}
            </span>
        );
    };

    const columns = useMemo(() => {
        return [
            {
                header: 'کارگزاری',
                accessorKey: 'cryptoBrokerId',
                cell: (row: AddressRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{row?.cryptoBrokerId || `#${row.exchangeId}`}</span>
                ),
            },
            {
                header: 'کاربر',
                accessorKey: 'userId',
                cell: (row: AddressRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{row?.userId || '-'}</span>
                ),
            },
            {
                header: 'هویت',
                accessorKey: 'userIdentity',
                cell: (row: AddressRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{row?.userIdentity || '-'}</span>
                ),
            },
            {
                header: 'آدرس',
                accessorKey: 'address',
                cell: (row: AddressRow) => (
                    <span className="text-titleText dark:text-titleText-dark font-mono text-xs ">{row?.address || ''}</span>
                ),
            },
            {
                header: 'شبکه',
                accessorKey: 'network',
                cell: (row: AddressRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{row?.network || '-'}</span>
                ),
            },
            {
                header: 'نوع کیف پول',
                accessorKey: 'addressType',
                cell: (row: AddressRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{row?.addressType || '-'}</span>
                ),
            },
            {
                header: 'وضعیت',
                accessorKey: 'status',
                cell: (row: AddressRow) => renderStatusBadge(row?.status),
            },
            {
                header: 'به‌روزرسانی',
                accessorKey: 'updatedTime',
                cell: (row: AddressRow) => (
                    <span className="text-titleText dark:text-titleText-dark whitespace-nowrap">
                        {formatJalaliDateTime(row?.updatedTime)}
                    </span>
                ),
            },
            {
                header: 'ایجاد',
                accessorKey: 'createdAt',
                cell: (row: AddressRow) => (
                    <span className="text-titleText dark:text-titleText-dark whitespace-nowrap">
                        {formatJalaliDateTime(row?.createdAt)}
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

    return (
        <div className="p-2 sm:p-0">
            <div className="mt-4">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
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
                                    className="w-full sm:w-auto px-4 py-2 bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark
                    border border-gray-300 rounded-lg dark:border-buttonBorderColor-dark outline-none shadow-none"
                                    onClick={() => {
                                        setDraftFilters(appliedFilters); // ✅ کپی مقدارهای فعلی
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
                        <ExpandableTable<AddressRow>
                            data={rows}
                            columns={columns as any}
                            rowDetailsMode="row"
                            rowDetailsClassName="rounded-xl p-3"
                        />
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
                                کاربر
                                <input
                                    value={draftFilters.userId}
                                    onChange={(e) => setDraftFilters((p) => ({ ...p, userId: e.target.value }))}
                                    placeholder="مثلاً user-9317"
                                    className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-buttonBorderColor-dark
                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark outline-none"
                                />
                            </div>

                            {/* addressType */}
                            <div className="w-full">
                                <SearchableSelect
                                    label="نوع کیف پول"
                                    value={draftFilters.addressType}
                                    onChange={(val) => setDraftFilters((p) => ({ ...p, addressType: val }))}
                                    options={addressTypeOptions.map((x) => ({ id: x.id, label: x.label, value: x.value }))}
                                    placeholder="همه"
                                    allLabel="همه"
                                    searchable={false}
                                    className="text-sm"
                                />
                            </div>

                            {/* status */}
                            <div className="w-full">
                                <SearchableSelect
                                    label="وضعیت"
                                    value={draftFilters.status}
                                    onChange={(val) => setDraftFilters((p) => ({ ...p, status: val }))}
                                    options={statusOptions.map((x) => ({ id: x.id, label: x.label, value: x.value }))}
                                    placeholder="همه"
                                    allLabel="همه"
                                    searchable={false}
                                    className="text-sm"
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                className="px-4 py-2 rounded-lg bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark
                  border border-gray-200 dark:border-buttonBorderColor-dark"
                                onClick={() => {
                                    setDraftFilters(appliedFilters);
                                    setIsModalOpen(false);
                                }}
                            >
                                انصراف
                            </Button>

                            <Button
                                variant="ghost"
                                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:opacity-90"
                                onClick={() => {
                                    setAppliedFilters(draftFilters); // ✅ اعمال واقعی فیلترها
                                    setCurrentPage(1); // ✅ ریست صفحه
                                    setIsModalOpen(false); // ✅ بستن مودال
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
