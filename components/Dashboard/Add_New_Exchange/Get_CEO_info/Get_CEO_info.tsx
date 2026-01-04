import React, { useMemo, useState } from "react";
import { Input } from "@heathmont/moon-core-tw";
import toast from "react-hot-toast";
import { PostRequest } from "../../../../functions/PostRequest";
import { LoaderCircle } from "../../../Loader/Loader";

import { validateEmail, validateNumbers } from "../../../../functions/Validations";
import { handlePostErrors } from "../../../../functions/handlePostErrors";

interface GetExchangeInfoProps {
  SetStep: React.Dispatch<React.SetStateAction<number>>;
  ID: number | undefined;
}

/** ---------- UI helpers (برای همه مراحل reuse می‌کنیم) ---------- */
const Stepper = ({ current = 2, total = 5 }: { current?: number; total?: number }) => {
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
        <span className="hidden sm:inline">ثبت مشخصات مدیرعامل</span>
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

const Get_CEO_info: React.FC<GetExchangeInfoProps> = ({ SetStep, ID }) => {
  const [name, Setname] = useState<string>("");
  const [phoneNumber, SetphoneNumber] = useState<string>("");
  const [nationalCode, SetnationalCode] = useState<string>("");
  const [educationalHistory, SeteducationalHistory] = useState<string>("");
  const [careerHistory, SetcareerHistory] = useState<string>("");
  const [sharePercentage, SetsharePercentage] = useState<string | null>("");
  const [email, Setemail] = useState<string>("");

  const [Loading, setLoading] = useState<boolean>(false);

  const inputBaseClass = useMemo(() => {
    return [
      "w-full h-12",
      "rounded-xl",
      "bg-boxColor dark:bg-bgColor-dark",
      "text-titleText dark:text-titleText-dark",
      "border border-boxBorderColor dark:border-boxBorderColor-dark",
      "shadow-sm",
      "px-4",
      "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60",
      "transition",
    ].join(" ");
  }, []);

  const nextStep = async () => {
    if (!name.trim()) return toast.error("نام و نام‌خانوادگی الزامی است");
    if (/[@#!]/.test(name))
      return toast.error("نام نباید شامل کاراکترهای خاص باشد (#, @, !)");
    if (name.length > 200)
      return toast.error("طول نام نباید بیشتر از ۲۰۰ کاراکتر باشد");
    if (!phoneNumber.trim()) return toast.error("شماره همراه الزامی است");
    if (!/^0\d{10}$/.test(phoneNumber))
      return toast.error("شماره همراه باید ۱۱ رقم و با ۰ شروع شود");
    if (!nationalCode.trim()) return toast.error("کد ملی الزامی است");
    if (!/^\d{10}$/.test(nationalCode))
      return toast.error("کد ملی باید دقیقاً ۱۰ رقم باشد");
    if (educationalHistory && educationalHistory.length > 1000)
      return toast.error("طول سوابق تحصیلی نباید بیشتر از ۱۰۰۰ کاراکتر باشد");
    if (educationalHistory && /[@#!]/.test(educationalHistory))
      return toast.error("سوابق تحصیلی نباید شامل کاراکترهای خاص باشد (#, @, !)");
    if (careerHistory && careerHistory.length > 1000)
      return toast.error("طول سوابق شغلی نباید بیشتر از ۱۰۰۰ کاراکتر باشد");
    if (careerHistory && /[@#!]/.test(careerHistory))
      return toast.error("سوابق شغلی نباید شامل کاراکترهای خاص باشد (#, @, !)");
    if (sharePercentage === "" || sharePercentage === null)
      return toast.error("درصد سهام الزامی است");
    if (email && !validateEmail(email))
      return toast.error("ایمیل وارد شده معتبر نیست");

    const share = Number(sharePercentage);
    if (isNaN(share) || share < 0 || share > 100)
      return toast.error("درصد سهام باید بین ۰ تا ۱۰۰ باشد");

    const data = {
      name,
      phoneNumber,
      nationalCode,
      educationalHistory,
      careerHistory,
      sharePercentage: share,
      email,
    };

    setLoading(true);

    PostRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${ID}/manager`, data)
      .then(() => {
        toast.success("مدیرعامل با موفقیت ذخیره شد.", { position: "bottom-left" });
        setLoading(false);
        SetStep(3);
      })
      .catch((err) => {
        handlePostErrors(err);
        setLoading(false);
      });
  };

  return (
    <div className="mt-4 space-y-4">
      {/* Header */}
      <div>
        <h5 className="font-extrabold text-xl text-titleText dark:text-titleText-dark">
          ثبت مشخصات مدیرعامل
        </h5>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          مرحله ۲: اطلاعات هویتی و سوابق مدیرعامل را وارد کنید.
        </p>
      </div>

      {/* Stepper */}
      <Stepper current={2} total={5} />

      {/* Card */}
      <div className="bg-boxColor dark:bg-boxColor-dark border border-boxBorderColor dark:border-boxBorderColor-dark rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h6 className="font-bold text-base text-titleText dark:text-titleText-dark">
            مشخصات مدیرعامل
          </h6>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            فیلدهای ستاره‌دار الزامی هستند
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <Field label="نام و نام‌خانوادگی" required hint="حداکثر ۲۰۰ کاراکتر">
            <Input
              value={name}
              onChange={(e) => Setname(e.target.value)}
              placeholder="نام و نام‌خانوادگی"
              className={inputBaseClass}
            />
          </Field>

          <Field label="شماره همراه" required hint="۱۱ رقم و با ۰ شروع شود">
            <Input
              value={phoneNumber}
              onChange={(e) => {
                if (validateNumbers(e.target.value)) SetphoneNumber(e.target.value);
              }}
              placeholder="شماره همراه"
              className={inputBaseClass}
            />
          </Field>

          <Field label="کد ملی" required hint="دقیقاً ۱۰ رقم">
            <Input
              value={nationalCode}
              onChange={(e) => {
                if (validateNumbers(e.target.value)) SetnationalCode(e.target.value);
              }}
              placeholder="کد ملی"
              className={inputBaseClass}
            />
          </Field>

          <Field label="سوابق تحصیلی" hint="اختیاری (حداکثر ۱۰۰۰ کاراکتر)">
            <Input
              value={educationalHistory}
              onChange={(e) => SeteducationalHistory(e.target.value)}
              placeholder="سوابق تحصیلی"
              className={inputBaseClass}
            />
          </Field>

          <Field label="سوابق شغلی" hint="اختیاری (حداکثر ۱۰۰۰ کاراکتر)">
            <Input
              value={careerHistory}
              onChange={(e) => SetcareerHistory(e.target.value)}
              placeholder="سوابق شغلی"
              className={inputBaseClass}
            />
          </Field>

          <Field label="درصد سهام" required hint="بین ۰ تا ۱۰۰ (اعشار مجاز)">
            <Input
              type="text"
              value={sharePercentage ?? ""}
              onChange={(e) => {
                const value = e.target.value;

                if (value === "") {
                  SetsharePercentage("");
                  return;
                }

                const decimalRegex = /^\d*\.?\d*$/;
                if (decimalRegex.test(value)) {
                  SetsharePercentage(value);
                }
              }}
              placeholder="مثلاً 25"
              className={inputBaseClass}
            />
          </Field>

          <Field label="ایمیل" hint="اختیاری">
            <Input
              value={email}
              onChange={(e) => Setemail(e.target.value)}
              placeholder="example@domain.com"
              style={{ direction: "ltr" }}
              className={inputBaseClass}
            />
          </Field>
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
            "disabled:opacity-60 disabled:cursor-not-allowed",
          ].join(" ")}
          onClick={nextStep}
          id="nextPage2"
          disabled={Loading}
        >
          {Loading ? (
            <div className="flex items-center gap-2">
              <LoaderCircle size={8} color="border-white-500" />
              <span className="text-sm">در حال ذخیره...</span>
            </div>
          ) : (
            "صفحه بعد"
          )}
        </button>
      </div>
    </div>
  );
};

export default Get_CEO_info;
