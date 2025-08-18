'use client';

import { Button } from "@heathmont/moon-core-tw";

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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 max-w-[490px] w-full ">
        {/* عنوان */}
        <div className="flex justify-between ">
          <DottedPatternLeft />
          <img src="/images/pantaLogo.png" className="w-14 h-16" />
          <DottedPatternRight />
        </div>
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
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-[48px]"
            />
          </div>

          <div className="mt-6">
            <label className="block mb-1 text-sm font-medium text-titleText">گذرواژه </label>
            <input
              type="password"
              placeholder="گذرواژه "
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-[48px]"
            />
          </div>

          <div className="text-right">
            <a href="#" className="text-sm text-blue-600 hover:underline text-primary">
              رمز عبور خود را فراموش کرده‌اید؟
            </a>
          </div>

          <Button className="w-full bg-primary text-white hover:bg-primary-600 rounded-lg mt-16 h-[48px]">
            ورود
          </Button>
        </form>
      </div>
    </div>
  );
}
