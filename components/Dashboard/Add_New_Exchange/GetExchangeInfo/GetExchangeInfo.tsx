import React, { useState } from 'react'
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import { Dropdown, MenuItem, Button, Input } from "@heathmont/moon-core-tw";
import { ControlsChevronDown } from '@heathmont/moon-icons-tw';
import toast from "react-hot-toast";

interface Step1Data {
    name: string;
    legalName: string;
    nationalCode: string;
    establishmentDate: string;
    type: string;
    exchangeType: string;
    financialCode: string;
    logo: string;
    siteAddress: string;
    emergencyPhoneNumber: string;
    officeAddress: string;
    email: string;
    fileName: string;
}

type ShowingStepProps = {
    SetStep: React.Dispatch<React.SetStateAction<number>>;
    step1Data: Step1Data;
    setStep1Data: React.Dispatch<React.SetStateAction<Step1Data>>;
};

const GetExchangeInfo = ({ SetStep, step1Data, setStep1Data }: ShowingStepProps) => {

    //exchange info
    const [name, Setname] = useState<string>(step1Data.name);
    const [legalName, SetlegalName] = useState<string>(step1Data.legalName);
    const [nationalCode, SetnationalCode] = useState<string>(step1Data.nationalCode);
    const [establishmentDate, SetestablishmentDate] = useState<any>(step1Data.establishmentDate);
    const [type, Settype] = useState<string>(step1Data.type)
    const [exchangeType, SetexchangeType] = useState<string>(step1Data.exchangeType)
    const [financialCode, SetfinancialCode] = useState<string>(step1Data.financialCode)
    const [logo, SetLogo] = useState<string>(step1Data.logo);
    const [siteAddress, SetsiteAddress] = useState<string>(step1Data.siteAddress);
    const [emergencyPhoneNumber, SetemergencyPhoneNumber] = useState<string>(step1Data.emergencyPhoneNumber);
    const [officeAddress, SetofficeAddress] = useState<string>(step1Data.officeAddress);
    const [email, Setemail] = useState<string>(step1Data.email);

    const [fileName, setFileName] = useState<string>(step1Data.fileName);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
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

    const nextStep = () => {
        if (name === '') {
            return (
                toast.error("نام صرافی مورد نظر را انتخاب کنید", {
                    position: "bottom-left",
                })
            )
        }
        if (legalName === '') {
            return (
                toast.error("نام حقوقی صرافی مورد نظر را انتخاب کنید", {
                    position: "bottom-left",
                })
            )
        }
        if (nationalCode === '') {
            return (
                toast.error("شناسه ملی صرافی مورد نظر را انتخاب کنید", {
                    position: "bottom-left",
                })
            )
        }
        setStep1Data(
            {
                name,
                legalName,
                nationalCode,
                establishmentDate: establishmentDate === '' ? '' : `${establishmentDate.year}/${establishmentDate.month.number}/${establishmentDate.day}`,
                type,
                exchangeType,
                financialCode,
                logo,
                siteAddress,
                emergencyPhoneNumber,
                officeAddress,
                email,
                fileName
            }
        )
        SetStep(2)
    }
    return (
        <div className='mt-4'>
            <h5 className='font-bold text-lg text-titleText dark:text-titleText-dark'>
                ثبت صرافی جدید
            </h5>
            <div className='bg-boxColor dark:bg-boxColor-dark border border-boxBorderColor dark:border-boxBorderColor-dark rounded-xl mt-4 p-4'>
                <h6 className='font-bold text-md text-titleText dark:text-titleText-dark'>
                    مشخصات صرافی
                </h6>
                <div className='grid grid-cols-1 xl:grid-cols-3 md:grid-cols-2 gap-4 mt-4'>
                    <div>
                        <label className='text-titleText dark: dark:text-titleText-dark'>نام صرافی</label>
                        <Input value={name} onChange={(e) => { Setname(e.target.value) }} placeholder='نام صرافی' className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-bgColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>

                    <div>
                        <label className='text-titleText dark: dark:text-titleText-dark'>نام حقوقی صرافی</label>
                        <Input value={legalName} onChange={(e) => { SetlegalName(e.target.value) }} placeholder='نام حقوقی صرافی' className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-bgColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>

                    <div>
                        <label className='text-titleText dark: dark:text-titleText-dark'>شناسه ملی صرافی</label>
                        <Input value={nationalCode} onChange={(e) => { SetnationalCode(e.target.value) }} placeholder='شناسه ملی صرافی' className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-bgColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>

                    <div>
                        <label className='text-titleText dark: dark:text-titleText-dark'>تاریخ تاسیس</label>
                        <DatePicker
                            value={establishmentDate}
                            onChange={SetestablishmentDate}
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
                                        className="w-full pr-10 pl-10 flex-shrink-0 rounded-md bg-bgColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm border border-boxBorderColor dark:border-boxBorderColor-dark"
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
                                            e.stopPropagation(); // ❌ جلو گیری از باز شدن تقویم
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

                    <div>
                        <label className='text-titleText dark: dark:text-titleText-dark'>شکل حقوقی صرافی</label>

                        <div className="relative w-full mt-2">
                            <Dropdown onChange={SetexchangeType} value={exchangeType}>
                                <Dropdown.Trigger className="w-full">
                                    <Button
                                        as="span"
                                        role="button"
                                        variant="ghost"
                                        className="flex items-center justify-between w-full pl-10 pr-10 py-2 
                   text-gray-700 border border-gray-300 
                   rounded-lg dark:border-buttonBorderColor-dark focus:outline-none 
                   dark:text-gray-100 appearance-none relative bg-bgColor dark:bg-bgColor-dark"
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
                                    <Dropdown.Option value="سهامی" key="option1">
                                        {({ selected, active }) => (
                                            <MenuItem isActive={active} isSelected={selected}
                                            className={`border mt-2 mb-1 rounded-md border-gray-100 dark:border-buttonBorderColor-dark ${exchangeType === "سهامی"
                                                ? "bg-gray-100 border-gray-200 dark:bg-gray-700"
                                                : ""
                                                }`}
                                            >
                                                <MenuItem.Title>سهامی</MenuItem.Title>
                                            </MenuItem>
                                        )}
                                    </Dropdown.Option>
                                    <Dropdown.Option value="مسئولیت محدود" key="option2">
                                        {({ selected, active }) => (
                                            <MenuItem isActive={active}
                                            className={`border mt-2 mb-1 rounded-md border-gray-100 dark:border-buttonBorderColor-dark ${exchangeType === "مسئولیت محدود"
                                                ? "bg-gray-100 border-gray-200 dark:bg-gray-700"
                                                : ""
                                                }`}
                                            >
                                                <MenuItem.Title>مسئولیت محدود</MenuItem.Title>
                                            </MenuItem>
                                        )}
                                    </Dropdown.Option>
                                </Dropdown.Options>
                            </Dropdown>

                            {/* فلش سمت راست */}
                            <ControlsChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-titleText dark:text-titleText-dark pointer-events-none" />

                            {/* ضربدر سمت چپ */}
                            {exchangeType && (
                                <svg
                                    onClick={() => SetexchangeType("")}
                                    className="cursor-pointer absolute left-3 top-1/2 -translate-y-1/2 text-titleText dark:text-titleText-dark hover:dark:text-gray-300 transition"
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
                            )}
                        </div>



                    </div>

                    <div>
                        <label className='text-titleText dark: dark:text-titleText-dark'>نوع صرافی</label>

                        <div className="relative w-full mt-2">
                            <Dropdown onChange={handleSelectChange} value={type}>
                                <Dropdown.Trigger className="w-full">
                                    <Button
                                        as="span"
                                        role="button"
                                        variant="ghost"
                                        className="flex items-center justify-between w-full pl-10 pr-10 py-2 
                   text-gray-700 border border-gray-300 
                   rounded-lg dark:border-buttonBorderColor-dark focus:outline-none 
                   dark:text-gray-100 appearance-none relative bg-bgColor dark:bg-bgColor-dark"
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
                                        {({ selected, active }) => (
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
                            <ControlsChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-titleText dark:text-titleText-dark pointer-events-none" />

                            {/* ضربدر سمت چپ */}
                            {type && (
                                <svg
                                    onClick={() => Settype("")}
                                    className="cursor-pointer absolute left-3 top-1/2 -translate-y-1/2 text-titleText dark:text-titleText-dark hover:dark:text-gray-300 transition"
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
                            )}
                        </div>

                    </div>

                    <div>
                        <label className='text-titleText dark: dark:text-titleText-dark'>کد اقتصادی</label>
                        <Input value={financialCode} onChange={(e) => { SetfinancialCode(e.target.value) }} placeholder='کد اقتصادی' className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-bgColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>

                    <div>
                        <label className="text-titleText dark:text-titleText-dark">لوگو</label>
                        <label className="block mt-2 cursor-pointer p-2 rounded-md border border-boxBorderColor dark:border-boxBorderColor-dark bg-bgColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm">
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
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    </div>

                    <div>
                        <label className='text-titleText dark: dark:text-titleText-dark'>آدرس سایت</label>
                        <Input value={siteAddress} onChange={(e) => { SetsiteAddress(e.target.value) }} placeholder='آدرس سایت' className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-bgColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>

                    <div>
                        <label className='text-titleText dark: dark:text-titleText-dark'>شماره تماس اضطراری</label>
                        <Input value={emergencyPhoneNumber} onChange={(e) => { SetemergencyPhoneNumber(e.target.value) }} placeholder='شماره تماس اضطراری' className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-bgColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>

                    <div>
                        <label className='text-titleText dark: dark:text-titleText-dark'>آدرس دفتر رسمی</label>
                        <Input value={officeAddress} onChange={(e) => { SetofficeAddress(e.target.value) }} placeholder='آدرس دفتر رسمی' className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-bgColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>

                    <div>
                        <label className='text-titleText dark: dark:text-titleText-dark'>ایمیل صرافی</label>
                        <Input value={email} onChange={(e) => { Setemail(e.target.value) }} placeholder='ایمیل صرافی' className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-bgColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>
                </div>
            </div>

            <div className="relative w-full mt-4 ">
                <div className="flex justify-between items-center">
                    <div className="text-sm text-titleText dark:text-titleText-dark"></div>

                    <div className="text-sm text-titleText dark:text-titleText-dark">
                        <button className="w-72 bg-primary h-[48px] rounded-lg text-white shadow-lg" onClick={() => { nextStep() }}>
                            صفحه بعد
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GetExchangeInfo
