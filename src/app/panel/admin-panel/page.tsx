"use client";

import React, { useEffect, useState } from "react";
import AnimatedText from "../../../../components/AnimatedLoading/AnimatedLoading";
import { PantaTabs, TabItem } from "../../../../components/Tabs/Tabs";
import AdminPanel from "../../../../components/AdminPanel/AdminPanel";
import AdminSchedulers from "../../../../components/AdminSchedulers/AdminSchedulers";
import AdminSimpleTriggers from "../../../../components/AdminSimpleTriggers/AdminSimpleTriggers";
import AdminSchedulerState from "../../../../components/AdminSchedulerStates/AdminSchedulerStates";
import ProjectExceptionsPage from "../../../../components/adminErrors/adminErrors";

const Page = () => {
  const [Loading, SetLoading] = useState<boolean>(false);

  // اختیاری: برای اینکه اگر یکی از بخش‌ها fail شد گیر نکنه
  useEffect(() => {
    const fallback = setTimeout(() => SetLoading(false), 15000);
    return () => clearTimeout(fallback);
  }, []);

  const tabs: TabItem[] = [
    {
      id: 'overview',
      label: 'کاربران',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.1992 12C12.9606 12 15.1992 9.76142 15.1992 7C15.1992 4.23858 12.9606 2 10.1992 2C7.43779 2 5.19922 4.23858 5.19922 7C5.19922 9.76142 7.43779 12 10.1992 12Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M1 22C1.57038 20.0332 2.74795 18.2971 4.36438 17.0399C5.98081 15.7827 7.95335 15.0687 10 15C14.12 15 17.63 17.91 19 22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M17.8205 4.44006C18.5822 4.83059 19.1986 5.45518 19.579 6.22205C19.9594 6.98891 20.0838 7.85753 19.9338 8.70032C19.7838 9.5431 19.3674 10.3155 18.7458 10.9041C18.1243 11.4926 17.3302 11.8662 16.4805 11.97" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M17.3203 14.5701C18.6543 14.91 19.8779 15.5883 20.8729 16.5396C21.868 17.4908 22.6007 18.6827 23.0003 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>,
      content: (
        <div>
          <AdminPanel />
        </div>
      ),
    },
    {
      id: 'jobs',
      label: 'لیست وظایف',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 6.00067L21 6.00139M8 12.0007L21 12.0015M8 18.0007L21 18.0015M3.5 6H3.51M3.5 12H3.51M3.5 18H3.51M4 6C4 6.27614 3.77614 6.5 3.5 6.5C3.22386 6.5 3 6.27614 3 6C3 5.72386 3.22386 5.5 3.5 5.5C3.77614 5.5 4 5.72386 4 6ZM4 12C4 12.2761 3.77614 12.5 3.5 12.5C3.22386 12.5 3 12.2761 3 12C3 11.7239 3.22386 11.5 3.5 11.5C3.77614 11.5 4 11.7239 4 12ZM4 18C4 18.2761 3.77614 18.5 3.5 18.5C3.22386 18.5 3 18.2761 3 18C3 17.7239 3.22386 17.5 3.5 17.5C3.77614 17.5 4 17.7239 4 18Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>,
      content: (
        <div>
          <AdminSchedulers />
        </div>
      ),
    },
    {
      id: 'simple_triggers',
      label: 'وضعیت وظایف',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M14.5868 6.58468C14.9487 6.22336 15.4482 5.99994 16 5.99994C17.1046 5.99994 18 6.89537 18 7.99994C18 8.55169 17.7766 9.05126 17.4153 9.41311C16.824 8.17759 15.8223 7.17594 14.5868 6.58468ZM10.2571 6.25701C10.5118 5.41662 10.9459 4.65423 11.5149 4.0144C7.32249 4.26517 4 7.74455 4 11.9999C4 16.4182 7.58172 19.9999 12 19.9999C16.2554 19.9999 19.7348 16.6774 19.9855 12.4851C19.3457 13.054 18.5833 13.4882 17.7429 13.7429C16.9962 16.2066 14.7075 17.9999 12 17.9999C8.68629 17.9999 6 15.3136 6 11.9999C6 9.2924 7.79338 7.00373 10.2571 6.25701Z" fill="currentColor" />
        <circle cx="16" cy="8" r="4" fill="currentColor" />
      </svg>,
      content: (
        <div>
          <AdminSimpleTriggers />
        </div>
      ),
    },
    {
      id: 'scheduler_states',
      label: 'زمانبندی وظایف',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 10H20V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5.77778 5H4V10H20V5H18.2222M11.1111 5H12.8889" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="8" y1="4" x2="8" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="16" y1="4" x2="16" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9.5 18V13L8 14.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="12.5" y="13" width="3" height="5" rx="1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>,
      content: (
        <div>
          <AdminSchedulerState />
        </div>
      ),
    },
    {
      id: 'setting',
      label: 'خطای سیستم',
      icon: <svg width="20" height="20" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M600.704 64a32 32 0 0 1 30.464 22.208l35.2 109.376c14.784 7.232 28.928 15.36 42.432 24.512l112.384-24.192a32 32 0 0 1 34.432 15.36L944.32 364.8a32 32 0 0 1-4.032 37.504l-77.12 85.12a357.12 357.12 0 0 1 0 49.024l77.12 85.248a32 32 0 0 1 4.032 37.504l-88.704 153.6a32 32 0 0 1-34.432 15.296L708.8 803.904c-13.44 9.088-27.648 17.28-42.368 24.512l-35.264 109.376A32 32 0 0 1 600.704 960H423.296a32 32 0 0 1-30.464-22.208L357.696 828.48a351.616 351.616 0 0 1-42.56-24.64l-112.32 24.256a32 32 0 0 1-34.432-15.36L79.68 659.2a32 32 0 0 1 4.032-37.504l77.12-85.248a357.12 357.12 0 0 1 0-48.896l-77.12-85.248A32 32 0 0 1 79.68 364.8l88.704-153.6a32 32 0 0 1 34.432-15.296l112.32 24.256c13.568-9.152 27.776-17.408 42.56-24.64l35.2-109.312A32 32 0 0 1 423.232 64H600.64zm-23.424 64H446.72l-36.352 113.088-24.512 11.968a294.113 294.113 0 0 0-34.816 20.096l-22.656 15.36-116.224-25.088-65.28 113.152 79.68 88.192-1.92 27.136a293.12 293.12 0 0 0 0 40.192l1.92 27.136-79.808 88.192 65.344 113.152 116.224-25.024 22.656 15.296a294.113 294.113 0 0 0 34.816 20.096l24.512 11.968L446.72 896h130.688l36.48-113.152 24.448-11.904a288.282 288.282 0 0 0 34.752-20.096l22.592-15.296 116.288 25.024 65.28-113.152-79.744-88.192 1.92-27.136a293.12 293.12 0 0 0 0-40.256l-1.92-27.136 79.808-88.128-65.344-113.152-116.288 24.96-22.592-15.232a287.616 287.616 0 0 0-34.752-20.096l-24.448-11.904L577.344 128zM512 320a192 192 0 1 1 0 384 192 192 0 0 1 0-384zm0 64a128 128 0 1 0 0 256 128 128 0 0 0 0-256z" /></svg>,
      content: (
        <div>
          <ProjectExceptionsPage/>
        </div>
      ),
    }
  ];


  return (
    <div className="relative px-4 xl:px-0 mb-4">
      {Loading && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-white/70 dark:bg-bgColor-dark/70 backdrop-blur-sm">
          <div className="pointer-events-none">
            <AnimatedText />
          </div>
        </div>
      )}

      <div className="p-0">
        <PantaTabs items={tabs} defaultId="overview" />
      </div>

    </div>
  );
};

export default Page;
