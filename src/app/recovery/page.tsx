'use client';

import { Button } from "@heathmont/moon-core-tw";
import { useEffect, useState, FormEvent } from "react";
import { Alert } from "@heathmont/moon-core-tw";
import { ControlsClose } from '@heathmont/moon-icons-tw';
import { Loader } from "@heathmont/moon-core-tw";
import { Input } from "@heathmont/moon-core-tw";
import Link from "next/link"
import type { forgot_password_request, forgot_password_response, recovery_password_request } from "@/types/auth";
import toast from 'react-hot-toast';
import { useRouter } from "next/navigation";
import { LoaderCircle } from "../../../components/Loader/Loader";

export default function Home() {
  const router = useRouter();

  const [UsernameError, SetUsernameError] = useState(false)

  const [hasError, SetHasError] = useState(false)
  const [ErrorText, SetErrorText] = useState('سلام')

  const [hasSuccess, SetHasSuccess] = useState(false)
  const [SuccessText, SetSuccessText] = useState('سلام')

  const [loading, setLoading] = useState(false);
  const [Step, setStep] = useState(1);

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);


  const handleChange = (value: string, index: number) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < otp.length - 1) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) (nextInput as HTMLInputElement).focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) (prevInput as HTMLInputElement).focus();
    }
  };

  const [time, setTime] = useState(120);
  const [finalOtp, setFinalOtp] = useState<string | null>(null);
  const [username, Setusername] = useState<string>('')
  const [password, SetPassword] = useState<string>('')
  const [confirmPassword, SetConfirmPassword] = useState<string>('')

  useEffect(() => {
    if (time <= 0) return;
    const interval = setInterval(() => {
      setTime((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [time]);

  useEffect(() => {
    setTime(120)
  }, [Step])


  function validatePhoneNumber(phoneNumber: string) {
    const phoneRegex = /^09\d{9}$/;
    return phoneRegex.test(phoneNumber);
  }

  async function GetRecoveryCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const ADDRESS = process.env.NEXT_PUBLIC_API_URL + `/api/v1/auth/forgot-password`
    const credentials: forgot_password_request = {
      username,
    }
    if (validatePhoneNumber(username)) {
      setLoading(true)
      const response = await fetch(`${ADDRESS}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) {
        setLoading(false)
        SetHasError(true)
        SetUsernameError(true)
        SetErrorText('شماره همراه اشتباه است')
        return;
      } else {
        setLoading(false)
        SetHasError(false)
        SetUsernameError(false)
      }

      const data: forgot_password_response = await response.json();
      const result = data?.result;
      if (!result) {
        SetHasError(true)
        SetErrorText('خطا در پردازش')
        return;
      } else {
        SetHasError(false)
      }
      setStep(2)
    } else {
      SetUsernameError(true)
      SetHasError(true)
      SetErrorText('شماره همراه وارد شده اشتباه است')
    }

  }

  async function ReSendRecoveryCode() {
    const ADDRESS = process.env.NEXT_PUBLIC_API_URL + `/api/v1/auth/forgot-password`
    const credentials: forgot_password_request = {
      username,
    }
    if (validatePhoneNumber(username)) {
      setLoading(true)
      const response = await fetch(`${ADDRESS}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) {
        setLoading(false)
        SetHasError(true)
        SetUsernameError(true)
        SetErrorText('شماره همراه اشتباه است')
        return;
      } else {
        setLoading(false)
        SetHasError(false)
        SetUsernameError(false)
      }

      const data: forgot_password_response = await response.json();
      const result = data?.result;
      if (!result) {
        SetHasError(true)
        SetErrorText('خطا در پردازش')
        return;
      } else {
        SetHasError(false)
      }
      setStep(2)
      setTime(120)
    } else {
      SetUsernameError(true)
      SetHasError(true)
      SetErrorText('شماره همراه وارد شده اشتباه است')
    }

  }

  async function recoveryPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (password === confirmPassword) {

      const ADDRESS = process.env.NEXT_PUBLIC_API_URL + `/api/v1/auth/reset-password`
      const credentials: recovery_password_request = {
        username: username,
        verificationCode: Number(finalOtp),
        newPassword: password,
      }
      if (validatePhoneNumber(username)) {
        setLoading(true)
        const response = await fetch(`${ADDRESS}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });
        console.log(response)
        if (!response.ok) {
          setLoading(false)
          SetHasError(true)
          SetUsernameError(true)
          SetErrorText('خطا در بازیابی رمزعبور')
          return;
        } else {
          setLoading(false)
          SetHasError(false)
          SetUsernameError(false)
        }

        const data: forgot_password_response = await response.json();
        const result = data?.result;
        if (!result) {
          SetHasError(true)
          SetErrorText('خطا در پردازش')
          return;
        } else {
          // صحیح
          toast.success("رمزعبور باموفقیت تغییر کرد", { position: "bottom-left" });
          router.push("/")
          SetHasError(false)
        }
      } else {
        SetUsernameError(true)
        SetHasError(true)
        SetErrorText('شماره همراه وارد شده اشتباه است')
      }
    } else {
      toast.error("عدم تطابق رمزعبور و تکرار رمزعبور", { position: "bottom-left" });
    }

  }
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 max-w-[490px] w-full ">
        {
          hasError ?
            <Alert
              className="bg-white text-red-500 border border-red-500 rounded-lg p-4 flex justify-between mt-12"
            >
              <div className="flex items-center justify-between w-full">
                <Alert.Message className="text-red-500 flex items-left space-x-2">
                  <ControlsClose className="text-red-500 cursor-pointer mt-1 me-2" />
                  <span className="float-left text-titleText">{ErrorText}</span>
                </Alert.Message>
              </div>
            </Alert>
            :
            null
        }

        {
          hasSuccess ?
            <Alert
              className="bg-white text-green-500 border border-green-500 rounded-lg p-4 flex justify-between mt-12"
            >
              <div className="flex items-center justify-between w-full">
                <Alert.Message className="text-green-500 flex items-left space-x-2">
                  <ControlsClose className="text-green-500 cursor-pointer mt-1 me-2" />
                  <span className="float-left text-titleText">{SuccessText}</span>
                </Alert.Message>
              </div>
            </Alert>
            :
            null
        }
        <h2 className="text-2xl mb-6 text-titleText mt-8 items-center text-center">
          بازیابی رمز عبور
        </h2>


        {
          Step === 1 ?
            <form className="flex flex-col gap-4 mt-14" onSubmit={(e) => GetRecoveryCode(e)}>
              <div>
                <label className="block mb-1 text-sm font-medium text-titleText"> شماره همراه</label>
                <input
                  type="text"
                  placeholder="شماره همراه"
                  onChange={(e) => { Setusername(e.target.value) }}
                  value={username}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-[48px] ${UsernameError
                    ? "border border-red-500 focus:ring-red-500"
                    : "border border-gray-300 focus:ring-blue-500"
                    }`}
                />
              </div>

              <div className="text-right">
                <Link href="/" className="text-sm hover:underline text-primary">
                  بازگشت به صفحه ورود
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-white hover:bg-primary-600 rounded-lg mt-4 h-[48px]"
                disabled={loading} // اگر لودینگ هست، دکمه غیرفعال بشه
              >
                {loading ? <LoaderCircle size={8} color="border-white-500" /> : 'بازیابی'}
              </Button>

            </form>
            : Step === 2 ?
              <form className="flex flex-col gap-4 mt-14">
                <h6 className="text-titleText  p-4 pt-0 pb-0">
                  کد تایید به شماره موردنظر ارسال شد
                </h6>
                <div className="flex gap-2 sm:gap-3 justify-center flex-wrap" dir="ltr">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(e.target.value, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="
        w-10 h-10 text-lg    // پیش‌فرض برای موبایل
        sm:w-12 sm:h-12 sm:text-xl  // تبلت
        md:w-14 md:h-14 md:text-2xl // دسکتاپ
        text-center border border-gray-200 rounded-xl
        focus:border-gray-300 focus:ring-2 focus:ring-gray-300
      "
                    />
                  ))}
                </div>

                <div className="text-right">

                  <div className="flex justify-between items-center  rounded-lg w-full p-4 pt-0 pb-0">
                    <span className="text-gray-700">
                      <p className={`text-sm ${time === 0 ? 'hover:underline cursor-pointer text-primary ' : 'text-blue-300'} `} onClick={() => {
                        if (time === 0) {
                          ReSendRecoveryCode()
                        }
                      }
                      }>
                        ارسال مجدد کد تایید
                      </p>
                    </span>
                    <span className="text-red-500">
                      {minutes}:{seconds.toString().padStart(2, "0")}
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  className="w-full bg-primary text-white hover:bg-primary-600 rounded-lg mt-4 h-[48px]"
                  disabled={loading}
                  onClick={() => {
                    const code = otp.join(""); // تبدیل آرایه به رشته
                    if (code.length === 6 && /^\d{6}$/.test(code)) {
                      setFinalOtp(code);
                      console.log(code)
                      setStep(3);
                    } else {
                      SetHasError(true);
                      SetErrorText("کد تایید معتبر نیست");
                    }
                  }}
                >
                  {loading ? <LoaderCircle size={8} color="border-white-500" /> : 'تایید'}
                </Button>

              </form>
              : Step === 3 ?
                <form className="flex flex-col gap-4 mt-14" onSubmit={(e) => recoveryPassword(e)}>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-titleText">رمز عبور</label>
                    <input
                      type="password"
                      onChange={(e) => { SetPassword(e.target.value) }}
                      value={password}
                      placeholder="رمز عبور "
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-[48px] ${UsernameError
                        ? "border border-red-500 focus:ring-red-500"
                        : "border border-gray-300 focus:ring-blue-500"
                        }`}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-titleText">تایید رمز عبور</label>
                    <input
                      onChange={(e) => { SetConfirmPassword(e.target.value) }}
                      value={confirmPassword}
                      type="password"
                      placeholder="تایید رمز عبور"
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-[48px] ${UsernameError
                        ? "border border-red-500 focus:ring-red-500"
                        : "border border-gray-300 focus:ring-blue-500"
                        }`}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary text-white hover:bg-primary-600 rounded-lg mt-4 h-[48px]"
                    disabled={loading} // اگر لودینگ هست، دکمه غیرفعال بشه
                    onClick={() => {
                      
                    }}
                  >
                    {loading ? <LoaderCircle size={8} color="border-white-500" /> : 'تغییر رمز عبور'}
                  </Button>

                </form>
                :
                null
        }

      </div>
      
    </div>
  );
}
