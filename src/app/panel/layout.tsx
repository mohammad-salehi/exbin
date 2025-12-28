'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../../components/Navbar/Navbar';
import Header from '../../../components/Header/Header';
import Head from 'next/head';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);
  const [isMobileOpen, SetisMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean | null>(null);

  useEffect(() => {
    const storedMode = localStorage.getItem('dark-mode');
    if (storedMode === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else if (storedMode === 'false') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dark-mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dark-mode', 'false');
    }
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    setIsNavbarOpen(mediaQuery.matches);

    const handleResize = (e: MediaQueryListEvent) => setIsNavbarOpen(e.matches);

    mediaQuery.addEventListener('change', handleResize);
    return () => mediaQuery.removeEventListener('change', handleResize);
  }, []);

  if (isDarkMode === null) return null;

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <Head>
        <style>{`
          html { transition: background-color 0.3s ease; }
        `}</style>
      </Head>

      {/* Content wrapper */}
      <div
        className={`
          flex-1 flex flex-col transition-all duration-300
          lg:${isNavbarOpen ? 'mr-64' : 'mr-0'}
          ${isNavbarOpen ? 'lg:px-8 lg:pb-0' : 'lg:p-0'}
          p-0
        `}
      >
        {/* ✅ Header فقط دسکتاپ (تا توی موبایل دو تا هدر نشه) */}
        <div className="hidden lg:block">
          <Header
            isOpen={isNavbarOpen}
            setIsOpen={setIsNavbarOpen}
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={SetisMobileOpen}
            toggleDarkMode={toggleDarkMode}
            isDarkMode={!!isDarkMode}
          />
        </div>

        {/* ✅ چون TopBar موبایل داخل Navbar fixed هست، باید محتوا از زیرش بیاد پایین */}
        <main className="flex-1 overflow-auto mt-2 lg:mt-4 pt-16 lg:pt-0">
          {children}
        </main>

        <footer className="text-titleText dark:text-titleText-dark mx-auto w-full max-w-screen-xl text-sm py-2">
          <div className="text-center">
            <p>© طراحی‌ و توسعه توسط شرکت پردازش داده های زنجیره امین v2.1.0</p>
          </div>
        </footer>
      </div>

      {/* Sidebar + Mobile TopBar داخل Navbar */}
      <Navbar
        isOpen={isNavbarOpen}
        setIsOpen={setIsNavbarOpen}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={SetisMobileOpen}
        toggleDarkMode={toggleDarkMode}
        isDarkMode={!!isDarkMode}
      />
    </div>
  );
}
