import React, { useEffect, useMemo, useRef, useState } from "react";
import ExpandableTable, { Column } from "../../../ExpandableTable/ExpandableTable";
import { Modal, Button, Input, Label } from "@heathmont/moon-core-tw";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import { GetRequest, DeleteRequest } from "../../../../functions/GetRequest";
import { LoaderCircle } from "../../../Loader/Loader";

import { validateNumbers } from "../../../../functions/Validations";
import { PostRequest, PutRequest } from "../../../../functions/PostRequest";
import { handlePostErrors } from "../../../../functions/handlePostErrors";

import Pagination from "../../../Pagination/Pagination";
import { LogViewer } from "../../../../functions/changesHandler";
import LoadingComponent from "../../../LoadingComponent/LoadingComponent";
import JalaliLocalDatePicker from "../../../DatePicker/JalaliLocalDatePicker";
import { toJalaliDate } from "../../../../functions/toJalaliDate";

type Person = {
  id: string;
  name: string;
  jobPosition: string;
  startDate: string;
  educationalHistory: string;
  careerHistory: string;
  insuranceStartDate: string;
  insuranceEndDate: string;
  isSpecialAccess: boolean;
  nationalCode: string;
  phoneNumber: string;
};

type PersonRow = Person & { rowIndex: number };

