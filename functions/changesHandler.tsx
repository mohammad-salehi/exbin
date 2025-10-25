import React from "react";

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

      const oldVal = prev[key];
      const newVal = curr[key];

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
    <div className="">
      {rows.length === 0 ? (
        <p className="text-gray-500 text-sm">هیچ تغییری ثبت نشده است.</p>
      ) : (
        <div className="max-h-96 overflow-y-auto border border-boxBorderColor dark:border-boxBorderColor-dark rounded-md">
          <table className="min-w-full text-sm">
            <thead className="bg-boxBorderColor dark:bg-boxBorderColor-dark sticky top-0">
              <tr>
                <th className="px-3 py-2 text-right border-b   border-boxBorderColor dark:border-boxBorderColor-dark w-36">کاربر</th>
                <th className="px-3 py-2 text-right border-b   border-boxBorderColor dark:border-boxBorderColor-dark w-48">تاریخ</th>
                <th className="px-3 py-2 text-right border-b   border-boxBorderColor dark:border-boxBorderColor-dark w-40">پارامتر</th>
                <th className="px-3 py-2 text-right border-b   border-boxBorderColor dark:border-boxBorderColor-dark">قبل</th>
                <th className="px-3 py-2 text-right border-b   border-boxBorderColor dark:border-boxBorderColor-dark">بعد</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="">
                  <td className="px-3 py-2 border-b border-boxBorderColor dark:border-boxBorderColor-dark align-top">{r.username}</td>
                  <td className="px-3 py-2 border-b border-boxBorderColor dark:border-boxBorderColor-dark align-top whitespace-nowrap">
                    {r.dateTime}
                  </td>
                  <td className="px-3 py-2 border-b border-boxBorderColor dark:border-boxBorderColor-dark align-top font-semibold text-blue-700">
                    {r.field}
                  </td>
                  <td className="px-3 py-2 border-b border-boxBorderColor dark:border-boxBorderColor-dark align-top text-gray-600">
                    {r.oldValue}
                  </td>
                  <td className="px-3 py-2 border-b border-boxBorderColor dark:border-boxBorderColor-dark align-top text-green-700">
                    {r.newValue}
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
