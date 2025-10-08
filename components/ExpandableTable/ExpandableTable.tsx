"use client";

import React, { useMemo, useState, useCallback } from "react";

export type RowId = string;

export type Column<T> = {
  header: React.ReactNode;
  className?: string;
  cell?: (row: T) => React.ReactNode;
  accessorKey?: keyof T;
  align?: "start" | "center" | "end";
  width?: string | number;
};

export type ExpandableTableProps<T extends { id?: RowId; subRows?: T[] }> = {
  data: T[];
  columns: Column<T>[];
  className?: string;
  rtl?: boolean;
  searchKeys?: (keyof T)[];
  searchPlaceholder?: string;
  pageSize?: number;
  getRowId?: (row: T, path: string) => RowId;
  getSubRows?: (row: T) => T[] | undefined;
  onRowClick?: (row: T) => void;
  defaultExpandedIds?: RowId[];
  renderProgress?: (value: number) => React.ReactNode;
  rowDetails?: (row: T) => React.ReactNode | React.ReactNode[];
  rowDetailsClassName?: string;
  rowDetailsMode?: "inline" | "row";
  detailsColumnIndex?: number;
};

function classNames(...xs: Array<string | false | undefined>) {
  return xs.filter(Boolean).join(" ");
}
function getAlignClass(a?: "start" | "center" | "end") {
  if (a === "center") return "text-center";
  if (a === "end") return "text-left rtl:text-right ltr:text-right";
  return "text-right rtl:text-right ltr:text-left";
}

