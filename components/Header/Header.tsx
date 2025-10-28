"use client";

type NavbarProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  toggleDarkMode: () => void; // اصلاح تایپ
  isDarkMode: boolean;
};
import { Dropdown, MenuItem, Modal } from "@heathmont/moon-core-tw";
import { useEffect, useState } from "react";
import { PostRequest } from "../../functions/PostRequest";

export default function Header({
  isOpen,
  setIsOpen,
  isMobileOpen,
  setIsMobileOpen,
  toggleDarkMode,
  isDarkMode,
}: NavbarProps) {
  const closeSidebar = () => {
    setIsMobileOpen(false);
  };

  const [name, setName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [role, setRole] = useState<string>("");
  // تابع امن برای خواندن کوکی
  const getCookie = (name: string): string => {
    if (typeof document === "undefined") return "";
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(";").shift();
      return decodeURIComponent(cookieValue || "");
    }
    return "";
  };

  useEffect(() => {
    const firstName = getCookie("firstName");
    const lastName = getCookie("lastName");
    setName(`${firstName} ${lastName}`.trim());
    setUsername(getCookie("username"));
    setRole(getCookie("role"));
  }, []);

  const openChangePassword = () => {
    resetForm();
    setOpen(true);
  };

  // stateهای فرم
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [open, setOpen] = useState(false);
  // وضعیت ارسال
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formVersion, setFormVersion] = useState(0);

  const resetForm = () => {
    setOldPassword("");
    setNewPassword("");
    setShowOld(false);
    setShowNew(false);
    setLoading(false);
    setError(null);
    setSuccess(null);
    // با هر ریست، نسخه فرم رو عوض کن تا submitهای قبلی بی‌اثر بشن
    setFormVersion(v => v + 1);
  };


  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/change-password`;

  const validate = () => {
    if (!oldPassword) return setError("رمز فعلی را وارد کنید"), false;
    if (!newPassword) return setError("رمز جدید را وارد کنید"), false;
    if (newPassword.length < 8)
      return setError("رمز جدید باید حداقل ۸ کاراکتر باشد"), false;
    setError(null);
    return true;
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) return;

    const v = formVersion;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await PostRequest(
        API_URL,
        { oldPassword, newPassword },
        {
          // اختیاری ولی پیشنهادی:
          baseURL: process.env.NEXT_PUBLIC_API_URL,
          redirectOn403: false,
          headers: { accept: "*/*" },
        }
      );

      if (v !== formVersion) return;

      setSuccess("رمز با موفقیت تغییر کرد.");
      setOldPassword("");
      setNewPassword("");
    } catch (err: any) {
      if (v !== formVersion) return;
      setError(err?.message || "خطا در تغییر رمز");
    } finally {
      if (v === formVersion) setLoading(false);
    }
  };




  useEffect(() => {
    if (!open) {
      resetForm();
    }
    console.log(error)
    console.log(success)
  }, [open]);

  return (
    <header
      className={`w-full h-18 bg-boxColor dark:bg-boxColor-dark flex items-stretch justify-between ${
        isOpen ? "rounded-bl-md rounded-br-md" : ""
      } shadow-sm px-6`}
    >
      {isMobileOpen && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 bg-gray-500 opacity-50 z-40"
          onClick={closeSidebar}
        ></div>
      )}
      <div className="flex items-center gap-5">
        {isOpen ? (
          <div className="flex items-center gap-1 text-titleText dark:text-titleText-dark">
            <Dropdown
              value={"option"}
              onChange={() => {}}
              className="outline-none shadow-none border-none"
            >
              <Dropdown.Trigger className="outline-none shadow-none border-none">
                <div className="flex items-center justify-between gap-2 px-3 py-2 outline-none shadow-none border-none">
                  <svg width="20px" height="20px" fill="none" className="m-0">
                    <path
                      d="M5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="mr-0">{name}</span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-gray-500  dark:text-gray-400"
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </Dropdown.Trigger>

              <Dropdown.Options
                className="
        absolute top-full right-0 mt-2 z-[10000]
        w-fit inline-block
        max-w-[90vw]      /* اختیاری: جلوگیری از خروج از صفحه */
        rounded-md border dark:border-boxColor-dark
        bg-white dark:bg-boxBorderColor2-dark shadow-lg
        origin-top-right  /* رشد از راست به چپ */
        p-4
      "
              >
                <span className="block text-md mb-1">{username}</span>
                <p className="text-md whitespace-nowrap mt-4" dir="rtl">
                  {role}
                </p>
                <div
                  className="mt-4 cursor-pointer"
                  onClick={() => {
                    setOpen(true);
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="inline-block ml-1"
                  >
                    <g id="Iconly/Curved/Password">
                      <g id="Password">
                        <path
                          id="Stroke 1"

                          d="M10.6887 11.9999C10.6887 13.0229 9.85974 13.8519 8.83674 13.8519C7.81374 13.8519 6.98474 13.0229 6.98474 11.9999C6.98474 10.9769 7.81374 10.1479 8.83674 10.1479H8.83974C9.86174 10.1489 10.6887 10.9779 10.6887 11.9999Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
          
                        />
                        <path
                          id="Stroke 3"
                          d="M10.6918 12H17.0098V13.852"
                          stroke="currentColor"
                          strokeWidth="1.5"
 
                        />
                        <path
                          id="Stroke 5"
                          d="M14.182 13.852V12"
                          stroke="currentColor"
                          strokeWidth="1.5"
    
                        />
                        <path
                          id="Stroke 7"
                          d="M2.74988 12C2.74988 5.063 5.06288 2.75 11.9999 2.75C18.9369 2.75 21.2499 5.063 21.2499 12C21.2499 18.937 18.9369 21.25 11.9999 21.25C5.06288 21.25 2.74988 18.937 2.74988 12Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
 
                        />
                      </g>
                    </g>
                  </svg>
                  <span>تغییر رمزعبور</span>
                </div>
              </Dropdown.Options>
            </Dropdown>
          </div>
        ) : (
          <div className="text-titleText dark:text-titleText-dark">
            <svg
              className="cursor-pointer"
              width="28px"
              height="28px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              onClick={() => {
                setIsMobileOpen(true);
              }}
            >
              <path
                d="M4 6H20M4 12H20M4 18H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="flex items-center p-4 pl-0">
        {/* <button className="flex items-center justify-center border border-gray-200 bg-gray-100 hover:bg-gray-200 transition ml-2 h-9 w-9 rounded-full dark:text-gray-200 dark:bg-bgColor-dark dark:hover:bg-gray-900 dark:border-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute ml-7 mb-7 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                        12
                    </span>
                </button>
                {
                    isOpen ?
                        <div className="h-8 bg-gray-200 ml-4 mr-2" style={{ width: '1px' }}></div>
                        :
                        null
                } */}
        {isOpen ? (
          <button
            className="flex items-center justify-center border border-gray-200 bg-gray-100 hover:bg-gray-200 transition ml-2 h-9 w-9 rounded-full dark:text-gray-200 dark:bg-bgColor-dark dark:hover:bg-gray-900 dark:border-gray-600"
            onClick={toggleDarkMode}
          >
            {isDarkMode ? (
              <svg
                width="20px"
                height="20px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21.0672 11.8568L20.4253 11.469L21.0672 11.8568ZM12.1432 2.93276L11.7553 2.29085V2.29085L12.1432 2.93276ZM7.37554 20.013C7.017 19.8056 6.5582 19.9281 6.3508 20.2866C6.14339 20.6452 6.26591 21.104 6.62446 21.3114L7.37554 20.013ZM2.68862 17.3755C2.89602 17.7341 3.35482 17.8566 3.71337 17.6492C4.07191 17.4418 4.19443 16.983 3.98703 16.6245L2.68862 17.3755ZM21.25 12C21.25 17.1086 17.1086 21.25 12 21.25V22.75C17.9371 22.75 22.75 17.9371 22.75 12H21.25ZM2.75 12C2.75 6.89137 6.89137 2.75 12 2.75V1.25C6.06294 1.25 1.25 6.06294 1.25 12H2.75ZM15.5 14.25C12.3244 14.25 9.75 11.6756 9.75 8.5H8.25C8.25 12.5041 11.4959 15.75 15.5 15.75V14.25ZM20.4253 11.469C19.4172 13.1373 17.5882 14.25 15.5 14.25V15.75C18.1349 15.75 20.4407 14.3439 21.7092 12.2447L20.4253 11.469ZM9.75 8.5C9.75 6.41182 10.8627 4.5828 12.531 3.57467L11.7553 2.29085C9.65609 3.5593 8.25 5.86509 8.25 8.5H9.75ZM12 2.75C11.9115 2.75 11.8077 2.71008 11.7324 2.63168C11.6686 2.56527 11.6538 2.50244 11.6503 2.47703C11.6461 2.44587 11.6482 2.35557 11.7553 2.29085L12.531 3.57467C13.0342 3.27065 13.196 2.71398 13.1368 2.27627C13.0754 1.82126 12.7166 1.25 12 1.25V2.75ZM21.7092 12.2447C21.6444 12.3518 21.5541 12.3539 21.523 12.3497C21.4976 12.3462 21.4347 12.3314 21.3683 12.2676C21.2899 12.1923 21.25 12.0885 21.25 12H22.75C22.75 11.2834 22.1787 10.9246 21.7237 10.8632C21.286 10.804 20.7293 10.9658 20.4253 11.469L21.7092 12.2447ZM12 21.25C10.3139 21.25 8.73533 20.7996 7.37554 20.013L6.62446 21.3114C8.2064 22.2265 10.0432 22.75 12 22.75V21.25ZM3.98703 16.6245C3.20043 15.2647 2.75 13.6861 2.75 12H1.25C1.25 13.9568 1.77351 15.7936 2.68862 17.3755L3.98703 16.6245Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M6.05 17.95l-1.414 1.414m0-13.828l1.414 1.414M17.95 17.95l1.414 1.414M12 8a4 4 0 100 8 4 4 0 000-8z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        ) : null}
      </div>
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setTimeout(() => resetForm(), 0);
        }}
      >
        <Modal.Backdrop className="fixed inset-0 w-screen h-screen bg-black/50 z-[2147483646]" />

        <div className="fixed inset-0 z-[2147483647] flex items-center justify-center">
          <Modal.Panel
            key={`${formVersion}-${open ? "open" : "closed"}`}
            className="bg-boxColor dark:bg-bgColor-dark shadow-xl rounded-xl text-titleText dark:text-titleText-dark w-full max-w-md p-6"
          >            <div className="w-full">
              <Modal.Title>
                <h3 className="text-lg font-medium  text-titleText dark:text-titleText-dark text-center">
                  تغییر رمز عبور
                </h3>
              </Modal.Title>

              <form onSubmit={submit} className="mt-4 space-y-4">
                {/* فیلد رمز فعلی */}
                <div>
                  <label className="block text-sm font-medium  text-titleText dark:text-titleText-dark">
                    رمز فعلی
                  </label>
                  <div className="relative mt-1">
                    <input
                      type={showOld ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="رمز فعلی"
                      className="w-full rounded-md border border-boxBorderColor dark:border-boxBorderColor-dark px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500       bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark "
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowOld((s) => !s)}
                      className="absolute inset-y-0 left-2 flex items-center px-2 text-xs text-titleText dark:text-titleText-dark"
                    >
                      {showOld ? "مخفی" : "نمایش"}
                    </button>
                  </div>
                </div>

                {/* فیلد رمز جدید */}
                <div>
                  <label className="block text-sm font-medium text-titleText dark:text-titleText-dark">
                    رمز جدید
                  </label>
                  <div className="relative mt-1">
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="رمز جدید"
                      className="w-full rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark bg-boxColor dark:bg-boxColor-dark"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((s) => !s)}
                      className="absolute inset-y-0 left-2 flex items-center px-2 text-xs text-titleText dark:text-titleText-dark"
                    >
                      {showNew ? "مخفی" : "نمایش"}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-titleText dark:text-titleText-dark">
                    رمز جدید حداقل ۸ کاراکتر باشد.
                  </p>
                </div>

                {!!error && (
                  <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {!!success && (
                  <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                    {success}
                  </div>
                )}

                <div className="mt-2 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    className={`rounded-md px-4 py-2 text-sm font-medium text-white ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    disabled={loading}
                  >
                    {loading ? "در حال ارسال…" : "تغییر رمز"}
                  </button>
                </div>
              </form>
            </div>
          </Modal.Panel>
        </div>
      </Modal>
    </header>
  );
}
function getCookie(arg0: string): import("react").SetStateAction<string> {
  throw new Error("Function not implemented.");
}
