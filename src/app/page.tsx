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

  const DottedPatternLeft = ({ className = "" }: { className?: string }) => (
    <svg
      viewBox="0 0 150 60"
      className={`w-full h-auto ${className}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
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

  // const DottedPatternLeft = () => (
  //   <svg width="150" height="60" xmlns="http://www.w3.org/2000/svg">
  //     <circle cx="5" cy="20" r="2" fill="#ccc" />
  //     <circle cx="20" cy="20" r="2" fill="#ccc" />
  //     <circle cx="35" cy="20" r="2" fill="#ccc" />
  //     <circle cx="50" cy="20" r="2" fill="#ccc" />
  //     <circle cx="65" cy="20" r="2" fill="#ccc" />
  //     <circle cx="80" cy="20" r="2" fill="#ccc" />
  //     <circle cx="95" cy="20" r="2" fill="#ccc" />
  //     <circle cx="110" cy="20" r="2" fill="#ccc" />
  //     <circle cx="125" cy="20" r="2" fill="#ccc" />

  //     <circle cx="20" cy="35" r="2" fill="#ccc" />
  //     <circle cx="35" cy="35" r="2" fill="#ccc" />
  //     <circle cx="50" cy="35" r="2" fill="#ccc" />
  //     <circle cx="65" cy="35" r="2" fill="#ccc" />
  //     <circle cx="80" cy="35" r="2" fill="#ccc" />
  //     <circle cx="95" cy="35" r="2" fill="#ccc" />
  //     <circle cx="110" cy="35" r="2" fill="#ccc" />
  //     <circle cx="125" cy="35" r="2" fill="#ccc" />
  //     <circle cx="140" cy="35" r="2" fill="#ccc" />

  //     <circle cx="5" cy="50" r="2" fill="#ccc" />
  //     <circle cx="20" cy="50" r="2" fill="#ccc" />
  //     <circle cx="35" cy="50" r="2" fill="#ccc" />
  //     <circle cx="50" cy="50" r="2" fill="#ccc" />
  //     <circle cx="65" cy="50" r="2" fill="#ccc" />
  //     <circle cx="80" cy="50" r="2" fill="#ccc" />
  //     <circle cx="95" cy="50" r="2" fill="#ccc" />
  //     <circle cx="110" cy="50" r="2" fill="#ccc" />
  //     <circle cx="125" cy="50" r="2" fill="#ccc" />

  //   </svg>
  // );

  const DottedPatternRight = ({ className = "" }: { className?: string }) => (
    <svg
      viewBox="0 0 150 60"
      className={`w-full h-auto ${className}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
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

  // const DottedPatternRight = () => (
  //   <svg width="150" height="60" xmlns="http://www.w3.org/2000/svg">
  //     <circle cx="20" cy="20" r="2" fill="#ccc" />
  //     <circle cx="35" cy="20" r="2" fill="#ccc" />
  //     <circle cx="50" cy="20" r="2" fill="#ccc" />
  //     <circle cx="65" cy="20" r="2" fill="#ccc" />
  //     <circle cx="80" cy="20" r="2" fill="#ccc" />
  //     <circle cx="95" cy="20" r="2" fill="#ccc" />
  //     <circle cx="110" cy="20" r="2" fill="#ccc" />
  //     <circle cx="125" cy="20" r="2" fill="#ccc" />
  //     <circle cx="140" cy="20" r="2" fill="#ccc" />

  //     <circle cx="5" cy="35" r="2" fill="#ccc" />
  //     <circle cx="20" cy="35" r="2" fill="#ccc" />
  //     <circle cx="35" cy="35" r="2" fill="#ccc" />
  //     <circle cx="50" cy="35" r="2" fill="#ccc" />
  //     <circle cx="65" cy="35" r="2" fill="#ccc" />
  //     <circle cx="80" cy="35" r="2" fill="#ccc" />
  //     <circle cx="95" cy="35" r="2" fill="#ccc" />
  //     <circle cx="110" cy="35" r="2" fill="#ccc" />
  //     <circle cx="125" cy="35" r="2" fill="#ccc" />
  //     <circle cx="125" cy="35" r="2" fill="#ccc" />

  //     <circle cx="20" cy="50" r="2" fill="#ccc" />
  //     <circle cx="35" cy="50" r="2" fill="#ccc" />
  //     <circle cx="50" cy="50" r="2" fill="#ccc" />
  //     <circle cx="65" cy="50" r="2" fill="#ccc" />
  //     <circle cx="80" cy="50" r="2" fill="#ccc" />
  //     <circle cx="95" cy="50" r="2" fill="#ccc" />
  //     <circle cx="110" cy="50" r="2" fill="#ccc" />
  //     <circle cx="125" cy="50" r="2" fill="#ccc" />
  //     <circle cx="140" cy="50" r="2" fill="#ccc" />

  //   </svg>
  // );

  const [UsernameError, SetUsernameError] = useState<boolean>(false)
  const [hasError, SetHasError] = useState<boolean>(false)
  const [ErrorText, SetErrorText] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false);

  const [username, Setusername] = useState<string>('')
  const [password, Setpassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false);

  async function Login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const ADDRESS = process.env.NEXT_PUBLIC_API_URL + `/api/auth/signin`
    const credentials: LoginRequest = {
      username,
      password
    }

    if (true) {
      setLoading(true)
      try {
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
        document.cookie = `refreshToken=${user.refreshToken}; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`

        router.push("/panel/dashboard")
      } catch (error) {
        setLoading(false)
      }

    } else {
      SetUsernameError(true)
      SetHasError(true)
      SetErrorText('شماره موبایل وارد شده اشتباه است')
    }
  }


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="sm:bg-white sm:dark:bg-gray-800 sm:shadow-lg sm:rounded-2xl sm:p-8 sm:max-w-[490px] sm:w-full ">
        {/* عنوان */}
        <div className="flex justify-between ">
          <DottedPatternLeft />
          <img src="/images/pantaLogo.png" className="w-14 mx-2" alt="image" />
          <DottedPatternRight />
        </div>
        {
          hasError ?
            <Alert
              className="bg-white text-red-500 border border-red-500 rounded-lg p-4 flex justify-between mt-12"
            >
              <div className="flex items-center justify-between w-full">
                <Alert.Message className="text-red-500 flex items-left space-x-2">
                  <ControlsClose className="text-red-500 mt-1 me-2" />
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
        <form className="flex flex-col gap-4 mt-4" onSubmit={Login}>
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

          <div className="">
            <label className="block mb-1 text-sm font-medium text-titleText">گذرواژه</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                onChange={(e) => { Setpassword(e.target.value) }}
                value={password}
                placeholder="گذرواژه"
                className={`w-full border rounded-lg px-3 py-2 pr-2 focus:outline-none focus:ring-2 h-[48px] ${UsernameError
                  ? "border border-red-500 focus:ring-red-500"
                  : "border border-gray-300 focus:ring-blue-500"
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
              >
                {showPassword ?
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M3.61399 4.21063C3.17804 3.87156 2.54976 3.9501 2.21069 4.38604C1.87162 4.82199 1.95016 5.45027 2.38611 5.78934L4.66386 7.56093C3.78436 8.54531 3.03065 9.68043 2.41854 10.896L2.39686 10.9389C2.30554 11.1189 2.18764 11.3514 2.1349 11.6381C2.09295 11.8661 2.09295 12.1339 2.1349 12.3618C2.18764 12.6485 2.30554 12.881 2.39686 13.0611L2.41854 13.104C4.35823 16.956 7.71985 20 12.0001 20C14.2313 20 16.2129 19.1728 17.8736 17.8352L20.3861 19.7893C20.8221 20.1284 21.4503 20.0499 21.7894 19.6139C22.1285 19.178 22.0499 18.5497 21.614 18.2106L3.61399 4.21063ZM16.2411 16.5654L14.4434 15.1672C13.7676 15.6894 12.9201 16 12.0001 16C9.79092 16 8.00006 14.2091 8.00006 12C8.00006 11.4353 8.11706 10.898 8.32814 10.4109L6.24467 8.79044C5.46659 9.63971 4.77931 10.6547 4.20485 11.7955C4.17614 11.8525 4.15487 11.8948 4.13694 11.9316C4.12114 11.964 4.11132 11.9853 4.10491 12C4.11132 12.0147 4.12114 12.036 4.13694 12.0684C4.15487 12.1052 4.17614 12.1474 4.20485 12.2045C5.9597 15.6894 8.76726 18 12.0001 18C13.5314 18 14.9673 17.4815 16.2411 16.5654ZM10.0187 11.7258C10.0064 11.8154 10.0001 11.907 10.0001 12C10.0001 13.1046 10.8955 14 12.0001 14C12.2667 14 12.5212 13.9478 12.7538 13.8531L10.0187 11.7258Z" fill="#0F1729" />
                    <path d="M10.9506 8.13908L15.9995 12.0661C15.9999 12.0441 16.0001 12.022 16.0001 12C16.0001 9.79085 14.2092 7.99999 12.0001 7.99999C11.6369 7.99999 11.285 8.04838 10.9506 8.13908Z" fill="#0F1729" />
                    <path d="M19.7953 12.2045C19.4494 12.8913 19.0626 13.5326 18.6397 14.1195L20.2175 15.3467C20.7288 14.6456 21.1849 13.8917 21.5816 13.104L21.6033 13.0611C21.6946 12.881 21.8125 12.6485 21.8652 12.3618C21.9072 12.1339 21.9072 11.8661 21.8652 11.6381C21.8125 11.3514 21.6946 11.1189 21.6033 10.9389L21.5816 10.896C19.6419 7.04402 16.2803 3.99998 12.0001 3.99998C10.2848 3.99998 8.71714 4.48881 7.32934 5.32257L9.05854 6.66751C9.98229 6.23476 10.9696 5.99998 12.0001 5.99998C15.2329 5.99998 18.0404 8.31058 19.7953 11.7955C19.824 11.8525 19.8453 11.8948 19.8632 11.9316C19.879 11.964 19.8888 11.9853 19.8952 12C19.8888 12.0147 19.879 12.036 19.8632 12.0684C19.8453 12.1052 19.824 12.1474 19.7953 12.2045Z" fill="#0F1729" />
                  </svg>
                  :
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 6C8.76722 6 5.95965 8.31059 4.2048 11.7955C4.17609 11.8526 4.15483 11.8948 4.1369 11.9316C4.12109 11.964 4.11128 11.9853 4.10486 12C4.11128 12.0147 4.12109 12.036 4.1369 12.0684C4.15483 12.1052 4.17609 12.1474 4.2048 12.2045C5.95965 15.6894 8.76722 18 12 18C15.2328 18 18.0404 15.6894 19.7952 12.2045C19.8239 12.1474 19.8452 12.1052 19.8631 12.0684C19.8789 12.036 19.8888 12.0147 19.8952 12C19.8888 11.9853 19.8789 11.964 19.8631 11.9316C19.8452 11.8948 19.8239 11.8526 19.7952 11.7955C18.0404 8.31059 15.2328 6 12 6ZM2.41849 10.896C4.35818 7.04403 7.7198 4 12 4C16.2802 4 19.6419 7.04403 21.5815 10.896C21.5886 10.91 21.5958 10.9242 21.6032 10.9389C21.6945 11.119 21.8124 11.3515 21.8652 11.6381C21.9071 11.8661 21.9071 12.1339 21.8652 12.3619C21.8124 12.6485 21.6945 12.8811 21.6032 13.0611C21.5958 13.0758 21.5886 13.09 21.5815 13.104C19.6419 16.956 16.2802 20 12 20C7.7198 20 4.35818 16.956 2.41849 13.104C2.41148 13.09 2.40424 13.0758 2.39682 13.0611C2.3055 12.881 2.18759 12.6485 2.13485 12.3619C2.09291 12.1339 2.09291 11.8661 2.13485 11.6381C2.18759 11.3515 2.3055 11.119 2.39682 10.9389C2.40424 10.9242 2.41148 10.91 2.41849 10.896ZM12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10ZM8.00002 12C8.00002 9.79086 9.79088 8 12 8C14.2092 8 16 9.79086 16 12C16 14.2091 14.2092 16 12 16C9.79088 16 8.00002 14.2091 8.00002 12Z" fill="#0F1729" />
                  </svg>
                }
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-white hover:bg-primary-600 rounded-lg mt-8 h-[48px]"
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
