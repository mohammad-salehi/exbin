"use client";

import React, { useMemo, useState } from "react";
import ExpandableTable, { Column } from "../../../../components/ExpandableTable/ExpandableTable";
import { GenericSearch } from "@heathmont/moon-icons-tw";

type Person = {
  id: string;
  logo?: string;
  name?: string;
  legal_name?: number;
  national_code?: number;
  website?: number;
  title?: string;
  link?: string;
  progress?: number;
  subRows?: Person[];
};

// کمکی: چک مچ روی یک فیلد
const matchVal = (val: unknown, q: string) => {
  if (val == null) return false;
  const s =
    typeof val === "string"
      ? val
      : typeof val === "number"
      ? String(val)
      : "";
  return s.toLowerCase().includes(q);
};

// فیلتر بازگشتی روی آرایه‌ی درختی
function filterTree(items: Person[], rawQuery: string, keys: (keyof Person)[]): Person[] {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return items; // بدون فیلتر

  return items
    .map((node) => {
      const selfMatches = keys.some((k) => matchVal(node[k], q));
      const children = node.subRows ? filterTree(node.subRows, q, keys) : undefined;
      const hasChildMatches = !!children && children.length > 0;

      if (selfMatches || hasChildMatches) {
        // فقط زیرشاخه‌های مچ‌شده را نگه داریم
        return { ...node, subRows: children };
      }
      return null;
    })
    .filter(Boolean) as Person[];
}

const Page = () => {
  const [q, setQ] = useState("");

  const data: Person[] = [
    {
      id: "1",
      logo: "https://cdn.nobitex.ir/logo/nobitex-l.png",
      name: "صرافی آبان تتر",
      legal_name: 1400123456,
      national_code: 1010101010,
      website: 9129991111,
      progress: 75,
      subRows: [
        { id: "1.1", title: "گزارش حسابرسی 3 ماهه اول 1404", link: "test" },
        { id: "1.2", title: "صورت‌های مالی 1403", link: "example" },
      ],
    },
    { id: "2", logo: "https://cdn.nobitex.ir/logo/nobitex-l.png", name: "صرافی پارسیان کریپتو", legal_name: 1400654321, national_code: 3030303030, website: 9129991111, progress: 90 },
    { id: "3", logo: "https://cdn.nobitex.ir/logo/nobitex-l.png", name: "صرافی والکس", legal_name: 1400765432, national_code: 4040404040, website: 9129991111, progress: 30 },
    { id: "4", logo: "https://cdn.nobitex.ir/logo/nobitex-l.png", name: "صرافی کوفت", legal_name: 1400765432, national_code: 4040404040, website: 9129991111, progress: 30 },
    { id: "5", logo: "https://cdn.nobitex.ir/logo/nobitex-l.png", name: "صرافی زهرمار", legal_name: 1400765432, national_code: 4040404040, website: 9129991111, progress: 30 },
  ];

  const columns: Column<Person>[] = [
    {
      header: "لوگو",
      accessorKey: "logo",
      cell: (row: Person) => (
        <div className="flex items-center gap-2">
          <img src={row.logo} style={{ width: "30px" }} />
        </div>
      ),
    },
    { header: "نام صرافی", accessorKey: "name" },
    { header: "نام حقوقی", accessorKey: "legal_name", align: "center", className: "tabular-nums" },
    { header: "شناسه ملی", accessorKey: "national_code", align: "center", className: "tabular-nums" },
    { header: "سایت", accessorKey: "website" },
    {
      header: "عملیات",
      accessorKey: "progress",
      cell: (row: Person) => (
        <div className="flex items-center gap-2 text-titleText dark:text-titleText-dark">
          {/* آیکون‌ها… */}
        </div>
      ),
    },
  ];

  // فیلدهایی که می‌خوای سرچ روی‌شون اعمال بشه:
  const searchKeys: (keyof Person)[] = ["name", "legal_name", "national_code", "website", "title", "link"];

  // دیتای فیلترشده برای جدول
  const filteredData = useMemo(() => filterTree(data, q, searchKeys), [data, q]);

  return (
    <div className="p-4 md:p-0">
      {/* Search box */}
      <div className="relative w-full md:w-[500px] h-[48px] mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex w-full h-full p-0 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-[0_8px_24px_-8px_rgba(0,_0,_0,_0.16),_0_0_1px_0_rgba(0,_0,_0,_0.40)] pl-4 pr-10 focus:outline-none focus:ring-0"
          placeholder="جست‌وجو"
        />
        <GenericSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl" />
      </div>

      {/* Table with filtered data */}
      <div className="mb-4">
        <ExpandableTable<Person>
          data={filteredData}          // ← فقط دیتای فیلترشده را بده
          columns={columns}
          defaultExpandedIds={[]}      // همه بسته شروع شوند
          rowDetails={(row) => (
            <div
              className="
                bg-white dark:bg-bgColor-dark p-4 w-full
                border-b border-gray-200 dark:border-gray-500
                last:border-b-0 last:pb-0 last:mb-0
              "
            >
              <div className="flex justify-between items-center">
                <div className="text-sm text-titleText dark:text-titleText-dark">
                  {row.title}
                </div>
                <div className="text-sm text-titleText dark:text-titleText-dark">
                  {/* آیکون نمونه */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" className="cursor-pointer">
                    <path d="M16.44 8.9C20.04 9.21 21.51 11.06 21.51 15.11v.13c0 4.47-1.79 6.26-6.26 6.26H8.74c-4.47 0-6.26-1.79-6.26-6.26v-.13C2.48 11.09 3.93 9.24 7.47 8.91" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 2V14.88" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15.35 12.65 12 16l-3.35-3.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          )}
          rowDetailsMode="row"
          rowDetailsClassName="rounded-xl p-3"
        />
      </div>
      <div className="relative w-full mb-4 ">
        <div className="flex justify-between items-center">
          <div className="text-sm text-titleText dark:text-titleText-dark"></div>

          <div className="text-sm text-titleText dark:text-titleText-dark">
            <button className="w-72 bg-primary h-[48px] rounded-lg text-white shadow-lg">
              افزودن صرافی جدید
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
