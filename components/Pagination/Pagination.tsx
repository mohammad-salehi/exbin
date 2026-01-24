"use client";
import React, { useMemo } from "react";

export type TablePaginationProps = {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
  rtl?: boolean;
  compact?: boolean;
};

function usePagination(totalItems: number, currentPage: number, pageSize: number) {
  return useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(totalItems / Math.max(1, pageSize)));
    const pages: (number | "…")[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return { pages, totalPages };
    }

    const siblings = 1;
    const left = Math.max(2, currentPage - siblings);
    const right = Math.min(totalPages - 1, currentPage + siblings);

    pages.push(1);
    if (left > 2) pages.push("…");

    for (let i = left; i <= right; i++) pages.push(i);

    if (right < totalPages - 1) pages.push("…");

    return { pages, totalPages };
  }, [totalItems, currentPage, pageSize]);
}

export default function Pagination({
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
  className = "",
  rtl = false,
  compact = false,
}: TablePaginationProps) {
  const { pages, totalPages } = usePagination(totalItems, currentPage, pageSize);

  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  const dir = rtl ? "rtl" : "ltr";
  const arrowPrev = rtl ? "→" : "←";
  const arrowNext = rtl ? "←" : "→";

  const size = compact ? "h-8 px-2 text-sm" : "h-10 px-3 text-sm";

  return (
    <div dir={dir} className={`w-full flex justify-start mt-4 ${className}`}>
      <div className="flex items-center gap-4 flex-wrap">

        {/* 🔹 دکمه‌ها */}
        <div className="flex items-center gap-1">
          <button
            className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/40 ${size} disabled:opacity-40 text-titleText dark:text-titleText-dark`}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={isFirst}
          >
            {arrowPrev}
          </button>

          {pages.map((p, i) => (
            <button
              key={`${p}-${i}`}
              className={`rounded-xl border border-gray-200 dark:border-gray-700 ${size} ${p === currentPage
                  ? "bg-gray-200 dark:bg-black text-black dark:text-white border-primary-500"
                  : "bg-white/70 dark:bg-gray-900/40 text-titleText dark:text-titleText-dark"
                }`}
              onClick={() => typeof p === "number" && onPageChange(p)}
              disabled={p === "…"}
            >
              {p}
            </button>
          ))}

          <button
            className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/40 ${size} disabled:opacity-40 text-titleText dark:text-titleText-dark`}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={isLast}
          >
            {arrowNext}
          </button>
        </div>

        {/* 🔹 تعداد کل دیتا */}
        <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
          مجموع:
          <span className="font-bold mx-1 text-titleText dark:text-titleText-dark">
            {totalItems.toLocaleString("fa-IR")}
          </span>
          داده
        </div>
      </div>
    </div>
  );

}
