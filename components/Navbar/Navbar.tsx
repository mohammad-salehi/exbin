"use client";

import { useState } from "react";
import clsx from "clsx";

type NavbarProps = {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
  };
  
const Navbar = ({ isOpen, setIsOpen }: NavbarProps) => {

    

    const navItems = [
        {
            label: "داشبورد",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M18.3333 7.08335C18.3333 10.075 15.9083 12.5 12.9167 12.5C12.775 12.5 12.625 12.4917 12.4833 12.4834C12.275 9.8417 10.1583 7.72501 7.51666 7.51668C7.50832 7.37501 7.5 7.22502 7.5 7.08335C7.5 4.09169 9.925 1.66669 12.9167 1.66669C15.9083 1.66669 18.3333 4.09169 18.3333 7.08335Z" stroke="#606060" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12.5 12.9167C12.5 15.9083 10.075 18.3333 7.08329 18.3333C4.09163 18.3333 1.66663 15.9083 1.66663 12.9167C1.66663 9.925 4.09163 7.5 7.08329 7.5C7.22496 7.5 7.37495 7.50832 7.51662 7.51666C10.1583 7.72499 12.275 9.84168 12.4833 12.4833C12.4916 12.625 12.5 12.775 12.5 12.9167Z" stroke="#606060" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6.35 12.1833L7.08333 10.8333L7.81667 12.1833L9.16667 12.9166L7.81667 13.65L7.08333 15L6.35 13.65L5 12.9166L6.35 12.1833Z" stroke="#606060" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
        },
        {
            label: "لیست صرافی‌ها",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M18.3333 7.08335C18.3333 10.075 15.9083 12.5 12.9167 12.5C12.775 12.5 12.625 12.4917 12.4833 12.4834C12.275 9.8417 10.1583 7.72501 7.51666 7.51668C7.50832 7.37501 7.5 7.22502 7.5 7.08335C7.5 4.09169 9.925 1.66669 12.9167 1.66669C15.9083 1.66669 18.3333 4.09169 18.3333 7.08335Z" stroke="#606060" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12.5 12.9167C12.5 15.9083 10.075 18.3333 7.08329 18.3333C4.09163 18.3333 1.66663 15.9083 1.66663 12.9167C1.66663 9.925 4.09163 7.5 7.08329 7.5C7.22496 7.5 7.37495 7.50832 7.51662 7.51666C10.1583 7.72499 12.275 9.84168 12.4833 12.4833C12.4916 12.625 12.5 12.775 12.5 12.9167Z" stroke="#606060" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6.35 12.1833L7.08333 10.8333L7.81667 12.1833L9.16667 12.9166L7.81667 13.65L7.08333 15L6.35 13.65L5 12.9166L6.35 12.1833Z" stroke="#606060" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )
        },
        {
            label: "افزودن صرافی جدید",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M18.3333 7.08335C18.3333 10.075 15.9083 12.5 12.9167 12.5C12.775 12.5 12.625 12.4917 12.4833 12.4834C12.275 9.8417 10.1583 7.72501 7.51666 7.51668C7.50832 7.37501 7.5 7.22502 7.5 7.08335C7.5 4.09169 9.925 1.66669 12.9167 1.66669C15.9083 1.66669 18.3333 4.09169 18.3333 7.08335Z" stroke="#606060" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12.5 12.9167C12.5 15.9083 10.075 18.3333 7.08329 18.3333C4.09163 18.3333 1.66663 15.9083 1.66663 12.9167C1.66663 9.925 4.09163 7.5 7.08329 7.5C7.22496 7.5 7.37495 7.50832 7.51662 7.51666C10.1583 7.72499 12.275 9.84168 12.4833 12.4833C12.4916 12.625 12.5 12.775 12.5 12.9167Z" stroke="#606060" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6.35 12.1833L7.08333 10.8333L7.81667 12.1833L9.16667 12.9166L7.81667 13.65L7.08333 15L6.35 13.65L5 12.9166L6.35 12.1833Z" stroke="#606060" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )
        },
        {
            label: "پنل ادمین",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M18.3333 7.08335C18.3333 10.075 15.9083 12.5 12.9167 12.5C12.775 12.5 12.625 12.4917 12.4833 12.4834C12.275 9.8417 10.1583 7.72501 7.51666 7.51668C7.50832 7.37501 7.5 7.22502 7.5 7.08335C7.5 4.09169 9.925 1.66669 12.9167 1.66669C15.9083 1.66669 18.3333 4.09169 18.3333 7.08335Z" stroke="#606060" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12.5 12.9167C12.5 15.9083 10.075 18.3333 7.08329 18.3333C4.09163 18.3333 1.66663 15.9083 1.66663 12.9167C1.66663 9.925 4.09163 7.5 7.08329 7.5C7.22496 7.5 7.37495 7.50832 7.51662 7.51666C10.1583 7.72499 12.275 9.84168 12.4833 12.4833C12.4916 12.625 12.5 12.775 12.5 12.9167Z" stroke="#606060" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6.35 12.1833L7.08333 10.8333L7.81667 12.1833L9.16667 12.9166L7.81667 13.65L7.08333 15L6.35 13.65L5 12.9166L6.35 12.1833Z" stroke="#606060" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )
        },
        {
            label: "تیکت‌گذاری",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M18.3333 7.08335C18.3333 10.075 15.9083 12.5 12.9167 12.5C12.775 12.5 12.625 12.4917 12.4833 12.4834C12.275 9.8417 10.1583 7.72501 7.51666 7.51668C7.50832 7.37501 7.5 7.22502 7.5 7.08335C7.5 4.09169 9.925 1.66669 12.9167 1.66669C15.9083 1.66669 18.3333 4.09169 18.3333 7.08335Z" stroke="#606060" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12.5 12.9167C12.5 15.9083 10.075 18.3333 7.08329 18.3333C4.09163 18.3333 1.66663 15.9083 1.66663 12.9167C1.66663 9.925 4.09163 7.5 7.08329 7.5C7.22496 7.5 7.37495 7.50832 7.51662 7.51666C10.1583 7.72499 12.275 9.84168 12.4833 12.4833C12.4916 12.625 12.5 12.775 12.5 12.9167Z" stroke="#606060" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6.35 12.1833L7.08333 10.8333L7.81667 12.1833L9.16667 12.9166L7.81667 13.65L7.08333 15L6.35 13.65L5 12.9166L6.35 12.1833Z" stroke="#606060" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )
        },
    ];

    return (
        <div className="flex">
            {/* Sidebar */}
            <div
                className={clsx(
                    "fixed top-0 right-0 h-screen w-64 bg-[#f8f8f9] shadow-lg transition-transform duration-300 z-50 bg-boxColor ",
                    {
                        "translate-x-full lg:translate-x-0": !isOpen,
                        "translate-x-0": isOpen,
                    }
                )}
            >
                <div className="flex items-center p-4 border-b">
                    <img src='images/pantaLogo.png' className="w-10" />
                    <span className="text-lg font-bold mr-4 text-titleText">پنتا</span>
                </div>
                <nav className="p-2 space-y-4 mt-12">
                    {navItems.map((item) => (
                        <button
                            key={item.label}
                            className="flex items-center space-x-2 w-full px-4 py-2 rounded-md hover:bg-gray-200 transition"
                        >
                            <span className="text-xl ml-2">{item.icon}</span>
                            <span className="text-titleText">{item.label}</span>
                        </button>
                    ))}
                    <div className="mt-auto pt-12">
                        <button
                            key={'exit'}
                            className="flex items-center space-x-2 w-full px-4 py-2 rounded-md hover:bg-gray-200 transition"
                        >
                            <span className="text-xl ml-2">
                                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path className="text-titleText" d="M10 12H18M18 12L15.5 9.77778M18 12L15.5 14.2222M18 7.11111V5C18 4.44772 17.5523 4 17 4H7C6.44772 4 6 4.44772 6 5V19C6 19.5523 6.44772 20 7 20H17C17.5523 20 18 19.5523 18 19V16.8889" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                            <span className="text-titleText">خروج</span>
                        </button>
                    </div>

                </nav>
            </div>
        </div>
    );
}

export default Navbar