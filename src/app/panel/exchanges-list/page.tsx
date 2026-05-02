"use client";

import React, { useEffect, useMemo, useState } from "react";
import { GenericSearch } from "@heathmont/moon-icons-tw";
import Link from "next/link";
import { GetRequest } from "../../../../functions/GetRequest";
import toast from "react-hot-toast";
import AnimatedText from "../../../../components/AnimatedLoading/AnimatedLoading";
import { Modal } from "@heathmont/moon-core-tw";
import ExchangeCard from "../../../../components/Dashboard/ExchangeList/ExchangeCard/ExchangeCard";
import RiskSwitch from "../../../../components/Dashboard/ExchangeList/Switch/Switch";

type Person = {
  id: string;
  name: string;
  legalName: string;
  logo: string;
  registrationNumber: number;
  reserveRatio: number;
  siteAddress: string;
  uniqueCoins: number;
  uniqueUserCount: number;
};

type Company = {
  id: string;
  name: string;
  legalName: string;
  logo: string;
  registrationNumber: number;
  reserveRatio: number;
  siteAddress: string;
  uniqueCoins: number;
  uniqueUserCount: number;
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

      if (selfMatches) {
        // فقط زیرشاخه‌های مچ‌شده را نگه داریم
        return { ...node };
      }
      return null;
    })
    .filter(Boolean) as Person[];
}