type ExchangeInfoProps = {
  SetC5: React.Dispatch<React.SetStateAction<boolean>>;
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

const EmployeeInfo = ({ SetC5 }: ExchangeInfoProps) => {
  const params = useParams<{ id: string }>();
  const didInit = useRef(false);

  const PAGE_SIZE = 10;

  const emptyForm: Person = {
    id: "",
    name: "",
    jobPosition: "",
    startDate: "",
    educationalHistory: "",
    careerHistory: "",
    insuranceStartDate: "",
    insuranceEndDate: "",
    isSpecialAccess: false,
    nationalCode: "",
    phoneNumber: "",
  };

  const [data, setData] = useState<PersonRow[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(0); // 0-based
  const [tableLoading, setTableLoading] = useState(false);

  const [form, setForm] = useState<Person>(emptyForm);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [editLoading, setEditLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  const [isLogOpen, setIsLogOpen] = useState(false);
  const [LogNumber, setLogNumber] = useState(0);
  const [LogPage, setLogPage] = useState(0);
  const [LogLoading, setLogLoading] = useState(false);
  const [Changes, setChanges] = useState<string[]>([]);

  const [deleteBox, setDeleteBox] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteForm, setDeleteForm] = useState<PersonRow>({ ...emptyForm, rowIndex: 0 });

  const normalize = (val: any) => String(val ?? "").trim();
  const isDigits = (val: string, len?: number) => /^\d+$/.test(val) && (!len || val.length === len);
  const hasNoSpecialChars = (val: string) => /^[\u0600-\u06FFa-zA-Z0-9\s]+$/.test(val);

  const fetchEmployees = (pageToFetch = page) => {
    setTableLoading(true);

    GetRequest(
      `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/employees?page=${pageToFetch}&size=${PAGE_SIZE}&sort=updatedAt,DESC`
    )
      .then((response) => {
        const content = (response?.result?.content ?? []) as Person[];
        const total = Number(response?.result?.totalElements ?? content.length);

        const indexed: PersonRow[] = content.map((p, idx) => ({
          ...p,
          rowIndex: pageToFetch * PAGE_SIZE + idx, // global for test ids
        }));

        setData(indexed);
        setTotalItems(total);
        SetC5(true);
      })
      .catch((err) => {
        console.log(err);
        setData([]);
        setTotalItems(0);
        SetC5(true);
      })
      .finally(() => setTableLoading(false));
  };

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    fetchEmployees(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!didInit.current) return;
    fetchEmployees(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const openEdit = (row: PersonRow) => {
    const { rowIndex, ...rest } = row;
    setForm(rest);
    setEditingId(row.id);
    setIsEditOpen(true);
  };

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setIsAddOpen(true);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setEditingId(null);
  };

  const closeAdd = () => setIsAddOpen(false);

  const columns: Column<PersonRow>[] = useMemo(
    () => [
      { header: "نام و نام‌خانوادگی", accessorKey: "name" },
      { header: "سمت", accessorKey: "jobPosition" },
      { header: "شماره همراه", accessorKey: "phoneNumber" },
      { header: "کدملی", accessorKey: "nationalCode" },
      { header: "سوابق تحصیلی", accessorKey: "educationalHistory" },
      { header: "سوابق شغلی", accessorKey: "careerHistory" },
      {
        header: "تاریخ شروع کار",
        cell: (row: PersonRow) => <span>{toJalaliDate(row.startDate)}</span>,
      },
      {
        header: "تاریخ شروع بیمه",
        cell: (row: PersonRow) => <span>{toJalaliDate(row.insuranceStartDate)}</span>,
      },
      {
        header: "تاریخ پایان بیمه",
        cell: (row: PersonRow) => <span>{toJalaliDate(row.insuranceEndDate)}</span>,
      },
      {
        header: "دسترسی خاص",
        cell: (row: PersonRow) =>
          row.isSpecialAccess ? (
            <span className="text-green-500 dark:text-green-300">دارد</span>
          ) : (
            <span className="text-red-500 dark:text-red-300">ندارد</span>
          ),
      },
      {
        header: "عملیات",
        cell: (row: PersonRow) => (
          <div className="flex items-center gap-2">
            <IconBtn id={`EditEmployee${row.rowIndex}`} title="ویرایش" onClick={() => openEdit(row)}>
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
              id={`ChangesEmployee${row.rowIndex}`}
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
              id={`DeleteEmployee${row.rowIndex}`}
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

  const handleSave = () => {
    if (!editingId) return;

    const name = normalize(form.name);
    const jobPosition = normalize(form.jobPosition);
    const phoneNumber = normalize(form.phoneNumber);
    const nationalCode = normalize(form.nationalCode);

    if (!name) return toast.error("نام و نام‌خانوادگی الزامی است", { position: "bottom-left" });
    if (!hasNoSpecialChars(name))
      return toast.error("نام نباید شامل کاراکترهای خاص باشد", { position: "bottom-left" });
    if (!jobPosition) return toast.error("سمت الزامی است", { position: "bottom-left" });
    if (!/^0\d{10}$/.test(phoneNumber))
      return toast.error("شماره همراه باید ۱۱ رقم و با ۰ شروع شود", { position: "bottom-left" });
    if (!isDigits(nationalCode, 10))
      return toast.error("کد ملی باید دقیقاً ۱۰ رقم باشد", { position: "bottom-left" });

    const payload: Person = {
      ...form,
      name,
      jobPosition,
      phoneNumber,
      nationalCode,
      educationalHistory: normalize(form.educationalHistory),
      careerHistory: normalize(form.careerHistory),
      startDate: form.startDate || "",
      insuranceStartDate: form.insuranceStartDate || "",
      insuranceEndDate: form.insuranceEndDate || "",
      isSpecialAccess: !!form.isSpecialAccess,
    };

    setEditLoading(true);
    PutRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/employees/${editingId}`, payload)
      .then(() => {
        toast.success("کارمند با موفقیت ویرایش شد.", { position: "bottom-left" });
        closeEdit();
        fetchEmployees(page);
      })
      .catch((err) => handlePostErrors(err))
      .finally(() => setEditLoading(false));
  };

  const handleAdd = () => {
    const name = normalize(form.name);
    const jobPosition = normalize(form.jobPosition);
    const phoneNumber = normalize(form.phoneNumber);
    const nationalCode = normalize(form.nationalCode);

    if (!name) return toast.error("نام و نام‌خانوادگی الزامی است", { position: "bottom-left" });
    if (!hasNoSpecialChars(name))
      return toast.error("نام نباید شامل کاراکترهای خاص باشد", { position: "bottom-left" });
    if (!jobPosition) return toast.error("سمت الزامی است", { position: "bottom-left" });
    if (!/^0\d{10}$/.test(phoneNumber))
      return toast.error("شماره همراه باید ۱۱ رقم و با ۰ شروع شود", { position: "bottom-left" });
    if (!isDigits(nationalCode, 10))
      return toast.error("کد ملی باید دقیقاً ۱۰ رقم باشد", { position: "bottom-left" });

    const payload: Omit<Person, "id"> = {
      name,
      jobPosition,
      phoneNumber,
      nationalCode,
      educationalHistory: normalize(form.educationalHistory),
      careerHistory: normalize(form.careerHistory),
      startDate: form.startDate || "",
      insuranceStartDate: form.insuranceStartDate || "",
      insuranceEndDate: form.insuranceEndDate || "",
      isSpecialAccess: !!form.isSpecialAccess,
    };

    setAddLoading(true);
    PostRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/employees`, payload)
      .then(() => {
        toast.success("کارمند با موفقیت افزوده شد.", { position: "bottom-left" });
        closeAdd();
        setPage(0);
        fetchEmployees(0);
      })
      .catch((err) => handlePostErrors(err))
      .finally(() => setAddLoading(false));
  };

  const Audit = () => {
    if (!editingId) return;
    setLogLoading(true);
    GetRequest(
      `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/audit/employees/${editingId}?page=${LogPage}&size=10&sort=updatedAt,DESC`
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

  const deleteMember = (row: PersonRow) => {
    setDeleteLoading(true);
    DeleteRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/employees/${row.id}`)
      .then(() => {
        toast.success("کارمند با موفقیت حذف شد.", { position: "bottom-left" });

        const afterTotal = Math.max(0, totalItems - 1);
        const lastPageIndex = Math.max(0, Math.ceil(afterTotal / PAGE_SIZE) - 1);

        setTotalItems(afterTotal);
        setDeleteBox(false);

        if (page > lastPageIndex) {
          setPage(lastPageIndex);
        } else {
          fetchEmployees(page);
        }
      })
      .catch((err) => handlePostErrors(err))
      .finally(() => setDeleteLoading(false));
  };

  const showPagination = totalItems > PAGE_SIZE;

  return (
    <div className="mt-4 space-y-4">
      <div className={cx(panelBase, "p-5")}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h5 className="font-extrabold text-lg text-titleText dark:text-titleText-dark">
              مشخصات کارمندان
            </h5>
          </div>

          <Button id="addNewEmployee" variant="primary" onClick={openAdd} className="rounded-xl text-titleText dark:text-titleText-dark">
            افزودن کارمند جدید
          </Button>
        </div>

        {tableLoading ? (
          <div className="py-8">
            <LoadingComponent />
          </div>
        ) : (
          <ExpandableTable<PersonRow>
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

      {/* Modal Edit */}
      <Modal open={isEditOpen} onClose={closeEdit}>
        <Modal.Backdrop />
        <div className="fixed inset-0 flex z-50 backdrop-blur-sm bg-black/10 dark:bg-black/30 p-4">
          <Modal.Panel className={cx(panelBase, "max-w-3xl mx-auto my-12 overflow-hidden")}>
            <div className="px-5 py-4 border-b border-boxBorderColor dark:border-boxBorderColor-dark">
              <Modal.Title className="text-xl font-extrabold text-titleText dark:text-titleText-dark">
                ویرایش مشخصات کارمند
              </Modal.Title>
              <p className={cx(subtleText, "mt-1")}>فیلدهای ستاره‌دار الزامی هستند.</p>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="نام و نام‌خانوادگی" required>
                <Input
                  className={inputBase}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="نام و نام‌خانوادگی"
                />
              </Field>

              <Field label="سمت" required>
                <Input
                  className={inputBase}
                  value={form.jobPosition}
                  onChange={(e) => setForm({ ...form, jobPosition: e.target.value })}
                  placeholder="سمت"
                />
              </Field>

              <Field label="شماره همراه" required hint="۱۱ رقم و با ۰ شروع شود">
                <Input
                  className={inputBase}
                  value={form.phoneNumber}
                  onChange={(e) => {
                    if (validateNumbers(e.target.value)) setForm({ ...form, phoneNumber: e.target.value });
                  }}
                  placeholder="09xxxxxxxxx"
                  inputMode="numeric"
                />
              </Field>

              <Field label="کد ملی" required hint="۱۰ رقم">
                <Input
                  className={inputBase}
                  value={form.nationalCode}
                  onChange={(e) => {
                    if (validateNumbers(e.target.value)) setForm({ ...form, nationalCode: e.target.value });
                  }}
                  placeholder="کد ملی"
                  inputMode="numeric"
                />
              </Field>

              <Field label="تاریخ شروع کار" hint="اختیاری">
                  <JalaliLocalDatePicker
                    value={form.startDate}
                    onChange={(val) => setForm((p) => ({ ...p, startDate: val !== null ? val : "" }))}
                    placeholder=""
                    clearable
                    min="1900-01-01"
                    max="2030-12-31"
                  />
              </Field>

              <Field label="تاریخ شروع بیمه" hint="اختیاری">
                  <JalaliLocalDatePicker
                    value={form.insuranceStartDate}
                    onChange={(val) => setForm((p) => ({ ...p, insuranceStartDate: val !== null ? val : "" }))}
                    placeholder=""
                    clearable
                    min="1900-01-01"
                    max="2030-12-31"
                  />
              </Field>

              <Field label="تاریخ پایان بیمه" hint="اختیاری">
                  <JalaliLocalDatePicker
                    value={form.insuranceEndDate}
                    onChange={(val) => setForm((p) => ({ ...p, insuranceEndDate: val !== null ? val : "" }))}
                    placeholder=""
                    clearable
                    min="1900-01-01"
                    max="2030-12-31"
                  />
              </Field>

              <Field label="سوابق تحصیلی" className="md:col-span-2" hint="اختیاری">
                <textarea
                  className={textareaBase}
                  value={form.educationalHistory}
                  onChange={(e) => setForm({ ...form, educationalHistory: e.target.value })}
                  placeholder="سوابق تحصیلی"
                />
              </Field>

              <Field label="سوابق شغلی" className="md:col-span-2" hint="اختیاری">
                <textarea
                  className={textareaBase}
                  value={form.careerHistory}
                  onChange={(e) => setForm({ ...form, careerHistory: e.target.value })}
                  placeholder="سوابق شغلی"
                />
              </Field>

              <div className="md:col-span-2">
                <div className="flex items-center gap-3 rounded-2xl border border-boxBorderColor dark:border-boxBorderColor-dark bg-boxColor/10 dark:bg-boxColor-dark/10 px-4 py-3">
                  <input
                    type="checkbox"
                    id="isSpecialAccess"
                    checked={form.isSpecialAccess === true}
                    onChange={(e) => setForm({ ...form, isSpecialAccess: e.target.checked })}
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                  <label htmlFor="isSpecialAccess" className="cursor-pointer text-titleText dark:text-titleText-dark">
                    دسترسی خاص
                  </label>
                  <span className={cx(subtleText, "text-xs mr-auto")}>در صورت فعال بودن، دسترسی ویژه اعمال می‌شود.</span>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-boxBorderColor dark:border-boxBorderColor-dark flex flex-col sm:flex-row sm:justify-end gap-2 bg-white/80 dark:bg-bgColor-dark/80 backdrop-blur">
              <Button variant="ghost" onClick={closeEdit} className="rounded-xl text-titleText dark:text-titleText-dark">
                انصراف
              </Button>
              <Button variant="primary" onClick={handleSave} className="rounded-xl text-titleText dark:text-titleText-dark">
                {editLoading ? <LoaderCircle size={8} color="border-white-500" /> : "ذخیره اطلاعات"}
              </Button>
            </div>
          </Modal.Panel>
        </div>
      </Modal>

      {/* Modal Add */}
      <Modal open={isAddOpen} onClose={closeAdd}>
        <Modal.Backdrop />
        <div className="fixed inset-0 flex z-50 backdrop-blur-sm bg-black/10 dark:bg-black/30 p-4">
          <Modal.Panel className={cx(panelBase, "max-w-3xl mx-auto my-12 overflow-hidden")}>
            <div className="px-5 py-4 border-b border-boxBorderColor dark:border-boxBorderColor-dark">
              <Modal.Title className="text-xl font-extrabold text-titleText dark:text-titleText-dark">
                افزودن کارمند جدید
              </Modal.Title>
              <p className={cx(subtleText, "mt-1")}>فیلدهای ستاره‌دار الزامی هستند.</p>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="نام و نام‌خانوادگی" required>
                <Input
                  className={inputBase}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="نام و نام‌خانوادگی"
                />
              </Field>

              <Field label="سمت" required>
                <Input
                  className={inputBase}
                  value={form.jobPosition}
                  onChange={(e) => setForm({ ...form, jobPosition: e.target.value })}
                  placeholder="سمت"
                />
              </Field>

              <Field label="شماره همراه" required hint="۱۱ رقم و با ۰ شروع شود">
                <Input
                  className={inputBase}
                  value={form.phoneNumber}
                  onChange={(e) => {
                    if (validateNumbers(e.target.value)) setForm({ ...form, phoneNumber: e.target.value });
                  }}
                  placeholder="09xxxxxxxxx"
                  inputMode="numeric"
                />
              </Field>

              <Field label="کد ملی" required hint="۱۰ رقم">
                <Input
                  className={inputBase}
                  value={form.nationalCode}
                  onChange={(e) => {
                    if (validateNumbers(e.target.value)) setForm({ ...form, nationalCode: e.target.value });
                  }}
                  placeholder="کد ملی"
                  inputMode="numeric"
                />
              </Field>

              <Field label="تاریخ شروع کار" hint="اختیاری">
                <div className="rounded-xl border border-boxBorderColor dark:border-boxBorderColor-dark bg-boxColor/40 dark:bg-boxColor-dark/40 px-3 py-2">
                  <JalaliLocalDatePicker
                    value={form.startDate}
                    onChange={(val) => setForm((p) => ({ ...p, startDate: val !== null ? val : "" }))}
                    placeholder=""
                    clearable
                    min="1900-01-01"
                    max="2030-12-31"
                  />
                </div>
              </Field>

              <Field label="تاریخ شروع بیمه" hint="اختیاری">
                <div className="rounded-xl border border-boxBorderColor dark:border-boxBorderColor-dark bg-boxColor/40 dark:bg-boxColor-dark/40 px-3 py-2">
                  <JalaliLocalDatePicker
                    value={form.insuranceStartDate}
                    onChange={(val) => setForm((p) => ({ ...p, insuranceStartDate: val !== null ? val : "" }))}
                    placeholder=""
                    clearable
                    min="1900-01-01"
                    max="2030-12-31"
                  />
                </div>
              </Field>

              <Field label="تاریخ پایان بیمه" hint="اختیاری">
                <div className="rounded-xl border border-boxBorderColor dark:border-boxBorderColor-dark bg-boxColor/40 dark:bg-boxColor-dark/40 px-3 py-2">
                  <JalaliLocalDatePicker
                    value={form.insuranceEndDate}
                    onChange={(val) => setForm((p) => ({ ...p, insuranceEndDate: val !== null ? val : "" }))}
                    placeholder=""
                    clearable
                    min="1900-01-01"
                    max="2030-12-31"
                  />
                </div>
              </Field>

              <Field label="سوابق تحصیلی" className="md:col-span-2" hint="اختیاری">
                <textarea
                  className={textareaBase}
                  value={form.educationalHistory}
                  onChange={(e) => setForm({ ...form, educationalHistory: e.target.value })}
                  placeholder="سوابق تحصیلی"
                />
              </Field>

              <Field label="سوابق شغلی" className="md:col-span-2" hint="اختیاری">
                <textarea
                  className={textareaBase}
                  value={form.careerHistory}
                  onChange={(e) => setForm({ ...form, careerHistory: e.target.value })}
                  placeholder="سوابق شغلی"
                />
              </Field>

              <div className="md:col-span-2">
                <div className="flex items-center gap-3 rounded-2xl border border-boxBorderColor dark:border-boxBorderColor-dark bg-boxColor/10 dark:bg-boxColor-dark/10 px-4 py-3">
                  <input
                    type="checkbox"
                    id="isSpecialAccessAdd"
                    checked={form.isSpecialAccess === true}
                    onChange={(e) => setForm({ ...form, isSpecialAccess: e.target.checked })}
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                  <label htmlFor="isSpecialAccessAdd" className="cursor-pointer text-titleText dark:text-titleText-dark">
                    دسترسی خاص
                  </label>
                  <span className={cx(subtleText, "text-xs mr-auto")}>در صورت فعال بودن، دسترسی ویژه اعمال می‌شود.</span>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-boxBorderColor dark:border-boxBorderColor-dark flex flex-col sm:flex-row sm:justify-end gap-2 bg-white/80 dark:bg-bgColor-dark/80 backdrop-blur">
              <Button variant="ghost" onClick={closeAdd} className="rounded-xl text-titleText dark:text-titleText-dark">
                انصراف
              </Button>
              <Button variant="primary" onClick={handleAdd} className="rounded-xl text-titleText dark:text-titleText-dark">
                {addLoading ? <LoaderCircle size={8} color="border-white-500" /> : "ذخیره اطلاعات"}
              </Button>
            </div>
          </Modal.Panel>
        </div>
      </Modal>

      {/* Modal Logs */}
      <Modal open={isLogOpen} onClose={() => setIsLogOpen(false)}>
        <Modal.Backdrop />
        <div className="fixed inset-0 flex z-50 backdrop-blur-sm bg-black/10 dark:bg-black/30 p-4">
          <Modal.Panel className={cx(panelBase, "max-w-3xl mx-auto my-12 overflow-hidden")}>
            <div className="px-5 py-4 border-b border-boxBorderColor dark:border-boxBorderColor-dark">
              <h4 className="text-xl font-extrabold text-titleText dark:text-titleText-dark">تغییرات مشخصات کارمند</h4>
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

      {/* Delete confirm */}
      <Modal open={deleteBox} onClose={() => !deleteLoading && setDeleteBox(false)}>
        <Modal.Backdrop />
        <div className="fixed inset-0 flex z-50 backdrop-blur-sm bg-black/10 dark:bg-black/30 p-4">
          <Modal.Panel className={cx(panelBase, "max-w-md mx-auto my-12 overflow-hidden")}>
            <div className="px-5 py-4 border-b border-boxBorderColor dark:border-boxBorderColor-dark">
              <h3 className="text-xl font-extrabold text-titleText dark:text-titleText-dark text-center">حذف کارمند سکو</h3>
              <p className={cx(subtleText, "mt-2 text-center")}>آیا از حذف کارمند سکو مطمئن هستید؟</p>
            </div>

            <div className="p-5">
              <div className="rounded-2xl border border-boxBorderColor dark:border-boxBorderColor-dark bg-boxColor/10 dark:bg-boxColor-dark/10 p-4">
                <div className="font-semibold text-titleText dark:text-titleText-dark">{deleteForm.name || "—"}</div>
                <div className={subtleText}>{deleteForm.phoneNumber ? `شماره: ${deleteForm.phoneNumber}` : ""}</div>
                <div className={subtleText}>{deleteForm.nationalCode ? `کد ملی: ${deleteForm.nationalCode}` : ""}</div>
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
                  onClick={() => deleteMember(deleteForm)}
                >
                  {deleteLoading ? <LoaderCircle size={8} color="border-white-500" /> : "حذف"}
                </Button>
              </div>
            </div>
          </Modal.Panel>
        </div>
      </Modal>

      {/* Bottom pagination (optional) */}
      {totalItems > PAGE_SIZE ? (
        <div className={cx(panelBase, "p-4")}>
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
  );
};

export default EmployeeInfo;

/**
 * ⚠️ اگر API شما page/size ندارد:
 * - یک بار کل لیست رو بگیر (allData)
 * - بعد:
 *   const paged = allData.slice(page*PAGE_SIZE, page*PAGE_SIZE + PAGE_SIZE)
 * - ExpandableTable رو با paged پر کن
 * - Pagination با totalItems={allData.length}
 */