const CaretRight = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
    <path d="M9 6l6 6-6 6" />
  </svg>
);
const CaretDown = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export default function ExpandableTable<T extends { id?: RowId; subRows?: T[] }>(
  props: ExpandableTableProps<T>
) {
  const {
    data,
    columns,
    searchKeys = [],
    pageSize,
    getRowId,
    getSubRows = (r) => r.subRows,
    onRowClick,
    defaultExpandedIds = [],
    renderProgress,

    rowDetails,
    rowDetailsClassName,
    rowDetailsMode = "inline",
    detailsColumnIndex = 0,
  } = props;

  const computeId = useCallback(
    (row: T, path: string): RowId => (row.id ? String(row.id) : getRowId ? getRowId(row, path) : path),
    [getRowId]
  );

  type FlatRow = { row: T; level: number; id: RowId; path: string; parent?: RowId };
  const flatten = useCallback(
    (rows: T[], level = 0, parentPath = "", parentId?: RowId): FlatRow[] => {
      const out: FlatRow[] = [];
      rows.forEach((r, idx) => {
        const path = parentPath ? `${parentPath}.${idx}` : `${idx}`;
        const id = computeId(r, path);
        out.push({ row: r, level, id, path, parent: parentId });
        const children = getSubRows(r);
        if (children?.length) {
          out.push(...flatten(children, level + 1, path, id));
        }
      });
      return out;
    },
    [computeId, getSubRows]
  );
  const flat = useMemo(() => flatten(data), [data, flatten]);

  const [expanded, setExpanded] = useState<Set<RowId>>(new Set(defaultExpandedIds));
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const toggle = useCallback((id: RowId) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const byId = useMemo(() => {
    const m = new Map<RowId, FlatRow>();
    flat.forEach((f) => m.set(f.id, f));
    return m;
  }, [flat]);

  const childrenOf = useCallback((id: RowId) => flat.filter((f) => f.parent === id), [flat]);

  const rowMatches = useCallback(
    (r: T) => {
      const q = query.trim().toLowerCase();
      if (!q || !searchKeys.length) return true;
      return searchKeys.some((k) => {
        const v = r[k];
        return typeof v === "string" || typeof v === "number"
          ? String(v).toLowerCase().includes(q)
          : false;
      });
    },
    [query, searchKeys]
  );

  const subtreeMatches = useCallback(
    (id: RowId): boolean => {
      const node = byId.get(id);
      if (!node) return false;
      if (rowMatches(node.row)) return true;
      return childrenOf(id).some((c) => subtreeMatches(c.id));
    },
    [byId, childrenOf, rowMatches]
  );

  const roots = useMemo(() => flat.filter((f) => f.level === 0), [flat]);

  const visibleRows = useMemo(() => {
    if (!query) return roots;
    return roots.filter((root) => subtreeMatches(root.id));
  }, [roots, query, subtreeMatches]);

  const total = visibleRows.length;
  const pageCount = pageSize ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  const currentPage = Math.min(page, pageCount);
  const paginated = useMemo(() => {
    if (!pageSize) return visibleRows;
    const start = (currentPage - 1) * pageSize;
    return visibleRows.slice(start, start + pageSize);
  }, [visibleRows, pageSize, currentPage]);

  const renderCell = useCallback(
    (col: Column<T>, row: T): React.ReactNode => {
      if (col.cell) return col.cell(row);
      if (col.accessorKey) {
        const v = row[col.accessorKey]; // ✅ نوع درست میشه T[keyof T]
        if (
          typeof v === "number" &&
          col.accessorKey.toString().toLowerCase().includes("progress") &&
          renderProgress
        ) {
          return renderProgress(v);
        }
        return String(v ?? "");
      }
      return null;
    },
    [renderProgress]
  );

  return (
    <div className="">
      <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-boxColor-dark bg-gray-100 shadow-sm px-2 dark:bg-boxColor-dark">
        <table className="min-w-[720px] w-full text-sm border-separate border-spacing-y-2">
          <thead className="sticky top-0 bg-gray-100 dark:bg-boxColor-dark text-gray-700">
            <tr className="text-right">
              {columns.map((c, i) => (
                <th
                  key={i}
                  className={classNames(
                    "px-6 py-5 font-semibold text-titleText dark:text-titleText-dark",
                    i === 0 ? "first:rounded-tr-2xl rtl:first:rounded-tr-2xl" : "",
                    i === columns.length - 1 ? "last:rounded-tl-2xl rtl:last:rounded-tl-2xl" : "",
                    getAlignClass(c.align)
                  )}
                  style={c.width ? { width: c.width } : undefined}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginated.map((f) => {
              const node = f;
              const kids = childrenOf(node.id);
              const hasChildren = kids.length > 0;

              const detailNodes =
                hasChildren && rowDetails
                  ? kids.flatMap((k) => {
                    const raw = React.Children.toArray(rowDetails(k.row as T));
                    return raw.map((child, i) => {
                      const stableKey = `detail__p:${node.path}__c:${k.path}__i:${i}`;
                      return React.isValidElement(child)
                        ? React.cloneElement(child, { key: stableKey })
                        : <React.Fragment key={stableKey}>{child}</React.Fragment>;
                    });
                  })
                  : [];

              const hasDetails = detailNodes.length > 0;
              const canExpand = hasChildren && hasDetails;
              const isOpen = expanded.has(node.id);
              const showDetails = isOpen && hasDetails;


              return (
                <React.Fragment key={`row-${node.path}`}>
                  {/* ردیف اصلی */}
                  <tr
                    className="text-titleText dark:text-titleText-dark"
                    onClick={() => onRowClick?.(node.row)}
                  >
                    {columns.map((c, ci) => (
                      <td
                        key={ci}
                        className={classNames(
                          "px-6 py-6 align-top bg-white dark:bg-bgColor-dark !border-0 ring-0 shadow-none",
                          "first:rounded-r-xl last:rounded-l-xl",
                          getAlignClass(c.align),
                          c.className
                        )}
                        style={c.width ? { width: c.width } : undefined}
                      >
                        {rowDetailsMode === "inline" && ci === detailsColumnIndex ? (
                          <div className="flex flex-col gap-0" style={{ paddingInlineStart: `${node.level * 1.25}rem` }}>
                            <div className="flex items-center gap-2">
                              {canExpand ? (
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggle(node.id); }}
                                  className="inline-flex items-center justify-center rounded  hover:bg-gray-100 hover:dark:bg-gray-800 p-1"
                                  aria-label={isOpen ? "بستن" : "باز کردن"}
                                >
                                  {isOpen ? <CaretDown /> : <CaretRight />}
                                </button>
                              ) : (
                                null
                              )}
                              <span>{renderCell(c, node.row)}</span>
                            </div>

                            {showDetails && (
                              <div className={classNames("mt-3 pt-3 !border-0 !ring-0 shadow-none", rowDetailsClassName)}>
                                <div className="flex flex-col gap-3">{detailNodes}</div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            {ci === 0 && rowDetailsMode === "row" ? (
                              <div className="flex items-center gap-2" style={{ paddingInlineStart: `${node.level * 1.25}rem` }}>
                                {canExpand ? (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); toggle(node.id); }}
                                    className="inline-flex items-center justify-center rounded hover:bg-gray-100 hover:dark:bg-gray-800 p-1"
                                    aria-label={isOpen ? "بستن" : "باز کردن"}
                                  >
                                    {isOpen ? <CaretDown /> : <CaretRight />}
                                  </button>
                                ) : (
                                  null
                                )}
                                <span className="text-titleText dark:text-titleText-dark">{renderCell(c, node.row)}</span>
                              </div>
                            ) : (
                              renderCell(c, node.row)
                            )}
                          </>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* ردیف جزئیات تمام‌عرض */}
                  {rowDetailsMode === "row" && showDetails && (
                    <tr key={`detail-row-${node.path}`} >
                      <td
                        colSpan={columns.length}
                        className="bg-white dark:bg-bgColor-dark p-0 first:rounded-r-xl last:rounded-l-xl !border-0 ring-0 shadow-none "
                      >
                        <div className={classNames("px-6 py-4  shadow-none", rowDetailsClassName)}>
                          <div className="flex flex-col gap-3">
                            {detailNodes}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );

            })}

            {paginated.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-titleText dark:text-titleText-dark bg-none rounded-xl">
                  <div className="flex justify-center items-center" style={{ height: '100px' }}>
                    <svg fill="currentColor" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                      width="50px" height="50px" viewBox="0 0 462.035 462.035"
                      xmlSpace="preserve">
                      <g>
                        <path d="M457.83,158.441c-0.021-0.028-0.033-0.058-0.057-0.087l-50.184-62.48c-0.564-0.701-1.201-1.305-1.879-1.845
                        c-2.16-2.562-5.355-4.225-8.967-4.225H65.292c-3.615,0-6.804,1.661-8.965,4.225c-0.678,0.54-1.316,1.138-1.885,1.845l-50.178,62.48
                        c-0.023,0.029-0.034,0.059-0.057,0.087C1.655,160.602,0,163.787,0,167.39v193.07c0,6.5,5.27,11.771,11.77,11.771h438.496
                        c6.5,0,11.77-5.271,11.77-11.771V167.39C462.037,163.787,460.381,160.602,457.83,158.441z M408.516,134.615l16.873,21.005h-16.873
                        V134.615z M384.975,113.345v42.274H296.84c-2.514,0-4.955,0.805-6.979,2.293l-58.837,43.299l-58.849-43.305
                        c-2.023-1.482-4.466-2.287-6.978-2.287H77.061v-42.274H384.975z M53.523,155.62H36.65l16.873-21.005V155.62z M438.498,348.69H23.54
                        V179.16h137.796l62.711,46.148c4.15,3.046,9.805,3.052,13.954-0.005l62.698-46.144h137.799V348.69L438.498,348.69z"/>
                      </g>
                    </svg>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    نتیجه‌ای یافت نشد
                  </div>
                </td>
              </tr>

            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
