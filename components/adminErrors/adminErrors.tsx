'use client';

import React, { JSX, useEffect, useMemo, useState } from 'react';
import { Button } from '@heathmont/moon-base-tw';
import ExpandableTable from '../ExpandableTable/ExpandableTable';
import Pagination from '../Pagination/Pagination';
import LoadingComponent from '../LoadingComponent/LoadingComponent';
import { GetRequest } from '../../functions/GetRequest';

// -------------------- Types --------------------
type Severity = 'ERROR' | 'WARN' | 'WARNING' | 'INFO' | 'DEBUG' | 'FATAL' | string;

type ProjectExceptionRow = {
  id: string;

  exceptionClass?: string;
  cause?: string;

  rootCauseClass?: string;
  rootCauseMessage?: string;

  stackTrace?: string;

  className?: string;
  methodName?: string;
  lineNumber?: number;
  fileName?: string;

  threadName?: string;
  hostName?: string;

  severity?: Severity;
  context?: unknown;

  timestamp?: string;
  createdAt?: string;
};

type PagedResult<T> = {
  content: T[];
  totalPages?: number;
  totalElements?: number;
  number?: number;
  size?: number;
};

type ApiResponse<T> = {
  result: T;
};

// اگر ExpandableTable شما Column type خاص خودش رو داره، این type رو با همون replace کن
type Column<T> = {
  header: string;
  width?: number;
  cell: (row: T) => React.ReactNode;
};

// -------------------- Helpers --------------------
const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');

const safeJson = (val: unknown): string => {
  if (val == null) return '';
  if (typeof val === 'object') {
    try {
      return JSON.stringify(val, null, 2);
    } catch {
      return String(val);
    }
  }
  const s = String(val);
  try {
    const parsed = JSON.parse(s);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return s;
  }
};

const truncate = (s: unknown, n = 90) => {
  if (s == null) return '-';
  const str = String(s);
  if (str.length <= n) return str;
  return str.slice(0, n) + '…';
};

// ✅ قبلی (میلادی)
// const formatTs = (s?: string) => {
//   if (!s) return '-';
//   return String(s).replace('T', ' ').slice(0, 23);
// };

// ✅ جدید: تبدیل تاریخ به شمسی (با ساعت)
// ورودی می‌تونه ISO string یا timestamp عددی (sec/ms) یا string عددی باشه
const formatJalaliDateTime = (value?: string | number) => {
  if (value === null || value === undefined || value === '') return '-';

  let d: Date | null = null;

  if (typeof value === 'number') {
    const ms = value < 10_000_000_000 ? value * 1000 : value;
    d = new Date(ms);
  } else {
    const trimmed = String(value).trim();
    const asNum = Number(trimmed);

    // اگر رشته عددی بود و طولش معقول بود، به عنوان timestamp بگیر
    if (!Number.isNaN(asNum) && trimmed.length >= 10) {
      const ms = asNum < 10_000_000_000 ? asNum * 1000 : asNum;
      d = new Date(ms);
    } else {
      const parsed = new Date(trimmed);
      if (!Number.isNaN(parsed.getTime())) d = parsed;
    }
  }

  if (!d || Number.isNaN(d.getTime())) return String(value);

  const faDate = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);

  const faTime = new Intl.DateTimeFormat('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(d);

  return `${faTime} ${faDate}`;
};

type PillTone = 'neutral' | 'danger' | 'warn' | 'ok';

const severityTone = (sev?: Severity): PillTone => {
  const s = String(sev || '').toUpperCase();
  if (s === 'ERROR' || s === 'FATAL') return 'danger';
  if (s === 'WARN' || s === 'WARNING') return 'warn';
  if (s === 'INFO' || s === 'DEBUG') return 'neutral';
  return 'neutral';
};

// -------------------- Small UI Blocks --------------------
type PillProps = {
  children: React.ReactNode;
  tone?: PillTone;
};

const Pill: React.FC<PillProps> = ({ children, tone = 'neutral' }) => (
  <span
    className={cx(
      'inline-flex items-center rounded-full px-2.5 py-1 text-xs',
      tone === 'danger' && 'bg-red-500/10 text-red-600 dark:text-red-400',
      tone === 'warn' && 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
      tone === 'ok' && 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
      tone === 'neutral' && 'bg-slate-500/10 text-slate-700 dark:text-slate-300'
    )}
  >
    {children}
  </span>
);

