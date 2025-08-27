'use client';

import { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar/Navbar";
import Header from "../../../components/Header/Header";
import Head from "next/head";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isNavbarOpen, setIsNavbarOpen] = useState(true);
    const [isMobileOpen, SetisMobileOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState<boolean | null>(null); // null indicates waiting for check

    useEffect(() => {
        const storedMode = localStorage.getItem("dark-mode");
        if (storedMode === "true") {
            setIsDarkMode(true);
            document.documentElement.classList.add("dark");
        } else if (storedMode === "false") {
            setIsDarkMode(false);
            document.documentElement.classList.remove("dark");
        } else {
            setIsDarkMode(false);
        }
    }, []);

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("dark-mode", "true");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("dark-mode", "false");
        }
    };

    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 1024px)");
        setIsNavbarOpen(mediaQuery.matches);
        const handleResize = (e: MediaQueryListEvent) => {
            setIsNavbarOpen(e.matches);
        };
        mediaQuery.addEventListener("change", handleResize);
        return () => mediaQuery.removeEventListener("change", handleResize);
    }, []);

    if (isDarkMode === null) {
        return null;
    }

    return (
        <div className={`flex h-screen ${isDarkMode ? "dark" : ""}`}>
            <Head>
                <style>{`
                    html {
                        transition: background-color 0.3s ease;
                    }
                `}</style>
            </Head>

            <div className={`flex-1 flex flex-col transition-all duration-300 ${isNavbarOpen ? "mr-64" : "mr-0"} ${isNavbarOpen ? "p-8" : "p-0"} pt-0`}>
                <Header isOpen={isNavbarOpen} setIsOpen={setIsNavbarOpen} isMobileOpen={isMobileOpen} setIsMobileOpen={SetisMobileOpen} toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
                <main className="flex-1 overflow-auto p-6">
                    {children}
                </main>
            </div>
            <Navbar isOpen={isNavbarOpen} setIsOpen={setIsNavbarOpen} isMobileOpen={isMobileOpen} setIsMobileOpen={SetisMobileOpen} />
        </div>
    );
}
