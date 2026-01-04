import React, { useEffect, useMemo, useRef, useState } from "react";
import ExpandableTable, { Column } from "../../../ExpandableTable/ExpandableTable";
import { Modal, Button, Input, Dropdown, MenuItem, Label } from "@heathmont/moon-core-tw";
import { GetRequest, DeleteRequest } from "../../../../functions/GetRequest";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { LoaderCircle } from "../../../Loader/Loader";

import { validateEmail, validateNumbers } from "../../../../functions/Validations";
import { PostRequest, PutRequest } from "../../../../functions/PostRequest";
import { handlePostErrors } from "../../../../functions/handlePostErrors";

import Pagination from "../../../Pagination/Pagination";
import { LogViewer } from "../../../../functions/changesHandler";
import LoadingComponent from "../../../LoadingComponent/LoadingComponent";

import { BoardmemderRoleTypes } from "../../../../functions/BoardmemberRoleTypes";
import { ControlsChevronDown } from "@heathmont/moon-icons-tw";

type Person = {
  id: string;
  index: number; // ui index for testing ids
  name: string;
  role: string; // value
  phoneNumber: string;
  nationalCode: string;
  educationalHistory: string;
  careerHistory: string;
  sharePercentage: string; // string in table
  email: string;
};

type ExchangeInfoProps = {
  SetC3: React.Dispatch<React.SetStateAction<boolean>>;
};

const cx = (...c: Array<string | false | undefined | null>) => c.filter(Boolean).join(" ");

const panelBase =
  "w-full rounded-2xl bg-white dark:bg-bgColor-dark shadow-lg ring-1 ring-black/5 dark:ring-white/5";

const inputBase =
  "h-12 px-4 rounded-xl bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark " +
  "border border-boxBorderColor dark:border-boxBorderColor-dark shadow-sm " +
  "focus:outline-none focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary-dark/30";

const textareaBase =
  "w-full min-h-[48px] px-4 py-3 rounded-xl bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark " +
  "border border-boxBorderColor dark:border-boxBorderColor-dark shadow-sm " +
  "focus:outline-none focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary-dark/30";

const subtleText = "text-sm text-titleText/70 dark:text-titleText-dark/70";

const Hint = ({ children }: { children: React.ReactNode }) => (
  <div className={cx(subtleText, "text-xs mt-1 leading-5")}>{children}</div>
);

const Field = ({
  label,
  required,
  children,
  className,
  hint,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cx("flex flex-col gap-2", className)}>
    <Label className="text-sm font-medium text-titleText dark:text-titleText-dark">
      {label} {required ? <span className="text-red-500">*</span> : null}
    </Label>
    {children}
    {hint ? <Hint>{hint}</Hint> : null}
  </div>
);

