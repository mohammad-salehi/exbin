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

const formatTs = (s?: string) => {
  if (!s) return '-';
  return String(s).replace('T', ' ').slice(0, 23);
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
type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

const Field: React.FC<FieldProps> = ({ label, value, onChange, placeholder }) => (
  <label className="flex flex-col gap-2">
    <span className="text-sm text-titleText dark:text-titleText-dark">{label}</span>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cx(
        'h-12 w-full rounded-xl px-4',
        'border border-boxBorderColor/60 dark:border-boxBorderColor-dark/60',
        'bg-white/70 dark:bg-boxColor-dark/40',
        'text-sm text-titleText dark:text-titleText-dark',
        'outline-none focus:ring-2 focus:ring-primary/40'
      )}
    />
  </label>
);

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
    { k: 'cause', v: row.cause },
    { k: 'rootCauseClass', v: row.rootCauseClass },
    { k: 'rootCauseMessage', v: row.rootCauseMessage },
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
                {row.exceptionClass || '-'} • {formatTs(row.timestamp)}
              </p>
            </div>

            <Button size="sm" variant="secondary" onClick={onClose}>
              بستن
            </Button>
          </div>

          {/* body */}
          <div className="max-h-[70vh] overflow-auto px-5 py-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* summary */}
              <div className="rounded-2xl border border-boxBorderColor/60 bg-white/60 p-4 dark:border-boxBorderColor-dark/60 dark:bg-white/5">
                <div className="mb-3 text-sm font-semibold text-titleText dark:text-titleText-dark">
                  اطلاعات اصلی
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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

                <div className="flex flex-col gap-3">
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
              <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-black/5 p-4 text-xs text-slate-700 dark:bg-black/30 dark:text-slate-200">
                {row.stackTrace || '-'}
              </pre>
            </div>
          </div>

          {/* footer */}
          <div className="flex items-center justify-end gap-2 border-t border-boxBorderColor/60 px-5 py-4 dark:border-boxBorderColor-dark/60">
            <Button variant="secondary" onClick={onClose}>
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
  const [size, setSize] = useState<number>(100);

  const [rows, setRows] = useState<ProjectExceptionRow[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // filters
  const [severity, setSeverity] = useState<string>('');
  const [exceptionClass, setExceptionClass] = useState<string>('');
  const [hostName, setHostName] = useState<string>('');
  const [className, setClassName] = useState<string>('');
  const [fromTime, setFromTime] = useState<string>('');
  const [toTime, setToTime] = useState<string>('');

  // modal
  const [selected, setSelected] = useState<ProjectExceptionRow | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);

  const buildUrl = (): string => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('size', String(size));

    // NOTE: اگر بک‌اند شما request=<json> می‌خواهد، این بخش را تغییر می‌دهیم.
    if (severity) params.set('severity', severity);
    if (exceptionClass) params.set('exceptionClass', exceptionClass);
    if (hostName) params.set('hostName', hostName);
    if (className) params.set('className', className);
    if (fromTime) params.set('fromTime', fromTime);
    if (toTime) params.set('toTime', toTime);

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
  }, [page, size]);

  const columns: Column<ProjectExceptionRow>[] = useMemo(
    () => [
      {
        header: 'زمان',
        width: 170,
        cell: (r) => <span className="text-xs">{formatTs(r.timestamp)}</span>,
      },
      {
        header: 'شدت',
        width: 95,
        cell: (r) => <Pill tone={severityTone(r.severity)}>{r.severity || '-'}</Pill>,
      },
      {
        header: 'Exception',
        width: 260,
        cell: (r) => (
          <div className="flex flex-col gap-1">
            <span className="text-sm text-titleText dark:text-titleText-dark">
              {truncate(r.exceptionClass, 64)}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {truncate(r.rootCauseClass, 70)}
            </span>
          </div>
        ),
      },
      {
        header: 'Root Cause Message',
        width: 360,
        cell: (r) => (
          <span className="text-sm text-titleText dark:text-titleText-dark">
            {truncate(r.rootCauseMessage, 90)}
          </span>
        ),
      },
      {
        header: 'Class',
        width: 260,
        cell: (r) => <span className="text-xs">{truncate(r.className, 90)}</span>,
      },
      {
        header: 'Host',
        width: 150,
        cell: (r) => <span className="text-xs">{r.hostName || '-'}</span>,
      },
      {
        header: '',
        width: 120,
        cell: (r) => (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setSelected(r);
              setOpenModal(true);
            }}
          >
            جزئیات
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-5">
      {/* ---------------- Filters Card ---------------- */}
      <div
        className={cx(
          'rounded-2xl p-5 shadow-sm',
          'bg-white dark:bg-boxColor-dark',
          'border border-boxBorderColor/60 dark:border-boxBorderColor-dark/60'
        )}
      >
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col">
            <h2 className="text-base font-semibold text-titleText dark:text-titleText-dark">
              Project Exceptions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              لیست خطاهای پروژه + مشاهده جزئیات کامل در مودال
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setSeverity('');
                setExceptionClass('');
                setHostName('');
                setClassName('');
                setFromTime('');
                setToTime('');
                setPage(0);
                setTimeout(fetchData, 0);
              }}
            >
              پاک کردن فیلترها
            </Button>

            <Button
              onClick={() => {
                setPage(0);
                fetchData();
              }}
            >
              جستجو
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Field label="severity" value={severity} onChange={setSeverity} placeholder="مثلا: ERROR" />

          <Field
            label="exceptionClass"
            value={exceptionClass}
            onChange={setExceptionClass}
            placeholder="مثلا: org.quartz.JobExecutionException"
          />

          <Field
            label="hostName"
            value={hostName}
            onChange={setHostName}
            placeholder="مثلا: 56612589b374"
          />

          <Field
            label="className"
            value={className}
            onChange={setClassName}
            placeholder="مثلا: ir.panta.exchangesinker.scheduler.job.AddressesJob"
          />

          <Field
            label="fromTime (ISO)"
            value={fromTime}
            onChange={setFromTime}
            placeholder="2026-02-02T08:17:43.721Z"
          />

          <Field
            label="toTime (ISO)"
            value={toTime}
            onChange={setToTime}
            placeholder="2026-02-02T08:17:43.721Z"
          />
        </div>
      </div>

      {/* ---------------- Table Card ---------------- */}
      <div
        className={cx(
          'rounded-2xl p-4 shadow-sm',
          'bg-white dark:bg-boxColor-dark',
          'border border-boxBorderColor/60 dark:border-boxBorderColor-dark/60'
        )}
      >
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {loading ? 'در حال دریافت…' : `مجموع: ${totalElements.toLocaleString('fa-IR')} رکورد`}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">size:</span>
            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(0);
              }}
              className={cx(
                'h-10 rounded-xl px-3 text-sm',
                'border border-boxBorderColor/60 dark:border-boxBorderColor-dark/60',
                'bg-white/70 dark:bg-boxColor-dark/40',
                'text-titleText dark:text-titleText-dark',
                'outline-none focus:ring-2 focus:ring-primary/40'
              )}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>

            <Button variant="secondary" onClick={fetchData}>
              رفرش
            </Button>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : loading ? (
          <LoadingComponent />
        ) : (
          // اگر ExpandableTable شما Column type خودش رو export می‌کنه، این as any رو حذف/اصلاح می‌کنیم
          <ExpandableTable<ProjectExceptionRow> columns={columns as any} data={rows} />
        )}

        {/* ---------------- Pagination (YOUR COMPONENT) ---------------- */}
        <Pagination
          totalItems={totalElements}
          pageSize={size}
          currentPage={page + 1} // Pagination شما 1-based است
          rtl
          onPageChange={(p) => setPage(Math.max(0, p - 1))} // تبدیل به 0-based برای API
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
