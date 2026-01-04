import React from "react";
import { toJalaliDate } from "./toJalaliDate";
import { BoardmemderRoleTypes } from "./BoardmemberRoleTypes";

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a === null || b === null) return a === b;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (typeof a === "object" && typeof b === "object") {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of keys) if (!deepEqual(a[key], b[key])) return false;
    return true;
  }
  return a === b;
}

function fmtVal(v: any): string {
  if (v === null || v === undefined) return "-";
  if (typeof v === "string") return v.trim() === "" ? "-" : v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return `[${v.length} آیتم]`;
  try {
    const s = JSON.stringify(v);
    return s === "{}" ? "-" : s;
  } catch {
    return "-";
  }
}

function formatJalaliDateTime(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(d).replace(/،/g, "").replace(",", "");
}

const IGNORE_FIELDS = new Set([
  "boardMemberInfo",
  "employeeInfo",
  "exchangeAgentInfo",
  "managerInfo",
  "financialStatements",
  "updatedAt"
]);

function getEntityChangesRows(input: any): {
  username: string;
  dateTime: string;
  field: string;
  oldValue: string;
  newValue: string;
}[] {
  const logs = Array.isArray(input) ? input : input.content;
  if (!logs || logs.length < 2) return [];

  const rows: any[] = [];

  for (let i = 1; i < logs.length; i++) {
    const prev = logs[i - 1].entity;
    const curr = logs[i].entity;
    const username = logs[i].metadata.delegate.username;
    const dateTime = formatJalaliDateTime(logs[i].metadata.revisionInstant);

    const allKeys = new Set([...Object.keys(prev), ...Object.keys(curr)]);

    allKeys.forEach((key) => {
      if (IGNORE_FIELDS.has(key)) return;

      let oldVal = prev[key];
      let newVal = curr[key];

      // 🟢 اگر فیلد تاریخ بود و مقدار داشت، تبدیل کن
      if (
        ["startDate", "insuranceStartDate", "insuranceEndDate", "establishmentDate"].includes(key)
      ) {
        if (oldVal) oldVal = toJalaliDate(oldVal);
        if (newVal) newVal = toJalaliDate(newVal);
      }
      if (key === "role") {
        const findLabel = (v: any) =>
          BoardmemderRoleTypes.find((r) => r.value === v)?.label || v;
        if (oldVal) oldVal = findLabel(oldVal);
        if (newVal) newVal = findLabel(newVal);
      }
      if (!deepEqual(oldVal, newVal)) {
        rows.push({
          username,
          dateTime,
          field: key,
          oldValue: fmtVal(oldVal),
          newValue: fmtVal(newVal),
        });
      }
    });
  }

  return rows;
}

export function LogViewer({ logs }: { logs: any }) {
  const rows = getEntityChangesRows(logs);

  return (
    <div className="w-full"> {/* 👈 کل پهنا را بگیرد */}
      {rows.length === 0 ? (
        <p className="text-gray-500 text-sm">هیچ تغییری ثبت نشده است.</p>
      ) : (
        <div className="max-h-96 overflow-y-auto overflow-x-auto border border-boxBorderColor dark:border-boxBorderColor-dark rounded-md w-full  text-titleText dark:text-titleText-dark">
          {/* 👇 جدول تمام عرض */}
          <table className="min-w-full w-full text-sm table-auto border-collapse">
            <thead className="bg-boxBorderColor dark:bg-boxBorderColor-dark sticky top-0">
              <tr>
                <th className="px-3 py-2 text-right border-b border-boxBorderColor dark:border-boxBorderColor-dark w-36  text-titleText dark:text-titleText-dark">
                  کاربر
                </th>
                <th className="px-3 py-2 text-right border-b border-boxBorderColor dark:border-boxBorderColor-dark w-48 text-titleText dark:text-titleText-dark">
                  تاریخ
                </th>
                <th className="px-3 py-2 text-right border-b border-boxBorderColor dark:border-boxBorderColor-dark w-40 text-titleText dark:text-titleText-dark">
                  پارامتر
                </th>
                <th className="px-3 py-2 text-right border-b border-boxBorderColor dark:border-boxBorderColor-dark text-titleText dark:text-titleText-dark">
                  قبل
                </th>
                <th className="px-3 py-2 text-right border-b border-boxBorderColor dark:border-boxBorderColor-dark text-titleText dark:text-titleText-dark">
                  بعد
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="px-3 py-2 border-b border-boxBorderColor dark:border-boxBorderColor-dark align-top text-titleText dark:text-titleText-dark">
                    {r.username}
                  </td>
                  <td className="px-3 py-2 border-b border-boxBorderColor dark:border-boxBorderColor-dark align-top whitespace-nowrap text-titleText dark:text-titleText-dark">
                    {r.dateTime}
                  </td>
                  <td className="px-3 py-2 border-b border-boxBorderColor dark:border-boxBorderColor-dark align-top font-semibold  text-titleText dark:text-titleText-dark">
                    {r.field}
                  </td>
                  <td className="px-3 py-2 border-b border-boxBorderColor dark:border-boxBorderColor-dark align-top  text-titleText dark:text-titleText-dark">
                    {r.newValue}
                  </td>
                  <td className="px-3 py-2 border-b border-boxBorderColor dark:border-boxBorderColor-dark align-top  text-titleText dark:text-titleText-dark">
                    {r.oldValue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
