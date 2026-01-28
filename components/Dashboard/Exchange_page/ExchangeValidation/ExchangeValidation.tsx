"use client";

import React, { useEffect, useMemo, useState } from "react";
import ExpandableTable from "../../../ExpandableTable/ExpandableTable";
import Pagination from "../../../Pagination/Pagination";
import { GetRequest } from "../../../../functions/GetRequest";
import { useParams } from "next/navigation";
import LoadingComponent from "../../../LoadingComponent/LoadingComponent";

/* ================= Types ================= */

type ApiRow = {
    validator: string | null;
    violationMessage: string;
    endpointIp: string;
    endpointPath: string;
    item: string;
    requestParams: string;
    timestamp: string;
};

type TableRow = {
    id: string;
    subRows?: TableRow[];

    validator?: string;
    violationMessage?: string;
    endpointPath?: string;
    endpointIp?: string;
    timestampFa?: string;

    // expanded (قدیمی) - می‌تونی بعداً حذفش کنی
    isExpandedContent?: boolean;
    itemObj?: any;
    reqObj?: any;

    // جدید: دیتای مودال
    modalItemObj?: any;
    modalReqObj?: any;
};

type ExchangeInfoProps = {
    SetLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

/* ================= Helpers ================= */

const safeParse = (s?: string) => {
    try {
        return s ? JSON.parse(s) : null;
    } catch {
        return null;
    }
};

const toFa = (iso?: string) => {
    try {
        return iso
            ? new Date(iso).toLocaleString("fa-IR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            })
            : "—";
    } catch {
        return iso ?? "—";
    }
};

/* ================= Small UI bits ================= */

const IconButton = ({
    onClick,
    title,
}: {
    onClick: () => void;
    title?: string;
}) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        className="inline-flex items-center justify-center w-9 h-9 rounded-xl
               bg-boxColor dark:bg-boxColor-dark
               border border-boxBorderColor dark:border-boxBorderColor-dark
               text-titleText dark:text-titleText-dark
               hover:opacity-90 active:scale-[0.98] transition"
    >
        {/* آیکون info */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
                d="M12 17v-6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
            <path
                d="M12 7.5h.01"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
            />
            <path
                d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                stroke="currentColor"
                strokeWidth="1.8"
            />
        </svg>
    </button>
);

const JsonBox = ({ value }: { value: any }) => (
    <pre className="bg-slate-100 dark:bg-slate-900 text-titleText dark:text-titleText-dark p-3 rounded-xl overflow-auto text-xs leading-6 max-h-[55vh]">
        {JSON.stringify(value ?? {}, null, 2)}
    </pre>
);

const Modal = ({
    open,
    onClose,
    title,
    children,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60]">
            {/* بک‌دراپ فقط برای ظاهر */}
            <div className="absolute inset-0 bg-black/40" aria-hidden="true" />

            {/* این لایه کل صفحه را می‌گیرد و با کلیک بیرون می‌بندد */}
            <div
                className="absolute inset-0 flex items-center justify-center p-4"
                onClick={onClose} // ✅ کلیک بیرون مودال => بسته
                role="dialog"
                aria-modal="true"
            >
                {/* پنل: کلیک داخل پنل نباید مودال را ببندد */}
                <div
                    className="w-full max-w-5xl rounded-2xl bg-white dark:bg-bgColor-dark shadow-2xl ring-1 ring-black/10 dark:ring-white/10"
                    dir="rtl"
                    onClick={(e) => e.stopPropagation()} // ✅ جلوگیری از بسته شدن با کلیک داخل پنل
                >
                    <div className="flex items-center justify-between gap-3 p-4 border-b border-black/5 dark:border-white/10">
                        <h4 className="text-base font-extrabold text-titleText dark:text-titleText-dark">
                            {title}
                        </h4>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-9 h-9 grid place-items-center rounded-xl
                           bg-boxColor dark:bg-boxColor-dark
                           border border-boxBorderColor dark:border-boxBorderColor-dark text-titleText dark:text-titleText-dark"
                            aria-label="بستن"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="p-4">{children}</div>
                </div>
            </div>
        </div>
    );
};



/* ================= Component ================= */

const ExchangeValidation = ({ SetLoading }: ExchangeInfoProps) => {
    const params = useParams<{ id: string }>();
    const id = params.id;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);

    const [rows, setRows] = useState<TableRow[]>([]);
    const [total, setTotal] = useState<number | null>(null);

    const [TableLoading, SetTableLoading] = useState<boolean>(false);

    // ===== مودال =====
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selected, setSelected] = useState<{
        req: any;
        item: any;
        meta?: {
            endpointPath?: string;
            endpointIp?: string;
            timestampFa?: string;
            validator?: string;
        };
    } | null>(null);

    const openDetails = (row: TableRow) => {
        setSelected({
            req: row.modalReqObj,
            item: row.modalItemObj,
            meta: {
                endpointPath: row.endpointPath,
                endpointIp: row.endpointIp,
                timestampFa: row.timestampFa,
                validator: row.validator,
            },
        });
        setDetailsOpen(true);
    };

    const fetchData = () => {
        setLoading(true);
        SetTableLoading(true);
        setError("");

        GetRequest(
            `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/validation-violation?exchangeId=${id}&page=${page}&size=${size}`
        )
            .then((response: any) => {
                const content: ApiRow[] = response?.result?.content ?? [];

                const mapped: TableRow[] = content.map((r, i) => {
                    const parentId = `${page}-${i}`;

                    const itemObj = safeParse(r.item);
                    const reqObj = safeParse(r.requestParams);

                    return {
                        id: parentId,
                        validator: r.validator ?? "—",
                        violationMessage: r.violationMessage,
                        endpointPath: r.endpointPath,
                        endpointIp: r.endpointIp,
                        timestampFa: toFa(r.timestamp),

                        // دیتای مودال
                        modalItemObj: itemObj,
                        modalReqObj: reqObj,

                        // اگر دیگه expanded نمی‌خوای، این subRows رو می‌تونی حذف کنی
                        subRows: [
                            {
                                id: `${parentId}-details`,
                                isExpandedContent: true,
                                itemObj,
                                reqObj,
                            },
                        ],
                    };
                });

                setRows(mapped);
                setTotal(response?.result?.totalElements ?? null);
                SetTableLoading(false);
            })
            .catch((err: any) => {
                console.error(err);
                setError("خطا در دریافت اطلاعات از سرور");
                SetTableLoading(false);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, [page, size]);

    /* ================= Columns ================= */

    const columns = useMemo(
        () => [
            {
                header: "#",
                cell: (row: TableRow) =>
                    row.isExpandedContent ? "" : Number(row.id.split("-")[1]) + 1,
                width: 60,
            },
            {
                header: "پیام خطا",
                cell: (row: TableRow) =>
                    row.isExpandedContent ? (
                        ""
                    ) : (
                        <span className="font-medium text-slate-800 dark:text-slate-100">
                            {row.violationMessage}
                        </span>
                    ),
            },
            {
                header: "Endpoint",
                cell: (row: TableRow) => (row.isExpandedContent ? "" : row.endpointPath),
                width: 220,
            },
            {
                header: "IP",
                cell: (row: TableRow) => (row.isExpandedContent ? "" : row.endpointIp),
                width: 140,
            },
            {
                header: "Validator",
                cell: (row: TableRow) => (row.isExpandedContent ? "" : row.validator),
                width: 260,
            },
            {
                header: "زمان",
                cell: (row: TableRow) => (row.isExpandedContent ? "" : row.timestampFa),
                width: 180,
            },
            {
                header: "جزئیات",
                width: 90,
                cell: (row: TableRow) =>
                    row.isExpandedContent ? (
                        ""
                    ) : (
                        <div className="flex justify-center">
                            <IconButton
                                title="نمایش requestParams و item"
                                onClick={() => openDetails(row)}
                            />
                        </div>
                    ),
            },
        ],
        []
    );

    const totalItems = total ?? page * size + rows.length + size;

    /* ================= UI (existing code) ================= */

    const panelBase =
        "w-full rounded-2xl bg-white dark:bg-bgColor-dark shadow-lg ring-1 ring-black/5 dark:ring-white/5";

    const [C1, SetC1] = useState(false);
    const [IsLoading, SetIsLoading] = useState(true);
    useEffect(() => {
        if (C1) SetIsLoading(false);
    }, [C1]);
    useEffect(() => {
        SetLoading(IsLoading);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [IsLoading]);

    const cx = (...c: Array<string | false | undefined | null>) =>
        c.filter(Boolean).join(" ");

    const [logo, SetLogo] = useState<string>("");
    const [name, SetName] = useState<string>("");

    // نام و لوگو
    useEffect(() => {
        GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/exchanges/${id}`)
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

    const logoNode = useMemo(() => {
        if (logo)
            return <img alt="logo" className="w-8 h-8 object-contain" src={logo} />;
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
        <section dir="rtl" className="space-y-4">
            <div className="flex justify-between items-center">
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
                    </div>
                </div>
            </div>

            {error && (
                <div className="rounded-xl bg-red-50 text-red-600 text-sm p-3 border border-red-200">
                    {error}
                </div>
            )}

            <div className="rounded-2xl shadow-sm">
                {TableLoading ? (
                    <LoadingComponent />
                ) : (
                    <ExpandableTable<TableRow> columns={columns} data={rows} />
                )}
            </div>

            <Pagination
                totalItems={totalItems}
                pageSize={size}
                currentPage={page + 1}
                onPageChange={(p: number) => setPage(p - 1)}
                onPageSizeChange={(s: number) => {
                    setSize(s);
                    setPage(0);
                }}
                rtl
            />

            {/* ===== Modal ===== */}
            <Modal
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                title="جزئیات درخواست و آیتم"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div dir="ltr">
                        <div className="text-slate-500 mb-2 text-[11px] uppercase">
                            Item (returned item)
                        </div>
                        <JsonBox value={selected?.item} />
                    </div>

                    <div dir="ltr">
                        <div className="text-slate-500 mb-2 text-[11px] uppercase">
                            Request Params (sent to server)
                        </div>
                        <JsonBox value={selected?.req} />
                    </div>

                </div>

                {/* meta */}
                <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-black/5 dark:border-white/10 p-3 text-xs">
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-600 dark:text-slate-300">
                        <span>
                            <span className="text-slate-400">Endpoint:</span>{" "}
                            <span dir="ltr">{selected?.meta?.endpointPath ?? "—"}</span>
                        </span>
                        <span>
                            <span className="text-slate-400">IP:</span>{" "}
                            <span dir="ltr">{selected?.meta?.endpointIp ?? "—"}</span>
                        </span>
                        <span>
                            <span className="text-slate-400">Time:</span>{" "}
                            <span dir="ltr">{selected?.meta?.timestampFa ?? "—"}</span>
                        </span>
                    </div>
                </div>
            </Modal>
        </section>
    );
};

export default ExchangeValidation;
