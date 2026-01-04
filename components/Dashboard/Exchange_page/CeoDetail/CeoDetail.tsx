import React, { useEffect, useRef, useState } from "react";
import ExpandableTable, {
  Column,
} from "../../../../components/ExpandableTable/ExpandableTable";
import { Modal, Button, Input, Label } from "@heathmont/moon-core-tw";
import { GetRequest } from "../../../../functions/GetRequest";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { LoaderCircle } from "../../../Loader/Loader";

import { validateEmail, validateNumbers } from "../../../../functions/Validations";
import Pagination from "../../../Pagination/Pagination";
import { LogViewer } from "../../../../functions/changesHandler";
import LoadingComponent from "../../../LoadingComponent/LoadingComponent";
import { PostRequest, PutRequest } from "../../../../functions/PostRequest";

type Person = {
  id: string;
  name: string;
  phoneNumber: string;
  nationalCode: string;
  educationalHistory: string;
  careerHistory: string;
  sharePercentage: string;
  email: string;
  index: number;
};

type ExchangeInfoProps = {
  SetC2: React.Dispatch<React.SetStateAction<boolean>>;
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
    {/* فقط Label بالا */}
    <Label className="text-sm font-medium text-titleText dark:text-titleText-dark">
      {label} {required ? <span className="text-red-500">*</span> : null}
    </Label>

    {/* input/textarea */}
    {children}

    {/* hint پایین input */}
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

const CeoDetail = ({ SetC2 }: ExchangeInfoProps) => {
  const params = useParams<{ id: string }>();

  const [data, setData] = useState<Person[]>([]);
  const emptyForm: Person = {
    id: "",
    name: "",
    phoneNumber: "",
    nationalCode: "",
    educationalHistory: "",
    careerHistory: "",
    sharePercentage: "",
    email: "",
    index: 0,
  };

  const [form, setForm] = useState<Person>(emptyForm);

  const [isOpen, setIsOpen] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [isLogOpen, setisLogOpen] = useState(false);
  const [LogNumber, setLogNumber] = useState(0);
  const [LogPage, setLogPage] = useState(0);
  const [LogLoading, setLogLoading] = useState(false);
  const [Changes, setChanges] = useState<string[]>([]);

  const didInit = useRef(false);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setIsOpen(true);
  };

  const openEdit = (row: Person) => {
    setForm(row);
    setEditingId(row.id);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingId(null);
  };

  const handleSave = () => {
    const isEmpty = (val?: string) => !val || val.trim() === "";
    const isDigits = (val: string, len?: number) =>
      /^\d+$/.test(val) && (!len || val.length === len);

    if (isEmpty(form.name))
      return toast.error("نام و نام‌خانوادگی را وارد کنید", { position: "bottom-left" });

    if (isEmpty(form.phoneNumber))
      return toast.error("شماره همراه را وارد کنید", { position: "bottom-left" });

    if (!/^0\d{10}$/.test(form.phoneNumber))
      return toast.error("شماره همراه باید ۱۱ رقم و با ۰ شروع شود", { position: "bottom-left" });

    if (isEmpty(form.nationalCode))
      return toast.error("کد ملی را وارد کنید", { position: "bottom-left" });

    if (!isDigits(form.nationalCode, 10))
      return toast.error("کد ملی باید دقیقاً ۱۰ رقم باشد", { position: "bottom-left" });

    if (form.email && !validateEmail(form.email))
      return toast.error("ایمیل وارد شده معتبر نیست", { position: "bottom-left" });

    const rawShare = form.sharePercentage ?? "";
    const share = rawShare === "" ? NaN : Number(rawShare);
    if (isNaN(share))
      return toast.error("درصد سهام را به‌درستی وارد کنید", { position: "bottom-left" });
    if (share < 0 || share > 100)
      return toast.error("درصد سهام باید بین ۰ تا ۱۰۰ باشد", { position: "bottom-left" });

    const updatedForm = {
      ...form,
      educationalHistory: form.educationalHistory || "",
      careerHistory: form.careerHistory || "",
      sharePercentage: form.sharePercentage || "0",
    };

    setLoading(true);

    const isEdit = !!editingId && data.length !== 0;
    const url = isEdit
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/manager/${editingId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/manager`;

    const requestPromise = isEdit ? PutRequest(url, updatedForm) : PostRequest(url, updatedForm);

    requestPromise
      .then((res: any) => {
        const payload = res && typeof res === "object" ? res : null;
        const result = payload?.result ?? null;

        toast.success("مشخصات مدیرعامل با موفقیت ذخیره شد.", { position: "bottom-left" });

        if (isEdit) {
          setData((prev) =>
            prev.map((item) =>
              item.id === editingId ? { ...updatedForm, id: editingId } : item
            )
          );
        } else {
          const newManager = result || updatedForm;
          setData([newManager]);
        }

        closeModal();
      })
      .catch((err: any) => {
        console.error(err);
        const msg = String(err?.message ?? "");

        if (msg === "Token not found") {
          toast.error("توکن موجود نیست، لطفاً وارد سیستم شوید.", { position: "bottom-left" });
          return;
        }

        let parsed: any = null;
        if (msg.startsWith("{") && msg.endsWith("}")) {
          try {
            parsed = JSON.parse(msg);
          } catch {
            parsed = null;
          }
        }

        const errorObj = parsed;

        if (errorObj?.result && typeof errorObj.result === "object") {
          Object.entries(errorObj.result).forEach(([_, value]) => {
            const text = Array.isArray(value) ? value.join("، ") : String(value ?? "");
            if (text) toast.error(text, { position: "bottom-left" });
          });
          return;
        }

        if (typeof errorObj?.error === "string" && errorObj.error.trim() !== "") {
          toast.error(errorObj.error, { position: "bottom-left" });
          return;
        }

        if (msg.includes("HTTP 401") || msg.includes("HTTP 403")) {
          toast.error("نشست شما منقضی شده است. لطفاً دوباره وارد شوید.", { position: "bottom-left" });
          return;
        }

        toast.error("خطا در ذخیره مشخصات مدیرعامل", { position: "bottom-left" });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/exchanges/${params.id}`)
      .then((response) => {
        const managerInfo = response?.result?.managerInfo;

        if (!managerInfo) {
          setData([]);
          SetC2(true);
          return;
        }

        setData([
          {
            index: 1,
            id: managerInfo.id,
            name: managerInfo.name,
            phoneNumber: managerInfo.phoneNumber,
            nationalCode: managerInfo.nationalCode,
            educationalHistory: managerInfo.educationalHistory,
            careerHistory: managerInfo.careerHistory,
            sharePercentage: managerInfo.sharePercentage,
            email: managerInfo.email,
          },
        ]);

        SetC2(true);
      })
      .catch(() => SetC2(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: Column<Person>[] = [
    { header: "نام و نام‌خانوادگی", accessorKey: "name" },
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
          <IconBtn id={`EditCeo0`} title="ویرایش" onClick={() => openEdit(row)}>
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
            id={`ChangesCeo0`}
            title="تغییرات"
            onClick={() => {
              setForm(row);
              setisLogOpen(true);
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
        </div>
      ),
    },
  ];

  const Audit = () => {
    setLogLoading(true);
    GetRequest(
      `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/audit/manager/${form.id}?page=${LogPage}&size=10&sort=updatedAt,DESC`
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

  return (
    <div className="mt-4 space-y-4">
      <div className={cx(panelBase, "p-5")}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h5 className="font-extrabold text-lg text-titleText dark:text-titleText-dark">
              مشخصات مدیرعامل
            </h5>
            <p className={cx(subtleText, "mt-1")}>اطلاعات هویتی و تماس مدیرعامل سکو</p>
          </div>

          {data.length === 0 ? (
            <Button variant="primary" onClick={openCreate} className="rounded-xl text-titleText dark:text-titleText-dark">
              افزودن مدیرعامل
            </Button>
          ) : null}
        </div>

        <ExpandableTable<Person>
          data={data}
          columns={columns}
          rowDetailsMode="row"
          rowDetailsClassName="rounded-2xl p-4 border border-boxBorderColor dark:border-boxBorderColor-dark bg-boxColor/10 dark:bg-boxColor-dark/10"
        />
      </div>

      {/* Modal - Create/Edit */}
      <Modal open={isOpen} onClose={closeModal}>
        <Modal.Backdrop />
        <div className="fixed inset-0 flex z-50 backdrop-blur-sm bg-black/10 dark:bg-black/30 p-4">
          <Modal.Panel className={cx(panelBase, "max-w-2xl mx-auto my-12 overflow-hidden")}>
            <div className="px-5 py-4 border-b border-boxBorderColor dark:border-boxBorderColor-dark">
              <Modal.Title className="text-xl font-extrabold text-titleText dark:text-titleText-dark">
                {editingId ? "ویرایش مشخصات مدیرعامل" : "افزودن مدیرعامل"}
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
                  placeholder="مثلاً 25"
                  inputMode="decimal"
                />
              </Field>

              <Field label="سوابق تحصیلی" className="md:col-span-2">
                <textarea
                  className={textareaBase}
                  value={form.educationalHistory}
                  onChange={(e) => setForm({ ...form, educationalHistory: e.target.value })}
                  placeholder="سوابق تحصیلی"
                />
              </Field>

              <Field label="سوابق شغلی" className="md:col-span-2">
                <textarea
                  className={textareaBase}
                  value={form.careerHistory}
                  onChange={(e) => setForm({ ...form, careerHistory: e.target.value })}
                  placeholder="سوابق شغلی"
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
              <Button variant="ghost" onClick={closeModal} className="rounded-xl text-titleText dark:text-titleText-dark">
                انصراف
              </Button>
              <Button variant="primary" onClick={handleSave} className="rounded-xl text-titleText dark:text-titleText-dark">
                {Loading ? <LoaderCircle size={8} color="border-white-500" /> : "ذخیره اطلاعات"}
              </Button>
            </div>
          </Modal.Panel>
        </div>
      </Modal>

      {/* Log Modal */}
      <Modal open={isLogOpen} onClose={() => setisLogOpen(false)}>
        <Modal.Backdrop />
        <div className="fixed inset-0 flex z-50 backdrop-blur-sm bg-black/10 dark:bg-black/30 p-4">
          <Modal.Panel className={cx(panelBase, "max-w-3xl mx-auto my-12 overflow-hidden")}>
            <div className="px-5 py-4 border-b border-boxBorderColor dark:border-boxBorderColor-dark">
              <h4 className="text-xl font-extrabold text-titleText dark:text-titleText-dark">
                تغییرات مشخصات مدیرعامل
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
                  onClick={() => setisLogOpen(false)}
                >
                  بستن
                </Button>
              </div>
            </div>
          </Modal.Panel>
        </div>
      </Modal>
    </div>
  );
};

export default CeoDetail;
