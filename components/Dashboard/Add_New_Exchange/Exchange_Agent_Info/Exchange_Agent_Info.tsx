import React, { useMemo, useState } from "react";
import ExpandableTable, { Column } from "../../../ExpandableTable/ExpandableTable";
import { Modal, Button, Input } from "@heathmont/moon-core-tw";
import toast from "react-hot-toast";
import { LoaderCircle } from "../../../Loader/Loader";
import { validateNumbers } from "../../../../functions/Validations";
import { PostRequest } from "../../../../functions/PostRequest";
import { handlePostErrors } from "../../../../functions/handlePostErrors";

type Person = {
  id: string;
  name: string;
  phoneNumber: string;
  nationalCode: string;
};

interface GetExchangeInfoProps {
  SetStep: React.Dispatch<React.SetStateAction<number>>;
  ID: number | undefined;
}

/** ---------- UI helpers ---------- */
const Stepper = ({ current = 4, total = 5 }: { current?: number; total?: number }) => {
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
        <span className="hidden sm:inline">ثبت مشخصات نمایندگان کارگزاری</span>
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

const Exchange_Agent_Info: React.FC<GetExchangeInfoProps> = ({ SetStep, ID }) => {
  const [editingId, setEditingId] = useState<string | null>(null); // فعلاً فقط برای عنوان
  const [Loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);

  const [data, SetData] = useState<Person[]>([]);
  const [form, setForm] = useState<Omit<Person, "id">>({
    name: "",
    phoneNumber: "",
    nationalCode: "",
  });

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

  const columns: Column<Person>[] = [
    { header: "نام و نام‌خانوادگی", accessorKey: "name" },
    { header: "شماره همراه", accessorKey: "phoneNumber", align: "center", className: "tabular-nums" },
    { header: "کد ملی", accessorKey: "nationalCode", align: "center", className: "tabular-nums" },
  ];

  const handleChange = <K extends keyof Omit<Person, "id">>(field: K, value: Omit<Person, "id">[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm({ name: "", phoneNumber: "", nationalCode: "" });
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("نام و نام‌خانوادگی الزامی است");
    if (/[@#!]/.test(form.name)) return toast.error("نام نباید شامل کاراکترهای خاص باشد (#, @, !)");
    if (form.name.length > 200) return toast.error("طول نام نباید بیشتر از ۲۰۰ کاراکتر باشد");
    if (!form.phoneNumber.trim()) return toast.error("شماره همراه الزامی است");
    if (!/^0\d{10}$/.test(form.phoneNumber)) return toast.error("شماره همراه باید ۱۱ رقم و با ۰ شروع شود");
    if (!form.nationalCode.trim()) return toast.error("کد ملی الزامی است");
    if (!/^\d{10}$/.test(form.nationalCode)) return toast.error("کد ملی باید دقیقاً ۱۰ رقم باشد");

    const Member = {
      name: form.name,
      nationalCode: form.nationalCode,
      phoneNumber: form.phoneNumber,
    };

    setLoading(true);

    PostRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${ID}/exchange-agents`, Member)
      .then(() => {
        toast.success("نماینده کارگزاری با موفقیت افزوده شد.", { position: "bottom-left" });

        const newMember: Person = {
          id: String(data.length + 1),
          ...form,
        };

        SetData((prev) => [...prev, newMember]);
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
    SetStep(5);
  };

  return (
    <div className="mt-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h5 className="font-extrabold text-xl text-titleText dark:text-titleText-dark">
            مشخصات نمایندگان
          </h5>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            مرحله ۴: نمایندگان کارگزاری را اضافه کنید.
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
          onClick={openModal}
          id="openAddAgentModal"
        >
          افزودن نماینده جدید
        </button>
      </div>

      {/* Stepper */}
      <Stepper current={4} total={5} />

      {/* Table Card */}
      <div className="bg-boxColor dark:bg-boxColor-dark border border-boxBorderColor dark:border-boxBorderColor-dark rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h6 className="font-bold text-base text-titleText dark:text-titleText-dark">
            لیست نمایندگان
          </h6>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            در صورت نیاز می‌توانید چند نماینده اضافه کنید
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
          id="nextPage4"
        >
          صفحه بعد
        </button>
      </div>

      {/* Modal */}
      <Modal open={isOpen} onClose={closeModal}>
        <Modal.Backdrop />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/20">
          <Modal.Panel className="w-full max-w-2xl rounded-2xl bg-white dark:bg-bgColor-dark shadow-xl text-titleText dark:text-titleText-dark overflow-hidden">
            {/* header */}
            <div className="p-4 sm:p-5 border-b border-boxBorderColor dark:border-boxBorderColor-dark">
              <Modal.Title className="text-lg font-extrabold text-titleText dark:text-titleText-dark">
                {editingId ? "ویرایش نماینده" : "افزودن نماینده جدید"}
              </Modal.Title>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                اطلاعات نماینده را وارد کنید.
              </p>
            </div>

            {/* body */}
            <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="نام و نام‌خانوادگی" required hint="حداکثر ۲۰۰ کاراکتر">
                <Input
                  id="agent_full_name"
                  className={inputBaseClass}
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="نام و نام‌خانوادگی"
                />
              </Field>

              <Field label="شماره همراه" required hint="۱۱ رقم و با ۰ شروع شود">
                <Input
                  id="agent_phone_number"
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
                  id="agent_national_code"
                  className={inputBaseClass}
                  value={form.nationalCode}
                  onChange={(e) => {
                    if (validateNumbers(e.target.value)) handleChange("nationalCode", e.target.value);
                  }}
                  placeholder="کد ملی"
                />
              </Field>
            </div>

            {/* footer */}
            <div className="p-4 sm:p-5 border-t border-boxBorderColor dark:border-boxBorderColor-dark flex flex-col sm:flex-row justify-end gap-2">
              <Button variant="ghost" onClick={closeModal}>
                انصراف
              </Button>

              <Button onClick={handleSave} id="addAgent" disabled={Loading}>
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

export default Exchange_Agent_Info;