const Page = () => {
  const [q, setQ] = useState("");
  const [Loading, SetLoading] = useState(false);
  const [data, Setdata] = useState<Person[]>([]);

  const [isOpen, SetisOpen] = useState<boolean>(false)
  const [DeleteLoading, SetDeleteLoading] = useState<boolean>(false)
  const [Deletedata, SetDeletedata] = useState<Person>();

  const [filter, setFilter] = useState("all");

  // فیلدهایی که می‌خوای سرچ روی‌شون اعمال بشه:
  const searchKeys: (keyof Person)[] = ["name", "legalName", "registrationNumber", "siteAddress"];

  // دیتای فیلترشده برای جدول
  const filteredData = useMemo(() => filterTree(data, q, searchKeys), [data, q]);

  useEffect(() => {
    SetLoading(true)
    GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/exchanges?page=0&size=10000`)
      .then((response) => {
        const people: Person[] = response.result.content.map((item: Company) => ({
          id: String(item.id),
          name: item.name,
          legalName: item.legalName,
          logo: item.logo,
          registrationNumber: item.registrationNumber,
          siteAddress: item.siteAddress,
          uniqueCoins: item.uniqueCoins,
          uniqueUserCount: item.uniqueUserCount,
          reserveRatio: item.reserveRatio ? item.reserveRatio * 100 : 0
        }));

        people.sort((a, b) => Number(b.id) - Number(a.id));

        Setdata(people);
        SetLoading(false)

      })
      .catch((err) => {
        SetLoading(false)
      })
  }, [])

  return (
    <div className="lg:p-0">

      {/* --------------------------- Search + Filters --------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 m-4 lg:m-0">

        {/* Search Box */}
        <div className="relative w-full h-[48px] mb-4 mt-8">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جست‌وجو"
            className="
                w-full h-full pl-4 pr-10
                rounded-xl
                appearance-none
              bg-boxColor dark:bg-boxColor-dark
              border-boxBorderColor dark:border-boxBorderColor-dark
                backdrop-blur-md
                shadow-sm
                text-slate-700
                dark:text-slate-200
                outline-none
                focus:outline-none
                focus:ring-0
                transition-colors
            "
          />



          <GenericSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-300 text-xl" />
        </div>

        <div className="hidden xl:inline-block"></div>

        {/* Risk Filter */}
        <div className="mb-4 mt-8">
          <RiskSwitch value={filter} onChange={setFilter} />
        </div>
      </div>

      {/* ------------------------ Add New Exchange Button ------------------------ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 m-4 lg:m-0 -mt-2 mb-4 items-end">

        <div></div>
        <div></div>

        <div className="flex justify-start xl:justify-end">
          <Link href={`/panel/add-new-exchange`}>
            <button
              id="addExchangeButton"
              className="
                group w-full sm:w-72 h-[52px]
                rounded-xl
                bg-gradient-to-r from-primary to-primary/80
                text-white text-[15px] font-bold
                shadow-[0_10px_30px_-10px_rgba(0,150,255,0.5)]
                transition-all duration-300 ease-out
  
                hover:-translate-y-0.5 hover:brightness-110
                hover:shadow-[0_18px_40px_-8px_rgba(0,150,255,0.7)]
  
                active:translate-y-0 active:shadow-[0_6px_20px_-10px_rgba(0,150,255,0.4)]
  
                focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2
              "
            >
              <span className="relative flex items-center justify-center gap-2">
                افزودن کارگزاری جدید

                <svg
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

              </span>
            </button>
          </Link>
        </div>
      </div>

      {/* --------------------------- Table + Results --------------------------- */}
      <div className="mb-4 mt-4">

        {/* Loading Layer */}
        {Loading && (
          <div className="fixed inset-0 z-50 grid place-items-center 
            bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
            <div className="pointer-events-none">
              <AnimatedText />
            </div>
          </div>
        )}

        {/* Data Cards Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">

          {filteredData.map((item, index) => {
            const risk = item.reserveRatio;
            const show =
              filter === "all" ||
              (filter === "low" && risk >= 100) ||
              (filter === "medium" && risk >= 70 && risk < 100) ||
              (filter === "high" && risk < 70);

            if (!show) return null;

            return (
              <ExchangeCard
                key={item.id}
                id={item.id}
                index={index}
                name={item.name ?? ''}
                legalName={item.legalName ?? ''}
                logo={item.logo ?? ''}
                registrationNumber={item.registrationNumber ?? ''}
                reserveRatio={item.reserveRatio ?? ''}
                siteAddress={item.siteAddress ?? ''}
                uniqueCoins={item.uniqueCoins ?? ''}
                uniqueUserCount={item.uniqueUserCount ?? ''}
              />
            );
          })}
        </div>
      </div>

      {/* ---------------------------- Delete Modal ---------------------------- */}
      <Modal open={isOpen} onClose={() => SetisOpen(false)}>

        {/* Glassy Backdrop */}
        <Modal.Backdrop className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2147483646]" />

        {/* Modal Center Container */}
        <div className="fixed inset-0 z-[2147483647] flex items-center justify-center">

          <Modal.Panel
            className="
              w-full max-w-md p-6
              rounded-2xl shadow-2xl
              bg-white/80 dark:bg-slate-900/80 
              backdrop-blur-xl
              border border-white/20 dark:border-slate-700
              text-slate-800 dark:text-slate-200
              animate-[fadeIn_0.25s_ease-out]
            "
          >
            <h3 className="text-xl font-bold text-center mb-4">
              حذف کارگزاری
            </h3>

            <p className="text-sm text-center mb-6 leading-relaxed">
              آیا از حذف کارگزاری {Deletedata?.name} مطمئن هستید؟
            </p>

            <div className="flex justify-center">
              <button
                onClick={async () => {
                  try {
                    const token = document.cookie
                      .split('; ')
                      .find(c => c.startsWith('token='))
                      ?.split('=')[1];

                    if (Deletedata) {
                      SetDeleteLoading(true);
                      const response = await fetch(
                        process.env.NEXT_PUBLIC_API_URL + `/api/exchanges/${Deletedata.id}`,
                        {
                          method: 'DELETE',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                          }
                        }
                      );

                      if (!response.ok) {
                        SetDeleteLoading(false);
                        toast.error("خطا در حذف کارگزاری.", { position: "bottom-left" });

                        if (response.status === 403) {
                          document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                          window.location.assign('/');
                        }

                        throw new Error('Failed');
                      } else {
                        SetDeleteLoading(false);
                        toast.success("کارگزاری با موفقیت حذف شد.", { position: "bottom-left" });
                        window.location.reload();
                      }
                    } else {
                      SetDeleteLoading(false);
                      toast.error("خطا در حذف کارگزاری.", { position: "bottom-left" });
                    }

                  } catch {
                    SetDeleteLoading(false);
                    toast.error("خطا در حذف کارگزاری.", { position: "bottom-left" });
                  }
                }}
                className="
                  px-6 py-2 rounded-xl
                  bg-red-600 hover:bg-red-700
                  text-white font-semibold
                  shadow-lg hover:shadow-red-700/30
                  transition-all duration-300
                "
              >
                {DeleteLoading ? "درحال حذف..." : "حذف"}
              </button>
            </div>
          </Modal.Panel>

        </div>
      </Modal>

    </div>
  );

};

export default Page;
