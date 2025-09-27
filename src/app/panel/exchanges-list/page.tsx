"use client";

import React, { useEffect, useMemo, useState } from "react";
import ExpandableTable, { Column } from "../../../../components/ExpandableTable/ExpandableTable";
import { GenericSearch } from "@heathmont/moon-icons-tw";
import Link from "next/link";
import { GetRequest } from "../../../../functions/GetRequest";
import LoadingComponent from "../../../../components/LoadingComponent/LoadingComponent";
import Pagination from "../../../../components/Pagination/Pagination";

type Person = {
  id: string;
  logo?: string;
  name?: string;
  legal_name?: number;
  registrationNumber?: number;
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
  const [Loading, SetLoading] = useState(false);
  const [data, Setdata] = useState<Person[]>([]);

  const [First, SetFirst] = useState<number>(0)



  const columns: Column<Person>[] = [
    {
      header: "لوگو",
      accessorKey: "logo",
      cell: (row: Person) => (
        <div className="flex items-center gap-2 text-titleText dark:text-titleText-dark">
          {
            row.logo !== "" ?
              <img src={row.logo} style={{ width: "30px" }} alt="image" />
              :
              <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.2639 15.9376L12.5958 14.2835C11.7909 13.4852 11.3884 13.0861 10.9266 12.9402C10.5204 12.8119 10.0838 12.8166 9.68048 12.9537C9.22188 13.1096 8.82814 13.5173 8.04068 14.3327L4.04409 18.2802M14.2639 15.9376L14.6053 15.5991C15.4112 14.7999 15.8141 14.4003 16.2765 14.2544C16.6831 14.1262 17.12 14.1312 17.5236 14.2688C17.9824 14.4252 18.3761 14.834 19.1634 15.6515L20 16.4936M14.2639 15.9376L18.275 19.9566M20.9992 6.00011H14.9992M11 3.99951L7.2 4.00011C6.07989 4.00011 5.51984 4.00011 5.09202 4.21809C4.71569 4.40984 4.40973 4.7158 4.21799 5.09213C4 5.51995 4 6.08 4 7.20011V16.8001C4 17.4576 4 17.9222 4.04409 18.2802M20 9.99951V16.4936M4.04409 18.2802C4.07512 18.5322 4.12796 18.7314 4.21799 18.9081C4.40973 19.2844 4.71569 19.5904 5.09202 19.7821C5.51984 20.0001 6.07989 20.0001 7.2 20.0001H16.8C17.9201 20.0001 18.4802 20.0001 18.908 19.7821C19.2843 19.5904 19.5903 19.2844 19.782 18.9081C20 18.4803 20 17.9202 20 16.8001V16.4936" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
          }
        </div>
      ),
    },
    {
      header: "نام صرافی", accessorKey: "name",

      cell: (row: Person) => (
        <div>
          <Link href={`/panel/exchange/${row.id}`}>
            {row.name}
            <svg width="20px" height="20px" viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block' }} className="mr-1">
              <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g id="icon" fill="currentColor" transform="translate(85.333333, 64.000000)">
                  <path d="M128,63.999444 L128,106.666444 L42.6666667,106.666667 L42.6666667,320 L256,320 L256,234.666444 L298.666,234.666444 L298.666667,362.666667 L4.26325641e-14,362.666667 L4.26325641e-14,64 L128,63.999444 Z M362.666667,1.42108547e-14 L362.666667,170.666667 L320,170.666667 L320,72.835 L143.084945,249.751611 L112.915055,219.581722 L289.83,42.666 L192,42.6666667 L192,1.42108547e-14 L362.666667,1.42108547e-14 Z" id="Combined-Shape"></path>
                </g>
              </g>
            </svg>
          </Link>
        </div>
      ),
    },
    { header: "نام حقوقی", accessorKey: "legal_name", align: "center", className: "tabular-nums" },
    { header: "شماره ثبت", accessorKey: "registrationNumber", align: "center", className: "tabular-nums" },
    { header: "سایت", accessorKey: "website", align: "center", className: "tabular-nums" },
    {
      header: "عملیات",
      accessorKey: "progress",
      cell: (row: Person) => (
        <div className="flex items-center gap-2 text-titleText dark:text-titleText-dark">
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none" className="cursor-pointer">
            <path d="M21.5 5.97998C18.17 5.64998 14.82 5.47998 11.48 5.47998C9.5 5.47998 7.52 5.57998 5.54 5.77998L3.5 5.97998" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 4.97L9.22 3.66C9.38 2.71 9.5 2 11.19 2H13.81C15.5 2 15.63 2.75 15.78 3.67L16 4.97" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19.3504 9.14014L18.7004 19.2101C18.5904 20.7801 18.5004 22.0001 15.7104 22.0001H9.29039C6.50039 22.0001 6.41039 20.7801 6.30039 19.2101L5.65039 9.14014" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10.8301 16.5H14.1601" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 12.5H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ),
    },
  ];

  // فیلدهایی که می‌خوای سرچ روی‌شون اعمال بشه:
  const searchKeys: (keyof Person)[] = ["name", "legal_name", "registrationNumber", "website", "title", "link"];

  // دیتای فیلترشده برای جدول
  const filteredData = useMemo(() => filterTree(data, q, searchKeys), [data, q]);

  useEffect(() => {
    SetLoading(true)
    GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/exchanges`)
      .then((response) => {

        const getData = []
        console.log(response.result.content)
        for (let i = 0; i < response.result.content.length; i++) {
          getData.push(
            {
              id: response.result.content[i].id,
              name: response.result.content[i].name,
              logo: response.result.content[i].logo,
              legal_name: response.result.content[i].legalName,
              registrationNumber: response.result.content[i].registrationNumber,
              website: response.result.content[i].website
            }
          )
        }
        Setdata(getData)
        SetLoading(false)

      })
      .catch((err) => {
        SetLoading(false)
      })
  }, [])

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
        {
          Loading ?
            <div className="p-8">
              <LoadingComponent />
            </div>
            :
            <div>
              <ExpandableTable<Person>
                data={filteredData.slice((First * 10), (First * 10) + 10)}          // ← فقط دیتای فیلترشده را بده
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
                          <path d="M16.44 8.9C20.04 9.21 21.51 11.06 21.51 15.11v.13c0 4.47-1.79 6.26-6.26 6.26H8.74c-4.47 0-6.26-1.79-6.26-6.26v-.13C2.48 11.09 3.93 9.24 7.47 8.91" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M12 2V14.88" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M15.35 12.65 12 16l-3.35-3.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
                rowDetailsMode="row"
                rowDetailsClassName="rounded-xl p-3"
              />
              <Pagination
                rtl
                totalItems={filteredData.length}
                pageSize={10}
                currentPage={First + 1}
                onPageChange={
                  (e) => {
                    SetFirst(e - 1)
                  }
                }
              />
            </div>
        }
      </div>
      <div className="relative w-full mb-4 ">
        <div className="flex justify-between items-center">
          <div className="text-sm text-titleText dark:text-titleText-dark"></div>
          <div className="text-sm text-titleText dark:text-titleText-dark">
            <Link href={`/panel/add-new-exchange`}>
              <button className="w-72 bg-primary h-[48px] rounded-lg text-white shadow-lg" >
                افزودن صرافی جدید
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
