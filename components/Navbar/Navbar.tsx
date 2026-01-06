'use client';

const navItems = [
  {
    link: 'dashboard',
    label: 'داشبورد',
    access: '',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <mask id="path-1-inside-1_92_1581" fill="white">
          <path d="M14.825 18.9583H5.17496C2.89163 18.9583 1.04163 17.1 1.04163 14.8167V8.64166C1.04163 7.50833 1.74163 6.08333 2.64163 5.38333L7.13329 1.88333C8.48329 0.833332 10.6416 0.783332 12.0416 1.76667L17.1916 5.375C18.1833 6.06666 18.9583 7.55 18.9583 8.75833V14.825C18.9583 17.1 17.1083 18.9583 14.825 18.9583ZM7.89996 2.86667L3.40829 6.36666C2.81663 6.83333 2.29163 7.89166 2.29163 8.64166V14.8167C2.29163 16.4083 3.58329 17.7083 5.17496 17.7083H14.825C16.4166 17.7083 17.7083 16.4167 17.7083 14.825V8.75833C17.7083 7.95833 17.1333 6.85 16.475 6.4L11.325 2.79167C10.375 2.125 8.80829 2.15833 7.89996 2.86667Z" />
        </mask>
        <path
          d="M14.825 18.9583H5.17496C2.89163 18.9583 1.04163 17.1 1.04163 14.8167V8.64166C1.04163 7.50833 1.74163 6.08333 2.64163 5.38333L7.13329 1.88333C8.48329 0.833332 10.6416 0.783332 12.0416 1.76667L17.1916 5.375C18.1833 6.06666 18.9583 7.55 18.9583 8.75833V14.825C18.9583 17.1 17.1083 18.9583 14.825 18.9583ZM7.89996 2.86667L3.40829 6.36666C2.81663 6.83333 2.29163 7.89166 2.29163 8.64166V14.8167C2.29163 16.4083 3.58329 17.7083 5.17496 17.7083H14.825C16.4166 17.7083 17.7083 16.4167 17.7083 14.825V8.75833C17.7083 7.95833 17.1333 6.85 16.475 6.4L11.325 2.79167C10.375 2.125 8.80829 2.15833 7.89996 2.86667Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    link: 'exchanges-list',
    label: 'لیست سکوها',
    access: '',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M8 6.00067L21 6.00139M8 12.0007L21 12.0015M8 18.0007L21 18.0015M3.5 6H3.51M3.5 12H3.51M3.5 18H3.51M4 6C4 6.27614 3.77614 6.5 3.5 6.5C3.22386 6.5 3 6.27614 3 6C3 5.72386 3.22386 5.5 3.5 5.5C3.77614 5.5 4 5.72386 4 6ZM4 12C4 12.2761 3.77614 12.5 3.5 12.5C3.22386 12.5 3 12.2761 3 12C3 11.7239 3.22386 11.5 3.5 11.5C3.77614 11.5 4 11.7239 4 12ZM4 18C4 18.2761 3.77614 18.5 3.5 18.5C3.22386 18.5 3 18.2761 3 18C3 17.7239 3.22386 17.5 3.5 17.5C3.77614 17.5 4 17.7239 4 18Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    link: 'add-new-exchange',
    label: 'افزودن سکو جدید',
    access: '',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M15 12L12 12M12 12L9 12M12 12L12 9M12 12L12 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path
          d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    link: 'rial-transfers',
    label: 'واریز و برداشت ریالی',
    access: '',
    icon: (
      <svg fill="currentColor" height="20" width="20" viewBox="0 0 220 220">
        <g>
          <path d="M110,0C49.346,0,0,49.346,0,110s49.346,110,110,110s110-49.346,110-110S170.654,0,110,0z M110,210 c-55.14,0-100-44.86-100-100S54.86,10,110,10s100,44.86,100,100S165.14,210,110,210z" />
          <path d="M110,19.5c-49.902,0-90.5,40.598-90.5,90.5s40.598,90.5,90.5,90.5s90.5-40.598,90.5-90.5S159.902,19.5,110,19.5z M110,197.5c-48.248,0-87.5-39.252-87.5-87.5S61.752,22.5,110,22.5s87.5,39.252,87.5,87.5S158.248,197.5,110,197.5z" />
          <path d="M81.879,70.989h15.76v58.062c0,7.245-5.895,13.14-13.14,13.14s-13.139-5.895-13.139-13.14s5.894-13.139,13.139-13.139v-12 c-13.862,0-25.139,11.277-25.139,25.139s11.277,25.14,25.139,25.14s25.14-11.278,25.14-25.14V58.989h-27.76V70.989z" />
          <path d="M154.64,119.576c0-1.848-0.253-3.669-0.742-5.418c-0.815-2.915-2.285-5.629-4.329-7.929l-3.685-4.146l-8.291,7.369 l3.684,4.145c0.366,0.412,0.691,0.854,0.973,1.319c0.422,0.698,0.747,1.449,0.966,2.233c0.219,0.784,0.332,1.6,0.332,2.428 c0,2.173-0.773,4.169-2.06,5.727c-1.654,2.003-4.155,3.282-6.949,3.282s-5.295-1.279-6.949-3.282 c-1.286-1.558-2.06-3.554-2.06-5.727V59.443h-11.092v60.133c0,11.084,9.017,20.101,20.101,20.101S154.64,130.66,154.64,119.576z" />
        </g>
      </svg>
    ),
  },
  {
    link: 'crypto-transfers',
    label: 'واریز و برداشت رمزارزی',
    access: '',
    icon: (
      <svg fill="currentColor" height="20" width="20" viewBox="0 0 256 238">
        <path d="M122.7,109.9l0.1-30.1c8.5,0,35.2-2.6,35.2,15.2C157.9,112,131.2,109.9,122.7,109.9z M164.8,141.8L164.8,141.8 c0.1-19.5-32-16.7-42.2-16.7l-0.1,33.2C132.7,158.3,164.8,160.5,164.8,141.8z M10.6,119.9C10.6,54.9,62.8,2,127.8,2 c65,0,117.5,52.5,117.5,117.5c0,65-52.9,117.5-117.5,117.5S10.6,184.6,10.6,119.9z M98.1,113.5c-0.5,0-1,0-1.6,0L96.3,153 c-0.3,1.9-1.4,5-5.7,5c0.2,0.2-11,0-11,0l-3.1,18l19.6,0.1c3.7,0,7.2,0.1,10.8,0.1l-0.1,25l15.1,0.1l0.1-24.8 c4.1,0.1,8.1,0.1,12,0.2l-0.1,24.7l15.1,0.1l0.1-25c25.3-1.4,43.1-7.7,45.4-31.5c1.8-19.2-7.1-27.7-21.5-31.2 c8.8-4.4,14.2-12.2,13-25.3h0c-1.7-17.9-17-23.9-36.5-25.7l0.1-24.8l-15.1-0.1L134.5,62c-4,0-8,0.1-12,0.1l0.1-24.3l-15.1-0.1 l-0.1,24.8c-3.3,0.1-6.5,0.1-9.6,0.1l0-0.1l-20.8-0.1L77,78.5c0,0,11.1-0.2,10.9,0c6.1,0,8.1,3.6,8.6,6.6l-0.1,28.2 C96.9,113.4,97.5,113.4,98.1,113.5z" />
      </svg>
    ),
  },
  {
    link: 'crypto-transactions',
    label: 'معاملات رمزارزی',
    access: '',
    icon: (
      <svg fill="currentColor" width="20" height="20" viewBox="0 0 24 24">
        <path d="M17.0020048,13 C17.5542895,13 18.0020048,13.4477153 18.0020048,14 C18.0020048,14.5128358 17.6159646,14.9355072 17.1186259,14.9932723 L17.0020048,15 L5.41700475,15 L8.70911154,18.2928932 C9.0695955,18.6533772 9.09732503,19.2206082 8.79230014,19.6128994 L8.70911154,19.7071068 C8.34862757,20.0675907 7.78139652,20.0953203 7.38910531,19.7902954 L7.29489797,19.7071068 L2.29489797,14.7071068 C1.69232289,14.1045317 2.07433707,13.0928192 2.88837381,13.0059833 L3.00200475,13 L17.0020048,13 Z M16.6128994,4.20970461 L16.7071068,4.29289322 L21.7071068,9.29289322 C22.3096819,9.8954683 21.9276677,10.9071808 21.1136309,10.9940167 L21,11 L7,11 C6.44771525,11 6,10.5522847 6,10 C6,9.48716416 6.38604019,9.06449284 6.88337887,9.00672773 L7,9 L18.585,9 L15.2928932,5.70710678 C14.9324093,5.34662282 14.9046797,4.77939176 15.2097046,4.38710056 L15.2928932,4.29289322 C15.6533772,3.93240926 16.2206082,3.90467972 16.6128994,4.20970461 Z" />
      </svg>
    ),
  },
  {
    link: 'exchange-users',
    label: 'دارایی کاربران',
    access: '',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 19H1V18C1 16.1362 2.27477 14.5701 4 14.126M6 10.8293C4.83481 10.4175 4 9.30621 4 7.99999C4 6.69378 4.83481 5.58254 6 5.1707M21 19H23V18C23 16.1362 21.7252 14.5701 20 14.126M18 5.1707C19.1652 5.58254 20 6.69378 20 7.99999C20 9.30621 19.1652 10.4175 18 10.8293M10 14H14C16.2091 14 18 15.7909 18 18V19H6V18C6 15.7909 7.79086 14 10 14ZM15 8C15 9.65685 13.6569 11 12 11C10.3431 11 9 9.65685 9 8C9 6.34315 10.3431 5 12 5C13.6569 5 15 6.34315 15 8Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    link: 'admin-panel',
    label: 'مدیریت سامانه',
    access: 'ADMIN',
    icon: (
      <svg fill="currentColor" width="20" height="20" viewBox="0 0 36 36" preserveAspectRatio="xMidYMid meet">
        <path d="M14.68,14.81a6.76,6.76,0,1,1,6.76-6.75A6.77,6.77,0,0,1,14.68,14.81Zm0-11.51a4.76,4.76,0,1,0,4.76,4.76A4.76,4.76,0,0,0,14.68,3.3Z"></path>
        <path d="M16.42,31.68A2.14,2.14,0,0,1,15.8,30H4V24.22a14.81,14.81,0,0,1,11.09-4.68l.72,0a2.2,2.2,0,0,1,.62-1.85l.12-.11c-.47,0-1-.06-1.46-.06A16.47,16.47,0,0,0,2.2,23.26a1,1,0,0,0-.2.6V30a2,2,0,0,0,2,2H16.7Z"></path>
        <path d="M33.68,23.32l-2-.61a7.21,7.21,0,0,0-.58-1.41l1-1.86A.38.38,0,0,0,32,19l-1.45-1.45a.36.36,0,0,0-.44-.07l-1.84,1a7.15,7.15,0,0,0-1.43-.61l-.61-2a.36.36,0,0,0-.36-.24H23.82a.36.36,0,0,0-.35.26l-.61,2a7,7,0,0,0-1.44.6l-1.82-1a.35.35,0,0,0-.43.07L17.69,19a.38.38,0,0,0-.06.44l1,1.82A6.77,6.77,0,0,0,18,22.69l-2,.6a.36.36,0,0,0-.26.35v2.05A.35.35,0,0,0,16,26l2,.61a7,7,0,0,0,.6,1.41l-1,1.91a.36.36,0,0,0,.06.43l1.45,1.45a.38.38,0,0,0,.44.07l1.87-1a7.09,7.09,0,0,0,1.4.57l.6,2a.38.38,0,0,0,.35.26h2.05a.37.37,0,0,0,.35-.26l.61-2.05a6.92,6.92,0,0,0,1.38-.57l1.89,1a.36.36,0,0,0,.43-.07L32,30.4A.35.35,0,0,0,32,30l-1-1.88a7,7,0,0,0,.58-1.39l2-.61a.36.36,0,0,0,.26-.35V23.67A.36.36,0,0,0,33.68,23.32ZM24.85,28a3.34,3.34,0,1,1,3.33-3.33A3.34,3.34,0,0,1,24.85,28Z"></path>
        <rect x="0" y="0" width="36" height="36" fillOpacity="0" />
      </svg>
    ),
  },
];


