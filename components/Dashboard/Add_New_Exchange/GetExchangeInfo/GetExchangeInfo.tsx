import React, { useMemo, useState } from 'react';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import { Dropdown, MenuItem, Button, Input } from "@heathmont/moon-core-tw";
import { ControlsChevronDown } from '@heathmont/moon-icons-tw';
import toast from "react-hot-toast";
import { LoaderCircle } from '../../../Loader/Loader';
import { ExchangeLegalTypes } from '../../../../functions/ExchangeLegalTypes';

import { addHttps, removeProtocolAndWWW, validateDomainExtension, validateEmail, validateNumbers } from '../../../../functions/Validations';
import { PostRequest } from '../../../../functions/PostRequest';
import { toEnglishDigits } from '../../../../functions/EnglishNumber';
import { toLocalDate } from '../../../../functions/toLocalDate';
import { handlePostErrors } from '../../../../functions/handlePostErrors';

interface GetExchangeInfoProps {
  SetStep: React.Dispatch<React.SetStateAction<number>>;
  ID: number | undefined;
  setID: React.Dispatch<React.SetStateAction<number | undefined>>;
}

/** ---------- UI helpers (برای اینکه برای مراحل بعد هم راحت reuse بشه) ---------- */
const Stepper = ({ current = 1, total = 5 }: { current?: number; total?: number }) => {
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
        <span className="hidden sm:inline">ثبت اطلاعات پایه سکو</span>
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

const GetExchangeInfo: React.FC<GetExchangeInfoProps> = ({ SetStep, ID, setID }) => {
  // exchange info
  const [name, Setname] = useState<string>("");
  const [legalName, SetlegalName] = useState<string>("");
  const [nationalCode, SetnationalCode] = useState<string>("");
  const [establishmentDate, SetestablishmentDate] = useState<string>("");
  const [type, Settype] = useState<string>("")
  const [exchangeType, SetexchangeType] = useState<string>("")
  const [financialCode, SetfinancialCode] = useState<string>("")
  const [logo, SetLogo] = useState<string>("");
  const [siteAddress, SetsiteAddress] = useState<string>("");
  const [emergencyPhoneNumber, SetemergencyPhoneNumber] = useState<string>("");
  const [officeAddress, SetofficeAddress] = useState<string>("");
  const [zipCode, SetzipCode] = useState<string>("");
  const [email, Setemail] = useState<string>("");
  const [registrationNumber, SetregistrationNumber] = useState<string>("");
  const [phoneNumber, SetphoneNumber] = useState<string>("");

  const [fileName, setFileName] = useState<string>("");
  const [Loading, setLoading] = useState<boolean>(false);

  const inputBaseClass = useMemo(() => {
    // یک کلاس ثابت برای همه input ها (برای مراحل بعد هم همین رو reuse می‌کنیم)
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024) {
      toast.error("حجم لوگو نباید بیشتر از 100 کیلوبایت باشد");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      SetLogo(reader.result as string);
    };
    reader.readAsDataURL(file);
    setFileName(file.name)
  };

  const handleSelectChange = (event: string) => {
    Settype(event);
  };

  const nextStep = async () => {
    if (name === '') return toast.error("نام سکو مورد نظر را انتخاب کنید", { position: "bottom-left" })
    if (legalName === '') return toast.error("نام حقوقی سکو مورد نظر را انتخاب کنید", { position: "bottom-left" })
    if (nationalCode === '') return toast.error("شناسه ملی سکو مورد نظر را انتخاب کنید", { position: "bottom-left" })
    if (financialCode === '') return toast.error("کد اقتصادی سکو مورد نظر را انتخاب کنید", { position: "bottom-left" })
    if (registrationNumber === '') return toast.error("شماره ثبت سکو مورد نظر را انتخاب کنید", { position: "bottom-left" })
    if (exchangeType === '') return toast.error("شکل حقوقی سکو مورد نظر را انتخاب کنید", { position: "bottom-left" })
    if (type === '') return toast.error("نوع سکو مورد نظر را انتخاب کنید", { position: "bottom-left" })
    if (establishmentDate === '') return toast.error("تاریخ تاسیس سکو مورد نظر را انتخاب کنید", { position: "bottom-left" })
    if (siteAddress === '') return toast.error("وبسایت سکو مورد نظر را انتخاب کنید", { position: "bottom-left" })
    if (phoneNumber === '') return toast.error("شماره تماس سکو مورد نظر را انتخاب کنید", { position: "bottom-left" })

    if (email !== '' && email !== null && !validateEmail(email)) {
      return toast.error("ایمیل مورد نظر را به درستی وارد کنید", { position: "bottom-left" })
    }
    if (!validateDomainExtension(siteAddress)) return toast.error("پسوند سایت سکو مورد نظر را به درستی وارد کنید", { position: "bottom-left" })
    if (/[@#!]/.test(name)) return toast.error("نام سکو نباید شامل کاراکترهای خاص باشد (#, @, !)")
    if (name.length > 200) return toast.error("طول نام سکو نباید بیشتر از ۲۰۰ کاراکتر باشد")
    if (/[@#!]/.test(legalName)) return toast.error("نام حقوقی نباید شامل کاراکترهای خاص باشد (#, @, !)")
    if (legalName.length > 200) return toast.error("طول نام حقوقی نباید بیشتر از ۲۰۰ کاراکتر باشد")
    if (!/^\d{11}$/.test(nationalCode)) return toast.error("شناسه ملی باید دقیقاً ۱۱ رقم باشد")
    if (!/^\d{11,16}$/.test(financialCode)) return toast.error("کد اقتصادی باید بین ۱۱ تا ۱۶ رقم باشد")
    const regNum = Number(registrationNumber)
    if (!/^\d{6}$/.test(registrationNumber) || regNum < 100000 || regNum > 999999) return toast.error("شماره ثبت باید ۶ رقم و بین ۱۰۰۰۰۰ تا ۹۹۹۹۹۹ باشد")
    if (zipCode && !/^\d{10}$/.test(zipCode)) return toast.error("کد پستی باید دقیقاً ۱۰ رقم باشد")
    if (officeAddress.length > 1000) return toast.error("طول آدرس دفتر نباید بیشتر از ۱۰۰۰ کاراکتر باشد")

    const payload = {
      name,
      legalName,
      nationalCode: toEnglishDigits(nationalCode),
      establishmentDate: toLocalDate(establishmentDate),
      type,
      exchangeType: ExchangeLegalTypes.find(item => item.label === exchangeType)?.value,
      financialCode: toEnglishDigits(financialCode),
      logo,
      siteAddress: addHttps(removeProtocolAndWWW(siteAddress)),
      emergencyPhoneNumber: toEnglishDigits(emergencyPhoneNumber),
      officeAddress,
      phoneNumber: toEnglishDigits(phoneNumber),
      registrationNumber,
      email,
      zipCode
    }

    setLoading(true)
    PostRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/exchanges`, payload)
      .then((response) => {
        toast.success("سکو با موفقیت ذخیره شد.", { position: "bottom-left" })
        setID(response?.result?.id)
        SetStep(2)
        setLoading(false)
      })
      .catch((err) => {
        handlePostErrors(err)
        setLoading(false)
      })
  };

  return (
    <div className="mt-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h5 className="font-extrabold text-xl text-titleText dark:text-titleText-dark">
            ثبت سکو جدید
          </h5>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            مرحله ۱: اطلاعات پایه و هویتی سکو را وارد کنید.
          </p>
        </div>
      </div>

      {/* Stepper */}
      <Stepper current={1} total={5} />

      {/* Form Card */}
      <div className="bg-boxColor dark:bg-boxColor-dark border border-boxBorderColor dark:border-boxBorderColor-dark rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h6 className="font-bold text-base text-titleText dark:text-titleText-dark">
            مشخصات سکو
          </h6>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            فیلدهای ستاره‌دار الزامی هستند
          </span>
        </div>

        {/* Section 1 */}
        <div className="mt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Field label="نام سکو" required hint="حداکثر ۲۰۰ کاراکتر">
              <Input
                id="exchange_name"
                value={name}
                onChange={(e) => Setname(e.target.value)}
                placeholder="نام سکو"
                className={inputBaseClass}
              />
            </Field>

            <Field label="نام حقوقی سکو" required hint="حداکثر ۲۰۰ کاراکتر">
              <Input
                id="exchange_legal_name"
                value={legalName}
                onChange={(e) => SetlegalName(e.target.value)}
                placeholder="نام حقوقی سکو"
                className={inputBaseClass}
              />
            </Field>

            <Field label="شناسه ملی سکو" required hint="دقیقاً ۱۱ رقم">
              <Input
                id="exchange_national_code"
                value={nationalCode}
                onChange={(e) => {
                  if (validateNumbers(e.target.value)) SetnationalCode(e.target.value)
                }}
                placeholder="شناسه ملی"
                className={inputBaseClass}
              />
            </Field>

            <Field label="تاریخ تاسیس" required hint="بر اساس تقویم شمسی">
              <DatePicker
                value={establishmentDate}
                onChange={(date) => SetestablishmentDate(date ? date.format("YYYY/MM/DD") : "")}
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-right"
                containerClassName="w-full"
                render={(val, openCalendar) => (
                  <div className="relative">
                    <Input
                      id="exchange_establishment_date"
                      readOnly
                      value={val}
                      onClick={openCalendar}
                      placeholder="انتخاب تاریخ"
                      className={[inputBaseClass, "pr-10 pl-10 cursor-pointer"].join(" ")}
                    />

                    {/* calendar icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      viewBox="0 0 24 25"
                      fill="none"
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400"
                    >
                      <path
                        d="M19.125 10.4742H4.875M8.71154 7.73381V5.5415M15.2885 7.73381L15.2885 5.5415M4.875 8.82997L4.875 17.5992C4.875 18.81 5.85653 19.7915 7.06731 19.7915L16.9327 19.7915C18.1435 19.7915 19.125 18.81 19.125 17.5992V8.82999C19.125 7.61921 18.1435 6.63768 16.9327 6.63768L7.06731 6.63766C5.85653 6.63766 4.875 7.61919 4.875 8.82997Z"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                    {/* clear icon */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        SetestablishmentDate("");
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:dark:text-gray-300 transition"
                      aria-label="پاک کردن تاریخ"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M6 6L18 18M6 18L18 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              />
            </Field>

            <Field label="شکل حقوقی سکو" required>
              <div className="relative">
                <Dropdown onChange={SetexchangeType} value={exchangeType}>
                  <Dropdown.Trigger className="w-full">
                    <Button
                      as="span"
                      role="button"
                      variant="ghost"
                      className={[
                        "w-full h-12 rounded-xl px-4",
                        "flex items-center justify-between",
                        "bg-boxColor dark:bg-bgColor-dark",
                        "border border-boxBorderColor dark:border-boxBorderColor-dark",
                        "text-titleText dark:text-titleText-dark",
                        "shadow-sm",
                        "focus:outline-none focus:ring-2 focus:ring-primary/40",
                      ].join(" ")}
                    >
                      <span className={exchangeType ? "" : "text-gray-400"}>
                        {exchangeType !== "" ? exchangeType : "انتخاب"}
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
                    {ExchangeLegalTypes.map((item, index) => (
                      <Dropdown.Option value={item.label} key={`option${index}`}>
                        {({ selected, active }) => (
                          <MenuItem
                            isActive={active}
                            isSelected={selected}
                            className={[
                              "rounded-lg border mb-2",
                              "border-gray-100 dark:border-buttonBorderColor-dark",
                              exchangeType === item.label ? "bg-gray-100 dark:bg-gray-700" : "",
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

            <Field label="نوع سکو" required hint="P2P یا OTC">
              <div className="relative">
                <Dropdown onChange={handleSelectChange} value={type}>
                  <Dropdown.Trigger className="w-full">
                    <Button
                      as="span"
                      role="button"
                      variant="ghost"
                      className={[
                        "w-full h-12 rounded-xl px-4",
                        "flex items-center justify-between",
                        "bg-boxColor dark:bg-bgColor-dark",
                        "border border-boxBorderColor dark:border-boxBorderColor-dark",
                        "text-titleText dark:text-titleText-dark",
                        "shadow-sm",
                        "focus:outline-none focus:ring-2 focus:ring-primary/40",
                      ].join(" ")}
                    >
                      <span className={type ? "" : "text-gray-400"}>
                        {type !== "" ? type : "انتخاب"}
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
                    {["P2P", "OTC"].map((opt) => (
                      <Dropdown.Option value={opt} key={opt}>
                        {({ selected, active }) => (
                          <MenuItem
                            isActive={active}
                            isSelected={selected}
                            className={[
                              "rounded-lg border mb-2",
                              "border-gray-100 dark:border-buttonBorderColor-dark",
                              type === opt ? "bg-gray-100 dark:bg-gray-700" : "",
                            ].join(" ")}
                          >
                            <MenuItem.Title>{opt}</MenuItem.Title>
                          </MenuItem>
                        )}
                      </Dropdown.Option>
                    ))}
                  </Dropdown.Options>
                </Dropdown>

                <ControlsChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none" />
              </div>
            </Field>

            <Field label="کد اقتصادی" required hint="بین ۱۱ تا ۱۶ رقم">
              <Input
                id="exchange_financial_code"
                value={financialCode}
                onChange={(e) => {
                  if (validateNumbers(e.target.value)) SetfinancialCode(e.target.value)
                }}
                placeholder="کد اقتصادی"
                className={inputBaseClass}
              />
            </Field>

            <Field label="آدرس سایت" required hint="مثال: example.com">
              <Input
                id="exchange_site_address"
                value={siteAddress}
                onChange={(e) => SetsiteAddress(e.target.value)}
                placeholder="آدرس سایت"
                className={inputBaseClass}
              />
            </Field>

            <Field label="شماره ثبت" required hint="۶ رقم (۱۰۰۰۰۰ تا ۹۹۹۹۹۹)">
              <Input
                id="exchange_registration_number"
                type="text"
                value={registrationNumber}
                onChange={(e) => {
                  if (validateNumbers(e.target.value)) SetregistrationNumber(e.target.value)
                }}
                placeholder="شماره ثبت"
                className={inputBaseClass}
              />
            </Field>

            <Field label="شماره تماس" required>
              <Input
                id="exchange_phone_number"
                value={phoneNumber}
                onChange={(e) => {
                  if (validateNumbers(e.target.value)) SetphoneNumber(e.target.value)
                }}
                placeholder="شماره تماس"
                className={inputBaseClass}
              />
            </Field>

            <Field label="لوگو" hint="حداکثر 100KB (PNG/JPG/GIF)">
              <label
                className={[
                  "block w-full h-12 rounded-xl px-4",
                  "bg-boxColor dark:bg-bgColor-dark",
                  "border border-dashed border-boxBorderColor dark:border-boxBorderColor-dark",
                  "text-titleText dark:text-titleText-dark",
                  "shadow-sm cursor-pointer",
                  "flex items-center justify-between",
                  "hover:border-primary/60 transition",
                ].join(" ")}
              >
                <span className={fileName ? "text-sm" : "text-sm text-gray-400"}>
                  {fileName ? fileName : "انتخاب فایل"}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Upload</span>

                <input
                  id="exchange_logo"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </Field>

            <Field label="شماره تماس اضطراری">
              <Input
                id="exchange_emergency_phone_number"
                value={emergencyPhoneNumber}
                onChange={(e) => {
                  if (validateNumbers(e.target.value)) SetemergencyPhoneNumber(e.target.value)
                }}
                placeholder="شماره تماس اضطراری"
                className={inputBaseClass}
              />
            </Field>

            <Field label="ایمیل سکو" hint="اختیاری">
              <Input
                id="exchange_email"
                style={{ direction: 'ltr' }}
                value={email}
                onChange={(e) => Setemail(e.target.value)}
                placeholder="example@domain.com"
                className={inputBaseClass}
              />
            </Field>

            <Field label="آدرس دفتر رسمی" hint="حداکثر ۱۰۰۰ کاراکتر">
              <Input
                id="exchange_office_address"
                value={officeAddress}
                onChange={(e) => SetofficeAddress(e.target.value)}
                placeholder="آدرس دفتر رسمی"
                className={inputBaseClass}
              />
            </Field>

            <Field label="کد پستی" hint="۱۰ رقم (اختیاری)">
              <Input
                id="exchange_zip_code"
                value={zipCode}
                onChange={(e) => {
                  if (validateNumbers(e.target.value)) SetzipCode(e.target.value)
                }}
                placeholder="کد پستی"
                className={inputBaseClass}
              />
            </Field>
          </div>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="bg-transparent">
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
            id="nextPage1"
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
    </div>
  );
}

export default GetExchangeInfo;
