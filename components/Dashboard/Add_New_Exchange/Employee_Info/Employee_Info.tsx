import React, { useMemo, useState } from "react";
import ExpandableTable, { Column } from "../../../ExpandableTable/ExpandableTable";
import { Modal, Button, Input } from "@heathmont/moon-core-tw";
import toast from "react-hot-toast";

import { LoaderCircle } from "../../../Loader/Loader";
import { PostRequest } from "../../../../functions/PostRequest";
import { validateNumbers } from "../../../../functions/Validations";
import JalaliLocalDatePicker from "../../../DatePicker/JalaliLocalDatePicker";
import { toJalaliDate } from "../../../../functions/toJalaliDate";
import { handlePostErrors } from "../../../../functions/handlePostErrors";

type Person = {
  id: string;
  name: string;
  jobPosition: string;
  startDate: string;
  educationalHistory: string;
  careerHistory: string;
  insuranceStartDate: string;
  insuranceEndDate: string;
  isSpecialAccess: boolean | null;
  nationalCode: string;
  phoneNumber: string;
};

interface GetExchangeInfoProps {
  SetStep: React.Dispatch<React.SetStateAction<number>>;
  ID: number | undefined;
}

type EmployeeForm = Person;

/** ---------- UI helpers ---------- */
const Stepper = ({ current = 5, total = 5 }: { current?: number; total?: number }) => {
  const steps = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <div className="bg-boxColor dark:bg-boxColor-dark border border-boxBorderColor dark:border-boxBorderColor-dark rounded-2xl p-4">
      <div className="flex items-center justify-between gap-2">
        {steps.map((s, idx) => {
          const isDone = s < current;
          const isActive = s === current;
          return (
            <div key={s} className="flex items-center flex-1 min-w-0">
              <div
                className={[
                  "h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                  isActive
                    ? "bg-primary text-white"
                    : isDone
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-titleText dark:text-titleText-dark border border-boxBorderColor dark:border-boxBorderColor-dark",
                ].join(" ")}
                title={`مرحله ${s}`}
              >
                {s}
              </div>

              {idx !== steps.length - 1 && (
                <div
                  className={[
                    "mx-2 h-[2px] flex-1 rounded-full",
                    isDone ? "bg-emerald-400" : "bg-gray-200 dark:bg-gray-700",
                  ].join(" ")}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>مرحله {current} از {total}</span>
        <span className="hidden sm:inline">ثبت مشخصات کارمندان و اتمام فرایند</span>
      </div>
    </div>
  );
};

const Field = ({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-titleText dark:text-titleText-dark">
      {label} {required ? <span className="text-red-500">*</span> : null}
    </label>
    {children}
    {hint ? <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p> : null}
  </div>
);

const Employee_Info: React.FC<GetExchangeInfoProps> = ({ SetStep, ID }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [Loading, setLoading] = useState<boolean>(false);

  const closeModal = () => setIsOpen(false);
  const openModal = () => setIsOpen(true);

  const inputBaseClass = useMemo(() => {
    return [
      "w-full h-12",
      "rounded-xl",
      "bg-boxColor dark:bg-boxColor-dark",
      "text-titleText dark:text-titleText-dark",
      "border border-boxBorderColor dark:border-boxBorderColor-dark",
      "shadow-sm",
      "px-4",
      "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60",
      "transition",
    ].join(" ");
  }, []);

  const textareaClass = useMemo(() => {
    return [
      "w-full min-h-[96px]",
      "rounded-xl",
      "bg-boxColor dark:bg-boxColor-dark",
      "text-titleText dark:text-titleText-dark",
      "border border-boxBorderColor dark:border-boxBorderColor-dark",
      "shadow-sm",
      "px-4 py-3",
      "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60",
      "transition resize-none",
    ].join(" ");
  }, []);

  const columns: Column<Person>[] = [
    { header: "نام و نام‌خانوادگی", accessorKey: "name" },
    { header: "سمت", accessorKey: "jobPosition", align: "center" },
    {
      header: "تاریخ شروع به کار",
      cell: (row: Person) => <span>{toJalaliDate(row.startDate)}</span>,
    },
    {
      header: "تاریخ شروع بیمه",
      cell: (row: Person) => <span>{toJalaliDate(row.insuranceStartDate)}</span>,
    },
    {
      header: "تاریخ پایان بیمه",
      cell: (row: Person) => <span>{toJalaliDate(row.insuranceEndDate)}</span>,
    },
    {
      header: "دسترسی خاص",
      cell: (row: Person) => (
        <span
          className={[
            "inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-bold",
            row.isSpecialAccess
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
              : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200",
          ].join(" ")}
        >
          {row.isSpecialAccess ? "دارد" : "ندارد"}
        </span>
      ),
    },
  ];

  const [data, SetData] = useState<Person[]>([]);

  const [form, setForm] = useState<EmployeeForm>({
    id: "",
    name: "",
    jobPosition: "",
    startDate: "",
    educationalHistory: "",
    careerHistory: "",
    insuranceStartDate: "",
    insuranceEndDate: "",
    isSpecialAccess: null,
    nationalCode: "",
    phoneNumber: "",
  });

  const handleChange = <K extends keyof EmployeeForm>(field: K, value: EmployeeForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm({
      id: "",
      name: "",
      jobPosition: "",
      startDate: "",
      educationalHistory: "",
      careerHistory: "",
      insuranceStartDate: "",
      insuranceEndDate: "",
      isSpecialAccess: null,
      nationalCode: "",
      phoneNumber: "",
    });
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("نام و نام‌خانوادگی الزامی است");
    if (/[@#!]/.test(form.name)) return toast.error("نام نباید شامل کاراکترهای خاص باشد (#, @, !)");
    if (form.name.length > 200) return toast.error("طول نام نباید بیشتر از ۲۰۰ کاراکتر باشد");
    if (form.jobPosition && form.jobPosition.length > 100)
      return toast.error("طول سمت نباید بیشتر از ۱۰۰ کاراکتر باشد");
    if (form.jobPosition && /[@#!]/.test(form.jobPosition))
      return toast.error("سمت نباید شامل کاراکترهای خاص باشد (#, @, !)");
    if (!form.phoneNumber.trim()) return toast.error("شماره همراه الزامی است");
    if (!/^0\d{10}$/.test(form.phoneNumber))
      return toast.error("شماره همراه باید ۱۱ رقم و با ۰ شروع شود");
    if (!form.nationalCode.trim()) return toast.error("کد ملی الزامی است");
    if (!/^\d{10}$/.test(form.nationalCode))
      return toast.error("کد ملی باید دقیقاً ۱۰ رقم باشد");

    const today = new Date().toISOString().split("T")[0];
    if (form.startDate && form.startDate > today)
      return toast.error("تاریخ شروع به کار نمی‌تواند در آینده باشد");
    if (form.insuranceStartDate && form.insuranceStartDate > today)
      return toast.error("تاریخ شروع بیمه نمی‌تواند در آینده باشد");
    if (form.insuranceEndDate && form.insuranceEndDate > today)
      return toast.error("تاریخ پایان بیمه نمی‌تواند در آینده باشد");
    if (form.insuranceStartDate && form.insuranceEndDate && form.insuranceStartDate > form.insuranceEndDate)
      return toast.error("تاریخ شروع بیمه باید قبل از تاریخ پایان بیمه باشد");

    if (form.educationalHistory && form.educationalHistory.length > 1000)
      return toast.error("طول سوابق تحصیلی نباید بیشتر از ۱۰۰۰ کاراکتر باشد");
    if (form.educationalHistory && /[@#!]/.test(form.educationalHistory))
      return toast.error("سوابق تحصیلی نباید شامل کاراکترهای خاص باشد (#, @, !)");
    if (form.careerHistory && form.careerHistory.length > 1000)
      return toast.error("طول سوابق شغلی نباید بیشتر از ۱۰۰۰ کاراکتر باشد");
    if (form.careerHistory && /[@#!]/.test(form.careerHistory))
      return toast.error("سوابق شغلی نباید شامل کاراکترهای خاص باشد (#, @, !)");

    const Member = {
      name: form.name,
      jobPosition: form.jobPosition,
      startDate: form.startDate,
      educationalHistory: form.educationalHistory,
      careerHistory: form.careerHistory,
      insuranceStartDate: form.insuranceStartDate,
      insuranceEndDate: form.insuranceEndDate,
      isSpecialAccess: form.isSpecialAccess === true,
      nationalCode: form.nationalCode,
      phoneNumber: form.phoneNumber,
    };

    setLoading(true);
    PostRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${ID}/employees`, Member)
      .then(() => {
        toast.success("کارمند با موفقیت افزوده شد.", { position: "bottom-left" });
        SetData([...data, { ...form, id: String(data.length + 1) }]);
        closeModal();
        setEditingId(null);
        resetForm();
      })
      .catch((err) => {
        handlePostErrors(err);
      })
      .finally(() => setLoading(false));
  };

  const nextStep = async () => {
    window.location.assign(`/panel/exchanges-list/exchange/${ID}`);
  };

  return (
    <div className="mt-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h5 className="font-extrabold text-xl text-titleText dark:text-titleText-dark">
            مشخصات کارمندان
          </h5>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            مرحله ۵: در صورت نیاز کارمندان را اضافه کنید و فرایند را به پایان برسانید.
          </p>
        </div>

        <button
          className={[
            "h-12 w-full sm:w-auto px-4 rounded-xl",
            "border border-primary text-primary",
            "hover:bg-primary/10 transition",
            "flex items-center justify-center",
            "shadow-sm",
          ].join(" ")}
          onClick={() => {
            setEditingId(null);
            resetForm();
            openModal();
          }}
          id="openAddEmployeeModal"
        >
          افزودن کارمند جدید
        </button>
      </div>

      {/* Stepper */}
      <Stepper current={5} total={5} />

      {/* Table Card */}
      <div className="bg-boxColor dark:bg-boxColor-dark border border-boxBorderColor dark:border-boxBorderColor-dark rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h6 className="font-bold text-base text-titleText dark:text-titleText-dark">
            لیست کارمندان
          </h6>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            افزودن کارمند اختیاری است
          </span>
        </div>

        <div className="mt-5">
          <ExpandableTable<Person>
            rowDetailsMode="row"
            rowDetailsClassName="rounded-xl p-3"
            data={data}
            columns={columns}
          />
        </div>
      </div>

      {/* Finish CTA */}
      <div className="flex items-center justify-end">
        <button
          className={[
            "w-full sm:w-80 h-12 rounded-xl",
            "bg-primary text-white font-bold",
            "shadow-lg shadow-primary/20",
            "flex justify-center items-center",
            "hover:opacity-95 transition",
          ].join(" ")}
          onClick={nextStep}
          id="endExCreating"
        >
          اتمام
        </button>
      </div>

      {/* Modal */}
      <Modal open={isOpen} onClose={closeModal}>
        <Modal.Backdrop />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/20">
          <Modal.Panel className="w-full max-w-3xl rounded-2xl bg-white dark:bg-bgColor-dark shadow-xl text-titleText dark:text-titleText-dark overflow-hidden">
            {/* header */}
            <div className="p-4 sm:p-5 border-b border-boxBorderColor dark:border-boxBorderColor-dark">
              <Modal.Title className="text-lg font-extrabold text-titleText dark:text-titleText-dark">
                {editingId ? "ویرایش کارمند" : "افزودن کارمند جدید"}
              </Modal.Title>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                اطلاعات کارمند را وارد کنید.
              </p>
            </div>

            {/* body */}
            <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="نام و نام‌خانوادگی" required hint="حداکثر ۲۰۰ کاراکتر">
                <Input
                  id="employee_full_name"
                  className={inputBaseClass}
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="نام و نام‌خانوادگی"
                />
              </Field>

              <Field label="شماره همراه" required hint="۱۱ رقم و با ۰ شروع شود">
                <Input
                  id="employee_phone_number"
                  className={inputBaseClass}
                  value={form.phoneNumber}
                  onChange={(e) => {
                    if (validateNumbers(e.target.value)) handleChange("phoneNumber", e.target.value);
                  }}
                  placeholder="شماره همراه"
                />
              </Field>

              <Field label="کد ملی" required hint="دقیقاً ۱۰ رقم">
                <Input
                  id="employee_national_code"
                  className={inputBaseClass}
                  value={form.nationalCode}
                  onChange={(e) => {
                    if (validateNumbers(e.target.value)) handleChange("nationalCode", e.target.value);
                  }}
                  placeholder="کد ملی"
                />
              </Field>

              <Field label="سمت" required hint="حداکثر ۱۰۰ کاراکتر">
                <Input
                  id="employee_job_position"
                  className={inputBaseClass}
                  value={form.jobPosition}
                  onChange={(e) => handleChange("jobPosition", e.target.value)}
                  placeholder="سمت"
                />
              </Field>

              <Field label="سوابق تحصیلی" hint="اختیاری (حداکثر ۱۰۰۰ کاراکتر)">
                <textarea
                  id="employee_educational_history"
                  className={textareaClass}
                  value={form.educationalHistory}
                  onChange={(e) => handleChange("educationalHistory", e.target.value)}
                  placeholder="سوابق تحصیلی"
                />
              </Field>

              <Field label="سوابق شغلی" hint="اختیاری (حداکثر ۱۰۰۰ کاراکتر)">
                <textarea
                  id="employee_career_history"
                  className={textareaClass}
                  value={form.careerHistory}
                  onChange={(e) => handleChange("careerHistory", e.target.value)}
                  placeholder="سوابق شغلی"
                />
              </Field>

              <Field label="تاریخ شروع به کار" hint="اختیاری">
                <div className="mt-1" id="employee_start_date">
                  <JalaliLocalDatePicker
                    value={form.startDate}
                    onChange={(val) =>
                      setForm((p) => ({ ...p, startDate: val !== null ? val : "" }))
                    }
                    placeholder=""
                    clearable
                    min="1900-01-01"
                    max="2030-12-31"
                  />
                </div>
              </Field>

              <Field label="تاریخ شروع بیمه" hint="اختیاری">
                <div className="mt-1" id="employee_insurance_start_date">
                  <JalaliLocalDatePicker
                    value={form.insuranceStartDate}
                    onChange={(val) =>
                      setForm((p) => ({ ...p, insuranceStartDate: val !== null ? val : "" }))
                    }
                    placeholder=""
                    clearable
                    min="1900-01-01"
                    max="2030-12-31"
                  />
                </div>
              </Field>

              <Field label="تاریخ پایان بیمه" hint="اختیاری">
                <div className="mt-1" id="employee_insurance_end_date">
                  <JalaliLocalDatePicker
                    value={form.insuranceEndDate}
                    onChange={(val) =>
                      setForm((p) => ({ ...p, insuranceEndDate: val !== null ? val : "" }))
                    }
                    placeholder=""
                    clearable
                    min="2000-01-01"
                    max="2030-12-31"
                  />
                </div>
              </Field>

              <div className="md:col-span-2">
                <div className="flex items-center gap-3 rounded-xl border border-boxBorderColor dark:border-boxBorderColor-dark bg-boxColor dark:bg-boxColor-dark px-4 py-3">
                  <input
                    type="checkbox"
                    id="employee_is_special_access"
                    checked={form.isSpecialAccess === true}
                    onChange={(e) => handleChange("isSpecialAccess", e.target.checked)}
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                  <label htmlFor="employee_is_special_access" className="cursor-pointer text-sm font-semibold">
                    دسترسی خاص
                  </label>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    در صورت فعال بودن، کارمند دسترسی ویژه خواهد داشت.
                  </span>
                </div>
              </div>
            </div>

            {/* footer */}
            <div className="p-4 sm:p-5 border-t border-boxBorderColor dark:border-boxBorderColor-dark flex flex-col sm:flex-row justify-end gap-2">
              <Button variant="ghost" onClick={closeModal}>
                انصراف
              </Button>

              <Button onClick={handleSave} id="addEmployee" disabled={Loading}>
                {Loading ? (
                  <div className="flex items-center gap-2">
                    <LoaderCircle size={8} color="border-white-500" />
                    <span className="text-sm">در حال ذخیره...</span>
                  </div>
                ) : (
                  "افزودن"
                )}
              </Button>
            </div>
          </Modal.Panel>
        </div>
      </Modal>
    </div>
  );
};

export default Employee_Info;
