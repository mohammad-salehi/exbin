// @ts-nocheck
"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import JalaliLocalDatePicker from "../../../../../../components/DatePicker/JalaliLocalDatePicker";
import { useSearchParams } from "next/navigation";
import { Dropdown, MenuItem } from "@heathmont/moon-core-tw";
import { Button } from "@heathmont/moon-base-tw";
import { ControlsChevronDown } from "@heathmont/moon-icons-tw";
import { refreshTokenOnly } from "../../../../../../functions/TokenRefresh";

export type TimelineItem = {
  id: string | number;
  date: string;
  time: string;
  subtitle?: string;
  exchange?: string;
  username?: string;
};

const DEFAULT_PAGE_SIZE = 10;

const getCookie = (name: string) =>
  document.cookie
    .split("; ")
    .find((r) => r.startsWith(name + "="))
    ?.split("=")[1] || "";

type InitFactory = () => RequestInit;

async function fetchWithAuthRetry(url: string, initFactory: InitFactory) {
  let res = await fetch(url, initFactory());
  if (res.status === 401 || res.status === 403) {
    try {
      await refreshTokenOnly();
      res = await fetch(url, initFactory());
    } catch {
      return res;
    }
  }
  return res;
}

const persianDigits = (input: string | number) =>
  String(input).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)]);

const groupByDate = (items: TimelineItem[]) =>
  items.reduce<Record<string, TimelineItem[]>>((acc, it) => {
    (acc[it.date] ||= []).push(it);
    return acc;
  }, {});

const byTimeAsc = (a: TimelineItem, b: TimelineItem) =>
  b.time.localeCompare(a.time);

const fmtDateFa = (isoDate: string) => {
  const d = new Date(isoDate + "T00:00:00");
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  }).format(d);
};

const extractApiDateTime = (val: any, endOfDay = false): string | undefined => {
  if (!val) return undefined;
  const greg =
    typeof val === "string"
      ? val
      : val.gregorian || val.value || val.date || "";
  if (!greg) return undefined;
  const base = greg.slice(0, 10);
  return `${base}${endOfDay ? "T23:59:59" : "T00:00:00"}`;
};

// ==========================
// Modern UI Components
// ==========================
const GlassCard: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className,
}) => (
  <div
    className={`group relative rounded-3xl border border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 overflow-visible ${className || ""}`}
  >
    {children}
  </div>
);

const PrimaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, className, ...props }) => (
  <button
    {...props}
    className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:scale-[1.02] transition-all duration-200 disabled:opacity-60 disabled:hover:scale-100 ${className || ""}`}
  >
    {children}
  </button>
);

type ApiActivity = {
  id: number;
  timestamp: string;
  explain: string | null;
  exchange?: string | null;
  username?: string | null;
};

function mapApiToItems(list: ApiActivity[]): TimelineItem[] {
  return list.map((a) => {
    const [datePart, timePartRaw] = a.timestamp.split("T");
    const timePart = (timePartRaw || "").slice(0, 5);
    return {
      id: a.id,
      date: datePart,
      time: timePart,
      subtitle: a.explain || "",
      exchange: a.exchange || "",
      username: a.username || "",
    };
  });
}

function debounce<F extends (...args: any[]) => any>(fn: F, delay: number) {
  let timer: NodeJS.Timeout;
  const debounced = ((...args: Parameters<F>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as F & { cancel?: () => void };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}

type User = {
  id: number;
  firstName?: string;
  lastName?: string;
  username: string;
  role?: string;
};

export default function TimelinePage({ params }) {
  const searchParams = useSearchParams();
  const routeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const usernameFromUrl = (routeId ?? "").trim();
  const pageSize = Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE;

  // State
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [startPicker, setStartPicker] = useState<any>();
  const [endPicker, setEndPicker] = useState<any>();

  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>(usernameFromUrl || "");

  // refs for stable loadPage
  const loadingRef = useRef(false);
  const doneRef = useRef(false);
  const firstRenderRef = useRef(true);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    doneRef.current = done;
  }, [done]);

  // Load users on mount
  useEffect(() => {
    let abort = false;
    const fetchUsers = async () => {
      try {
        setUsersLoading(true);
        setUsersError(null);
        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/users`;
        const res = await fetchWithAuthRetry(url, () => {
          const token = getCookie("token");
          return {
            headers: {
              accept: "*/*",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            cache: "no-store",
          };
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const list: User[] = Array.isArray(json) ? json : json?.result ?? [];
        if (!abort) setUsers(list || []);
      } catch (e: any) {
        if (!abort) setUsersError(e?.message || "خطا در دریافت کاربران");
      } finally {
        if (!abort) setUsersLoading(false);
      }
    };
    fetchUsers();
    return () => {
      abort = true;
    };
  }, []);

  // Sync selectedUser with URL param (if it ever changes)
  // useEffect(() => {
  //   const next = usernameFromUrl || "";
  //   if (next !== selectedUser) setSelectedUser(next);
  // }, [usernameFromUrl, selectedUser]);

  const loadPage = useCallback(
    async (nextPage: number, replace = false) => {
      if (!replace) {
        if (loadingRef.current || doneRef.current) return;
      }
  
      setLoading(true);
      setError(null);
  
      try {
        const qs = new URLSearchParams();
        if (selectedUser) qs.set("username", selectedUser);
        qs.set("page", String(nextPage));
        qs.set("size", String(pageSize));
        qs.set("sort", "timestamp,DESC");
  
        const startTime = extractApiDateTime(startPicker, false);
        const endTime = extractApiDateTime(endPicker, true);
        if (startTime) qs.set("startTime", startTime);
        if (endTime) qs.set("endTime", endTime);
  
        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/user-activities?${qs.toString()}`;
        const res = await fetchWithAuthRetry(url, () => {
          const token = getCookie("token");
          return {
            headers: {
              accept: "*/*",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            cache: "no-store",
          };
        });
  
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
  
        const json = await res.json();
        const content: ApiActivity[] = json?.result?.content ?? [];
        const mapped = mapApiToItems(content);
  
        setItems((prev) => (replace ? mapped : [...prev, ...mapped]));
        setPage(nextPage);
        if (content.length < pageSize) setDone(true);
      } catch (e: any) {
        setError(e?.message || "خطا در دریافت داده");
      } finally {
        setLoading(false);
      }
    },
    [selectedUser, pageSize, startPicker, endPicker]
  );

  const reload = useCallback(() => {
    setItems([]);
    setDone(false);
    doneRef.current = false;
    loadingRef.current = false;
    loadPage(0, true);
  }, [loadPage]);

  // Debounced reload for filters, with first render guard
  const debouncedReload = useMemo(() => debounce(reload, 500), [reload]);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      reload();
      return;
    }
    debouncedReload();
    return () => debouncedReload.cancel?.();
  }, [selectedUser, startPicker, endPicker, reload, debouncedReload]);

  const grouped = useMemo(() => {
    const g = groupByDate(items);
    Object.values(g).forEach((arr) => arr.sort(byTimeAsc));
    return Object.entries(g).sort((a, b) => b[0].localeCompare(a[0]));
  }, [items]);

  const handleLoadMore = () => {
    if (!doneRef.current && !loadingRef.current) loadPage(page + 1);
  };

  function addTimeOffset(time: string, hours = 3, minutes = 30) {
    const [h, m] = time.split(":").map(Number);
    const total = h * 60 + m + hours * 60 + minutes;
    const newH = Math.floor((total / 60) % 24);
    const newM = total % 60;
    return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
  }

  // Avatar component
  const UserAvatar = ({ username }: { username?: string }) => {
    const initial = (username?.[0] || "?").toUpperCase();
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-amber-500",
    ];
    const colorIndex = username ? username.charCodeAt(0) % colors.length : 0;
    return (
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white text-xs font-bold shadow-md`}
      >
        {initial}
      </div>
    );
  };

  return (
    <div
      dir="rtl"
      className="
      min-h-screen w-full rounded-2xl
      bg-slate-50 dark:bg-slate-950
      bg-[radial-gradient(circle_at_1px_1px,_rgba(99,102,241,0.08)_1px,_transparent_0)]
      [background-size:32px_32px]
      text-gray-900 dark:text-gray-100
      "    >
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center md:text-right">
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-l from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400">
            {selectedUser
              ? `📋 خط زمانی کاربر ${selectedUser}`
              : "⏱️ خط زمانی همه کاربران"}
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            تاریخچه فعالیت‌ها در سامانه
          </p>
        </div>

        {/* Filters */}
        <GlassCard className="mb-8 p-5 relative z-10 overflow-visible">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="flex flex-col gap-1.5 relative z-20">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                📅 از تاریخ
              </label>
              <div className="relative">
                <JalaliLocalDatePicker
                  value={startPicker}
                  onChange={(val: any) => setStartPicker(val ?? undefined)}
                  placeholder="انتخاب تاریخ شروع"
                  clearable
                  min="2000-01-01"
                  max="2030-12-31"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 relative z-20">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                📅 تا تاریخ
              </label>
              <div className="relative">
                <JalaliLocalDatePicker
                  value={endPicker}
                  onChange={(val: any) => setEndPicker(val ?? undefined)}
                  placeholder="انتخاب تاریخ پایان"
                  clearable
                  min="2000-01-01"
                  max="2030-12-31"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                👤 کاربر
              </label>
              <div className="relative w-full">
                <Dropdown
                  value={selectedUser}
                  onChange={(v: unknown) => {
                    const val = (v as string) ?? "";
                    setSelectedUser(val);
                  }}
                >
                  <Dropdown.Trigger className="w-full">
                    <Button
                      as="span"
                      role="button"
                      variant="ghost"
                      className="flex items-center justify-between w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 px-3 py-2 text-sm text-right text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <span className="truncate">
                        {usersLoading
                          ? "در حال بارگذاری..."
                          : selectedUser
                          ? users.find((u) => u.username === selectedUser)
                              ?.username ?? selectedUser
                          : "همه کاربران"}
                      </span>
                    </Button>
                  </Dropdown.Trigger>
                  <Dropdown.Options className="absolute left-0 mt-2 w-72 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg z-50 max-h-60 overflow-y-auto">
                    <Dropdown.Option value="">
                      {({ selected, active }) => (
                        <MenuItem
                          isActive={active}
                          isSelected={selected}
                          className={`m-1 rounded-lg ${
                            selected
                              ? "bg-blue-50 dark:bg-gray-700"
                              : active
                              ? "bg-gray-50 dark:bg-gray-700/50"
                              : ""
                          }`}
                        >
                          <MenuItem.Title className="px-3 py-2 text-sm">
                            همه کاربران
                          </MenuItem.Title>
                        </MenuItem>
                      )}
                    </Dropdown.Option>
                    {users.map((u) => (
                      <Dropdown.Option value={u.username} key={u.id}>
                        {({ selected, active }) => (
                          <MenuItem
                            isActive={active}
                            isSelected={selected}
                            className={`m-1 rounded-lg ${
                              selected
                                ? "bg-blue-50 dark:bg-gray-700"
                                : active
                                ? "bg-gray-50 dark:bg-gray-700/50"
                                : ""
                            }`}
                          >
                            <MenuItem.Title className="px-3 py-2 text-sm">
                              {u.username}
                            </MenuItem.Title>
                          </MenuItem>
                        )}
                      </Dropdown.Option>
                    ))}
                  </Dropdown.Options>
                </Dropdown>
                <ControlsChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {usersError && (
                <span className="text-xs text-red-500 mt-1">{usersError}</span>
              )}
            </div>
          </div>
        </GlassCard>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/80 backdrop-blur-sm px-4 py-3 text-sm text-red-700">
            ⚠️ {error}
          </div>
        )}

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-blue-400 via-purple-500 to-pink-500 rounded-full hidden md:block" />
          <div
            className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gray-300 dark:bg-gray-700 md:hidden"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, #9ca3af, #9ca3af 8px, transparent 8px, transparent 16px)",
            }}
          />

          <div className="space-y-12">
            {grouped.map(([date, arr]) => (
              <section key={date} className="relative">
                <div className="relative mb-10 flex justify-center">
                  <div className="inline-flex items-center gap-3 rounded-full border border-white/20 dark:border-gray-700/50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300">
                    <span className="text-lg font-black bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                      {persianDigits(fmtDateFa(date))}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-gray-200/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300">
                      {arr.length} فعالیت
                    </span>
                  </div>
                </div>

                <div className="space-y-8">
                  {arr.map((it, idx) => {
                    const leftSide = idx % 2 === 0;
                    const isDelete = /\bdeleted\b/i.test(it.subtitle ?? "");
                    const isCreate = /\bcreated\b/i.test(it.subtitle ?? "");
                    const isAdd = /\badded\b/i.test(it.subtitle ?? "");
                    const isUpdate = /\bupdated\b/i.test(it.subtitle ?? "");
                    const borderGradient = isDelete
                      ? "border-red-400 dark:border-red-600"
                      : isCreate || isAdd
                      ? "border-green-400 dark:border-green-600"
                      : isUpdate
                      ? "border-blue-400 dark:border-blue-600"
                      : "border-gray-200 dark:border-gray-700";
                    const timeFormatted = persianDigits(addTimeOffset(it.time));

                    return (
                      <div
                        key={it.id}
                        className="relative animate-fadeInUp"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="absolute left-1/2 top-6 z-10 hidden md:block -translate-x-1/2">
                          <div className="relative flex items-center justify-center">
                            <div className="absolute w-10 h-10 rounded-full bg-blue-400 opacity-20 animate-ping" />
                            <div className="absolute w-6 h-6 rounded-full bg-blue-500 opacity-40 animate-pulse" />
                            <div className="relative w-4 h-4 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-md flex items-center justify-center">
                              <span className="text-[8px] text-white">✦</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                          {leftSide ? (
                            <div className="order-1 md:order-1 flex justify-end">
                              <GlassCard
                                className={`w-full md:w-[min(460px,100%)] ${borderGradient} border-t-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group`}
                              >
                                <div className="p-4">
                                  <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-2 mb-3">
                                    <div className="flex items-center gap-3">
                                      <UserAvatar username={it.username} />
                                      <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                          {it.username
                                            ? persianDigits(it.username)
                                            : "ناشناس"}
                                        </span>
                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                          <span>🕒</span>
                                          <span className="font-mono">
                                            {timeFormatted}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex gap-1">
                                      {isDelete && (
                                        <span className="text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                                          🗑️ حذف
                                        </span>
                                      )}
                                      {(isCreate || isAdd) && (
                                        <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                                          ✨ جدید
                                        </span>
                                      )}
                                      {isUpdate && (
                                        <span className="text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                          ✏️ ویرایش
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-500 dark:text-gray-400">
                                        🏦 صرافی:
                                      </span>
                                      <span className="text-gray-800 dark:text-gray-200">
                                        {it.exchange &&
                                        it.exchange.trim() !== ""
                                          ? it.exchange
                                          : "—"}
                                      </span>
                                    </div>
                                    {it.subtitle && (
                                      <div className="pt-2 text-gray-600 dark:text-gray-300 border-t border-dashed border-gray-100 dark:border-gray-800 mt-2 text-sm leading-relaxed">
                                        {it.subtitle}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </GlassCard>
                            </div>
                          ) : (
                            <div className="order-2 md:order-2" />
                          )}

                          {!leftSide ? (
                            <div className="order-2 md:order-2 flex justify-start">
                              <GlassCard
                                className={`w-full md:w-[min(460px,100%)] ${borderGradient} border-t-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group`}
                              >
                                <div className="p-4">
                                  <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-2 mb-3">
                                    <div className="flex items-center gap-3">
                                      <UserAvatar username={it.username} />
                                      <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                          {it.username
                                            ? persianDigits(it.username)
                                            : "ناشناس"}
                                        </span>
                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                          <span>🕒</span>
                                          <span className="font-mono">
                                            {timeFormatted}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex gap-1">
                                      {isDelete && (
                                        <span className="text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                                          🗑️ حذف
                                        </span>
                                      )}
                                      {(isCreate || isAdd) && (
                                        <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                                          ✨ جدید
                                        </span>
                                      )}
                                      {isUpdate && (
                                        <span className="text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                          ✏️ ویرایش
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-500 dark:text-gray-400">
                                        🏦 صرافی:
                                      </span>
                                      <span className="text-gray-800 dark:text-gray-200">
                                        {it.exchange &&
                                        it.exchange.trim() !== ""
                                          ? it.exchange
                                          : "—"}
                                      </span>
                                    </div>
                                    {it.subtitle && (
                                      <div className="pt-2 text-gray-600 dark:text-gray-300 border-t border-dashed border-gray-100 dark:border-gray-800 mt-2 text-sm leading-relaxed">
                                        {it.subtitle}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </GlassCard>
                            </div>
                          ) : (
                            <div className="order-1 md:order-1" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* Load More */}
        <div className="mt-12 flex justify-center">
          <PrimaryButton onClick={handleLoadMore} disabled={loading || done}>
            {done
              ? "✅ همه نمایش داده شد"
              : loading
              ? "⏳ در حال بارگذاری…"
              : "📥 نمایش بیشتر"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
