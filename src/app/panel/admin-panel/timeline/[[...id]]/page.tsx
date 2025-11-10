// @ts-nocheck
"use client";

import React, { useEffect, useMemo, useState } from "react";
import JalaliLocalDatePicker from "../../../../../../components/DatePicker/JalaliLocalDatePicker";

export type TimelineItem = {
  id: string | number;
  date: string;      // YYYY-MM-DD
  time: string;      // HH:mm
  subtitle?: string; // توضیح
  exchange?: string; // نام صرافی
  username?: string; // ⬅️ نام کاربری عامل تغییر
};
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Dropdown, MenuItem } from "@heathmont/moon-core-tw";
import { Button } from "@heathmont/moon-base-tw";
import { ControlsChevronDown } from "@heathmont/moon-icons-tw";
import { refreshTokenOnly } from "../../../../../../functions/TokenRefresh";

const DEFAULT_PAGE_SIZE = 10;

const getCookie = (name: string) =>
  document.cookie
    .split("; ")
    .find((r) => r.startsWith(name + "="))
    ?.split("=")[1] || "";



    type InitFactory = () => RequestInit;

/** یک‌بار تلاش + اگر 401/403 شد: refresh و یک‌بار retry */
async function fetchWithAuthRetry(url: string, initFactory: InitFactory) {
  let res = await fetch(url, initFactory());
  if (res.status === 401 || res.status === 403) {
    try {
      await refreshTokenOnly();              // کوکی‌ها به‌روزرسانی می‌شن
      res = await fetch(url, initFactory()); // تلاش دوم با توکن تازه
    } catch {
      // اگر رفرش شکست خورد همون پاسخ قبلی رو برگردونیم تا هندل ارور انجام بشه
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

/** خروجی DatePicker را به فرمت API برمی‌گرداند. */
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
// Tiny UI primitives
// ==========================
const Tile: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className,
}) => (
  <div
    className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${className || ""
      }`}
  >
    {children}
  </div>
);
const TileHeader: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className,
}) => <div className={`px-4 pt-4 pb-2 ${className || ""}`}>{children}</div>;
const TileBody: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className,
}) => <div className={`px-4 pb-4 ${className || ""}`}>{children}</div>;
const PrimaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, className, ...props }) => (
  <button
    {...props}
    className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2 text-sm font-medium text-white disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm ${className || ""
      } bg-blue-600 hover:bg-blue-700`}
  >
    {children}
  </button>
);

// ==========================
// API mapping
// ==========================
type ApiActivity = {
  id: number;
  timestamp: string;
  explain: string | null;
  exchange?: string | null;
  username?: string | null; // ⬅️ اضافه شد
};

function mapApiToItems(list: ApiActivity[]): TimelineItem[] {
  return list.map((a) => {
    const [datePart, timePartRaw] = a.timestamp.split("T");
    const timePart = (timePartRaw || "").slice(0, 5); // HH:mm
    return {
      id: a.id,
      date: datePart,
      time: timePart,
      subtitle: a.explain || "",
      exchange: a.exchange || "",
      username: a.username || "", // ⬅️ اینجا
    };
  });
}

