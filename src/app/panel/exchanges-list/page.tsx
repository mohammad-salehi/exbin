"use client";

import React, { useMemo } from "react";
import ExpandableTable, { Column } from "../../../../components/ExpandableTable/ExpandableTable";
import { GenericSearch } from '@heathmont/moon-icons-tw';



type Person = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  progress: number;
  status: "relationship" | "complicated" | "single";
  subRows?: Person[];
};

const page = () => {

  const data: Person[] = [
    {
      id: "1",
      firstName: "لوگو1",
      lastName: "صرافی آبان تتر",
      age: 1400123456,
      visits: 1010101010,
      status: "relationship",
      progress: 75,
      subRows: [
        {
          id: "1.1",
          firstName: "لوگو1-1",
          lastName: "شعبه تهران",
          age: 1400223344,
          visits: 123,
          status: "complicated",
          progress: 50,
        },
        {
          id: "1.1",
          firstName: "لوگو1-1",
          lastName: "شعبه تهران",
          age: 1400223344,
          visits: 645456,
          status: "complicated",
          progress: 50,
        },
        {
          id: "1.1",
          firstName: "لوگو1-1",
          lastName: "شعبه تهران",
          age: 1400223344,
          visits: 645456,
          status: "complicated",
          progress: 50,
        },
      ],
    },
    {
      id: "2",
      firstName: "لوگو2",
      lastName: "صرافی پارسیان کریپتو",
      age: 1400654321,
      visits: 3030303030,
      status: "single",
      progress: 90,
    },
    {
      id: "3",
      firstName: "لوگو3",
      lastName: "صرافی والکس",
      age: 1400765432,
      visits: 4040404040,
      status: "relationship",
      progress: 30,
    },
  ];

  const columns: Column<Person>[] = [
    { header: "لوگو", accessorKey: "firstName", width: 220 },
    { header: "نام صرافی", accessorKey: "lastName" },
    { header: "نام حقوقی", accessorKey: "age", align: "center", className: "tabular-nums" },
    { header: "شناسه ملی", accessorKey: "visits", align: "center", className: "tabular-nums" },
    { header: "سایت", accessorKey: "status" },
    {
      header: "عملیات",
      accessorKey: "progress",
      cell: (r: { progress: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded">
            <div className="h-2 bg-blue-500 rounded" style={{ width: `${r.progress}%` }} />
          </div>
          <span className="text-xs tabular-nums">{r.progress}%</span>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="relative w-[491px] h-[48px]">
        <input
          className="flex w-full h-full p-0 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-[0_8px_24px_-8px_rgba(0,_0,_0,_0.16),_0_0_1px_0_rgba(0,_0,_0,_0.40)] pl-4 pr-10 focus:outline-none focus:ring-0"
          placeholder="جست‌وجو"
        />
        <GenericSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl" />
      </div>

      <div className="">
        <ExpandableTable<Person>
          data={data}
          columns={columns}
          defaultExpandedIds={["1"]} // اگر خواستی باز باشد
          rowDetails={(row) => {
            return (
              <div className="
              bg-white p-3 w-full
                border-b border-gray-200
                last:border-b-0 last:pb-0 last:mb-0
              ">
                <div className="text-sm text-gray-700">شناسه ملی: {row.visits}</div>
                <div className="text-sm text-gray-700">وضعیت: {row.status}</div>
              </div>
            );
          }}
          
          rowDetailsMode="row"
          rowDetailsClassName="rounded-xl p-3"
        />
      </div>

    </div>
  )
}

export default page