// -------------------- Modal --------------------
type DetailsModalProps = {
  open: boolean;
  onClose: () => void;
  row: ProjectExceptionRow | null;
};

const DetailsModal: React.FC<DetailsModalProps> = ({ open, onClose, row }) => {
  if (!open || !row) return null;

  const items: Array<{ k: string; v: unknown }> = [
    { k: 'id', v: row.id },
    { k: 'severity', v: row.severity },
    { k: 'timestamp', v: row.timestamp },
    { k: 'createdAt', v: row.createdAt },
    { k: 'exceptionClass', v: row.exceptionClass },
    { k: 'className', v: row.className },
    { k: 'methodName', v: row.methodName },
    { k: 'fileName', v: row.fileName },
    { k: 'lineNumber', v: row.lineNumber },
    { k: 'threadName', v: row.threadName },
    { k: 'hostName', v: row.hostName },
  ];

  return (
    <div className="fixed inset-0 z-[80]">
      {/* backdrop */}
      <button
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close"
      />

      {/* panel */}
      <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-5xl px-3 pb-3 sm:inset-0 sm:flex sm:items-center sm:justify-center sm:pb-0">
        <div
          className={cx(
            'relative w-full overflow-hidden rounded-2xl',
            'bg-white dark:bg-boxColor-dark',
            'border border-boxBorderColor/60 dark:border-boxBorderColor-dark/60',
            'shadow-[0_20px_80px_rgba(0,0,0,0.25)]'
          )}
        >
          {/* header */}
          <div className="flex items-start justify-between gap-3 border-b border-boxBorderColor/60 px-5 py-4 dark:border-boxBorderColor-dark/60">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-titleText dark:text-titleText-dark">
                  جزئیات Exception
                </h3>
                <Pill tone={severityTone(row.severity)}>{row.severity || '-'}</Pill>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {row.exceptionClass || '-'} • {formatJalaliDateTime(row.timestamp)}
              </p>
            </div>
          </div>

          {/* body */}
          <div className="max-h-[70vh] overflow-auto px-5 py-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* summary */}
              <div className="rounded-2xl border border-boxBorderColor/60 bg-white/60 p-4 dark:border-boxBorderColor-dark/60 dark:bg-white/5">
                <div className="mb-3 text-sm font-semibold text-titleText dark:text-titleText-dark">
                  اطلاعات اصلی
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 ltr text-end">
                  {items.map((it) => (
                    <div
                      key={it.k}
                      className="rounded-xl border border-boxBorderColor/40 bg-white/70 px-3 py-2 dark:border-boxBorderColor-dark/40 dark:bg-black/10"
                    >
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{it.k}</div>
                      <div className="mt-0.5 break-words text-sm text-titleText dark:text-titleText-dark">
                        {it.v == null || it.v === '' ? '-' : String(it.v)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* root cause + context */}
              <div className="rounded-2xl border border-boxBorderColor/60 bg-white/60 p-4 dark:border-boxBorderColor-dark/60 dark:bg-white/5">
                <div className="mb-3 text-sm font-semibold text-titleText dark:text-titleText-dark">
                  Root Cause
                </div>

                <div className="flex flex-col gap-3 ltr text-end">
                  {/* ✅ rootCauseClass منتقل شد به مودال */}
                  <div className="rounded-xl border border-boxBorderColor/40 bg-white/70 px-3 py-2 dark:border-boxBorderColor-dark/40 dark:bg-black/10">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">rootCauseClass</div>
                    <div className="mt-0.5 break-words text-sm text-titleText dark:text-titleText-dark">
                      {row.rootCauseClass || '-'}
                    </div>
                  </div>

                  <div className="rounded-xl border border-boxBorderColor/40 bg-white/70 px-3 py-2 dark:border-boxBorderColor-dark/40 dark:bg-black/10">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      rootCauseMessage
                    </div>
                    <div className="mt-0.5 break-words text-sm text-titleText dark:text-titleText-dark">
                      {row.rootCauseMessage || '-'}
                    </div>
                  </div>

                  <div className="rounded-xl border border-boxBorderColor/40 bg-white/70 px-3 py-2 dark:border-boxBorderColor-dark/40 dark:bg-black/10">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">cause</div>
                    <div className="mt-0.5 break-words text-sm text-titleText dark:text-titleText-dark">
                      {row.cause || '-'}
                    </div>
                  </div>

                  <div className="rounded-xl border border-boxBorderColor/40 bg-white/70 px-3 py-2 dark:border-boxBorderColor-dark/40 dark:bg-black/10">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">context</div>
                    <pre className="mt-1 max-h-[220px] overflow-auto whitespace-pre-wrap break-words rounded-xl bg-black/5 p-3 text-xs text-slate-700 dark:bg-black/30 dark:text-slate-200">
                      {safeJson(row.context) || '-'}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* stack trace */}
            <div className="mt-4 rounded-2xl border border-boxBorderColor/60 bg-white/60 p-4 dark:border-boxBorderColor-dark/60 dark:bg-white/5">
              <div className="mb-3 text-sm font-semibold text-titleText dark:text-titleText-dark">
                Stack Trace
              </div>
              <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-black/5 p-4 text-xs text-slate-700 dark:bg-black/30 dark:text-slate-200 ltr text-end">
                {row.stackTrace || '-'}
              </pre>
            </div>
          </div>

          {/* footer */}
          <div className="flex items-center justify-end gap-2 border-t border-boxBorderColor/60 px-5 py-4 dark:border-boxBorderColor-dark/60">
            {/* دکمه اصلی با تم سایت */}
            <Button className="text-titleText dark:text-titleText-dark" onClick={onClose}>
              بستن
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------- Page --------------------
export default function ProjectExceptionsPage(): JSX.Element {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // API expects 0-based
  const [page, setPage] = useState<number>(0);

  // ✅ همیشه 10
  const size = 10;

  const [rows, setRows] = useState<ProjectExceptionRow[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // modal
  const [selected, setSelected] = useState<ProjectExceptionRow | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);

  const buildUrl = (): string => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('size', String(size));
    return `${API_BASE}/api/analytics/search/project-exceptions?${params.toString()}`;
  };

  const fetchData = (): void => {
    setLoading(true);
    setError('');

    GetRequest(buildUrl())
      .then((res: ApiResponse<PagedResult<ProjectExceptionRow>>) => {
        const content = res?.result?.content ?? [];
        setRows(content);

        setTotalPages(res?.result?.totalPages ?? 1);
        setTotalElements(res?.result?.totalElements ?? content.length);
      })
      .catch((err: any) => {
        setError(err?.message || 'خطا در دریافت اطلاعات');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const IconButton = ({ onClick, title }: { onClick: () => void; title?: string }) => (
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
        <path d="M12 17v-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 7.5h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <path
          d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
    </button>
  );

  const columns: Column<ProjectExceptionRow>[] = useMemo(
    () => [
      {
        header: 'زمان',
        // ✅ شمسی
        cell: (r) => <span className="text-xs">{formatJalaliDateTime(r.timestamp)}</span>,
      },
      {
        header: 'شدت',
        cell: (r) => <Pill tone={severityTone(r.severity)}>{r.severity || '-'}</Pill>,
      },
      {
        header: 'Exception',
        cell: (r) => (
          <div className="flex flex-col gap-1">
            <span className="text-sm text-titleText dark:text-titleText-dark">
              {truncate(r.exceptionClass, 70)}
            </span>
          </div>
        ),
      },
      {
        header: 'Root Cause Message',
        cell: (r) => (
          <span className="text-sm text-titleText dark:text-titleText-dark">
            {truncate(r.rootCauseMessage, 110)}
          </span>
        ),
      },
      {
        header: 'Host',
        cell: (r) => <span className="text-xs">{r.hostName || '-'}</span>,
      },
      {
        header: 'جزئیات',
        cell: (r) => (
          <div className="flex justify-center">
            <IconButton
              title="نمایش requestParams و item"
              onClick={() => {
                setSelected(r);
                setOpenModal(true);
              }}
            />
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-5">
      <div className={cx()}>
        {error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : loading ? (
          <LoadingComponent />
        ) : (
          <ExpandableTable<ProjectExceptionRow> columns={columns as any} data={rows} />
        )}

        <Pagination
          totalItems={totalElements}
          pageSize={size} // ✅ همیشه 10
          currentPage={page + 1} // 1-based
          rtl
          onPageChange={(p) => setPage(Math.max(0, p - 1))}
        />
      </div>

      <DetailsModal
        open={openModal}
        row={selected}
        onClose={() => {
          setOpenModal(false);
        }}
      />
    </div>
  );
}
