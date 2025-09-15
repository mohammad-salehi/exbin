import React, { useState } from 'react'
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import { Dropdown, MenuItem, Button, Input } from "@heathmont/moon-core-tw";
import { ControlsChevronDown } from '@heathmont/moon-icons-tw';
import toast from "react-hot-toast";

interface Step2Data {
    name: string;
    phoneNumber: string;
    nationalCode: string;
    educationalHistory: string;
    careerHistory: string;
    sharePercentage: number | null;
    email: string;
}

type ShowingStepProps = {
    SetStep: React.Dispatch<React.SetStateAction<number>>;
    step2Data: Step2Data;
    setStep2Data: React.Dispatch<React.SetStateAction<Step2Data>>;
};

const Get_CEO_info = ({ SetStep, step2Data, setStep2Data }: ShowingStepProps) => {

    //exchange info
    const [name, Setname] = useState<string>(step2Data.name);
    const [phoneNumber, SetphoneNumber] = useState<string>(step2Data.phoneNumber);
    const [nationalCode, SetnationalCode] = useState<string>(step2Data.nationalCode);
    const [educationalHistory, SeteducationalHistory] = useState<string>(step2Data.educationalHistory);
    const [careerHistory, SetcareerHistory] = useState<string>(step2Data.careerHistory)
    const [sharePercentage, SetsharePercentage] = useState<number | null>(step2Data.sharePercentage)
    const [email, Setemail] = useState<string>(step2Data.email)

    const nextStep = () => {
        if (name === '') {
            return (
                toast.error("نام و نام‌خانوادگی مورد نظر را انتخاب کنید", {
                    position: "bottom-left",
                })
            )
        }
        if (phoneNumber === '') {
            return (
                toast.error("شماره همراه مورد نظر را انتخاب کنید", {
                    position: "bottom-left",
                })
            )
        }
        if (nationalCode === '') {
            return (
                toast.error("کد ملی مورد نظر را انتخاب کنید", {
                    position: "bottom-left",
                })
            )
        }
        if ( sharePercentage !== null && (sharePercentage < 0 || sharePercentage > 100)) {
            return toast.error("درصد سهام باید بین 0 تا 100 باشد", {
              position: "bottom-left",
            });
          }
        setStep2Data(
            {
                name,
                phoneNumber,
                nationalCode,
                educationalHistory,
                careerHistory,
                sharePercentage,
                email
            }
        )
        SetStep(3)
    }
    return (
        <div className='mt-4'>
            <h5 className='font-bold text-lg text-titleText dark:text-titleText-dark'>
                ثبت مشخصات مدیرعامل
            </h5>
            <div className='bg-boxColor dark:bg-boxColor-dark border border-boxBorderColor dark:border-boxBorderColor-dark rounded-xl mt-4 p-4'>
                <h6 className='font-bold text-md text-titleText dark:text-titleText-dark'>
                    مشخصات مدیرعامل
                </h6>
                <div className='grid grid-cols-1 xl:grid-cols-3 md:grid-cols-2 gap-4 mt-4'>
                    <div>
                        <label className='text-titleText dark: dark:text-titleText-dark'>نام و نام‌خانوادگی</label>
                        <Input value={name} onChange={(e) => { Setname(e.target.value) }} placeholder='نام و نام‌خانوادگی' className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-bgColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>

                    <div>
                        <label className='text-titleText dark: dark:text-titleText-dark'>شماره همراه</label>
                        <Input value={phoneNumber} onChange={(e) => { SetphoneNumber(e.target.value) }} placeholder='شماره همراه' className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-bgColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>

                    <div>
                        <label className='text-titleText dark: dark:text-titleText-dark'>کد ملی</label>
                        <Input value={nationalCode} onChange={(e) => { SetnationalCode(e.target.value) }} placeholder='کد ملی' className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-bgColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>

                    <div>
                        <label className='text-titleText dark: dark:text-titleText-dark'>سوابق تحصیلی</label>
                        <Input value={educationalHistory} onChange={(e) => { SeteducationalHistory(e.target.value) }} placeholder='سوابق تحصیلی' className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-bgColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>

                    <div>
                        <label className='text-titleText dark: dark:text-titleText-dark'>سوابق شغلی</label>
                        <Input value={careerHistory} onChange={(e) => { SetcareerHistory(e.target.value) }} placeholder='سوابق شغلی' className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-bgColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>

                    <div>
                        <label className='text-titleText dark: dark:text-titleText-dark'>درصد سهام</label>
                        <Input type='number' value={sharePercentage ?? ""} onChange={(e) => {
                            const val = e.target.value;
                            SetsharePercentage(val === "" ? null : Number(val));
                        }} placeholder='درصد سهام' className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-bgColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>

                    <div>
                        <label className='text-titleText dark: dark:text-titleText-dark'>ایمیل</label>
                        <Input value={email} onChange={(e) => { Setemail(e.target.value) }} placeholder='ایمیل' className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-bgColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>
                </div>
            </div>

            <div className="relative w-full mt-4 ">
                <div className="flex justify-between items-center">
                    <div className="text-sm text-titleText dark:text-titleText-dark"></div>

                    <div className="text-sm text-titleText dark:text-titleText-dark">
                        <button className="w-36 ml-2 bg-primary h-[48px] rounded-lg text-white shadow-lg" onClick={() => { SetStep(1) }}>
                            صفحه قبل
                        </button>
                        <button className="w-36 bg-primary h-[48px] rounded-lg text-white shadow-lg" onClick={() => { nextStep() }}>
                            صفحه بعد
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Get_CEO_info
