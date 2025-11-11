import React, { useState } from 'react'
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
import { refreshTokenOnly } from '../../../../functions/TokenRefresh';

interface GetExchangeInfoProps {
    SetStep: React.Dispatch<React.SetStateAction<number>>;
    ID: number | undefined;
    setID: React.Dispatch<React.SetStateAction<number | undefined>>;
}

const GetExchangeInfo: React.FC<GetExchangeInfoProps> = ({ SetStep, ID, setID }) => {

    //exchange info
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
        // === Validations ===
        if (name === '') return toast.error("نام سکو مورد نظر را انتخاب کنید", { position: "bottom-left" });
        if (legalName === '') return toast.error("نام حقوقی سکو مورد نظر را انتخاب کنید", { position: "bottom-left" });
        if (nationalCode === '') return toast.error("شناسه ملی سکو مورد نظر را انتخاب کنید", { position: "bottom-left" });
        if (financialCode === '') return toast.error("کد اقتصادی سکو مورد نظر را انتخاب کنید", { position: "bottom-left" });
        if (registrationNumber === '') return toast.error("شماره ثبت سکو مورد نظر را انتخاب کنید", { position: "bottom-left" });
        if (exchangeType === '') return toast.error("شکل حقوقی سکو مورد نظر را انتخاب کنید", { position: "bottom-left" });
        if (type === '') return toast.error("نوع سکو مورد نظر را انتخاب کنید", { position: "bottom-left" });
        if (establishmentDate === '') return toast.error("تاریخ تاسیس سکو مورد نظر را انتخاب کنید", { position: "bottom-left" });
        if (siteAddress === '') return toast.error("وبسایت سکو مورد نظر را انتخاب کنید", { position: "bottom-left" });
        if (phoneNumber === '') return toast.error("شماره تماس سکو مورد نظر را انتخاب کنید", { position: "bottom-left" });
        if (email !== '' && email !== null && !validateEmail(email)) {
          return toast.error("ایمیل مورد نظر را به درستی وارد کنید", { position: "bottom-left" });
        }
        if (!validateDomainExtension(siteAddress)) return toast.error("پسوند سایت سکو مورد نظر را به درستی وارد کنید", { position: "bottom-left" });
        if (/[@#!]/.test(name)) return toast.error("نام سکو نباید شامل کاراکترهای خاص باشد (#, @, !)");
        if (name.length > 200) return toast.error("طول نام سکو نباید بیشتر از ۲۰۰ کاراکتر باشد");
        if (/[@#!]/.test(legalName)) return toast.error("نام حقوقی نباید شامل کاراکترهای خاص باشد (#, @, !)");
        if (legalName.length > 200) return toast.error("طول نام حقوقی نباید بیشتر از ۲۰۰ کاراکتر باشد");
        if (!/^\d{11}$/.test(nationalCode)) return toast.error("شناسه ملی باید دقیقاً ۱۱ رقم باشد");
        if (!/^\d{11,16}$/.test(financialCode)) return toast.error("کد اقتصادی باید بین ۱۱ تا ۱۶ رقم باشد");
        const regNum = Number(registrationNumber);
        if (!/^\d{6}$/.test(registrationNumber) || regNum < 100000 || regNum > 999999)
          return toast.error("شماره ثبت باید ۶ رقم و بین ۱۰۰۰۰۰ تا ۹۹۹۹۹۹ باشد");
        if (zipCode && !/^\d{10}$/.test(zipCode)) return toast.error("کد پستی باید دقیقاً ۱۰ رقم باشد");
        if (officeAddress.length > 1000) return toast.error("طول آدرس دفتر نباید بیشتر از ۱۰۰۰ کاراکتر باشد");
      
        // === Payload ===
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
        };
      
        // 👇 کمک‌تابع هندل ارورها (نسخه‌ی کامل‌تر)
        const handlePostErrors = (e: any) => {
          const msg = String(e?.message ?? "");
          const status = e?.response?.status;
          const data = e?.response?.data as { result?: any; error?: string } | undefined;
      
          // 👇 تلاش دوم: اگه response نبود ولی message خودش JSON بود
          let parsedFromMessage: { result?: any; error?: string } | null = null;
          if (!data && typeof msg === "string" && msg.startsWith("{") && msg.endsWith("}")) {
            try {
              parsedFromMessage = JSON.parse(msg);
            } catch {
              // ignore
            }
          }
      
          const errorObj = data || parsedFromMessage;
      
          // 403 جدا هندل میشه بیرون، ولی اگه اینجا رسیدیم و متنی داشتیم نشون میدیم
          if (status === 403 && errorObj?.error) {
            toast.error(errorObj.error, { position: "bottom-left" });
            return true;
          }
      
          // ✅ ولیدیشن‌های فیلدی
          if (errorObj?.result && typeof errorObj.result === "object") {
            Object.entries(errorObj.result).forEach(([field, message]) => {
              if (message) toast.error(`${field} : ${message as string}`, { position: "bottom-left" });
            });
            return true;
          }
      
          // ✅ ارور متنی مستقیم از بک‌اند
          if (typeof errorObj?.error === "string" && errorObj.error.trim() !== "") {
            toast.error(errorObj.error, { position: "bottom-left" });
            return true;
          }
      
          // ✅ الگوی identifier از روی data.error
          if ((status === 400 || status === 409) && data?.error) {
            const duplicateMatch = String(data.error).match(/identifier:\s*(\w+):\s*(.+)$/i);
            if (duplicateMatch) {
              const field = duplicateMatch[1];
              const value = duplicateMatch[2];
              const fieldLabels: Record<string, string> = {
                nationalCode: "شناسه ملی",
                financialCode: "کد اقتصادی",
                phoneNumber: "شماره تماس",
                emergencyPhoneNumber: "شماره تماس اضطراری",
                zipCode: "کد پستی",
                legalName: "نام حقوقی",
                name: "نام سکو",
                siteAddress: "آدرس سایت",
              };
              const label = fieldLabels[field] || field;
              toast.error(`${label} ${value} قبلاً ثبت شده است.`, { position: "bottom-left" });
              return true;
            }
          }
      
          // ✅ fallbackهای متنی قبلیت
          const financialCodeError = msg.match(/Exchange with financial code '(.*?)' already exists/i);
          if (financialCodeError) {
            toast.error(`سکو با کد اقتصادی ${financialCodeError[1]} قبلاً وجود دارد.`, { position: "bottom-left" });
            return true;
          }
          const nationalCodeError = msg.match(/Exchange with national code '(.*?)' already exists/i);
          if (nationalCodeError) {
            toast.error(`سکو با شناسه ملی ${nationalCodeError[1]} قبلاً وجود دارد.`, { position: "bottom-left" });
            return true;
          }
      
          // آخرش
          toast.error("خطا در ذخیره سکو", { position: "bottom-left" });
          console.error(e);
          return true;
        };
      
        const doRequest = () =>
          PostRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/exchanges`, payload);
      
        try {
          setLoading(true);
      
          let res: any;
          try {
            // تلاش اول
            res = await doRequest();
          } catch (e1: any) {
            const status = e1?.response?.status;
      
            if (status === 401 || status === 403) {
              try {
                await refreshTokenOnly();
                res = await doRequest();
              } catch (e2: any) {
                handlePostErrors(e2);
                return;
              }
            } else {
              handlePostErrors(e1);
              return;
            }
          }
      
          // ✅ موفقیت
          toast.success("سکو با موفقیت ذخیره شد.", { position: "bottom-left" });
          setID(res?.result?.id);
          SetStep(2);
        } catch (e: any) {
          handlePostErrors(e);
        } finally {
          setLoading(false);
        }
      };
      
      

    return (
        <div className='mt-4'>
            <h5 className='font-bold text-lg text-titleText dark:text-titleText-dark'>
                ثبت سکو جدید
            </h5>
            <div className='bg-boxColor dark:bg-boxColor-dark border border-boxBorderColor dark:border-boxBorderColor-dark rounded-xl mt-4 p-4'>
                <h6 className='font-bold text-md text-titleText dark:text-titleText-dark'>
                    مشخصات سکو
                </h6>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4'>
                    <div>
                        <label className='text-titleText dark: dark:text-titleText-dark'>نام سکو *</label>
                        <Input value={name} onChange={(e) => { Setname(e.target.value) }} placeholder='نام سکو' className="w-full p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>

                    <div className="col-span-1">
                        <label className='text-titleText dark: dark:text-titleText-dark'>نام حقوقی سکو *</label>
                        <Input value={legalName} onChange={(e) => { SetlegalName(e.target.value) }} placeholder='نام حقوقی سکو' className="w-full p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>

                    <div className="col-span-1">
                        <label className='text-titleText dark: dark:text-titleText-dark'>شناسه ملی سکو *</label>
                        <Input value={nationalCode} onChange={(e) => {
                            if (validateNumbers(e.target.value)) {
                                SetnationalCode(e.target.value)
                            }
                        }} placeholder='شناسه ملی سکو' className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>

                    <div className="col-span-1">
                        <label className='text-titleText dark: dark:text-titleText-dark'>تاریخ تاسیس *</label>
                        <DatePicker
                            value={establishmentDate}
                            onChange={(date) => {
                                SetestablishmentDate(date ? date.format("YYYY/MM/DD") : "");
                            }}
                            calendar={persian}
                            locale={persian_fa}
                            calendarPosition="bottom-right"
                            containerClassName="w-full"
                            render={(val, openCalendar) => (
                                <div className="relative flex items-center w-full mt-2 text-titleText dark:text-titleText-dark">
                                    <Input
                                        readOnly
                                        value={val}
                                        onClick={openCalendar}
                                        placeholder="انتخاب تاریخ"
                                        className="w-full pr-10 pl-10 flex-shrink-0 rounded-md bg-boxColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm border border-boxBorderColor dark:border-boxBorderColor-dark"
                                    />

                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="25"
                                        viewBox="0 0 24 25"
                                        fill="none"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                    >
                                        <path
                                            d="M19.125 10.4742H4.875M8.71154 7.73381V5.5415M15.2885 7.73381L15.2885 5.5415M4.875 8.82997L4.875 17.5992C4.875 18.81 5.85653 19.7915 7.06731 19.7915L16.9327 19.7915C18.1435 19.7915 19.125 18.81 19.125 17.5992V8.82999C19.125 7.61921 18.1435 6.63768 16.9327 6.63768L7.06731 6.63766C5.85653 6.63766 4.875 7.61919 4.875 8.82997Z"
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>

                                    <svg
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            SetestablishmentDate("");
                                        }}
                                        className="cursor-pointer absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:dark:text-gray-300 transition"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M6 6L18 18M6 18L18 6"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>
                            )}
                        />


                    </div>

                    <div className="col-span-1">
                        <label className='text-titleText dark: dark:text-titleText-dark'>شکل حقوقی سکو *</label>

                        <div className="relative w-full mt-2">
                            <Dropdown onChange={SetexchangeType} value={exchangeType}>
                                <Dropdown.Trigger className="w-full">
                                    <Button
                                        as="span"
                                        role="button"
                                        variant="ghost"
                                        className="flex items-center justify-between w-full pl-10  py-2 
                   text-gray-700 border border-gray-300 
                   rounded-lg dark:border-buttonBorderColor-dark focus:outline-none 
                   dark:text-gray-100 appearance-none relative bg-boxColor dark:bg-bgColor-dark"
                                    >
                                        <span>{exchangeType !== "" ? exchangeType : "انتخاب"}</span>
                                    </Button>
                                </Dropdown.Trigger>

                                <Dropdown.Options
                                    className="absolute left-0 mt-2 w-72 pl-2 pr-2
                 text-gray-700 bg-white dark:bg-buttonColor-dark
                 border border-gray-300 dark:border-buttonBorderColor-dark 
                 rounded-lg dark:text-gray-100 appearance-none z-50
                 max-h-60 overflow-y-auto"
                                >
                                    {
                                        ExchangeLegalTypes.map((item, index) => {
                                            return (
                                                <Dropdown.Option value={item.label} key={`option${index}`}>
                                                    {({ selected, active }) => (
                                                        <MenuItem isActive={active} isSelected={selected}
                                                            className={`border mt-2 mb-1 rounded-md border-gray-100 dark:border-buttonBorderColor-dark ${exchangeType === item.label
                                                                ? "bg-gray-100 border-gray-200 dark:bg-gray-700"
                                                                : ""
                                                                }`}
                                                        >
                                                            <MenuItem.Title>{item.label}</MenuItem.Title>
                                                        </MenuItem>
                                                    )}
                                                </Dropdown.Option>
                                            )
                                        })
                                    }
                                </Dropdown.Options>
                            </Dropdown>

                            {/* فلش سمت راست */}
                            <ControlsChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-titleText dark:text-titleText-dark pointer-events-none" />
                        </div>
                    </div>

                    <div className="col-span-1">
                        <label className='text-titleText dark: dark:text-titleText-dark'>نوع سکو *</label>

                        <div className="relative w-full mt-2">
                            <Dropdown onChange={handleSelectChange} value={type}>
                                <Dropdown.Trigger className="w-full">
                                    <Button
                                        as="span"
                                        role="button"
                                        variant="ghost"
                                        className="flex items-center justify-between w-full pl-10 py-2 
                   text-gray-700 border border-gray-300 
                   rounded-lg dark:border-buttonBorderColor-dark focus:outline-none 
                   dark:text-gray-100 appearance-none relative bg-boxColor dark:bg-bgColor-dark"
                                    >
                                        <span>{type !== "" ? type : "انتخاب"}</span>
                                    </Button>
                                </Dropdown.Trigger>

                                <Dropdown.Options
                                    className="absolute left-0 mt-2 w-72 pl-2 pr-2
                 text-gray-700 bg-white dark:bg-buttonColor-dark
                 border border-gray-300 dark:border-buttonBorderColor-dark 
                 rounded-lg dark:text-gray-100 appearance-none z-50
                 max-h-60 overflow-y-auto"
                                >
                                    <Dropdown.Option value="P2P" key="option1">
                                        {({ selected, active }) => (
                                            <MenuItem
                                                isActive={active}
                                                isSelected={selected}
                                                className={`border mt-2 mb-1 rounded-md border-gray-100 dark:border-buttonBorderColor-dark ${type === "P2P"
                                                    ? "bg-gray-100 border-gray-200 dark:bg-gray-700"
                                                    : ""
                                                    }`}
                                            >
                                                <MenuItem.Title>P2P</MenuItem.Title>
                                            </MenuItem>
                                        )}
                                    </Dropdown.Option>
                                    <Dropdown.Option value="OTC" key="option2">
                                        {({ active }) => (
                                            <MenuItem
                                                isActive={active}
                                                className={`border mt-2 mb-1 rounded-md border-gray-100 dark:border-buttonBorderColor-dark ${type === "OTC"
                                                    ? "bg-gray-100 border-gray-200 dark:bg-gray-700"
                                                    : ""
                                                    }`}
                                            >
                                                <MenuItem.Title>OTC</MenuItem.Title>
                                            </MenuItem>
                                        )}
                                    </Dropdown.Option>
                                </Dropdown.Options>
                            </Dropdown>

                            {/* فلش سمت راست */}
                            <ControlsChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-titleText dark:text-titleText-dark pointer-events-none" />
                        </div>
                    </div>

                    <div className="col-span-1">
                        <label className='text-titleText dark: dark:text-titleText-dark'>کد اقتصادی *</label>
                        <Input value={financialCode} onChange={(e) => {
                            if (validateNumbers(e.target.value)) {
                                SetfinancialCode(e.target.value)
                            }
                        }} placeholder='کد اقتصادی' className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>

                    <div className="col-span-1">
                        <label className='text-titleText dark: dark:text-titleText-dark'>آدرس سایت *</label>
                        <Input value={siteAddress} onChange={(e) => { SetsiteAddress(e.target.value) }} placeholder='آدرس سایت' className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>

                    <div className="col-span-1">
                        <label className='text-titleText dark: dark:text-titleText-dark'>شماره ثبت *</label>
                        <Input type='text' value={registrationNumber} onChange={(e) => {
                            if (validateNumbers(e.target.value)) {
                                SetregistrationNumber((e.target.value))
                            }
                        }} placeholder='شماره ثبت' className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>

                    <div className="col-span-1">
                        <label className='text-titleText dark: dark:text-titleText-dark'>شماره تماس *</label>
                        <Input value={phoneNumber} onChange={(e) => {
                            if (validateNumbers(e.target.value)) {
                                SetphoneNumber(e.target.value)
                            }
                        }} placeholder='شماره تماس' className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>

                    <div className="col-span-1">
                        <label className="text-titleText dark:text-titleText-dark">لوگو (حداکثر 100 کیلوبایت)</label>
                        <label className="block mt-2 cursor-pointer p-2 rounded-md border border-boxBorderColor dark:border-boxBorderColor-dark bg-boxColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm">
                            {
                                fileName === "" ?
                                    <span>
                                        انتخاب فایل
                                    </span>
                                    :
                                    fileName
                            }

                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/jpg, image/gif"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    </div>

                    <div className="col-span-1">
                        <label className='text-titleText dark: dark:text-titleText-dark'>شماره تماس اضطراری</label>
                        <Input value={emergencyPhoneNumber} onChange={(e) => {
                            if (validateNumbers(e.target.value)) {
                                SetemergencyPhoneNumber(e.target.value)
                            }
                        }} placeholder='شماره تماس اضطراری' className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>

                    <div className="col-span-1">
                        <label className='text-titleText dark: dark:text-titleText-dark'>ایمیل سکو</label>
                        <Input style={{ direction: 'ltr' }} value={email} onChange={(e) => { Setemail(e.target.value) }} placeholder='ایمیل سکو' className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>

                    <div className="col-span-1 sm:col-span-1">
                        <label className='text-titleText dark: dark:text-titleText-dark'>آدرس دفتر رسمی</label>
                        <Input value={officeAddress} onChange={(e) => { SetofficeAddress(e.target.value) }} placeholder='آدرس دفتر رسمی' className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>

                    <div className="col-span-1 sm:col-span-1">
                        <label className='text-titleText dark: dark:text-titleText-dark'>کد پستی</label>
                        <Input value={zipCode} onChange={(e) => {
                            if (validateNumbers(e.target.value)) {
                                SetzipCode(e.target.value)
                            }
                        }} placeholder='کد پستی' className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>

                    <div>
                        <p className='text-primary dark:text-primary-dark text-sm'>
                            موارد ستاره‌دار الزامی هستند!
                        </p>
                    </div>

                </div>
            </div>

            <div className="relative w-full mt-4">
                <div className="flex justify-between items-center w-full">
                    <div className="text-sm text-titleText dark:text-titleText-dark"></div>
                    <div className="text-sm text-titleText dark:text-titleText-dark w-full sm:w-auto">
                        <button
                            className="w-full sm:w-72 bg-primary h-[48px] rounded-lg text-white shadow-lg flex justify-center items-center"
                            onClick={() => nextStep()}
                        >
                            {Loading ? (
                                <div>
                                    <LoaderCircle size={8} color="border-white-500" />
                                </div>
                            ) : (
                                "صفحه بعد"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GetExchangeInfo
