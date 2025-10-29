import React, { useState } from 'react'
import { Input } from "@heathmont/moon-core-tw";
import toast from "react-hot-toast";
import { GetRequest } from '../../../../functions/GetRequest';
import { LoaderCircle } from '../../../Loader/Loader';

import { validateEmail } from '../../../../functions/Validations';
import { validateNumbers } from '../../../../functions/Validations';
import { validateWebsite } from '../../../../functions/Validations';

interface GetExchangeInfoProps {
    SetStep: React.Dispatch<React.SetStateAction<number>>;
    ID: number | undefined;
}

const Get_CEO_info: React.FC<GetExchangeInfoProps> = ({ SetStep, ID }) => {

    //exchange info
    const [name, Setname] = useState<string>("");
    const [phoneNumber, SetphoneNumber] = useState<string>("");
    const [nationalCode, SetnationalCode] = useState<string>("");
    const [educationalHistory, SeteducationalHistory] = useState<string>("");
    const [careerHistory, SetcareerHistory] = useState<string>("")
    const [sharePercentage, SetsharePercentage] = useState<string | null>(null)
    const [email, Setemail] = useState<string>("")

    const [Loading, setLoading] = useState<boolean>(false);


    const nextStep = async () => {
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
        if (sharePercentage !== null && (Number(sharePercentage) < 0 || Number(sharePercentage) > 100)) {
            return toast.error("درصد سهام باید بین 0 تا 100 باشد", {
                position: "bottom-left",
            });
        }

        if (!validateEmail(email) && email !== "") {
            return (
                toast.error("ایمیل مورد نظر را به درستی وارد کنید", {
                    position: "bottom-left",
                })
            )
        }

        const data = {
            name,
            phoneNumber,
            nationalCode,
            educationalHistory,
            careerHistory,
            sharePercentage: sharePercentage !== null ? Number(sharePercentage) : 0,
            email
        };

        GetRequest(`https://sand-em-api.bahfara.ir/api/exchanges/${ID}`)
            .then(async (response) => {
                const managerInfo = response.result
                managerInfo.managerInfo = data
                console.log(managerInfo)
                try {
                    const token = document.cookie
                        .split('; ')
                        .find(row => row.startsWith('token='))
                        ?.split('=')[1];

                    if (!token) {
                        toast.error("توکن موجود نیست، لطفاً وارد سیستم شوید.", { position: "bottom-left" });
                        return;
                    }

                    // ارسال درخواست به API
                    setLoading(true)
                    const response = await fetch(`https://sand-em-api.bahfara.ir/api/exchanges/${ID}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(managerInfo),
                    });

                    if (!response.ok) {
                        console.log(response)
                        setLoading(false)
                        return toast.error(`خطا در ذخیره مدیرعامل`);
                    } else {
                        const responseData = await response.json();
                        console.log(responseData);
                        toast.success("مدیرعامل با موفقیت ذخیره شد.", { position: "bottom-left" });
                        setLoading(false)
                        SetStep(3)
                    }

                } catch (err) {
                    console.error(err);
                    return toast.error(`خطا در ذخیره مدیرعامل`);
                }
            })
            .catch((err) => {
                console.log(err)
                return toast.error(`خطا در ذخیره مدیرعامل`);
            })

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
                        <label className='text-titleText dark: dark:text-titleText-dark'>نام و نام‌خانوادگی *</label>
                        <Input value={name} onChange={(e) => { Setname(e.target.value) }} placeholder='نام و نام‌خانوادگی' className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>

                    <div>
                        <label className='text-titleText dark: dark:text-titleText-dark'>شماره همراه *</label>
                        <Input value={phoneNumber} onChange={(e) => {
                            if (validateNumbers(e.target.value)) {
                                SetphoneNumber(e.target.value)
                            }
                        }} placeholder='شماره همراه' className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>

                    <div>
                        <label className='text-titleText dark: dark:text-titleText-dark'>کد ملی *</label>
                        <Input value={nationalCode}
                            onChange={(e) => {
                                if (validateNumbers(e.target.value)) {
                                    SetnationalCode(e.target.value)
                                }
                            }}
                            placeholder='کد ملی' className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>

                    <div>
                        <label className='text-titleText dark: dark:text-titleText-dark'>سوابق تحصیلی</label>
                        <Input value={educationalHistory} onChange={(e) => { SeteducationalHistory(e.target.value) }} placeholder='سوابق تحصیلی' className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>

                    <div>
                        <label className='text-titleText dark: dark:text-titleText-dark'>سوابق شغلی</label>
                        <Input value={careerHistory} onChange={(e) => { SetcareerHistory(e.target.value) }} placeholder='سوابق شغلی' className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>

                    <div>
                        <label className='text-titleText dark: dark:text-titleText-dark'>درصد سهام</label>
                        <Input type='text' value={sharePercentage ?? ""} onChange={(e) => {
                            if (validateNumbers(e.target.value)) {
                                SetsharePercentage(e.target.value)
                            }
                        }} placeholder='درصد سهام' className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>

                    <div>
                        <label className='text-titleText dark: dark:text-titleText-dark'>ایمیل</label>
                        <Input value={email} onChange={(e) => { Setemail(e.target.value) }} placeholder='ایمیل' className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" />
                    </div>
                </div>
            </div>


            <div className="relative w-full mt-4">
                <div className="flex justify-between items-center w-full">
                    <div className="text-sm text-titleText dark:text-titleText-dark"></div>
                    <div className="text-sm text-titleText dark:text-titleText-dark w-full sm:w-auto">
                    <button
                            className="w-full sm:w-72 bg-primary h-[48px] rounded-lg text-white shadow-lg flex justify-center items-center"
                            onClick={() => { nextStep() }}
                        >
                            {Loading ?
                                <div>
                                    <LoaderCircle size={8} color="border-white-500" />
                                </div>
                                :
                                "صفحه بعد"
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Get_CEO_info