const IconBtn = ({
  id,
  title,
  onClick,
  children,
}: {
  id: string;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    id={id}
    title={title}
    onClick={onClick}
    className={cx(
      "h-9 w-9 grid place-items-center rounded-xl",
      "border border-boxBorderColor dark:border-boxBorderColor-dark",
      "bg-boxColor/20 dark:bg-boxColor-dark/20",
      "hover:bg-boxColor/60 dark:hover:bg-boxColor-dark/60",
      "transition"
    )}
  >
    {children}
  </button>
);

const BoardMemberTable = ({ SetC3 }: ExchangeInfoProps) => {
  const params = useParams<{ id: string }>();

  const PAGE_SIZE = 10;

  const emptyForm: Person = {
    id: "",
    index: 0,
    name: "",
    phoneNumber: "",
    nationalCode: "",
    role: "",
    careerHistory: "",
    educationalHistory: "",
    sharePercentage: "",
    email: "",
  };

  const didInit = useRef(false);

  const [data, setData] = useState<Person[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(0); // 0-based
  const [tableLoading, setTableLoading] = useState(false);

  const [form, setForm] = useState<Person>(emptyForm);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [editLoading, setEditLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  const [deleteBox, setDeleteBox] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteForm, setDeleteForm] = useState<Person>(emptyForm);

  const [isLogOpen, setIsLogOpen] = useState(false);
  const [LogNumber, setLogNumber] = useState(0);
  const [LogPage, setLogPage] = useState(0);
  const [LogLoading, setLogLoading] = useState(false);
  const [Changes, setChanges] = useState<string[]>([]);

  // -------- helpers
  const normalize = (val: any) => String(val ?? "").trim();
  const isDigits = (val: string, len?: number) => /^\d+$/.test(val) && (!len || val.length === len);
  const hasNoSpecialChars = (val: string) => /^[\u0600-\u06FFa-zA-Z0-9\s]+$/.test(val);

  const roleLabel = (value: string) =>
    BoardmemderRoleTypes.find((r) => r.value === value)?.label ?? value;

  const roleValueFromLabel = (label: string) =>
    BoardmemderRoleTypes.find((r) => r.label === label)?.value ?? "";

  // -------- fetch table (server-side pagination)
  const fetchBoardMembers = (pageToFetch = page) => {
    setTableLoading(true);
    GetRequest(
      `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/board-members?page=${pageToFetch}&size=${PAGE_SIZE}&sort=updatedAt,DESC`
    )
      .then((response) => {
        const content = (response?.result?.content ?? []) as Omit<Person, "index">[];
        const total = Number(response?.result?.totalElements ?? content.length);

        // index should be stable for testing ids inside current page
        const indexed: Person[] = content.map((item: any, idx: number) => ({
          ...item,
          index: pageToFetch * PAGE_SIZE + idx, // global index for ids
        }));

        setData(indexed);
        setTotalItems(total);
        SetC3(true);
      })
      .catch((err) => {
        console.log(err);
        SetC3(true);
        setData([]);
        setTotalItems(0);
      })
      .finally(() => setTableLoading(false));
  };

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    fetchBoardMembers(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // when page changes (after init)
    if (!didInit.current) return;
    fetchBoardMembers(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // -------- audit
  const Audit = () => {
    if (!editingId) return;
    setLogLoading(true);
    GetRequest(
      `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/audit/board-members/${editingId}?page=${LogPage}&size=10&sort=updatedAt,DESC`
    )
      .then((response) => {
        setLogLoading(false);
        setChanges(response.result.content);
        setLogNumber(response.result.totalElements);
      })
      .catch(() => {
        setLogLoading(false);
        setChanges([]);
      });
  };

  useEffect(() => {
    if (isLogOpen) Audit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogOpen, LogPage]);

  // -------- modals open/close
  const openAddModal = () => {
    setForm(emptyForm);
    setEditingId(null);
    setIsAddOpen(true);
  };

  const openEditModal = (row: Person) => {
    setForm({
      ...row,
      // ensure sharePercentage is string for input
      sharePercentage: String(row.sharePercentage ?? ""),
    });
    setEditingId(row.id);
    setIsEditOpen(true);
  };

  // -------- actions
  const handleDelete = async (row: Person) => {
    setDeleteLoading(true);

    DeleteRequest(
      `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/board-members/${row.id}`
    )
      .then(() => {
        toast.success("عضو هیئت‌مدیره و سهامداران با موفقیت حذف شد.", {
          position: "bottom-left",
        });

        // refresh current page; if page becomes empty and not first page -> go back one page
        const afterTotal = Math.max(0, totalItems - 1);
        const lastPageIndex = Math.max(0, Math.ceil(afterTotal / PAGE_SIZE) - 1);

        setTotalItems(afterTotal);
        setDeleteBox(false);

        if (page > lastPageIndex) {
          setPage(lastPageIndex);
        } else {
          fetchBoardMembers(page);
        }
      })
      .catch((err) => handlePostErrors(err))
      .finally(() => setDeleteLoading(false));
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    const name = normalize(form.name);
    const phoneNumber = normalize(form.phoneNumber);
    const nationalCode = normalize(form.nationalCode);
    const role = normalize(form.role);
    const email = normalize(form.email);

    const sharePercentageNum = Number(String(form.sharePercentage ?? "").trim());

    if (!name) return toast.error("نام و نام‌خانوادگی الزامی است", { position: "bottom-left" });
    if (!hasNoSpecialChars(name))
      return toast.error("نام نباید شامل کاراکترهای خاص باشد", { position: "bottom-left" });
    if (!/^0\d{10}$/.test(phoneNumber))
      return toast.error("شماره همراه باید ۱۱ رقم و با ۰ شروع شود", { position: "bottom-left" });
    if (!isDigits(nationalCode, 10))
      return toast.error("کد ملی باید دقیقاً ۱۰ رقم باشد", { position: "bottom-left" });
    if (!role) return toast.error("سمت یا نقش الزامی است", { position: "bottom-left" });
    if (isNaN(sharePercentageNum))
      return toast.error("درصد سهام را به‌درستی وارد کنید", { position: "bottom-left" });
    if (sharePercentageNum < 0 || sharePercentageNum > 100)
      return toast.error("درصد سهام باید بین ۰ تا ۱۰۰ باشد", { position: "bottom-left" });
    if (email && !validateEmail(email))
      return toast.error("ایمیل را به‌درستی وارد کنید", { position: "bottom-left" });

    const payload = {
      name,
      phoneNumber,
      nationalCode,
      role, // value
      educationalHistory: normalize(form.educationalHistory),
      careerHistory: normalize(form.careerHistory),
      sharePercentage: sharePercentageNum,
      email,
    };

    setEditLoading(true);
    PutRequest(
      `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/board-members/${editingId}`,
      payload
    )
      .then(() => {
        toast.success("عضو هیئت‌مدیره و سهامداران با موفقیت ویرایش شد.", { position: "bottom-left" });
        setIsEditOpen(false);
        fetchBoardMembers(page);
      })
      .catch((err) => handlePostErrors(err))
      .finally(() => setEditLoading(false));
  };

  const handleAdd = async () => {
    const name = normalize(form.name);
    const phoneNumber = normalize(form.phoneNumber);
    const nationalCode = normalize(form.nationalCode);
    const roleLabelText = normalize(form.role); // in add modal user may pick label
    const email = normalize(form.email);

    const sharePercentageNum = parseFloat(String(form.sharePercentage ?? "").trim());

    if (!name) return toast.error("نام و نام‌خانوادگی الزامی است", { position: "bottom-left" });
    if (!/^0\d{10}$/.test(phoneNumber))
      return toast.error("شماره همراه باید ۱۱ رقم و با ۰ شروع شود", { position: "bottom-left" });
    if (!isDigits(nationalCode, 10))
      return toast.error("کد ملی باید دقیقاً ۱۰ رقم باشد", { position: "bottom-left" });
    if (!roleLabelText) return toast.error("سمت یا نقش الزامی است", { position: "bottom-left" });
    if (isNaN(sharePercentageNum))
      return toast.error("درصد سهام را به‌درستی وارد کنید", { position: "bottom-left" });
    if (sharePercentageNum < 0 || sharePercentageNum > 100)
      return toast.error("درصد سهام باید بین ۰ تا ۱۰۰ باشد", { position: "bottom-left" });
    if (email && !validateEmail(email))
      return toast.error("ایمیل را به‌درستی وارد کنید", { position: "bottom-left" });

    const roleValue = roleValueFromLabel(roleLabelText) || form.role; // fallback if already value

    const payload = {
      name,
      phoneNumber,
      nationalCode,
      role: roleValue,
      educationalHistory: normalize(form.educationalHistory),
      careerHistory: normalize(form.careerHistory),
      sharePercentage: String(sharePercentageNum),
      email,
    };

    setAddLoading(true);
    PostRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/board-members`, payload)
      .then(() => {
        toast.success("عضو جدید هیئت‌مدیره و سهامداران با موفقیت افزوده شد.", { position: "bottom-left" });

        // after add, go to first page (fresh sorted list) or keep current page
        setIsAddOpen(false);
        setPage(0);
        fetchBoardMembers(0);
      })
      .catch((err) => handlePostErrors(err))
      .finally(() => setAddLoading(false));
  };

  const columns: Column<Person>[] = useMemo(
    () => [
      { header: "نام و نام‌خانوادگی", accessorKey: "name" },
      {
        header: "سمت",
        cell: (row: Person) => (
          <div className="text-titleText dark:text-titleText-dark">
            {roleLabel(row.role)}
          </div>
        ),
      },
      { header: "شماره همراه", accessorKey: "phoneNumber" },
      { header: "کدملی", accessorKey: "nationalCode" },
      { header: "سوابق تحصیلی", accessorKey: "educationalHistory" },
      { header: "سوابق شغلی", accessorKey: "careerHistory" },
      { header: "درصد سهام", accessorKey: "sharePercentage" },
      { header: "ایمیل", accessorKey: "email" },
      {
        header: "عملیات",
        cell: (row: Person) => (
          <div className="flex items-center gap-2">
            <IconBtn id={`EditBoardMember${row.index}`} title="ویرایش" onClick={() => openEditModal(row)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 16v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12.5 15.8 22 6.2 17.8 2 8.3 11.5 8 16l4.5-.2Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </IconBtn>

            <IconBtn
              id={`ChangesBoardMember${row.index}`}
              title="تغییرات"
              onClick={() => {
                setEditingId(row.id);
                setLogPage(0);
                setIsLogOpen(true);
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 8v4l2.5 2.5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21.75 12c0 5.385-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25 21.75 6.615 21.75 12Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
              </svg>
            </IconBtn>

            <IconBtn
              id={`DeleteBoardMember${row.index}`}
              title="حذف"
              onClick={() => {
                setDeleteForm(row);
                setDeleteBox(true);
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 7h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                <path
                  d="M6 10v8c0 1.657 1.343 3 3 3h6c1.657 0 3-1.343 3-3v-8"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
                <path
                  d="M9 7V5c0-1.105.895-2 2-2h2c1.105 0 2 .895 2 2v2"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
                <path d="M10 12v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                <path d="M14 12v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </IconBtn>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page]
  );

  const showPagination = totalItems > PAGE_SIZE;

  return (
    <div className="mt-4 space-y-4">
      {/* Header + Table */}
      <div className={cx(panelBase, "p-5")}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h5 className="font-extrabold text-lg text-titleText dark:text-titleText-dark">
              مشخصات اعضای هیئت‌مدیره و سهامداران
            </h5>
          </div>

          <Button variant="primary" id="addNewBoardMember" onClick={openAddModal} className="rounded-xl text-titleText dark:text-titleText-dark">
            افزودن عضو جدید
          </Button>
        </div>

        {tableLoading ? (
          <div className="py-8">
            <LoadingComponent />
          </div>
        ) : (
          <ExpandableTable<Person>
            data={data}
            columns={columns}
            rowDetailsMode="row"
            rowDetailsClassName="rounded-2xl p-4 border border-boxBorderColor dark:border-boxBorderColor-dark bg-boxColor/10 dark:bg-boxColor-dark/10"
          />
        )}

        {showPagination ? (
          <div className="mt-4">
            <Pagination
              rtl
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              currentPage={page + 1}
              onPageChange={(p) => setPage(p - 1)}
            />
          </div>
        ) : null}
      </div>

      {/* -------- Modal Edit -------- */}
      <Modal open={isEditOpen} onClose={() => setIsEditOpen(false)}>
        <Modal.Backdrop />
        <div className="fixed inset-0 flex z-50 backdrop-blur-sm bg-black/10 dark:bg-black/30 p-4">
          <Modal.Panel className={cx(panelBase, "max-w-2xl mx-auto my-12 overflow-hidden")}>
            <div className="px-5 py-4 border-b border-boxBorderColor dark:border-boxBorderColor-dark">
              <Modal.Title className="text-xl font-extrabold text-titleText dark:text-titleText-dark">
                ویرایش عضو هیئت‌مدیره و سهامداران
              </Modal.Title>
              <p className={cx(subtleText, "mt-1")}>فیلدهای ستاره‌دار الزامی هستند.</p>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="نام و نام‌خانوادگی" required>
                <Input className={inputBase} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>

              <Field label="شماره همراه" required hint="۱۱ رقم و با ۰ شروع شود">
                <Input
                  className={inputBase}
                  value={form.phoneNumber}
                  onChange={(e) => {
                    if (validateNumbers(e.target.value)) setForm({ ...form, phoneNumber: e.target.value });
                  }}
                  inputMode="numeric"
                  placeholder="09xxxxxxxxx"
                />
              </Field>

              <Field label="کد ملی" required hint="۱۰ رقم">
                <Input
                  className={inputBase}
                  value={form.nationalCode}
                  onChange={(e) => {
                    if (validateNumbers(e.target.value)) setForm({ ...form, nationalCode: e.target.value });
                  }}
                  inputMode="numeric"
                />
              </Field>

              <Field label="نقش" required hint="از لیست انتخاب کنید">
                <div className="relative w-full">
                  <Dropdown
                    value={form.role}
                    onChange={(v: unknown) => {
                      if (typeof v === "string") setForm({ ...form, role: v });
                    }}
                  >
                    <Dropdown.Trigger className="w-full">
                      <Button
                        as="span"
                        role="button"
                        variant="ghost"
                        className={cx(
                          "h-12 w-full rounded-xl px-4 pl-10",
                          "bg-boxColor dark:bg-boxColor-dark",
                          "text-titleText dark:text-titleText-dark",
                          "border border-boxBorderColor dark:border-boxBorderColor-dark",
                          "shadow-sm flex items-center justify-between"
                        )}
                      >
                        <span>{form.role ? roleLabel(form.role) : "انتخاب"}</span>
                      </Button>
                    </Dropdown.Trigger>

                    <Dropdown.Options
                      className={cx(
                        "absolute left-0 mt-2 w-72 p-2 z-50 max-h-60 overflow-y-auto rounded-xl",
                        "bg-white dark:bg-buttonColor-dark",
                        "border border-gray-300 dark:border-buttonBorderColor-dark",
                        "text-gray-700 dark:text-gray-100"
                      )}
                    >
                      {BoardmemderRoleTypes.map((item, idx) => (
                        <Dropdown.Option value={item.value} key={`role-edit-${idx}`}>
                          {({ selected, active }) => (
                            <MenuItem
                              isActive={active}
                              isSelected={selected}
                              className={cx(
                                "border mt-2 mb-1 rounded-xl",
                                "border-gray-100 dark:border-buttonBorderColor-dark",
                                form.role === item.value && "bg-gray-100 border-gray-200 dark:bg-gray-700"
                              )}
                            >
                              <MenuItem.Title>{item.label}</MenuItem.Title>
                            </MenuItem>
                          )}
                        </Dropdown.Option>
                      ))}
                    </Dropdown.Options>
                  </Dropdown>
                  <ControlsChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-titleText dark:text-titleText-dark pointer-events-none" />
                </div>
              </Field>

              <Field label="درصد سهام" required hint="بین ۰ تا ۱۰۰">
                <Input
                  className={inputBase}
                  type="text"
                  value={form.sharePercentage ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") return setForm({ ...form, sharePercentage: "" });
                    const decimalRegex = /^\d*\.?\d*$/;
                    if (decimalRegex.test(value)) setForm({ ...form, sharePercentage: value });
                  }}
                  inputMode="decimal"
                  placeholder="مثلاً 25"
                />
              </Field>

              <Field label="سوابق تحصیلی" className="md:col-span-2">
                <textarea
                  className={textareaBase}
                  value={form.educationalHistory}
                  onChange={(e) => setForm({ ...form, educationalHistory: e.target.value })}
                />
              </Field>

              <Field label="سوابق شغلی" className="md:col-span-2">
                <textarea
                  className={textareaBase}
                  value={form.careerHistory}
                  onChange={(e) => setForm({ ...form, careerHistory: e.target.value })}
                />
              </Field>

              <Field label="ایمیل" className="md:col-span-2" hint="اختیاری">
                <Input
                  style={{ direction: "ltr" }}
                  className={inputBase}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="example@domain.com"
                />
              </Field>
            </div>

            <div className="px-5 py-4 border-t border-boxBorderColor dark:border-boxBorderColor-dark flex flex-col sm:flex-row sm:justify-end gap-2 bg-white/80 dark:bg-bgColor-dark/80 backdrop-blur">
              <Button
                variant="ghost"
                onClick={() => setIsEditOpen(false)}
                className="rounded-xl text-titleText dark:text-titleText-dark"
              >
                انصراف
              </Button>
              <Button variant="primary" onClick={handleSaveEdit} className="rounded-xl text-titleText dark:text-titleText-dark">
                {editLoading ? <LoaderCircle size={8} color="border-white-500" /> : "ذخیره اطلاعات"}
              </Button>
            </div>
          </Modal.Panel>
        </div>
      </Modal>

      {/* -------- Modal Add -------- */}
      <Modal open={isAddOpen} onClose={() => setIsAddOpen(false)}>
        <Modal.Backdrop />
        <div className="fixed inset-0 flex z-50 backdrop-blur-sm bg-black/10 dark:bg-black/30 p-4">
          <Modal.Panel className={cx(panelBase, "max-w-2xl mx-auto my-12 overflow-hidden")}>
            <div className="px-5 py-4 border-b border-boxBorderColor dark:border-boxBorderColor-dark">
              <Modal.Title className="text-xl font-extrabold text-titleText dark:text-titleText-dark">
                افزودن عضو جدید هیئت‌مدیره و سهامداران
              </Modal.Title>
              <p className={cx(subtleText, "mt-1")}>فیلدهای ستاره‌دار الزامی هستند.</p>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="نام و نام‌خانوادگی" required>
                <Input className={inputBase} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>

              <Field label="شماره همراه" required hint="۱۱ رقم و با ۰ شروع شود">
                <Input
                  className={inputBase}
                  value={form.phoneNumber}
                  onChange={(e) => {
                    if (validateNumbers(e.target.value)) setForm({ ...form, phoneNumber: e.target.value });
                  }}
                  inputMode="numeric"
                  placeholder="09xxxxxxxxx"
                />
              </Field>

              <Field label="کد ملی" required hint="۱۰ رقم">
                <Input
                  className={inputBase}
                  value={form.nationalCode}
                  onChange={(e) => {
                    if (validateNumbers(e.target.value)) setForm({ ...form, nationalCode: e.target.value });
                  }}
                  inputMode="numeric"
                />
              </Field>

              <Field label="نقش" required hint="از لیست انتخاب کنید">
                <div className="relative w-full">
                  <Dropdown
                    value={form.role}
                    onChange={(v: unknown) => {
                      if (typeof v === "string") setForm({ ...form, role: v });
                    }}
                  >
                    <Dropdown.Trigger className="w-full">
                      <Button
                        as="span"
                        role="button"
                        variant="ghost"
                        className={cx(
                          "h-12 w-full rounded-xl px-4 pl-10",
                          "bg-boxColor dark:bg-boxColor-dark",
                          "text-titleText dark:text-titleText-dark",
                          "border border-boxBorderColor dark:border-boxBorderColor-dark",
                          "shadow-sm flex items-center justify-between"
                        )}
                      >
                        <span>{form.role ? form.role : "انتخاب"}</span>
                      </Button>
                    </Dropdown.Trigger>

                    <Dropdown.Options
                      className={cx(
                        "absolute left-0 mt-2 w-72 p-2 z-50 max-h-60 overflow-y-auto rounded-xl",
                        "bg-white dark:bg-buttonColor-dark",
                        "border border-gray-300 dark:border-buttonBorderColor-dark",
                        "text-gray-700 dark:text-gray-100"
                      )}
                    >
                      {BoardmemderRoleTypes.map((item, idx) => (
                        <Dropdown.Option value={item.label} key={`role-add-${idx}`}>
                          {({ selected, active }) => (
                            <MenuItem
                              isActive={active}
                              isSelected={selected}
                              className={cx(
                                "border mt-2 mb-1 rounded-xl",
                                "border-gray-100 dark:border-buttonBorderColor-dark",
                                form.role === item.label && "bg-gray-100 border-gray-200 dark:bg-gray-700"
                              )}
                            >
                              <MenuItem.Title>{item.label}</MenuItem.Title>
                            </MenuItem>
                          )}
                        </Dropdown.Option>
                      ))}
                    </Dropdown.Options>
                  </Dropdown>
                  <ControlsChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-titleText dark:text-titleText-dark pointer-events-none" />
                </div>
              </Field>

              <Field label="درصد سهام" required hint="بین ۰ تا ۱۰۰">
                <Input
                  className={inputBase}
                  type="text"
                  value={form.sharePercentage ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") return setForm({ ...form, sharePercentage: "" });
                    const decimalRegex = /^\d*\.?\d*$/;
                    if (decimalRegex.test(value)) setForm({ ...form, sharePercentage: value });
                  }}
                  inputMode="decimal"
                  placeholder="مثلاً 25"
                />
              </Field>

              <Field label="سوابق تحصیلی" className="md:col-span-2">
                <textarea
                  className={textareaBase}
                  value={form.educationalHistory}
                  onChange={(e) => setForm({ ...form, educationalHistory: e.target.value })}
                />
              </Field>

              <Field label="سوابق شغلی" className="md:col-span-2">
                <textarea
                  className={textareaBase}
                  value={form.careerHistory}
                  onChange={(e) => setForm({ ...form, careerHistory: e.target.value })}
                />
              </Field>

              <Field label="ایمیل" className="md:col-span-2" hint="اختیاری">
                <Input
                  style={{ direction: "ltr" }}
                  className={inputBase}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="example@domain.com"
                />
              </Field>
            </div>

            <div className="px-5 py-4 border-t border-boxBorderColor dark:border-boxBorderColor-dark flex flex-col sm:flex-row sm:justify-end gap-2 bg-white/80 dark:bg-bgColor-dark/80 backdrop-blur">
              <Button
                variant="ghost"
                onClick={() => setIsAddOpen(false)}
                className="rounded-xl text-titleText dark:text-titleText-dark"
              >
                انصراف
              </Button>
              <Button variant="primary" onClick={handleAdd} className="rounded-xl text-titleText dark:text-titleText-dark">
                {addLoading ? <LoaderCircle size={8} color="border-white-500" /> : "ذخیره اطلاعات"}
              </Button>
            </div>
          </Modal.Panel>
        </div>
      </Modal>

      {/* -------- Modal Logs -------- */}
      <Modal open={isLogOpen} onClose={() => setIsLogOpen(false)}>
        <Modal.Backdrop />
        <div className="fixed inset-0 flex z-50 backdrop-blur-sm bg-black/10 dark:bg-black/30 p-4">
          <Modal.Panel className={cx(panelBase, "max-w-3xl mx-auto my-12 overflow-hidden")}>
            <div className="px-5 py-4 border-b border-boxBorderColor dark:border-boxBorderColor-dark">
              <h4 className="text-xl font-extrabold text-titleText dark:text-titleText-dark">
                تغییرات مشخصات عضو هیئت‌مدیره و سهامداران
              </h4>
              <p className={cx(subtleText, "mt-1")}>گزارش تغییرات ثبت‌شده نمایش داده می‌شود.</p>
            </div>

            <div className="p-5">
              {LogLoading ? (
                <div className="mt-2">
                  <LoadingComponent />
                </div>
              ) : (
                <LogViewer logs={Changes} />
              )}

              <div className="mt-4">
                <Pagination
                  rtl
                  totalItems={LogNumber}
                  pageSize={10}
                  currentPage={LogPage + 1}
                  onPageChange={(e) => setLogPage(e - 1)}
                />
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  variant="ghost"
                  className="rounded-xl text-titleText dark:text-titleText-dark"
                  onClick={() => setIsLogOpen(false)}
                >
                  بستن
                </Button>
              </div>
            </div>
          </Modal.Panel>
        </div>
      </Modal>

      {/* -------- Modal Delete Confirm -------- */}
      <Modal open={deleteBox} onClose={() => !deleteLoading && setDeleteBox(false)}>
        <Modal.Backdrop />
        <div className="fixed inset-0 flex z-50 backdrop-blur-sm bg-black/10 dark:bg-black/30 p-4">
          <Modal.Panel className={cx(panelBase, "max-w-md mx-auto my-12 overflow-hidden")}>
            <div className="px-5 py-4 border-b border-boxBorderColor dark:border-boxBorderColor-dark">
              <h3 className="text-xl font-extrabold text-titleText dark:text-titleText-dark text-center">
                حذف عضو هیئت‌مدیره و سهامداران
              </h3>
              <p className={cx(subtleText, "mt-2 text-center")}>
                آیا از حذف این عضو مطمئن هستید؟ این عملیات قابل بازگشت نیست.
              </p>
            </div>

            <div className="p-5">
              <div className="rounded-2xl border border-boxBorderColor dark:border-boxBorderColor-dark bg-boxColor/10 dark:bg-boxColor-dark/10 p-4">
                <div className="flex flex-col gap-1">
                  <div className="font-semibold text-titleText dark:text-titleText-dark">{deleteForm.name || "—"}</div>
                  <div className={subtleText}>
                    {deleteForm.phoneNumber ? `شماره: ${deleteForm.phoneNumber}` : ""}
                  </div>
                  <div className={subtleText}>
                    {deleteForm.role ? `نقش: ${roleLabel(deleteForm.role)}` : ""}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  className="rounded-xl text-titleText dark:text-titleText-dark"
                  disabled={deleteLoading}
                  onClick={() => setDeleteBox(false)}
                >
                  انصراف
                </Button>

                <Button
                  variant="primary"
                  className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
                  disabled={deleteLoading}
                  onClick={() => handleDelete(deleteForm)}
                >
                  {deleteLoading ? <LoaderCircle size={8} color="border-white-500" /> : "حذف"}
                </Button>
              </div>
            </div>
          </Modal.Panel>
        </div>
      </Modal>
    </div>
  );
};

export default BoardMemberTable;

/**
 * ⚠️ اگر API شما page/size ندارد:
 * - یک بار همه دیتا را بگیر و داخل state ذخیره کن (allData)
 * - بعد:
 *   const paged = allData.slice(page*PAGE_SIZE, page*PAGE_SIZE + PAGE_SIZE)
 * - ExpandableTable را با paged پر کن
 * - Pagination را با totalItems={allData.length} نمایش بده
 */
