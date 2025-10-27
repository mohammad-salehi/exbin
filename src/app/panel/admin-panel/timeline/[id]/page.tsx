'use client'

import React, { useMemo, useState } from "react";

// ==========================
// Types
// ==========================
export type TimelineItem = {
  id: string | number;
  date: string; // ISO date (e.g. "2025-10-19")
  time: string; // 24h (e.g. "08:30")
  title?: string;
  subtitle?: string;
  meta?: string;
};

// ==========================
// Helpers
// ==========================
const persianDigits = (input: string | number) =>
  String(input).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)]);

const groupByDate = (items: TimelineItem[]) =>
  items.reduce<Record<string, TimelineItem[]>>((acc, it) => {
    (acc[it.date] ||= []).push(it);
    return acc;
  }, {});

const byTimeAsc = (a: TimelineItem, b: TimelineItem) => a.time.localeCompare(b.time);

const fmtDateFa = (isoDate: string) => {
  const d = new Date(isoDate + "T00:00:00");
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  }).format(d);
};

// ==========================
// Demo data — replace with your API data
// ==========================
const DEMO: TimelineItem[] = Array.from({ length: 28 }).map((_, i) => {
  const day = 19 - Math.floor(i / 4);
  const times = ["08:00", "08:30", "10:00", "13:00"];
  return {
    id: i + 1,
    date: `2025-10-${String(Math.max(1, day)).padStart(2, "0")}`,
    time: times[i % 4],
    title: "رویداد سیستم",
    subtitle: "یادداشت دلخواه",
    meta: "کد: ۹۹۹/XX",
  };
});

// ==========================
// Lightweight primitives (بدون کتابخانه UI و انیمیشن)
// ==========================
const Tile: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <div className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${className || ""}`}>{children}</div>
);

const TileHeader: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <div className={`px-4 pt-4 pb-2 ${className || ""}`}>{children}</div>
);

const TileBody: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <div className={`px-4 pb-4 ${className || ""}`}>{children}</div>
);

const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => (
  <button
    {...props}
    className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2 text-sm font-medium text-white disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm ${
      className || ""
    } bg-blue-600 hover:bg-blue-700`}
  >
    {children}
  </button>
);

// ==========================
// Component
export default function TimelinePage({
  initialItems = DEMO,
  pageSize = 8,
  fetchMore,
}: {
  initialItems?: TimelineItem[];
  pageSize?: number;
  fetchMore?: (cursor: number) => Promise<TimelineItem[]>;
}) {
  const [cursor, setCursor] = useState(pageSize);
  const [items, setItems] = useState<TimelineItem[]>(initialItems.slice(0, pageSize));
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(initialItems.length <= pageSize);

  const grouped = useMemo(() => {
    const g = groupByDate(items);
    Object.values(g).forEach((arr) => arr.sort(byTimeAsc));
    return Object.entries(g).sort((a, b) => b[0].localeCompare(a[0]));
  }, [items]);

  const handleLoadMore = async () => {
    if (loading || done) return;
    setLoading(true);
    try {
      if (fetchMore) {
        const next = await fetchMore(cursor);
        setItems((prev) => [...prev, ...next]);
        setCursor((c) => c + next.length);
        if (!next.length) setDone(true);
      } else {
        const next = initialItems.slice(cursor, cursor + pageSize);
        setItems((prev) => [...prev, ...next]);
        setCursor(cursor + next.length);
        if (cursor + pageSize >= initialItems.length) setDone(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen w-full  text-gray-900">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-titleText dark:text-titleText-dark">خط زمانی</h1>
        </div>

        <div className="relative">
          {/* خط عمودی تایم‌لاین */}
          <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-full w-px bg-gray-300" />

          {/* گروه‌بندی روزها */}
          <div className="space-y-10">
            {grouped.map(([date, arr]) => (
              <section key={date} className="relative">
                {/* عنوان روز در مرکز خط */}
                <div className="relative mb-4 flex justify-center">
                  <div className="rounded-full border-2 border-boxBorderColor bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark px-3 text-lg font-bold leading-8">
                    {persianDigits(fmtDateFa(date))}
                  </div>
                </div>

                {/* آیتم‌ها: یکی چپ یکی راست */}
                <div className="space-y-6">
                  {arr.map((it, idx) => {
                    const leftSide = idx % 2 === 0; // true => چپ، false => راست
                    return (
                      <div key={it.id} className="relative">
                        {/* نقطه وسط */}
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 inline-block h-4 w-4 rounded-full border-2 border-sky-500 bg-boxColor dark:bg-boxColor-dark" />

                        <div className="grid grid-cols-2 items-stretch gap-8">
                          {/* سمت چپ */}
                          {leftSide ? (
                            <div className="col-start-1 justify-self-end pr-8 ">
                              <Tile className="w-[min(440px,100%)] bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark">
                                <TileHeader>
                                  <div className=" items-center justify-between">
                                    <div className="text-base font-semibold">{it.title || "رویداد"}</div>
                                    <div className="text-sm font-bold text-titleText dark:text-titleText-dark">{persianDigits(it.time)} <span className="font-normal">ساعت</span></div>
                                  </div>
                                </TileHeader>
                                <div className="mx-4 mb-2 h-px bg-gray-100" />
                                <TileBody>
                                  <div className="text-sm text-titleText dark:text-titleText-dark">ورود به سیستم</div>
                                  <div className="mt-1 text-sm text-titleText dark:text-titleText-dark">{persianDigits(it.meta || "۱۴۰۴/۷/۲")}</div>
                                  {it.subtitle && <div className="mt-2 text-sm text-titleText dark:text-titleText-dark">{it.subtitle}</div>}
                                </TileBody>
                              </Tile>
                            </div>
                          ) : (
                            <div />
                          )}

                          {/* سمت راست */}
                          {!leftSide ? (
                            <div className="col-start-2 justify-self-start pl-8">
                              <Tile className="w-[min(440px,100%)] bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark">
                                <TileHeader>
                                  <div className=" items-center justify-between">
                                    <div className="text-base font-semibold">{it.title || "رویداد"}</div>
                                    <div className="text-sm font-bold text-titleText dark:text-titleText-dark">{persianDigits(it.time)} <span className="font-normal">ساعت</span></div>
                                  </div>
                                </TileHeader>
                                <div className="mx-4 mb-2 h-px bg-gray-100" />
                                <TileBody>
                                  <div className="text-sm text-titleText dark:text-titleText-dark">ورود به سیستم</div>
                                  <div className="mt-1 text-sm text-titleText dark:text-titleText-dark">{persianDigits(it.meta || "۱۴۰۴/۷/۱")}</div>
                                  {it.subtitle && <div className="mt-2 text-sm text-titleText dark:text-titleText-dark">{it.subtitle}</div>}
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
            {done ? "همه نمایش داده شد" : loading ? "در حال بارگذاری…" : "نمایش بیشتر"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------
  اتصال به API واقعی (نمونه)

  <TimelinePage
    pageSize={6}
    fetchMore={async (cursor) => {
      const res = await fetch(`/api/timeline?offset=${cursor}&limit=6`);
      const data: TimelineItem[] = await res.json();
      return data; // اگر آرایه خالی باشد، دکمه غیرفعال می‌شود
    }}
  />
--------------------------------------- */