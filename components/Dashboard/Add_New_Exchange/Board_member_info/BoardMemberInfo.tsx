import React, { useMemo, useState } from 'react'
import ExpandableTable, { Column } from '../../../ExpandableTable/ExpandableTable';
import { Modal, Button, Input, Dropdown, MenuItem } from "@heathmont/moon-core-tw";
import toast from 'react-hot-toast';
import { LoaderCircle } from '../../../Loader/Loader';
import { validateNumbers } from '../../../../functions/Validations';
import { BoardmemderRoleTypes } from '../../../../functions/BoardmemberRoleTypes';
import { ControlsChevronDown } from '@heathmont/moon-icons-tw';
import { PostRequest } from '../../../../functions/PostRequest';
import { handlePostErrors } from '../../../../functions/handlePostErrors';

type Person = {
  id: string;
  name: string;
  phoneNumber: string;
  nationalCode: string;
  role: string;
  careerHistory: string;
  educationalHistory: string;
  sharePercentage: string | null;
  email: string;
};

interface GetExchangeInfoProps {
  SetStep: React.Dispatch<React.SetStateAction<number>>;
  ID: number | undefined;
}

type PersonForm = Omit<Person, "id">;

/** ---------- UI helpers (همون سبک مراحل قبل) ---------- */
const Stepper = ({ current = 3, total = 5 }: { current?: number; total?: number }) => {
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
        <span className="hidden sm:inline">ثبت اعضای هیئت‌مدیره و سهامداران</span>
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
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-titleText dark:text-titleText-dark">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      {children}
      {hint ? <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p> : null}
    </div>
  );
};