// ==========================
// Page Component (Client Page but with correct signature)
// ==========================
type PageProps = {
  params?: { id?: string | string[] };  // ← اختیاری و سازگار با catch-all
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function TimelinePage({ params }) {
  const searchParams = useSearchParams();
  // اگر catch-all استفاده کرده‌ای، ممکنه آرایه باشه
  const routeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const username = (routeId ?? "").trim(); // "" یعنی بدون فیلتر کاربر

  // اگر بخوای از query string اندازه صفحه بیاد:
  const pageSize = Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE;

  // pagination & data
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // فیلتر تاریخ‌ها (JalaliLocalDatePicker)
  const [startPicker, setStartPicker] = useState<any>();
  const [endPicker, setEndPicker] = useState<any>();

  // لود اولیه بدون فیلتر
  useEffect(() => {
    setItems([]);
    setDone(false);
    void loadPage(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, pageSize]);

  async function loadPage(nextPage: number, replace = false) {
    if (loading || done) return;
    setLoading(true);
    setError(null);
  
    try {
      const qs = new URLSearchParams();
      if (username) qs.set("username", username);
      qs.set("page", String(nextPage));
      qs.set("size", String(pageSize));
      qs.set("sort", "timestamp,DESC");
  
      const startTime = extractApiDateTime(startPicker, false);
      const endTime = extractApiDateTime(endPicker, true);
      if (startTime) qs.set("startTime", startTime);
      if (endTime) qs.set("endTime", endTime);
  
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/user-activities?${qs.toString()}`;
  
      const res = await fetchWithAuthRetry(url, () => {
        const token = getCookie("token"); // هر بار تازه بخون
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
  }
  

  // اعمال فیلتر ⇒ از صفحه ۰ دوباره بگیر
  const applyFilters = () => {
    setItems([]);
    setDone(false);
    void loadPage(0, true);
  };

  const grouped = useMemo(() => {
    const g = groupByDate(items);
    Object.values(g).forEach((arr) => arr.sort(byTimeAsc));
    return Object.entries(g).sort((a, b) => b[0].localeCompare(a[0]));
  }, [items]);

  const handleLoadMore = () => {
    if (!done && !loading) void loadPage(page + 1);
  };

  function addTimeOffset(time: string, hours = 3, minutes = 30) {
    const [h, m] = time.split(":").map(Number);
    const total = h * 60 + m + hours * 60 + minutes;
    const newH = Math.floor((total / 60) % 24); // در صورت عبور از 24
    const newM = total % 60;
    return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
  }

  const router = useRouter();

  // لیست کاربران
  type User = { id: number; firstName?: string; lastName?: string; username: string; role?: string };
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  // مقدار انتخاب‌شدهٔ کاربر در UI
  const [selectedUser, setSelectedUser] = useState<string>(""); // "" = همه

  useEffect(() => {
    // اگر روی صفحهٔ یک کاربر خاص هستیم، مقدار اولیهٔ dropdown را همان بگذار
    setSelectedUser(username || "");
  }, [username]);

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
        const list: User[] = Array.isArray(json) ? json : (json?.result ?? []);
  
        if (!abort) setUsers(list || []);
      } catch (e: any) {
        if (!abort) setUsersError(e?.message || "خطا در دریافت کاربران");
      } finally {
        if (!abort) setUsersLoading(false);
      }
    };
    fetchUsers();
    return () => { abort = true; };
  }, []);
  


  return (
    <div dir="rtl" className="min-h-screen w-full text-gray-900">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-titleText dark:text-titleText-dark">
            {username ? `خط زمانی کاربر ${username}` : "خط زمانی همه کاربران"}
          </h1>
        </div>

        {/* فیلترها با JalaliLocalDatePicker */}
        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="flex flex-col gap-1 text-sm text-titleText dark:text-titleText-dark">
            شروع
            <JalaliLocalDatePicker
              value={startPicker}
              onChange={(val: any) => setStartPicker(val ?? undefined)}
              placeholder=""
              clearable
              min="2000-01-01"
              max="2030-12-31"
            />
          </div>

          <div className="flex flex-col gap-1 text-sm text-titleText dark:text-titleText-dark">
            پایان
            <JalaliLocalDatePicker
              value={endPicker}
              onChange={(val: any) => setEndPicker(val ?? undefined)}
              placeholder=""
              clearable
              min="2000-01-01"
              max="2030-12-31"
            />
          </div>

          <div className="flex flex-col gap-1 text-sm text-titleText dark:text-titleText-dark">
            کاربر
            <div className="relative w-full">
              <Dropdown
                value={selectedUser} // "" = همه
                onChange={(v: unknown) => {
                  const val = (v as string) ?? "";
                  setSelectedUser(val);

                  // هدایت به مسیر مناسب
                  if (!val) {
                    // همه کاربران
                    router.push("/panel/admin-panel/timeline");
                  } else {
                    router.push(`/panel/admin-panel/timeline/${encodeURIComponent(val)}`);
                  }
                }}
              >
                <Dropdown.Trigger className="w-full">
                  <Button
                    as="span"
                    role="button"
                    variant="ghost"
                    className="flex items-center justify-between w-full pl-10 py-2 bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark
            border border-gray-300 rounded-lg dark:border-buttonBorderColor-dark focus:outline-none appearance-none relative"
                  >
                    <span>
                      {usersLoading
                        ? "در حال بارگذاری..."
                        : selectedUser
                          ? (users.find(u => u.username === selectedUser)?.username ?? selectedUser)
                          : "همه کاربران"}
                    </span>
                  </Button>
                </Dropdown.Trigger>

                <Dropdown.Options
                  className="absolute left-0 mt-2 w-72 pl-2 pr-2 text-gray-700 bg-white dark:bg-buttonColor-dark
          border border-gray-300 dark:border-buttonBorderColor-dark rounded-lg dark:text-gray-100 appearance-none z-50
          max-h-60 overflow-y-auto"
                >
                  {/* گزینهٔ «همه کاربران» */}
                  <Dropdown.Option value="">
                    {({ selected, active }) => (
                      <MenuItem isActive={active} isSelected={selected}
                        className={`border mt-2 mb-1 rounded-md border-gray-100 dark:border-buttonBorderColor-dark ${selected ? "bg-gray-100 border-gray-200 dark:bg-gray-700" : ""}`}>
                        <MenuItem.Title>همه کاربران</MenuItem.Title>
                      </MenuItem>
                    )}
                  </Dropdown.Option>

                  {/* کاربران از API */}
                  {users.map((u) => {
                    const label = u.username; // اگر خواستی: `${u.firstName ?? ""} ${u.lastName ?? ""} (${u.username})`
                    return (
                      <Dropdown.Option value={u.username} key={u.id}>
                        {({ selected, active }) => (
                          <MenuItem isActive={active} isSelected={selected}
                            className={`border mt-2 mb-1 rounded-md border-gray-100 dark:border-buttonBorderColor-dark ${selected ? "bg-gray-100 border-gray-200 dark:bg-gray-700" : ""}`}>
                            <MenuItem.Title>{label}</MenuItem.Title>
                          </MenuItem>
                        )}
                      </Dropdown.Option>
                    );
                  })}
                </Dropdown.Options>
              </Dropdown>

              <ControlsChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-titleText dark:text-titleText-dark pointer-events-none" />
            </div>

            {usersError && (
              <span className="text-xs text-red-600 mt-1">{usersError}</span>
            )}
          </div>

          <div className="flex items-end">
            <PrimaryButton onClick={applyFilters} disabled={loading}>
              اعمال فیلتر
            </PrimaryButton>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* تایم‌لاین */}
        <div className="relative">
          {/* خط عمودی وسط */}
          <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-full w-px bg-gray-300" />

          <div className="space-y-10">
            {grouped.map(([date, arr]) => (
              <section key={date} className="relative">
                {/* عنوان روز در مرکز خط */}
                <div className="relative mb-4 flex justify-center">
                  <div className="rounded-full border-2 border-boxBorderColor dark:border-boxColor-dark bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark px-3 text-lg font-bold leading-8">
                    {persianDigits(fmtDateFa(date))}
                  </div>
                </div>

                {/* آیتم‌ها: یکی چپ یکی راست */}
                <div className="space-y-6">
                  {arr.map((it, idx) => {
                    const leftSide = idx % 2 === 0;

                    // 👇 اگر subtitle شامل delete بود، کلاس قرمز بگذار
                    const isDelete = /\bdeleted\b/i.test(it.subtitle ?? "");
                    const isCreate = /\bcreated\b/i.test(it.subtitle ?? "");
                    const isAdd = /\added\b/i.test(it.subtitle ?? "");
                    const isUpdate = /\updated\b/i.test(it.subtitle ?? "");
                    let borderClass = isDelete ? "border-redError" : isCreate ? "border-green-500" : isAdd ? "border-green-500" : isUpdate ? 'border-primary' : "border-boxBorderColor dark:border-boxBorderColor-dark"

                    return (
                      <div key={it.id} className="relative">
                        {/* نقطه روی خط */}
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 inline-block h-4 w-4 rounded-full border-2 border-sky-500 bg-boxColor dark:bg-boxColor-dark" />

                        <div className="grid grid-cols-2 items-stretch gap-8">
                          {/* سمت چپ */}
                          {leftSide ? (
                            <div className="col-start-1 justify-self-end pr-8 text-titleText dark:text-titleText-dark">
                              <Tile
                                className={`w-[min(440px,100%)] bg-boxColor dark:bg-boxColor-dark ${borderClass}`}
                              >
                                <TileHeader>
                                  <div className="text-sm font-bold">
                                    <span className="font-normal">ساعت</span>{" "}
                                    {persianDigits(addTimeOffset(it.time))}
                                  </div>
                                </TileHeader>
                                <div className="mx-4 mb-2 h-px bg-boxBorderColor dark:bg-boxBorderColor-dark" />
                                <TileBody>
                                  <p className="mb-1">
                                    <span className="inline-block">کاربر:</span>
                                    <span className="inline-block mr-2">
                                      {it.username && it.username.trim() !== "" ? persianDigits(it.username) : "—"}
                                    </span>
                                  </p>

                                  <p className="mb-1">
                                    <span className="inline-block">صرافی:</span>
                                    <span className="inline-block mr-2">
                                      {it.exchange && it.exchange.trim() !== "" ? it.exchange : "—"}
                                    </span>
                                  </p>

                                  {it.subtitle && <div className="mt-2 text-sm">{it.subtitle}</div>}
                                </TileBody>
                              </Tile>
                            </div>
                          ) : (
                            <div />
                          )}

                          {/* سمت راست */}
                          {!leftSide ? (
                            <div className="col-start-2 justify-self-start pl-8 text-titleText dark:text-titleText-dark">
                              <Tile
                                className={`w-[min(440px,100%)] bg-boxColor dark:bg-boxColor-dark ${borderClass}`}
                              >
                                <TileHeader>
                                  <div className="text-sm font-bold">
                                    <span className="font-normal">ساعت</span>{" "}
                                    {persianDigits(addTimeOffset(it.time))}
                                  </div>
                                </TileHeader>
                                <div className="mx-4 mb-2 h-px bg-boxBorderColor dark:bg-boxBorderColor-dark" />
                                <TileBody>
                                  <p className="mb-1">
                                    <span className="inline-block">کاربر:</span>
                                    <span className="inline-block mr-2">
                                      {it.username && it.username.trim() !== "" ? persianDigits(it.username) : "—"}
                                    </span>
                                  </p>

                                  <p className="mb-1">
                                    <span className="inline-block">صرافی:</span>
                                    <span className="inline-block mr-2">
                                      {it.exchange && it.exchange.trim() !== "" ? it.exchange : "—"}
                                    </span>
                                  </p>

                                  {it.subtitle && <div className="mt-2 text-sm">{it.subtitle}</div>}
                                </TileBody>
                              </Tile>
                            </div>
                          ) : (
                            <div />
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

        {/* Load more */}
        <div className="mt-10 flex justify-center">
          <PrimaryButton onClick={handleLoadMore} disabled={loading || done}>
            {done
              ? "همه نمایش داده شد"
              : loading
                ? "در حال بارگذاری…"
                : "نمایش بیشتر"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
