'use client';

import { Button } from "@heathmont/moon-core-tw";
import { useState } from "react";
import { Alert } from "@heathmont/moon-core-tw";
import { ControlsClose } from '@heathmont/moon-icons-tw';
import { Loader } from "@heathmont/moon-core-tw";

export default function Home() {


  const [UsernameError, SetUsernameError] = useState(false)
  const [hasError, SetHasError] = useState(false)
  const [ErrorText, SetErrorText] = useState('سلام')
  const [loading, setLoading] = useState(false);

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
                  <span className="float-left">{ErrorText}</span>
                </Alert.Message>
              </div>
            </Alert>
            :
            null
        }
        <h2 className="text-2xl mb-6 text-titleText mt-8 items-center text-center">
          بازیابی رمزعبور
        </h2>

        {/* فرم */}
        <form className="flex flex-col gap-4 mt-14">
          <div>
            <label className="block mb-1 text-sm font-medium text-titleText">شماره تلفن</label>
            <input
              type="text"
              placeholder="شماره تلفن"
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-[48px] ${UsernameError
                ? "border border-red-500 focus:ring-red-500"
                : "border border-gray-300 focus:ring-blue-500"
                }`}
            />
          </div>

          <div className="text-right">
            <a href="/" className="text-sm text-blue-600 hover:underline text-primary">
              بازگشت به صفحه ورود
            </a>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-white hover:bg-primary-600 rounded-lg mt-4 h-[48px]"
            disabled={loading} // اگر لودینگ هست، دکمه غیرفعال بشه
          >
            {loading ? <Loader color="border-redError" size="xs" /> : 'بازیابی'}
          </Button>

        </form>
      </div>
      <Loader color="border-redError" size="xs" />
    </div>
  );
}
