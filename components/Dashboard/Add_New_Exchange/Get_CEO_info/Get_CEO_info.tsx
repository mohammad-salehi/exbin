import React, { useState } from 'react'
import { Input } from "@heathmont/moon-core-tw";
import toast from "react-hot-toast";
import { GetRequest } from '../../../../functions/GetRequest';
import { LoaderCircle } from '../../../Loader/Loader';

import { validateEmail } from '../../../../functions/Validations';
import { validateNumbers } from '../../../../functions/Validations';
import { validateWebsite } from '../../../../functions/Validations';
import { refreshTokenOnly } from '../../../../functions/TokenRefresh';

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
    const [sharePercentage, SetsharePercentage] = useState<string | null>("")
    const [email, Setemail] = useState<string>("")

    const [Loading, setLoading] = useState<boolean>(false);


    const nextStep = async () => {
        // === Local Validations ===
        if (!name.trim()) return toast.error("نام و نام‌خانوادگی الزامی است");
        if (/[@#!]/.test(name)) return toast.error("نام نباید شامل کاراکترهای خاص باشد (#, @, !)");
        if (name.length > 200) return toast.error("طول نام نباید بیشتر از ۲۰۰ کاراکتر باشد");
        if (!phoneNumber.trim()) return toast.error("شماره همراه الزامی است");
        if (!/^0\d{10}$/.test(phoneNumber)) return toast.error("شماره همراه باید ۱۱ رقم و با ۰ شروع شود");
        if (!nationalCode.trim()) return toast.error("کد ملی الزامی است");
        if (!/^\d{10}$/.test(nationalCode)) return toast.error("کد ملی باید دقیقاً ۱۰ رقم باشد");
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
        const share = Number(sharePercentage);
        if (isNaN(share) || share < 0 || share > 100)
          return toast.error("درصد سهام باید بین ۰ تا ۱۰۰ باشد");
        if (email && !validateEmail(email))
          return toast.error("ایمیل وارد شده معتبر نیست");
      
        const data = {
          name,
          phoneNumber,
          nationalCode,
          educationalHistory,
          careerHistory,
          sharePercentage: share,
          email,
        };
      
        try {
          const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1];
      
          if (!token) {
            toast.error("توکن موجود نیست، لطفاً وارد سیستم شوید.", { position: "bottom-left" });
            return;
          }
      
          setLoading(true);
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${ID}/manager`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            }
          );
      
          // 👈 اول 403
          if (response.status === 403) {
            await refreshTokenOnly();
            setLoading(false);
          }
      
          // بعدش بقیه رو بخون
          if (response.status === 400 || response.status === 409) {
            const resData = await response.json();
      
            if (resData?.result && typeof resData.result === "object") {
              Object.entries(resData.result).forEach(([field, message]) => {
                if (message) toast.error(`${field} : ${message}`, { position: "bottom-left" });
              });
              setLoading(false);
              return;
            }
      
            if (resData?.error) {
              const duplicateMatch = resData.error.match(/identifier:\s*(\w+):\s*(\d+)/i);
              if (duplicateMatch) {
                const field = duplicateMatch[1];
                const value = duplicateMatch[2];
                const fieldLabels: Record<string, string> = {
                  nationalCode: "کد ملی",
                  phoneNumber: "شماره تماس",
                  email: "ایمیل",
                };
                const label = fieldLabels[field] || field;
                toast.error(`${label} ${value} قبلاً ثبت شده است.`, { position: "bottom-left" });
                setLoading(false);
                return;
              }
            }
      
            toast.error("خطا در ذخیره مدیرعامل", { position: "bottom-left" });
            setLoading(false);
            return;
          }
      
          if (!response.ok) {
            setLoading(false);
            return toast.error("خطا در ذخیره مدیرعامل", { position: "bottom-left" });
          }
      
          toast.success("مدیرعامل با موفقیت ذخیره شد.", { position: "bottom-left" });
          setLoading(false);
          SetStep(3);
        } catch (e: any) {
          console.error(e);
          toast.error("خطا در ذخیره مدیرعامل", { position: "bottom-left" });
          setLoading(false);
        }
      };
      
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
