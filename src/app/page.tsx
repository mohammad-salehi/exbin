'use client';

import { Button } from "@heathmont/moon-core-tw";
import { FormEvent, useState } from "react";
import { Alert } from "@heathmont/moon-core-tw";
import { ControlsClose } from '@heathmont/moon-icons-tw';
import Link from "next/link"
import type { LoginRequest, LoginResponse } from "@/types/auth";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "../../components/Loader/Loader";

export default function Home() {
  const router = useRouter();
  const DottedPatternLeft = () => (
    <svg width="150" height="60" xmlns="http://www.w3.org/2000/svg">
      <circle cx="5" cy="20" r="2" fill="#ccc" />
      <circle cx="20" cy="20" r="2" fill="#ccc" />
      <circle cx="35" cy="20" r="2" fill="#ccc" />
      <circle cx="50" cy="20" r="2" fill="#ccc" />
      <circle cx="65" cy="20" r="2" fill="#ccc" />
      <circle cx="80" cy="20" r="2" fill="#ccc" />
      <circle cx="95" cy="20" r="2" fill="#ccc" />
      <circle cx="110" cy="20" r="2" fill="#ccc" />
      <circle cx="125" cy="20" r="2" fill="#ccc" />

      <circle cx="20" cy="35" r="2" fill="#ccc" />
      <circle cx="35" cy="35" r="2" fill="#ccc" />
      <circle cx="50" cy="35" r="2" fill="#ccc" />
      <circle cx="65" cy="35" r="2" fill="#ccc" />
      <circle cx="80" cy="35" r="2" fill="#ccc" />
      <circle cx="95" cy="35" r="2" fill="#ccc" />
      <circle cx="110" cy="35" r="2" fill="#ccc" />
      <circle cx="125" cy="35" r="2" fill="#ccc" />
      <circle cx="140" cy="35" r="2" fill="#ccc" />

      <circle cx="5" cy="50" r="2" fill="#ccc" />
      <circle cx="20" cy="50" r="2" fill="#ccc" />
      <circle cx="35" cy="50" r="2" fill="#ccc" />
      <circle cx="50" cy="50" r="2" fill="#ccc" />
      <circle cx="65" cy="50" r="2" fill="#ccc" />
      <circle cx="80" cy="50" r="2" fill="#ccc" />
      <circle cx="95" cy="50" r="2" fill="#ccc" />
      <circle cx="110" cy="50" r="2" fill="#ccc" />
      <circle cx="125" cy="50" r="2" fill="#ccc" />

    </svg>
  );

  const DottedPatternRight = () => (
    <svg width="150" height="60" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="2" fill="#ccc" />
      <circle cx="35" cy="20" r="2" fill="#ccc" />
      <circle cx="50" cy="20" r="2" fill="#ccc" />
      <circle cx="65" cy="20" r="2" fill="#ccc" />
      <circle cx="80" cy="20" r="2" fill="#ccc" />
      <circle cx="95" cy="20" r="2" fill="#ccc" />
      <circle cx="110" cy="20" r="2" fill="#ccc" />
      <circle cx="125" cy="20" r="2" fill="#ccc" />
      <circle cx="140" cy="20" r="2" fill="#ccc" />

      <circle cx="5" cy="35" r="2" fill="#ccc" />
      <circle cx="20" cy="35" r="2" fill="#ccc" />
      <circle cx="35" cy="35" r="2" fill="#ccc" />
      <circle cx="50" cy="35" r="2" fill="#ccc" />
      <circle cx="65" cy="35" r="2" fill="#ccc" />
      <circle cx="80" cy="35" r="2" fill="#ccc" />
      <circle cx="95" cy="35" r="2" fill="#ccc" />
      <circle cx="110" cy="35" r="2" fill="#ccc" />
      <circle cx="125" cy="35" r="2" fill="#ccc" />
      <circle cx="125" cy="35" r="2" fill="#ccc" />

      <circle cx="20" cy="50" r="2" fill="#ccc" />
      <circle cx="35" cy="50" r="2" fill="#ccc" />
      <circle cx="50" cy="50" r="2" fill="#ccc" />
      <circle cx="65" cy="50" r="2" fill="#ccc" />
      <circle cx="80" cy="50" r="2" fill="#ccc" />
      <circle cx="95" cy="50" r="2" fill="#ccc" />
      <circle cx="110" cy="50" r="2" fill="#ccc" />
      <circle cx="125" cy="50" r="2" fill="#ccc" />
      <circle cx="140" cy="50" r="2" fill="#ccc" />

    </svg>
  );

  const [UsernameError, SetUsernameError] = useState<boolean>(false)
  const [hasError, SetHasError] = useState<boolean>(false)
  const [ErrorText, SetErrorText] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false);

  const [username, Setusername] = useState<string>('')
  const [password, Setpassword] = useState<string>('')

  function validatePhoneNumber(phoneNumber: string) {
    const phoneRegex = /^09\d{9}$/;
    return phoneRegex.test(phoneNumber);
  }

  async function Login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const ADDRESS = process.env.NEXT_PUBLIC_API_URL + `/api/v1/auth/signin`
    const credentials: LoginRequest = {
      username,
      password
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
        SetErrorText('شماره موبایل یا رمزعبور اشتباه است')
        return
      }
  
      setLoading(false)
      SetHasError(false)
      SetUsernameError(false)
  
      const data: LoginResponse = await response.json()
      const token = data?.result?.token
      const user = data?.result
  
      if (!token || !user) {
        SetHasError(true)
        SetErrorText('خطا در پردازش')
        return
      }
  
      const secure = location.protocol === "https:" ? "; Secure" : ""
      const maxAge = 60 * 60 * 24 // 24 ساعت
  
      // ذخیره‌ی کوکی‌ها
      document.cookie = `token=${token}; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`
      document.cookie = `username=${user.username}; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`
      document.cookie = `firstName=${user.firstName}; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`
      document.cookie = `lastName=${user.lastName}; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`
      document.cookie = `role=${user.role}; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`
  
      router.push("/panel/exchanges-list")
    } else {
      SetUsernameError(true)
      SetHasError(true)
      SetErrorText('شماره موبایل وارد شده اشتباه است')
    }
  }
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 max-w-[490px] w-full ">
        {/* عنوان */}
        <div className="flex justify-between ">
          <DottedPatternLeft />
          <img src="/images/pantaLogo.png" className="w-14 h-16" alt="image"/>
          <DottedPatternRight />
        </div>
        {
          hasError ?
            <Alert
              className="bg-white text-red-500 border border-red-500 rounded-lg p-4 flex justify-between mt-12"
            >
              <div className="flex items-center justify-between w-full">
                <Alert.Message className="text-red-500 flex items-left space-x-2">
                  <ControlsClose className="text-red-500 cursor-pointer mt-1 me-2" />
                  <span className="float-left">{ErrorText}</span>
                </Alert.Message>
              </div>
            </Alert>
            :
            null
        }
        <h2 className="text-2xl mb-6 text-titleText mt-16">
          ورود به حساب کاربری
        </h2>

        {/* فرم */}
        <form className="flex flex-col gap-4 mt-14" onSubmit={Login}>
          <div>
            <label className="block mb-1 text-sm font-medium text-titleText">نام کاربری</label>
            <input
              type="text"
              name="email"
              onChange={(e) => {
                Setusername(e.target.value)
                SetUsernameError(false)
                SetHasError(false)
              }}
              value={username}
              placeholder="نام کاربری"
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-[48px] ${UsernameError
                ? "border border-red-500 focus:ring-red-500"
                : "border border-gray-300 focus:ring-blue-500"
                }`}
            />
          </div>

          <div className="mt-6">
            <label className="block mb-1 text-sm font-medium text-titleText">گذرواژه </label>
            <input
              type="password"
              name="password"
              onChange={(e) => { Setpassword(e.target.value) }}
              value={password}
              placeholder="گذرواژه "
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-[48px] ${UsernameError
                ? "border border-red-500 focus:ring-red-500"
                : "border border-gray-300 focus:ring-blue-500"
                }`}
            />
          </div>

          <div className="text-right">
            <Link href="/recovery" className="text-sm hover:underline text-primary">
              رمز عبور خود را فراموش کرده‌اید؟
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-white hover:bg-primary-600 rounded-lg mt-16 h-[48px]"
            disabled={loading} // اگر لودینگ هست، دکمه غیرفعال بشه
          >
            {loading ? <LoaderCircle size={8} color="border-white-500" /> : 'ورود'}
          </Button>
          <button type="submit" className="hidden" tabIndex={-1} aria-hidden />

        </form>
      </div>
    </div>
  );
}
