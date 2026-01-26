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

    isExpandedContent?: boolean;
    itemObj?: any;
    reqObj?: any;
};

type ExchangeInfoProps = {
    SetLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

/* ================= Helpers ================= */

const safeParse = (s?: string) => {
    try { return s ? JSON.parse(s) : null; } catch { return null; }
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

/* ================= Component ================= */

const ExchangeValidation = ({ SetLoading }: ExchangeInfoProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);

    const [rows, setRows] = useState<TableRow[]>([]);
    const [total, setTotal] = useState<number | null>(null);

    const [TableLoading, SetTableLoading] = useState<boolean>(false)

    const fetchData = () => {
        setLoading(true);
        SetTableLoading(true)
        setError("");

        GetRequest(
            `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/validation-violation?exchangeId=${params.id}&page=${page}&size=${size}`
        )
            .then((response: any) => {
                const content: ApiRow[] = response?.result?.content ?? [];

                const mapped: TableRow[] = content.map((r, i) => {
                    const parentId = `${page}-${i}`;

                    return {
                        id: parentId,
                        validator: r.validator ?? "—",
                        violationMessage: r.violationMessage,
                        endpointPath: r.endpointPath,
                        endpointIp: r.endpointIp,
                        timestampFa: toFa(r.timestamp),

                        subRows: [
                            {
                                id: `${parentId}-details`,
                                isExpandedContent: true,
                                itemObj: safeParse(r.item),
                                reqObj: safeParse(r.requestParams),
                            },
                        ],
                    };
                });

                setRows(mapped);
                setTotal(response?.result?.totalElements ?? null);
                SetTableLoading(false)
            })
            .catch((err: any) => {
                console.error(err);
                setError("خطا در دریافت اطلاعات از سرور");
                SetTableLoading(false)
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, [page, size]);

    /* ================= Columns ================= */

    const columns = useMemo(() => [
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
                    <div className="col-span-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 text-xs" dir="ltr">
                        <div>
                            <div className="text-slate-500 mb-1 text-[11px] uppercase">Item</div>
                            <pre className="bg-slate-100 dark:bg-slate-900 p-3 rounded-xl overflow-auto">
                                {JSON.stringify(row.itemObj, null, 2)}
                            </pre>
                        </div>
                        <div>
                            <div className="text-slate-500 mb-1 text-[11px] uppercase">Request Params</div>
                            <pre className="bg-slate-100 dark:bg-slate-900 p-3 rounded-xl overflow-auto">
                                {JSON.stringify(row.reqObj, null, 2)}
                            </pre>
                        </div>
                    </div>
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
    ], []);

    const totalItems = total ?? page * size + rows.length + size;

    /* ================= UI ================= */



    const panelBase =
        "w-full rounded-2xl bg-white dark:bg-bgColor-dark shadow-lg ring-1 ring-black/5 dark:ring-white/5";
    const params = useParams<{ id: string }>();
    const id = params.id;
    const [C1, SetC1] = useState(false);
    const [IsLoading, SetIsLoading] = useState(true);
    useEffect(() => {
        if (C1) {
            SetIsLoading(false);
        }
    }, [C1]);
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
    const cx = (...c: Array<string | false | undefined | null>) => c.filter(Boolean).join(" ");
    const [logo, SetLogo] = useState<string>("");
    const [name, SetName] = useState<string>("");
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
        <section dir="rtl" className=" space-y-4">

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

            <div className="rounded-2xl  shadow-sm ">
                {
                    TableLoading ?
                        <LoadingComponent/>
                    :
                        <ExpandableTable<TableRow> columns={columns} data={rows} />
                }
            </div>

            <Pagination
                totalItems={totalItems}
                pageSize={size}
                currentPage={page + 1}
                onPageChange={(p: number) => setPage(p - 1)}
                onPageSizeChange={(s: number) => { setSize(s); setPage(0); }}
                rtl
            />
        </section>
    );
};

export default ExchangeValidation;
