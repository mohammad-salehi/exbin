"use client";

import { Modal } from "@heathmont/moon-core-tw";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { PostRequest } from "../../functions/PostRequest";

type NavbarProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  toggleDarkMode: () => void;
  isDarkMode: boolean;
};

export default function Header({
  isOpen,
  setIsOpen,
  isMobileOpen,
  setIsMobileOpen,
  toggleDarkMode,
  isDarkMode,
}: NavbarProps) {
  const closeSidebar = () => setIsMobileOpen(false);

  const [name, setName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [role, setRole] = useState<string>("");

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

  // -------------------------
  // ✅ Custom Dropdown (NO scroll lock)
  // -------------------------
  const [profileOpen, setProfileOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [menuPos, setMenuPos] = useState<{ top: number; right: number; width: number }>({
    top: 0,
    right: 0,
    width: 240,
  });

  const updateMenuPosition = () => {
    const el = triggerRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    // منو را به صورت fixed و هم‌راستا با راستِ دکمه می‌گذاریم
    const top = r.bottom + 8;
    const right = Math.max(8, window.innerWidth - r.right);
    const width = Math.max(220, Math.min(320, r.width + 60));

    setMenuPos({ top, right, width });
  };

  useLayoutEffect(() => {
    if (!profileOpen) return;
    updateMenuPosition();
  }, [profileOpen, name, username, role]);

  useEffect(() => {
    if (!profileOpen) return;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t)) return;
      if (triggerRef.current?.contains(t)) return;
      setProfileOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProfileOpen(false);
    };

    const onResizeOrScroll = () => updateMenuPosition();

    document.addEventListener("mousedown", onPointerDown, true);
    document.addEventListener("touchstart", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResizeOrScroll);
    // اگر صفحه اسکرول شد هم منو جاش آپدیت بشه (scroll lock هم نداریم)
    window.addEventListener("scroll", onResizeOrScroll, true);

    return () => {
      document.removeEventListener("mousedown", onPointerDown, true);
      document.removeEventListener("touchstart", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResizeOrScroll);
      window.removeEventListener("scroll", onResizeOrScroll, true);
    };
  }, [profileOpen]);

  // -------------------------
  // Change Password Modal States
  // -------------------------
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [open, setOpen] = useState(false);

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
    setFormVersion((v) => v + 1);
  };

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/change-password`;

  const validate = () => {
    if (!oldPassword) return setError("رمز فعلی را وارد کنید"), false;
    if (!newPassword) return setError("رمز جدید را وارد کنید"), false;
    if (newPassword.length < 8) return setError("رمز جدید باید حداقل ۸ کاراکتر باشد"), false;
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
          baseURL: process.env.NEXT_PUBLIC_API_URL,
          redirectOn403: false,
          headers: { accept: "*/*" },
        }
      );

      if (v !== formVersion) return;

      toast.success("رمزعبور با موفقیت تغییر کرد");
      setOldPassword("");
      setNewPassword("");
      setOpen(false);
    } catch (err: any) {
      if (v !== formVersion) return;
      setError(err?.message || "خطا در تغییر رمز");
    } finally {
      if (v === formVersion) setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) resetForm();
  }, [open]);

  return (
    <header
      className={`w-full h-18 bg-boxColor dark:bg-boxColor-dark flex items-stretch justify-between shadow-sm px-6 lux-panel rounded-t-none`}
    >
      {isMobileOpen && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 bg-gray-500 opacity-50 z-40"
          onClick={closeSidebar}
        />
      )}
  
      <div className="flex items-center gap-5">
        {isOpen ? (
          <div className="relative flex items-center gap-1 text-titleText dark:text-titleText-dark font-bold">
            سامانه نظارت بر کارگزاری‌های مبادله رمزارز ایران
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
              onClick={() => setIsMobileOpen(true)}
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
  
      {/* Dark mode button */}
      <div className="flex items-center p-4 pl-0">
        {isOpen ? (
          <button
            className="flex items-center justify-center border border-gray-200 bg-gray-100 hover:bg-gray-200 transition ml-2 h-9 w-9 dark:text-gray-200 dark:bg-bgColor-dark dark:hover:bg-gray-900 dark:border-gray-600 lux-btn"
            onClick={toggleDarkMode}
          >
            {isDarkMode ? (
              <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M21.0672 11.8568L20.4253 11.469L21.0672 11.8568ZM12.1432 2.93276L11.7553 2.29085V2.29085L12.1432 2.93276ZM7.37554 20.013C7.017 19.8056 6.5582 19.9281 6.3508 20.2866C6.14339 20.6452 6.26591 21.104 6.62446 21.3114L7.37554 20.013ZM2.68862 17.3755C2.89602 17.7341 3.35482 17.8566 3.71337 17.6492C4.07191 17.4418 4.19443 16.983 3.98703 16.6245L2.68862 17.3755ZM21.25 12C21.25 17.1086 17.1086 21.25 12 21.25V22.75C17.9371 22.75 22.75 17.9371 22.75 12H21.25ZM2.75 12C2.75 6.89137 6.89137 2.75 12 2.75V1.25C6.06294 1.25 1.25 6.06294 1.25 12H2.75ZM15.5 14.25C12.3244 14.25 9.75 11.6756 9.75 8.5H8.25C8.25 12.5041 11.4959 15.75 15.5 15.75V14.25ZM20.4253 11.469C19.4172 13.1373 17.5882 14.25 15.5 14.25V15.75C18.1349 15.75 20.4407 14.3439 21.7092 12.2447L20.4253 11.469ZM9.75 8.5C9.75 6.41182 10.8627 4.5828 12.531 3.57467L11.7553 2.29085C9.65609 3.5593 8.25 5.86509 8.25 8.5H9.75ZM12 2.75C11.9115 2.75 11.8077 2.71008 11.7324 2.63168C11.6686 2.56527 11.6538 2.50244 11.6503 2.47703C11.6461 2.44587 11.6482 2.35557 11.7553 2.29085L12.531 3.57467C13.0342 3.27065 13.196 2.71398 13.1368 2.27627C13.0754 1.82126 12.7166 1.25 12 1.25V2.75ZM21.7092 12.2447C21.6444 12.3518 21.5541 12.3539 21.523 12.3497C21.4976 12.3462 21.4347 12.3314 21.3683 12.2676C21.2899 12.1923 21.25 12.0885 21.25 12H22.75C22.75 11.2834 22.1787 10.9246 21.7237 10.8632C21.286 10.804 20.7293 10.9658 20.4253 11.469L21.7092 12.2447ZM12 21.25C10.3139 21.25 8.73533 20.7996 7.37554 20.013L6.62446 21.3114C8.2064 22.2265 10.0432 22.75 12 22.75V21.25ZM3.98703 16.6245C3.20043 15.2647 2.75 13.6861 2.75 12H1.25C1.25 13.9568 1.77351 15.7936 2.68862 17.3755L3.98703 16.6245Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
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
  
      {/* ✅ Modal stays as you had */}
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
            className="bg-boxColor dark:bg-bgColor-dark shadow-xl text-titleText dark:text-titleText-dark w-full max-w-md p-6 lux-panel"
          >
            <div className="w-full">
              <Modal.Title>
                <h3 className="text-lg font-medium text-titleText dark:text-titleText-dark text-center">
                  تغییر رمز عبور
                </h3>
              </Modal.Title>
  
              <form onSubmit={submit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-titleText dark:text-titleText-dark">رمز فعلی</label>
                  <div className="relative mt-1">
                    <input
                      type={showOld ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="رمز فعلی"
                      className="w-full border border-boxBorderColor dark:border-boxBorderColor-dark px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowOld((s) => !s)}
                      className="absolute inset-y-0 left-2 flex items-center px-2 text-xs text-titleText dark:text-titleText-dark lux-btn"
                    >
                      {showOld ? "مخفی" : "نمایش"}
                    </button>
                  </div>
                </div>
  
                <div>
                  <label className="block text-sm font-medium text-titleText dark:text-titleText-dark">رمز جدید</label>
                  <div className="relative mt-1">
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="رمز جدید"
                      className="w-full px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((s) => !s)}
                      className="absolute inset-y-0 left-2 flex items-center px-2 text-xs text-titleText dark:text-titleText-dark lux-btn"
                    >
                      {showNew ? "مخفی" : "نمایش"}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-titleText dark:text-titleText-dark">رمز جدید حداقل ۸ کاراکتر باشد.</p>
                </div>
  
                {!!error && (
                  <div className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
                )}
  
                {!!success && (
                  <div className="border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                    {success}
                  </div>
                )}
  
                <div className="mt-2 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    className={`px-4 py-2 text-sm font-medium text-white ${
                      loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                    } lux-btn`}
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
