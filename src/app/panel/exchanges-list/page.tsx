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
  logo?: string;
  name?: string;
  legalName?: number;
  registrationNumber?: number;
  siteAddress?: number;
  title?: string;
  link?: string;
  progress?: number;
  subRows?: Person[];
};

type Company = {
  id: number;
  name: string;
  logo: string;
  legalName: string;
  registrationNumber: string;
  siteAddress: string;
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
  const [isOpen, SetisOpen] = useState<boolean>(false)
  const [DeleteLoading, SetDeleteLoading] = useState<boolean>(false)
  const [Deletedata, SetDeletedata] = useState<Person>();

  const [filter, setFilter] = useState("all");

  // فیلدهایی که می‌خوای سرچ روی‌شون اعمال بشه:
  const searchKeys: (keyof Person)[] = ["name", "legalName", "registrationNumber", "siteAddress", "title", "link"];

  // دیتای فیلترشده برای جدول
  const filteredData = useMemo(() => filterTree(data, q, searchKeys), [data, q]);



  useEffect(() => {
    SetLoading(true)
    GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/exchanges?page=0&size=100`)
      .then((response) => {

        const people: Person[] = response.result.content.map((item: Company) => ({
          id: String(item.id),
          name: item.name,
          logo: item.logo,
          legalName: item.legalName,
          registrationNumber: item.registrationNumber,
          siteAddress: item.siteAddress,
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
    <div className="p-4 md:p-0">
      {/* Search box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="relative w-full h-[48px] mb-4 mt-8">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex w-full h-full p-0 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark border border-boxBorderColor dark:border-boxBorderColor-dark pl-4 pr-10 focus:outline-none focus:ring-0"
            placeholder="جست‌وجو"
          />
          <GenericSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-titleText dark:text-titleText-dark text-xl" />
        </div>
        <div className="hidden xl:inline-block"></div>
        <div className=" mb-4 mt-8">
          <RiskSwitch value={filter} onChange={setFilter} />
        </div>
      </div>



      {/* Table with filtered data */}
      <div className="mb-4">
        {
          Loading && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-white/70 dark:bg-bgColor-dark/70 backdrop-blur-sm">
              <div className="pointer-events-none">
                <AnimatedText />
              </div>
            </div>)
        }
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredData.map((item) => {
            const risk = Math.floor(Math.random() * 140);

            const show =
              filter === "all" ||
              (filter === "low" && risk >= 100) ||
              (filter === "medium" && risk >= 70 && risk < 100) ||
              (filter === "high" && risk < 70);

            if (!show) return null;

            return (
              <ExchangeCard
                key={item.id}
                rank={3}
                id={item.id}
                name={item.name ?? ""}
                volume="۲۳۳۶"
                risk={risk}             
                coins={220}
                lastUpdate="۱۴۰۴/۰۸/۱۷"
                logo={item.logo ?? ""}
              />
            );
          })}
        </div>
      </div>
      <div className="relative w-full mb-4 ">
        <div className="flex justify-between items-center">
          <div className="text-sm text-titleText dark:text-titleText-dark"></div>
          <div className="text-sm text-titleText dark:text-titleText-dark">
            <Link href={`/panel/add-new-exchange`}>
              <button className="w-72 bg-primary h-[48px] rounded-lg text-white shadow-lg" id="addExchangeButton">
                افزودن سکو جدید
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* -------- مودال تأیید حذف -------- */}
      <Modal open={isOpen} onClose={() => { SetisOpen(false) }}>
        {/* بک‌دراپ، تمام صفحه، یک لایه پایین‌تر از پنل */}
        <Modal.Backdrop className="fixed inset-0 w-screen h-screen bg-black/50 z-[2147483646]" />

        {/* کانتینر مرکزی پنل، بالاتر از بک‌دراپ */}
        <div className="fixed inset-0 z-[2147483647] flex items-center justify-center">
          <Modal.Panel className="bg-boxColor dark:bg-bgColor-dark shadow-xl rounded-xl text-titleText dark:text-titleText-dark w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-3 text-center">
              حذف سکو
            </h3>
            <p className="text-sm mb-6 text-center leading-relaxed mt-3">
              آیا از حذف سکو {Deletedata?.name} مطمئن هستید؟
            </p>

            <div className="flex justify-center gap-4 w-full">

              <button
                onClick={async () => {
                  try {
                    const token = document.cookie
                      .split('; ')
                      .find(Deletedata => Deletedata.startsWith('token='))
                      ?.split('=')[1];
                    if (Deletedata !== undefined) {
                      SetDeleteLoading(true)
                      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/api/exchanges/${Deletedata.id}`, {
                        method: 'DELETE',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        }
                      });
                      if (!response.ok) {
                        SetDeleteLoading(false)
                        toast.error("خطا در حذف سکو.", { position: "bottom-left" });
                        if (response.status === 403) {
                          document.cookie = `${'token'}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                          window.location.assign('/')
                        }
                        throw new Error('Failed to fetch data');
                      } else {
                        if (response.status === 200) {
                          SetDeleteLoading(false)
                          toast.success("سکو با موفقیت حذف شد.", { position: "bottom-left" });
                          window.location.reload();
                        }
                      }
                    } else {
                      SetDeleteLoading(false)
                      toast.error("خطا در حذف سکو.", { position: "bottom-left" });
                    }
                  } catch (error) {
                    SetDeleteLoading(false)
                    toast.error("خطا در حذف سکو.", { position: "bottom-left" });
                  }


                }}
                className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-lg transition"
              >
                {
                  DeleteLoading ?
                    'درحال حذف...'
                    :
                    'حذف'
                }

              </button>
            </div>
          </Modal.Panel>
        </div>
      </Modal>
    </div>
  );
};

export default Page;