const BoardMemberInfo: React.FC<GetExchangeInfoProps> = ({ SetStep, ID }) => {
  const [form, setForm] = useState<PersonForm>({
    name: "",
    phoneNumber: "",
    nationalCode: "",
    role: "",
    careerHistory: "",
    educationalHistory: "",
    sharePercentage: null,
    email: "",
  });

  const [data, SetData] = useState<Person[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null); // فعلاً فقط برای متن عنوان
  const [Loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);

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
    { header: "شماره همراه", accessorKey: "phoneNumber", align: "center", className: "tabular-nums" },
    { header: "کد ملی", accessorKey: "nationalCode", align: "center", className: "tabular-nums" },
    { header: "سمت", accessorKey: "role", align: "center", className: "tabular-nums" },
    { header: "درصد سهام", accessorKey: "sharePercentage", align: "center", className: "tabular-nums" },
  ];

  const handleChange = <K extends keyof PersonForm>(field: K, value: PersonForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      phoneNumber: "",
      nationalCode: "",
      role: "",
      careerHistory: "",
      educationalHistory: "",
      sharePercentage: null,
      email: "",
    });
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("نام و نام‌خانوادگی الزامی است");
    if (/[@#!]/.test(form.name)) return toast.error("نام نباید شامل کاراکترهای خاص باشد (#, @, !)");
    if (form.name.length > 200) return toast.error("طول نام نباید بیشتر از ۲۰۰ کاراکتر باشد");
    if (!form.phoneNumber.trim()) return toast.error("شماره همراه الزامی است");
    if (!/^0\d{10}$/.test(form.phoneNumber))
      return toast.error("شماره همراه باید ۱۱ رقم و با ۰ شروع شود");
    if (!form.nationalCode.trim()) return toast.error("کد ملی الزامی است");
    if (!/^\d{10}$/.test(form.nationalCode))
      return toast.error("کد ملی باید دقیقاً ۱۰ رقم باشد");
    if (!form.role.trim()) return toast.error("سمت (نقش) الزامی است");
    if (form.sharePercentage === null || form.sharePercentage === "")
      return toast.error("درصد سهام الزامی است");
    const share = parseFloat(String(form.sharePercentage));
    if (isNaN(share) || share < 0 || share > 100)
      return toast.error("درصد سهام باید بین ۰ تا ۱۰۰ باشد");
    if (form.educationalHistory && form.educationalHistory.length > 1000)
      return toast.error("طول سوابق تحصیلی نباید بیشتر از ۱۰۰۰ کاراکتر باشد");
    if (form.educationalHistory && /[@#!]/.test(form.educationalHistory))
      return toast.error("سوابق تحصیلی نباید شامل کاراکترهای خاص باشد (#, @, !)");
    if (form.careerHistory && form.careerHistory.length > 1000)
      return toast.error("طول سوابق شغلی نباید بیشتر از ۱۰۰۰ کاراکتر باشد");
    if (form.careerHistory && /[@#!]/.test(form.careerHistory))
      return toast.error("سوابق شغلی نباید شامل کاراکترهای خاص باشد (#, @, !)");
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return toast.error("ایمیل وارد شده معتبر نیست");

    const Member = {
      name: form.name,
      phoneNumber: form.phoneNumber,
      nationalCode: form.nationalCode,
      role: BoardmemderRoleTypes.find(item => item.label === form.role)?.value,
      careerHistory: form.careerHistory,
      educationalHistory: form.educationalHistory,
      sharePercentage: share,
      email: form.email,
    };

    setLoading(true);

    PostRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${ID}/board-members`, Member)
      .then(() => {
        toast.success("عضو هیئت‌مدیره و سهامدار با موفقیت افزوده شد.", { position: "bottom-left" });

        const newMember: Person = {
          id: String(data.length + 1),
          ...form,
        };

        SetData([...data, newMember]);
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
    SetStep(4);
  };

  return (
    <div className="mt-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h5 className="font-extrabold text-xl text-titleText dark:text-titleText-dark">
            مشخصات اعضای هیئت‌مدیره و سهامداران
          </h5>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            مرحله ۳: اعضای هیئت‌مدیره و سهامداران را اضافه کنید.
          </p>
        </div>

        <button
          className={[
            "h-12 w-full sm:w-auto px-4 rounded-xl",
            "border border-primary text-primary",
            "hover:bg-primary/10 transition",
            "flex items-center justify-center gap-2",
            "shadow-sm",
          ].join(" ")}
          onClick={openModal}
          id="openAddBoardMemberModal"
        >
          افزودن عضو جدید
        </button>
      </div>

      {/* Stepper */}
      <Stepper current={3} total={5} />

      {/* Table Card */}
      <div className="bg-boxColor dark:bg-boxColor-dark border border-boxBorderColor dark:border-boxBorderColor-dark rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h6 className="font-bold text-base text-titleText dark:text-titleText-dark">
            لیست اعضا
          </h6>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            برای ادامه حداقل یک عضو اضافه کنید (در صورت نیاز)
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

      {/* CTA */}
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
          id="nextPage3"
        >
          صفحه بعد
        </button>
      </div>

      {/* Modal */}
      <Modal open={isOpen} onClose={closeModal}>
        <Modal.Backdrop />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/20">
          <Modal.Panel className="w-full max-w-2xl rounded-2xl bg-white dark:bg-bgColor-dark shadow-xl text-titleText dark:text-titleText-dark overflow-hidden">
            {/* Modal header */}
            <div className="p-4 sm:p-5 border-b border-boxBorderColor dark:border-boxBorderColor-dark">
              <Modal.Title className="text-lg font-extrabold text-titleText dark:text-titleText-dark">
                {editingId ? "ویرایش عضو" : "افزودن عضو جدید"}
              </Modal.Title>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                اطلاعات عضو هیئت‌مدیره/سهامدار را وارد کنید.
              </p>
            </div>

            {/* Modal body */}
            <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="نام و نام‌خانوادگی" required hint="حداکثر ۲۰۰ کاراکتر">
                <Input
                  id="boardmember_full_name"
                  className={inputBaseClass}
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="نام و نام‌خانوادگی"
                />
              </Field>

              <Field label="شماره همراه" required hint="۱۱ رقم و با ۰ شروع شود">
                <Input
                  id="boardmember_phone_number"
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
                  id="boardmember_national_code"
                  className={inputBaseClass}
                  value={form.nationalCode}
                  onChange={(e) => {
                    if (validateNumbers(e.target.value)) handleChange("nationalCode", e.target.value);
                  }}
                  placeholder="کد ملی"
                />
              </Field>

              <Field label="نقش" required>
                <div className="relative">
                  <Dropdown
                    onChange={(e) => { if (typeof e === 'string') handleChange("role", e); }}
                    value={form.role}
                  >
                    <Dropdown.Trigger className="w-full">
                      <Button
                        as="span"
                        role="button"
                        variant="ghost"
                        className={[
                          "w-full h-12 rounded-xl px-4",
                          "flex items-center justify-between",
                          "bg-boxColor dark:bg-boxColor-dark",
                          "border border-boxBorderColor dark:border-boxBorderColor-dark",
                          "text-titleText dark:text-titleText-dark",
                          "shadow-sm",
                          "focus:outline-none focus:ring-2 focus:ring-primary/40",
                        ].join(" ")}
                      >
                        <span className={form.role ? "" : "text-gray-400"}>
                          {form.role !== "" ? form.role : "انتخاب"}
                        </span>
                      </Button>
                    </Dropdown.Trigger>

                    <Dropdown.Options
                      className={[
                        "absolute left-0 mt-2 w-full min-w-[18rem] p-2",
                        "bg-white dark:bg-buttonColor-dark",
                        "border border-gray-200 dark:border-buttonBorderColor-dark",
                        "rounded-xl z-50 max-h-64 overflow-y-auto shadow-lg",
                        "text-titleText dark:text-titleText-dark",
                      ].join(" ")}
                    >
                      {BoardmemderRoleTypes.map((item, index) => (
                        <Dropdown.Option value={item.label} key={`option${index}`}>
                          {({ selected, active }) => (
                            <MenuItem
                              isActive={active}
                              isSelected={selected}
                              className={[
                                "rounded-lg border mb-2",
                                "border-gray-100 dark:border-buttonBorderColor-dark",
                                form.role === item.label ? "bg-gray-100 dark:bg-gray-700" : "",
                              ].join(" ")}
                            >
                              <MenuItem.Title>{item.label}</MenuItem.Title>
                            </MenuItem>
                          )}
                        </Dropdown.Option>
                      ))}
                    </Dropdown.Options>
                  </Dropdown>

                  <ControlsChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none" />
                </div>
              </Field>

              <Field label="سوابق تحصیلی" hint="اختیاری (حداکثر ۱۰۰۰ کاراکتر)">
                <textarea
                  id="boardmember_educational_history"
                  className={textareaClass}
                  value={form.educationalHistory}
                  onChange={(e) => handleChange("educationalHistory", e.target.value)}
                  placeholder="سوابق تحصیلی"
                />
              </Field>

              <Field label="سوابق شغلی" hint="اختیاری (حداکثر ۱۰۰۰ کاراکتر)">
                <textarea
                  id="boardmember_career_history"
                  className={textareaClass}
                  value={form.careerHistory}
                  onChange={(e) => handleChange("careerHistory", e.target.value)}
                  placeholder="سوابق شغلی"
                />
              </Field>

              <Field label="درصد سهام" required hint="بین ۰ تا ۱۰۰ (اعشار مجاز)">
                <Input
                  id="boardmember_share_percentage"
                  className={inputBaseClass}
                  type="text"
                  value={form.sharePercentage ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;

                    if (value === "") {
                      handleChange("sharePercentage", value);
                      return;
                    }

                    const decimalRegex = /^\d*\.?\d*$/;
                    if (decimalRegex.test(value)) {
                      handleChange("sharePercentage", value);
                    }
                  }}
                  placeholder="مثلاً 25"
                />
              </Field>

              <Field label="ایمیل" hint="اختیاری">
                <Input
                  id="boardmember_email"
                  className={inputBaseClass}
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="example@domain.com"
                  style={{ direction: "ltr" }}
                />
              </Field>
            </div>

            {/* Modal footer */}
            <div className="p-4 sm:p-5 border-t border-boxBorderColor dark:border-boxBorderColor-dark flex flex-col sm:flex-row justify-end gap-2">
              <Button variant="ghost" onClick={closeModal}>
                انصراف
              </Button>

              <Button onClick={handleSave} id="AddBoardMember" disabled={Loading}>
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
  )
}

export default BoardMemberInfo;