import { Modal } from '@heathmont/moon-core-tw';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PostRequest } from '../../functions/PostRequest';
import AnimatedHeadingText from '../AnimatedHeadingText/AnimatedHeadingText';

type NavbarProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  toggleDarkMode: () => void;
  isDarkMode: boolean;
};

const Navbar = ({
  isOpen,
  setIsOpen,
  isMobileOpen,
  setIsMobileOpen,
  toggleDarkMode,
  isDarkMode,
}: NavbarProps) => {
  const pathname = usePathname();

  // ---------- cookie helper ----------
  const getCookie = (name: string): string => {
    if (typeof document === 'undefined') return '';
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      return decodeURIComponent(cookieValue || '');
    }
    return '';
  };

  // ---------- user info ----------
  const [role, setRole] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const r = getCookie('role');
    const firstName = getCookie('firstName');
    const lastName = getCookie('lastName');
    setRole(r);
    setUsername(getCookie('username'));
    setFullName(`${firstName} ${lastName}`.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- active route ----------
  const activeLink = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean);
    return parts[1] || ''; // /panel/<here>
  }, [pathname]);

  // ---------- close mobile on route change ----------
  useEffect(() => {
    if (isMobileOpen) setIsMobileOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // ---------- prevent body scroll ONLY when mobile sidebar is open ----------
  useEffect(() => {
    if (!isMobileOpen) return;

    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [isMobileOpen]);

  // ---------- change password modal ----------
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [retryPassword, setretryPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showRetry, setshowRetry] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formVersion, setFormVersion] = useState(0);

  const resetForm = () => {
    setOldPassword('');
    setNewPassword('');
    setretryPassword('');
    setShowOld(false);
    setShowNew(false);
    setLoading(false);
    setError(null);
    setSuccess(null);
    setFormVersion((v) => v + 1);
  };

  const openChangePassword = () => {
    resetForm();
    setOpen(true);
  };

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/change-password`;

  const validate = () => {
    if (!oldPassword) return setError('رمز فعلی را وارد کنید'), false;
    if (!newPassword) return setError('رمز جدید را وارد کنید'), false;
    if (newPassword !== retryPassword) return setError('تکرار رمزعبور جدید را به درستی وارد کنید'), false;
    if (newPassword.length < 8) return setError('رمز جدید باید حداقل ۸ کاراکتر باشد'), false;
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

      await PostRequest(API_URL, { oldPassword, newPassword }, { redirectOn403: false, headers: { accept: '*/*' } });

      if (v !== formVersion) return;
      setSuccess('رمز با موفقیت تغییر کرد.');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      if (v !== formVersion) return;
      setError(err?.message || 'خطا در تغییر رمز');
    } finally {
      if (v === formVersion) setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ---------- close mobile on outside click ----------
  const asideRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!isMobileOpen) return;

    const onDown = (e: MouseEvent | TouchEvent) => {
      const el = asideRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setIsMobileOpen(false);
    };

    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown, { passive: true });

    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [isMobileOpen, setIsMobileOpen]);

  return (
    <div className="flex">
      {/* ===== Mobile top bar ===== */}
      <div className="fixed top-0 left-0 right-0 z-40 lg:hidden">
        <div className="bg-boxColor/90 dark:bg-boxColor-dark/80 backdrop-blur border-b border-boxBorderColor dark:border-boxBorderColor-dark">
          <div className="h-14 px-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="h-10 w-10 rounded-xl border border-boxBorderColor dark:border-boxBorderColor-dark bg-white/70 dark:bg-bgColor-dark/60 hover:bg-gray-100 dark:hover:bg-gray-900 transition flex items-center justify-center text-titleText dark:text-titleText-dark"
              aria-label="open menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            <button
              type="button"
              onClick={toggleDarkMode}
              className="h-10 w-10 rounded-xl border border-boxBorderColor dark:border-boxBorderColor-dark bg-white/70 dark:bg-bgColor-dark/60 hover:bg-gray-100 dark:hover:bg-gray-900 transition flex items-center justify-center text-titleText dark:text-titleText-dark"
              aria-label="toggle theme"
            >
              {isDarkMode ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21.0672 11.8568L20.4253 11.469L21.0672 11.8568ZM12.1432 2.93276L11.7553 2.29085V2.29085L12.1432 2.93276ZM7.37554 20.013C7.017 19.8056 6.5582 19.9281 6.3508 20.2866C6.14339 20.6452 6.26591 21.104 6.62446 21.3114L7.37554 20.013ZM2.68862 17.3755C2.89602 17.7341 3.35482 17.8566 3.71337 17.6492C4.07191 17.4418 4.19443 16.983 3.98703 16.6245L2.68862 17.3755ZM21.25 12C21.25 17.1086 17.1086 21.25 12 21.25V22.75C17.9371 22.75 22.75 17.9371 22.75 12H21.25ZM2.75 12C2.75 6.89137 6.89137 2.75 12 2.75V1.25C6.06294 1.25 1.25 6.06294 1.25 12H2.75ZM15.5 14.25C12.3244 14.25 9.75 11.6756 9.75 8.5H8.25C8.25 12.5041 11.4959 15.75 15.5 15.75V14.25ZM20.4253 11.469C19.4172 13.1373 17.5882 14.25 15.5 14.25V15.75C18.1349 15.75 20.4407 14.3439 21.7092 12.2447L20.4253 11.469ZM9.75 8.5C9.75 6.41182 10.8627 4.5828 12.531 3.57467L11.7553 2.29085C9.65609 3.5593 8.25 5.86509 8.25 8.5H9.75ZM21.7092 12.2447C21.6444 12.3518 21.5541 12.3539 21.523 12.3497C21.4976 12.3462 21.4347 12.3314 21.3683 12.2676C21.2899 12.1923 21.25 12.0885 21.25 12H22.75C22.75 11.2834 22.1787 10.9246 21.7237 10.8632C21.286 10.804 20.7293 10.9658 20.4253 11.469L21.7092 12.2447ZM12 21.25C10.3139 21.25 8.73533 20.7996 7.37554 20.013L6.62446 21.3114C8.2064 22.2265 10.0432 22.75 12 22.75V21.25ZM3.98703 16.6245C3.20043 15.2647 2.75 13.6861 2.75 12H1.25C1.25 13.9568 1.77351 15.7936 2.68862 17.3755L3.98703 16.6245Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
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
          </div>
        </div>
      </div>

      {/* ===== Mobile overlay ===== */}
      {isMobileOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" />}

      {/* ===== Sidebar ===== */}
      <aside
        ref={asideRef}
        className={clsx(
          'fixed top-0 right-0 h-screen w-[82vw] max-w-[320px] lg:w-64 shadow-[0_10px_40px_rgba(0,0,0,0.18)] transition-transform duration-300 z-50 bg-boxColor dark:bg-boxColor-dark dark:text-titleText-dark',
          {
            'translate-x-full lg:translate-x-0': !isOpen && !isMobileOpen,
            'translate-x-0': isOpen || isMobileOpen,
          }
        )}
      >
        {/* Sticky header inside sidebar */}
        <div className="sticky top-0 z-10 bg-boxColor/95 dark:bg-boxColor-dark/90 backdrop-blur border-b border-boxBorderColor dark:border-boxBorderColor-dark">
          <div className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="../../../images/pantaLogo.png" className="w-11 h-11 rounded-xl" alt="image" />
                <div className="leading-5">
                  <AnimatedHeadingText />
                </div>
              </div>

              <button
                type="button"
                className="lg:hidden h-10 w-10 rounded-xl border border-boxBorderColor dark:border-boxBorderColor-dark bg-white/70 dark:bg-bgColor-dark/60 hover:bg-gray-100 dark:hover:bg-gray-900 transition flex items-center justify-center text-titleText dark:text-titleText-dark"
                onClick={() => setIsMobileOpen(false)}
                aria-label="close menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="mt-3 rounded-2xl border border-boxBorderColor dark:border-boxBorderColor-dark bg-white/70 dark:bg-bgColor-dark/50 p-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-boxColor-dark border border-boxBorderColor dark:border-boxBorderColor-dark flex items-center justify-center text-titleText dark:text-titleText-dark">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div className="min-w-0 flex-1" dir="rtl">
                  <div className="text-sm font-semibold text-titleText dark:text-titleText-dark truncate">{fullName || 'کاربر'}</div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{role || '—'}</div>
                </div>

                <button
                  type="button"
                  onClick={openChangePassword}
                  className="shrink-0 h-10 w-10 rounded-xl border border-boxBorderColor dark:border-boxBorderColor-dark bg-white/70 dark:bg-bgColor-dark/60 hover:bg-gray-100 dark:hover:bg-gray-900 transition flex items-center justify-center text-titleText dark:text-titleText-dark"
                  aria-label="change password"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M10.6887 11.9999C10.6887 13.0229 9.85974 13.8519 8.83674 13.8519C7.81374 13.8519 6.98474 13.0229 6.98474 11.9999C6.98474 10.9769 7.81374 10.1479 8.83674 10.1479H8.83974C9.86174 10.1489 10.6887 10.9779 10.6887 11.9999Z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M10.6918 12H17.0098V13.852" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M14.182 13.852V12" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M2.74988 12C2.74988 5.063 5.06288 2.75 11.9999 2.75C18.9369 2.75 21.2499 5.063 21.2499 12C21.2499 18.937 18.9369 21.25 11.9999 21.25C5.06288 21.25 2.74988 18.937 2.74988 12Z" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav
          className="px-3 pt-4 space-y-2 overflow-y-auto h-[calc(100vh-220px)]"
          style={{ paddingBottom: 'calc(160px + env(safe-area-inset-bottom))' }}
        >          {navItems.map((item) => {
          if (item.access !== '' && item.access !== role) return null;
          const active = item.link === activeLink;

          return (
            <a href={`/panel/${item.link}`} key={item.label} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <button
                type="button"
                className={clsx(
                  'w-full flex items-center justify-between gap-1 px-1 py-1 rounded-xl transition border', // ✅ items-center
                  active
                    ? 'bg-BgPrimary dark:bg-BgPrimary-dark border-transparent'
                    : 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 border-transparent'
                )}
              >
                {/* ✅ سمت چپ: آیکن + متن -> شروع از بالا */}
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={clsx(
                      'h-10 w-10 rounded-xl flex items-center justify-center border shrink-0', // ✅ shrink-0
                      active
                        ? 'bg-white/70 dark:bg-bgColor-dark/60 border-boxBorderColor dark:border-boxBorderColor-dark text-primary dark:text-primary-dark'
                        : 'bg-white/50 dark:bg-bgColor-dark/40 border-boxBorderColor dark:border-boxBorderColor-dark text-titleText dark:text-titleText-dark'
                    )}
                  >
                    {item.icon}
                  </span>

                  {/* ✅ متن چندخطی: چپ/راست نشه و وسط‌چین نشه */}
                  <span
                    className={clsx(
                      'text-sm font-medium text-right leading-5 min-w-0 break-words', // ✅ leading + break
                      active ? 'text-primary dark:text-titleText-dark' : 'text-titleText dark:text-titleText-dark'
                    )}
                    dir="rtl"
                  >
                    {item.label}
                  </span>
                </div>

                {/* ✅ فلش همیشه بالا بمونه */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  className={clsx('transition mt-3 self-start shrink-0', active ? 'opacity-100' : 'opacity-40')} // ✅ self-start
                >
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </a>
          );
        })}
        </nav>

        {/* Sticky bottom actions */}
        <div
          className="fixed bottom-0 right-0 left-0 lg:left-auto lg:right-auto lg:bottom-0 lg:w-64
             p-3 bg-boxColor/95 dark:bg-boxColor-dark/90 backdrop-blur
             border-t border-boxBorderColor dark:border-boxBorderColor-dark"
          style={{
            paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
          }}
        >          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                window.location.assign('/');
              }}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/40 transition py-3"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M10 12H18M18 12L15.5 9.77778M18 12L15.5 14.2222M18 7.11111V5C18 4.44772 17.5523 4 17 4H7C6.44772 4 6 4.44772 6 5V19C6 19.5523 6.44772 20 7 20H17C17.5523 20 18 19.5523 18 19V16.8889"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span className="text-sm font-semibold">خروج</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden h-12 w-12 rounded-2xl border border-boxBorderColor dark:border-boxBorderColor-dark bg-white/70 dark:bg-bgColor-dark/60 hover:bg-gray-100 dark:hover:bg-gray-900 transition flex items-center justify-center"
              aria-label="close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ===== Change password modal ===== */}
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setTimeout(() => resetForm(), 0);
        }}
      >
        <Modal.Backdrop className="fixed inset-0 w-screen h-screen bg-black/50 z-[2147483646]" />

        <div className="fixed inset-0 z-[2147483647] flex items-center justify-center p-4">
          <Modal.Panel
            key={`${formVersion}-${open ? 'open' : 'closed'}`}
            className="bg-boxColor dark:bg-bgColor-dark shadow-xl rounded-2xl text-titleText dark:text-titleText-dark w-full max-w-md p-6 border border-boxBorderColor dark:border-boxBorderColor-dark"
          >
            <div className="w-full">
              <Modal.Title>
                <h3 className="text-lg font-semibold text-titleText dark:text-titleText-dark text-center">تغییر رمز عبور</h3>
              </Modal.Title>

              <form onSubmit={submit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-titleText dark:text-titleText-dark">رمزعبور فعلی</label>
                  <div className="relative mt-1">
                    <input
                      type={showOld ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="رمزعبور فعلی"
                      className="w-full rounded-xl border border-boxBorderColor dark:border-boxBorderColor-dark px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/40 bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowOld((s) => !s)}
                      className="absolute inset-y-0 left-2 flex items-center px-2 text-xs text-gray-600 dark:text-gray-300"
                    >
                      {showOld ? 'مخفی' : 'نمایش'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-titleText dark:text-titleText-dark">رمزعبور جدید</label>
                  <div className="relative mt-1">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="رمزعبور جدید"
                      className="w-full rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/40 border border-boxBorderColor dark:border-boxBorderColor-dark bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((s) => !s)}
                      className="absolute inset-y-0 left-2 flex items-center px-2 text-xs text-gray-600 dark:text-gray-300"
                    >
                      {showNew ? 'مخفی' : 'نمایش'}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">رمز جدید حداقل ۸ کاراکتر باشد.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-titleText dark:text-titleText-dark">تکرار رمزعبور جدید</label>
                  <div className="relative mt-1">
                    <input
                      type={showRetry ? 'text' : 'password'}
                      value={retryPassword}
                      onChange={(e) => setretryPassword(e.target.value)}
                      placeholder="تکرار رمزعبور جدید"
                      className="w-full rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/40 border border-boxBorderColor dark:border-boxBorderColor-dark bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setshowRetry((s) => !s)}
                      className="absolute inset-y-0 left-2 flex items-center px-2 text-xs text-gray-600 dark:text-gray-300"
                    >
                      {showRetry ? 'مخفی' : 'نمایش'}
                    </button>
                  </div>
                </div>

                {!!error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
                {!!success && (
                  <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{success}</div>
                )}

                <div className="mt-2 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    className={clsx(
                      'rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition',
                      loading ? 'bg-primary/60' : 'bg-primary hover:opacity-90'
                    )}
                    disabled={loading}
                  >
                    {loading ? 'در حال ارسال…' : 'تغییر رمز'}
                  </button>
                </div>
              </form>
            </div>
          </Modal.Panel>
        </div>
      </Modal>
    </div>
  );
};

export default Navbar;
