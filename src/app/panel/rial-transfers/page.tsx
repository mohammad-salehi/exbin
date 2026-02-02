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
import { useSearchParams } from 'next/navigation';

type TransactionType = 'all' | 'deposit' | 'withdraw' | 'refund';

type Company = {
    id: string;
    name: string;
    logo?: string;
    legalName?: string;
    registrationNumber?: string;
    siteAddress?: string;
};

type IrrTransactionRow = {
    id: string; // ✅ مهم برای جدول
    subRows?: IrrTransactionRow[]; // ✅ برای سازگاری با ExpandableTable

    exchangeName?: string;
    cryptoBrokerId?: string;
    transactionReferenceId?: string;
    irrTransactionId?: string;
    userId?: string;
    userIdentity?: string;
    transactionStatus?: string;
    transactionTime?: string | number;
    transferPlatform?: string;
    amount?: number;
    paymentFacilitator?: string;
    transactionReason?: string;
    transactionType?: string;
    exchangeAcctDataType?: string;
    exchangeAcctData?: string;
    exchangeBankId?: string;
};

type ApiResponse = {
    result?: {
        content?: any[];
        totalElements?: number;
        totalPages?: number;
        size?: number;
        number?: number; // page index
    };
};

const Page = () => {

    const sp = useSearchParams();

    const [usersLoading, setUsersLoading] = useState(false);
    const [loading, setLoading] = useState(false);

    // ✅ سوییچ نوع تراکنش
    const [transactionType, setTransactionType] = useState<TransactionType>('all');

    // ✅ انتخاب کارگزاری در صفحه اصلی (فیلتر exchangeName)
    const [exchangeSelected, setExchangeSelected] = useState<string>(sp.get('exchange') || '');
    const [exchangeSearch, setExchangeSearch] = useState<string>('');

    // ✅ مودال فیلترهای بیشتر (فقط 4 فیلتر: userId, userIdentity, irrTransactionId, transactionType از سوییچ است نه مودال)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const modalBackdropRef = useRef<HTMLDivElement | null>(null);

    const [filterUserId, setFilterUserId] = useState<string>('');
    const [filterUserIdentity, setFilterUserIdentity] = useState<string>('');
    const [filterIrrTransactionId, setFilterIrrTransactionId] = useState<string>('');

    // ✅ دیتا و صفحه‌بندی
    const [rows, setRows] = useState<IrrTransactionRow[]>([]);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number>(12);
    const [currentPage, setCurrentPage] = useState<number>(1); // 1-based

    // ✅ لیست صرافی‌ها
    const [exchanges, setExchanges] = useState<Company[]>([]);

    const transactionTypeOptions: { label: string; value: TransactionType }[] = [
        { label: 'همه', value: 'all' },
        { label: 'واریز', value: 'deposit' },
        { label: 'برداشت', value: 'withdraw' },
        { label: 'برگشت‌خورده', value: 'refund' },
    ];

    // ✅ state های داخل مودال (Draft)
    const [draftUserId, setDraftUserId] = useState<string>('');
    const [draftUserIdentity, setDraftUserIdentity] = useState<string>('');
    const [draftIrrTransactionId, setDraftIrrTransactionId] = useState<string>('');

    // ✅ وقتی مودال باز شد، draft رو از فیلترهای اعمال‌شده پر کن
    useEffect(() => {
        if (isModalOpen) {
            setDraftUserId(filterUserId);
            setDraftUserIdentity(filterUserIdentity);
            setDraftIrrTransactionId(filterIrrTransactionId);
        }
    }, [isModalOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    // ✅ اعمال فیلترهای مودال فقط با دکمه
    const applyModalFilters = () => {
        setFilterUserId(draftUserId);
        setFilterUserIdentity(draftUserIdentity);
        setFilterIrrTransactionId(draftIrrTransactionId);
        setCurrentPage(1);
        setIsModalOpen(false);
    };

    // ✅ (اختیاری) پاک کردن draft داخل مودال
    const clearModalFilters = () => {
        setDraftUserId('');
        setDraftUserIdentity('');
        setDraftIrrTransactionId('');
    };

    // ✅ گزینه‌های userIdentity مطابق داک
    const userIdentityOptions: { label: string; value: string }[] = [
        { label: 'حقیقی', value: 'individual' },
        { label: 'حقوقی', value: 'legalEntity' },
        { label: 'اتباع', value: 'nonCitizen' },
        { label: 'ربات کاربر', value: 'userBot' },
        { label: 'ربات کارگزار', value: 'exchangeBot' },
    ];

    const translateTransactionType = (v?: string) => {
        if (!v) return '';
        if (v === 'deposit') return 'واریز';
        if (v === 'withdraw') return 'برداشت';
        if (v === 'refund') return 'برگشت‌خورده';
        return v;
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

    const translateTransactionStatus = (v?: string) => {
        if (!v) return '';
        const map: Record<string, string> = {
            known: 'معلوم',
            unknown: 'نامعلوم',
            corrected: 'اصلاحی',
        };
        return map[v] ?? v;
    };

    const translateTransferPlatform = (v?: string) => {
        if (!v) return '';
        const map: Record<string, string> = {
            gateway: 'درگاه بانکی',
            paya: 'پایا',
            satna: 'ساتنا',
            pol: 'پل',
            idTransfer: 'واریز شناسه‌دار',
            card: 'کارت به کارت',
            intraBankTransfer: 'درون بانکی',
            checkTransfer: 'چکاوک',
            other: 'غیره',
        };
        return map[v] ?? v;
    };

    const translateExchangeAcctDataType = (v?: string) => {
        if (!v) return '';
        const map: Record<string, string> = {
            account: 'حساب',
            card: 'کارت',
            shaba: 'شبا',
        };
        return map[v] ?? v;
    };

    const formatAmountIRR = (n?: number) => {
        if (n === null || n === undefined || Number.isNaN(Number(n))) return '';
        return `${Number(n).toLocaleString()} ریال`;
    };

    const formatJalaliDateTime = (value?: string | number) => {
        if (value === null || value === undefined || value === '') return '';
        let d: Date | null = null;

        if (typeof value === 'number') {
            // unix ms
            d = new Date(value);
        } else {
            // string: ISO or numeric-string
            const asNum = Number(value);
            if (!Number.isNaN(asNum) && value.trim() !== '' && value.trim().length >= 10) {
                // اگر عدد بزرگ بود (ms)
                d = new Date(asNum);
            } else {
                const parsed = new Date(value);
                if (!Number.isNaN(parsed.getTime())) d = parsed;
            }
        }

        if (!d || Number.isNaN(d.getTime())) return String(value);

        // ✅ شمسی با مرورگر
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

    // ✅ لیست صرافی‌ها
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

    // ✅ ساخت URL مطابق چیزی که گفتی (بدون request.)
    const buildQueryUrl = () => {
        const base = process.env.NEXT_PUBLIC_API_URL + `/api/analytics/search/irr-transactions`;

        const params = new URLSearchParams();

        // pageable.* دقیقاً مثل swagger
        params.set('pageable.page', String(Math.max(0, currentPage - 1)));
        params.set('pageable.size', String(pageSize));

        // transactionType: اگر all بود، نفرست
        if (transactionType !== 'all') params.set('transactionType', transactionType);

        // exchangeName از dropdown صفحه اصلی
        if (exchangeSelected) params.set('exchangeId', exchanges.find(item => item.name === exchangeSelected)?.id ?? '');

        // فیلترهای مودال
        if (filterUserId) params.set('userId', filterUserId);
        if (filterUserIdentity) params.set('userIdentity', filterUserIdentity);
        if (filterIrrTransactionId) params.set('irrTransactionId', filterIrrTransactionId);

        return `${base}?${params.toString()}`;
    };

    const fetchData = () => {
        setLoading(true);
        const url = buildQueryUrl();

        GetRequest(url)
            .then((response: ApiResponse) => {
                const content = response?.result?.content ?? [];
                const total = Number(response?.result?.totalElements ?? 0);

                const mapped: IrrTransactionRow[] = content.map((item: any, idx: number) => ({
                    id: String(item?.irrTransactionId ?? item?.transactionReferenceId ?? item?.userId ?? `${currentPage}-${idx}`),

                    exchangeName: item?.exchangeName,
                    cryptoBrokerId: item?.cryptoBrokerId,
                    transactionReferenceId: item?.transactionReferenceId,
                    irrTransactionId: item?.irrTransactionId,
                    userId: item?.userId,
                    userIdentity: item?.userIdentity,
                    transactionStatus: item?.transactionStatus,
                    transactionTime: item?.transactionTime,
                    transferPlatform: item?.transferPlatform,
                    amount: item?.amount,
                    paymentFacilitator: item?.paymentFacilitator,
                    transactionReason: item?.transactionReason,
                    transactionType: item?.transactionType,
                    exchangeAcctDataType: item?.exchangeAcctDataType,
                    exchangeAcctData: item?.exchangeAcctData,
                    exchangeBankId: item?.exchangeBankId,
                }));

                setRows(mapped);
                console.log('mapped')
                console.log(mapped)
                setTotalItems(total);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    // ✅ هر تغییری در فیلترها/صفحه => دوباره گرفتن دیتا
    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        transactionType,
        exchangeSelected,
        filterUserId,
        filterUserIdentity,
        filterIrrTransactionId,
        currentPage,
        pageSize,
    ]);

    // ✅ بَج‌ها (بدون badge برای transactionType)
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

        if (filterIrrTransactionId) {
            badges.push({
                key: 'irrTransactionId',
                label: `شناسه تراکنش ${filterIrrTransactionId}`,
                onRemove: () => {
                    setFilterIrrTransactionId('');
                    setCurrentPage(1);
                },
            });
        }

        return badges;
    }, [exchangeSelected, filterUserId, filterUserIdentity, filterIrrTransactionId]);

    // ✅ ستون‌های جدول (همه چیز نمایش داده بشه)
    const columns = useMemo(() => {
        return [
            {
                header: 'نوع تراکنش',
                accessorKey: 'transactionType',
                cell: (row: IrrTransactionRow) => {
                    return (
                        <span className="text-titleText dark:text-titleText-dark">
                            {translateTransactionType(row?.transactionType) || ''}
                        </span>
                    )
                }
                ,
            },
            {
                header: 'کارگزاری',
                accessorKey: 'exchangeName',
                cell: (row: IrrTransactionRow) => (
                    <span className="text-titleText dark:text-titleText-dark">
                        {row?.cryptoBrokerId || ''}
                    </span>
                ),
            },
            {
                header: 'شناسه مرجع',
                accessorKey: 'transactionReferenceId',
                cell: (row: IrrTransactionRow) => (
                    <span className="text-titleText dark:text-titleText-dark">
                        {row?.transactionReferenceId || ''}
                    </span>
                ),
            },
            {
                header: 'شناسه تراکنش',
                accessorKey: 'irrTransactionId',
                cell: (row: IrrTransactionRow) => (
                    <span className="text-titleText dark:text-titleText-dark">
                        {row?.irrTransactionId || ''}
                    </span>
                ),
            },
            {
                header: 'شناسه کاربر',
                accessorKey: 'userId',
                cell: (row: IrrTransactionRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{row?.userId || ''}</span>
                ),
            },
            {
                header: 'هویت کاربر',
                accessorKey: 'userIdentity',
                cell: (row: IrrTransactionRow) => (
                    <span className="text-titleText dark:text-titleText-dark">
                        {translateUserIdentity(row?.userIdentity) || ''}
                    </span>
                ),
            },
            {
                header: 'وضعیت',
                accessorKey: 'transactionStatus',
                cell: (row: IrrTransactionRow) => (
                    <span className="text-titleText dark:text-titleText-dark">
                        {translateTransactionStatus(row?.transactionStatus) || ''}
                    </span>
                ),
            },
            {
                header: 'تاریخ',
                accessorKey: 'transactionTime',
                cell: (row: IrrTransactionRow) => (
                    <span className="text-titleText dark:text-titleText-dark">
                        {formatJalaliDateTime(row?.transactionTime) || ''}
                    </span>
                ),
            },
            {
                header: 'بستر انتقال',
                accessorKey: 'transferPlatform',
                cell: (row: IrrTransactionRow) => (
                    <span className="text-titleText dark:text-titleText-dark">
                        {translateTransferPlatform(row?.transferPlatform) || ''}
                    </span>
                ),
            },
            {
                header: 'مبلغ',
                accessorKey: 'amount',
                cell: (row: IrrTransactionRow) => (
                    <span className="text-titleText dark:text-titleText-dark">
                        {formatAmountIRR(row?.amount) || ''}
                    </span>
                ),
            },
            {
                header: 'پرداخت‌یار',
                accessorKey: 'paymentFacilitator',
                cell: (row: IrrTransactionRow) => (
                    <span className="text-titleText dark:text-titleText-dark">
                        {row?.paymentFacilitator || ''}
                    </span>
                ),
            },
            {
                header: 'علت تراکنش',
                accessorKey: 'transactionReason',
                cell: (row: IrrTransactionRow) => (
                    <span className="text-titleText dark:text-titleText-dark">
                        {row?.transactionReason || ''}
                    </span>
                ),
            },
            {
                header: 'نوع داده حساب',
                accessorKey: 'exchangeAcctDataType',
                cell: (row: IrrTransactionRow) => (
                    <span className="text-titleText dark:text-titleText-dark">
                        {translateExchangeAcctDataType(row?.exchangeAcctDataType) || ''}
                    </span>
                ),
            },
            {
                header: 'داده حساب',
                accessorKey: 'exchangeAcctData',
                cell: (row: IrrTransactionRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{row?.exchangeAcctData || ''}</span>
                ),
            },
            {
                header: 'بانک',
                accessorKey: 'exchangeBankId',
                cell: (row: IrrTransactionRow) => (
                    <span className="text-titleText dark:text-titleText-dark">{row?.exchangeBankId || ''}</span>
                ),
            },
        ];
    }, []);

    // ✅ بستن مودال با کلیک بیرون
    const handleBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === modalBackdropRef.current) {
            setIsModalOpen(false);
        }
    };

    return (
        <div className='p-2 sm:p-0'>
            <div className="mt-4">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4" dir="rtl">
                    {/* RIGHT (Switch) */}
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
                                    value={transactionType}
                                    onChange={(v: string) => {
                                        const next = (v as TransactionType) ?? "all";
                                        setTransactionType(next);
                                        setCurrentPage(1);
                                    }}
                                    options={transactionTypeOptions.map((x) => ({ label: x.label, value: x.value }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* LEFT (Exchange + More Filters) */}
                    <div className="order-2 lg:order-1 w-full lg:w-auto">
                        {/* ✅ موبایل: ستونی و تمام عرض | از sm به بعد: ردیفی مثل قبل */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 w-full justify-start">
                            {/* انتخاب کارگزاری */}
                            <SearchableSelect
                                label="کارگزاری"
                                value={exchangeSelected}
                                onChange={(val) => {
                                    setExchangeSelected(val);
                                    setCurrentPage(1);
                                }}
                                loading={usersLoading}
                                placeholder="همه کارگزاریها"
                                allLabel="همه کارگزاریها"
                                searchable
                                searchPlaceholder="جستجوی نام کارگزاری..."
                                options={filteredExchanges.map((e) => ({
                                    id: e.id,
                                    label: e.name,
                                    value: e.name,
                                }))}
                                className="w-full sm:w-80 text-sm"
                                direction="rtl"
                            />

                            {/* فیلترهای بیشتر */}
                            <div className="w-full sm:w-auto shrink-0">
                                <Button
                                    variant="ghost"
                                    className="w-full sm:w-auto px-4 py-2 bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark
            border border-gray-300 rounded-lg dark:border-buttonBorderColor-dark outline-none shadow-none"
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M19 3H5C3.58579 3 2.87868 3 2.43934 3.4122C2 3.8244 2 4.48782 2 5.81466V6.50448C2 7.54232 2 8.06124 2.2596 8.49142C2.5192 8.9216 2.99347 9.18858 3.94202 9.72255L6.85504 11.3624C7.49146 11.7206 7.80967 11.8998 8.03751 12.0976C8.51199 12.5095 8.80408 12.9935 8.93644 13.5872C9 13.8722 9 14.2058 9 14.8729L9 17.5424C9 18.452 9 18.9067 9.25192 19.2613C9.50385 19.6158 9.95128 19.7907 10.8462 20.1406C12.7248 20.875 13.6641 21.2422 14.3321 20.8244C15 20.4066 15 19.4519 15 17.5424V14.8729C15 14.2058 15 13.8722 15.0636 13.5872C15.1959 12.9935 15.488 12.5095 15.9625 12.0976C16.1903 11.8998 16.5085 11.7206 17.145 11.3624L20.058 9.72255C21.0065 9.18858 21.4808 8.9216 21.7404 8.49142C22 8.06124 22 7.54232 22 6.50448V5.81466C22 4.48782 22 3.8244 21.5607 3.4122C21.1213 3 20.4142 3 19 3Z" stroke="currentColor" stroke-width="1.5" />
                                    </svg>
                                    فیلترهای بیشتر
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 2: Badges */}
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

                            {/* ✅ ضربدر: بدون border + هم‌رنگ بک‌گراند badge + فقط hover کمی پررنگ‌تر */}
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


            {/* جدول */}
            <div className="mt-4">
                {loading ? (
                    <LoadingComponent />
                ) : (
                    <div className="mt-4 w-full overflow-x-auto">
                        <div className="">
                            <ExpandableTable<IrrTransactionRow>
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
                    onPageChange={(p: number) => {
                        setCurrentPage(p);
                    }}
                />
            </div>

            {/* مودال */}
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
                                    value={draftUserId}
                                    onChange={(e) => setDraftUserId(e.target.value)}
                                    placeholder=""
                                    className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-buttonBorderColor-dark
    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark outline-none"
                                />
                            </div>

                            {/* irrTransactionId */}
                            <div className="text-sm text-titleText dark:text-titleText-dark">
                                شناسه تراکنش
                                <input
                                    value={draftIrrTransactionId}
                                    onChange={(e) => setDraftIrrTransactionId(e.target.value)}
                                    placeholder=""
                                    className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-buttonBorderColor-dark
    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark outline-none"
                                />
                            </div>

                            {/* userIdentity (Select مثل سلکت کارگزاری) */}
                            <SearchableSelect
                                label="هویت کاربر"
                                value={draftUserIdentity}
                                onChange={(val) => setDraftUserIdentity(val)}
                                placeholder="همه"
                                allLabel="همه"
                                searchable={false}
                                options={userIdentityOptions.map((o) => ({
                                    id: o.value,
                                    label: o.label,
                                    value: o.value,
                                }))}
                                className="w-full text-sm"
                                direction="rtl"
                            />
                        </div>

                        {/* دکمه اعمال (فقط بستن مودال، چون فیلترها لحظه‌ای اعمال می‌شن) */}
                        <div className="mt-4 flex justify-end">
                            <Button
                                variant="ghost"
                                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:opacity-90"
                                onClick={applyModalFilters}
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
