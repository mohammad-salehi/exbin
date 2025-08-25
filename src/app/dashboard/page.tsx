"use client";

import { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar/Navbar";
import Header from "../../../components/Header/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

    const [isNavbarOpen, setIsNavbarOpen] = useState(true);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 1024px)"); // lg breakpoint

        // مقدار اولیه بر اساس سایز صفحه
        setIsNavbarOpen(mediaQuery.matches);

        // واکنش به تغییر سایز صفحه
        const handleResize = (e: MediaQueryListEvent) => {
            setIsNavbarOpen(e.matches);
        };

        mediaQuery.addEventListener("change", handleResize);
        return () => mediaQuery.removeEventListener("change", handleResize);
    }, []);

    return (
        <div className="flex h-screen">
            {/* محتوای اصلی در سمت چپ (زیر ناوبار راست) */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isNavbarOpen ? "mr-64" : "mr-0"} p-8 pt-0`}>
                <Header />
                <main className="flex-1 overflow-auto p-6">
                    {children}
                </main>
            </div>

            {/* ناوبار ثابت در سمت راست */}
            <Navbar isOpen={isNavbarOpen} setIsOpen={setIsNavbarOpen} />
        </div>
    );
}

