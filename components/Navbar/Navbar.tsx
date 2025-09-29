'use client';

import clsx from "clsx";
import { usePathname } from 'next/navigation';
import { useEffect, useState } from "react";

type NavbarProps = {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    isMobileOpen: boolean;
    setIsMobileOpen: (open: boolean) => void;
};

const Navbar = ({ isOpen, setIsOpen, isMobileOpen, setIsMobileOpen }: NavbarProps) => {

    const [pathName, SetPathName] = useState('')

    const pathname = usePathname();

    useEffect(() => {
        const pathParts = pathname.split('/').filter(part => part !== '');
        const secondPart = pathParts[1];
        SetPathName(secondPart)
    }, [])

    const navItems = [
        {
            link: "dashboard",
            label: "داشبورد",
            icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <mask id="path-1-inside-1_92_1581" fill="white">
                        <path d="M14.825 18.9583H5.17496C2.89163 18.9583 1.04163 17.1 1.04163 14.8167V8.64166C1.04163 7.50833 1.74163 6.08333 2.64163 5.38333L7.13329 1.88333C8.48329 0.833332 10.6416 0.783332 12.0416 1.76667L17.1916 5.375C18.1833 6.06666 18.9583 7.55 18.9583 8.75833V14.825C18.9583 17.1 17.1083 18.9583 14.825 18.9583ZM7.89996 2.86667L3.40829 6.36666C2.81663 6.83333 2.29163 7.89166 2.29163 8.64166V14.8167C2.29163 16.4083 3.58329 17.7083 5.17496 17.7083H14.825C16.4166 17.7083 17.7083 16.4167 17.7083 14.825V8.75833C17.7083 7.95833 17.1333 6.85 16.475 6.4L11.325 2.79167C10.375 2.125 8.80829 2.15833 7.89996 2.86667Z" />
                    </mask>
                    <path d="M14.825 18.9583H5.17496C2.89163 18.9583 1.04163 17.1 1.04163 14.8167V8.64166C1.04163 7.50833 1.74163 6.08333 2.64163 5.38333L7.13329 1.88333C8.48329 0.833332 10.6416 0.783332 12.0416 1.76667L17.1916 5.375C18.1833 6.06666 18.9583 7.55 18.9583 8.75833V14.825C18.9583 17.1 17.1083 18.9583 14.825 18.9583ZM7.89996 2.86667L3.40829 6.36666C2.81663 6.83333 2.29163 7.89166 2.29163 8.64166V14.8167C2.29163 16.4083 3.58329 17.7083 5.17496 17.7083H14.825C16.4166 17.7083 17.7083 16.4167 17.7083 14.825V8.75833C17.7083 7.95833 17.1333 6.85 16.475 6.4L11.325 2.79167C10.375 2.125 8.80829 2.15833 7.89996 2.86667Z" fill="currentColor" />
                </svg>
            ),
        },
        {
            link: "exchanges-list",
            label: "لیست صرافی‌ها",
            icon: (
                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 6.00067L21 6.00139M8 12.0007L21 12.0015M8 18.0007L21 18.0015M3.5 6H3.51M3.5 12H3.51M3.5 18H3.51M4 6C4 6.27614 3.77614 6.5 3.5 6.5C3.22386 6.5 3 6.27614 3 6C3 5.72386 3.22386 5.5 3.5 5.5C3.77614 5.5 4 5.72386 4 6ZM4 12C4 12.2761 3.77614 12.5 3.5 12.5C3.22386 12.5 3 12.2761 3 12C3 11.7239 3.22386 11.5 3.5 11.5C3.77614 11.5 4 11.7239 4 12ZM4 18C4 18.2761 3.77614 18.5 3.5 18.5C3.22386 18.5 3 18.2761 3 18C3 17.7239 3.22386 17.5 3.5 17.5C3.77614 17.5 4 17.7239 4 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )
        },
        {
            link: "add-new-exchange",
            label: "افزودن صرافی جدید",
            icon: (
                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 12L12 12M12 12L9 12M12 12L12 9M12 12L12 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            )
        },
        {
            link: "admin-panel",
            label: "پنل ادمین",
            icon: (
                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 19H1V18C1 16.1362 2.27477 14.5701 4 14.126M6 10.8293C4.83481 10.4175 4 9.30621 4 7.99999C4 6.69378 4.83481 5.58254 6 5.1707M21 19H23V18C23 16.1362 21.7252 14.5701 20 14.126M18 5.1707C19.1652 5.58254 20 6.69378 20 7.99999C20 9.30621 19.1652 10.4175 18 10.8293M10 14H14C16.2091 14 18 15.7909 18 18V19H6V18C6 15.7909 7.79086 14 10 14ZM15 8C15 9.65685 13.6569 11 12 11C10.3431 11 9 9.65685 9 8C9 6.34315 10.3431 5 12 5C13.6569 5 15 6.34315 15 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )
        },
        {
            link: "ticket",
            label: "تیکت‌گذاری",
            icon: (
                <svg fill="currentColor" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                    width="20px" height="20px" viewBox="796 796 200 200" enableBackground="new 796 796 200 200" xmlSpace="preserve">
                    <g>
                        <path d="M995.998,871.884c0-3.136-1.222-6.084-3.439-8.301l-14.355-14.355c-1.479-1.479-3.445-2.294-5.538-2.294
		c-1.906,0-3.747,0.694-5.181,1.958c-3.145,2.771-7.195,4.298-11.403,4.298c-4.614,0-8.953-1.796-12.216-5.059
		c-6.43-6.43-6.764-16.805-0.762-23.617c2.729-3.094,2.582-7.804-0.335-10.721l-14.355-14.355c-2.219-2.216-5.166-3.438-8.301-3.438
		c-3.136,0-6.083,1.221-8.302,3.438L799.434,911.813c-4.575,4.577-4.575,12.023,0,16.602l14.356,14.356
		c1.479,1.479,3.446,2.296,5.539,2.296c1.908,0,3.748-0.695,5.182-1.959c3.146-2.772,7.195-4.299,11.404-4.299
		c4.614,0,8.951,1.797,12.214,5.061c6.431,6.431,6.765,16.804,0.761,23.616c-2.73,3.096-2.581,7.807,0.336,10.719l14.354,14.355
		c2.218,2.219,5.166,3.439,8.302,3.439s6.084-1.221,8.301-3.439l82.754-82.753c0.001-0.001,0.001-0.001,0.001-0.001s0,0,0.002-0.002
		l29.618-29.618C994.776,877.969,995.998,875.021,995.998,871.884z M958.53,896.588l-1.469-1.469c-2.435-2.435-6.379-2.434-8.813,0
		c-2.433,2.434-2.433,6.379,0.001,8.814l1.469,1.467l-77.835,77.836l-10.997-10.997c7.497-11.569,6.08-27.161-3.943-37.183
		c-5.616-5.618-13.084-8.711-21.027-8.711c-5.772,0-11.375,1.672-16.157,4.769l-11-11l77.837-77.836l1.47,1.469
		c1.217,1.217,2.811,1.825,4.406,1.825s3.19-0.609,4.407-1.826c2.434-2.434,2.434-6.379-0.001-8.813l-1.468-1.469l24.703-24.703
		l10.997,10.997c-7.495,11.572-6.079,27.163,3.943,37.184c5.616,5.617,13.084,8.709,21.028,8.709c5.771,0,11.373-1.671,16.155-4.767
		l10.998,10.998L958.53,896.588z"/>
                        <path d="M909.645,847.701c-2.432-2.434-6.381-2.434-8.813,0c-2.434,2.434-2.434,6.379,0,8.813l10.942,10.943
		c1.216,1.216,2.812,1.825,4.406,1.825s3.19-0.608,4.406-1.825c2.434-2.434,2.434-6.379,0-8.813L909.645,847.701z"/>
                        <path d="M933.353,871.41c-2.431-2.433-6.38-2.433-8.812,0c-2.435,2.434-2.435,6.379,0,8.813l10.941,10.942
		c1.217,1.217,2.813,1.826,4.406,1.826c1.595,0,3.19-0.608,4.406-1.825c2.435-2.434,2.435-6.379,0-8.813L933.353,871.41z"/>
                    </g>
                </svg>
            )
        },
    ];

    return (
        <div className="flex">
            {/* Sidebar */}
            <div
                className={clsx(
                    "fixed top-0 right-0 h-screen w-64 shadow-sm transition-transform duration-300 z-50 bg-boxColor dark:bg-boxColor-dark dark:text-titleText-dark",
                    {
                        "translate-x-full lg:translate-x-0": (!isOpen && !isMobileOpen),
                        "translate-x-0": (isOpen || isMobileOpen),
                    }
                )}
            >
                <div className="flex items-center p-4 border-b dark:border-[#666]">
                    <img src='../../images/pantaLogo.png' className="w-12" alt="image" />
                    <span className="text-sm font-bold mr-4 text-titleText dark:text-titleText-dark">سامانه نظارت بر صرافی‌ها</span>
                </div>
                <nav className="p-2 space-y-4 mt-12">
                    {navItems.map((item) => (
                        <a href={`/panel/${item.link}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }} key={item.label}>
                            <button

                                className={`flex items-center space-x-2 w-full px-4 py-2 rounded-md ${item.link === pathName ? "bg-BgPrimary text-primary dark:bg-BgPrimary-dark dark:text-primary-dark" : "hover:bg-gray-200 dark:hover:bg-gray-600"}  transition`}
                            >
                                <span className={`text-xl ml-2 ${item.link === pathName ? " text-primary dark:text-titleText-dark" : ""} `}>{item.icon}</span>
                                <span className={` ${item.link === pathName ? " text-primary dark:text-titleText-dark" : "text-titleText dark:text-titleText-dark"} `}>{item.label}</span>
                            </button>
                        </a>

                    ))}
                    <div className="mt-auto pt-12">
                        <button
                            key={'exit'}
                            className="flex items-center space-x-2 w-full px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                            onClick={() => {
                                document.cookie = `${'token'}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                                window.location.assign('/')
                            }}
                        >
                            <span className="text-xl ml-2 dark:text-gray-200">
                                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 12H18M18 12L15.5 9.77778M18 12L15.5 14.2222M18 7.11111V5C18 4.44772 17.5523 4 17 4H7C6.44772 4 6 4.44772 6 5V19C6 19.5523 6.44772 20 7 20H17C17.5523 20 18 19.5523 18 19V16.8889" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                            <span className="text-titleText dark:text-titleText-dark"
                                
                            >خروج</span>
                        </button>
                    </div>
                </nav>
            </div>
        </div>
    );
}

export default Navbar;
