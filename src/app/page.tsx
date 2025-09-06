'use client';

import { Button } from "@heathmont/moon-core-tw";
import { useState } from "react";
import { Alert } from "@heathmont/moon-core-tw";
import { ControlsClose } from '@heathmont/moon-icons-tw';
import { Loader } from "@heathmont/moon-core-tw";
import Link from "next/link"

export default function Home() {

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

  const [UsernameError, SetUsernameError] = useState(false)
  const [hasError, SetHasError] = useState(false)
  const [ErrorText, SetErrorText] = useState('سلام')
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 max-w-[490px] w-full ">
        {/* عنوان */}
        <div className="flex justify-between ">
          <DottedPatternLeft />
          <img src="/images/pantaLogo.png" className="w-14 h-16" />
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
        <form className="flex flex-col gap-4 mt-14">
          <div>
            <label className="block mb-1 text-sm font-medium text-titleText">نام کاربری</label>
            <input
              type="text"
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
              placeholder="گذرواژه "
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-[48px] "
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
            {loading ? <Loader color="border-redError" size="xs" /> : 'ورود'}
          </Button>

        </form>
      </div>
      <Loader color="border-redError" size="xs" />
    </div>
  );
}
