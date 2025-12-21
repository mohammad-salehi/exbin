// ExchangeCard.tsx
import React from "react";
import TailwindGaugePretty from './Gauge/Gauge'
import Link from "next/link";

interface ExchangeCardProps {
    id: string;
    rank: number;
    name: string;
    volume: string;
    risk: number;
    coins: number;
    lastUpdate: string;
    logo: string;
    key:string
}

const ExchangeCard: React.FC<ExchangeCardProps> = ({
    id,
    rank,
    name,
    volume,
    risk,
    coins,
    lastUpdate,
    logo,
    key
}) => {
    return (
        <Link
            href={`/panel/exchanges-list/exchange/${id}`}
            dir="rtl"
            className="w-full main-animated-border-box rounded-xl border  bg-boxColor dark:bg-boxColor-dark shadow-sm text-[13px] leading-relaxed hover:bg-bgHoverColor hover:dark:bg-bgHoverColor-dark cursor-pointer transition  duration-100"
            id={`ExschangeCard${key}`}
        >
            {/* هدر کارت */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center ">
                        {
                            logo !== '' && logo !== null ?
                                <img src={logo} className="w-8" />
                                :
                                <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-titleText dark:text-titleText-dark">
                                    <path d="M14.2639 15.9376L12.5958 14.2835C11.7909 13.4852 11.3884 13.0861 10.9266 12.9402C10.5204 12.8119 10.0838 12.8166 9.68048 12.9537C9.22188 13.1096 8.82814 13.5173 8.04068 14.3327L4.04409 18.2802M14.2639 15.9376L14.6053 15.5991C15.4112 14.7999 15.8141 14.4003 16.2765 14.2544C16.6831 14.1262 17.12 14.1312 17.5236 14.2688C17.9824 14.4252 18.3761 14.834 19.1634 15.6515L20 16.4936M14.2639 15.9376L18.275 19.9566M20.9992 6.00011H14.9992M11 3.99951L7.2 4.00011C6.07989 4.00011 5.51984 4.00011 5.09202 4.21809C4.71569 4.40984 4.40973 4.7158 4.21799 5.09213C4 5.51995 4 6.08 4 7.20011V16.8001C4 17.4576 4 17.9222 4.04409 18.2802M20 9.99951V16.4936M4.04409 18.2802C4.07512 18.5322 4.12796 18.7314 4.21799 18.9081C4.40973 19.2844 4.71569 19.5904 5.09202 19.7821C5.51984 20.0001 6.07989 20.0001 7.2 20.0001H16.8C17.9201 20.0001 18.4802 20.0001 18.908 19.7821C19.2843 19.5904 19.5903 19.2844 19.782 18.9081C20 18.4803 20 17.9202 20 16.8001V16.4936" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                        }
                    </div>

                    <span className="text-lg font-semibold text-titleText dark:text-titleText-dark">
                        {name}
                    </span>
                </div>

                <span className="text-xs text-titleText dark:text-titleText-dark">رتبه {rank}</span>
            </div>

            <div className="mx-3 border-t border-boxBorderColor dark:border-boxBorderColor-dark " />

            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-6">
                <div className="flex items-center justify-between gap-4 text-right ">
                    <div className="space-y-[8px]  text-titleText dark:text-titleText-dark">
                        <p className="text-[15px]">حجم کل معاملات</p>
                        <span className="font-bold text-[17px]">
                            <svg fill="currentColor" height="16px" width="16px" version="1.1" id="Filled_Icons" xmlns="http://www.w3.org/2000/svg" x="0px"
                                y="0px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" className="inline-block ml-1">
                                <g id="Transaction-Filled">
                                    <path d="M14,11V8H1V4h13V1l7,5L14,11z M3,18l7,5v-3h13v-4H10v-3L3,18z" />
                                </g>
                            </svg>
                            1,223,652,234
                        </span>
                        <p className="text-[15px]">دارایی به بدهی </p>
                        <span className="font-bold text-[17px]">
                            <svg className="inline-block ml-1" width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 14.75C11.59 14.75 11.25 14.41 11.25 14V9C11.25 8.59 11.59 8.25 12 8.25C12.41 8.25 12.75 8.59 12.75 9V14C12.75 14.41 12.41 14.75 12 14.75Z" fill="currentColor" /><path d="M12 18C11.94 18 11.87 17.99 11.8 17.98C11.74 17.97 11.68 17.95 11.62 17.92C11.56 17.9 11.5 17.87 11.44 17.83C11.39 17.79 11.34 17.75 11.29 17.71C11.11 17.52 11 17.26 11 17C11 16.74 11.11 16.48 11.29 16.29C11.34 16.25 11.39 16.21 11.44 16.17C11.5 16.13 11.56 16.1 11.62 16.08C11.68 16.05 11.74 16.03 11.8 16.02C11.93 15.99 12.07 15.99 12.19 16.02C12.26 16.03 12.32 16.05 12.38 16.08C12.44 16.1 12.5 16.13 12.56 16.17C12.61 16.21 12.66 16.25 12.71 16.29C12.89 16.48 13 16.74 13 17C13 17.26 12.89 17.52 12.71 17.71C12.66 17.75 12.61 17.79 12.56 17.83C12.5 17.87 12.44 17.9 12.38 17.92C12.32 17.95 12.26 17.97 12.19 17.98C12.13 17.99 12.06 18 12 18Z" fill="currentColor" /><path d="M18.06 22.16H5.93998C3.98998 22.16 2.49998 21.45 1.73998 20.17C0.989976 18.89 1.08998 17.24 2.03998 15.53L8.09998 4.63C9.09998 2.83 10.48 1.84 12 1.84C13.52 1.84 14.9 2.83 15.9 4.63L21.96 15.54C22.91 17.25 23.02 18.89 22.26 20.18C21.5 21.45 20.01 22.16 18.06 22.16ZM12 3.34C11.06 3.34 10.14 4.06 9.40998 5.36L3.35998 16.27C2.67998 17.49 2.56998 18.61 3.03998 19.42C3.50998 20.23 4.54998 20.67 5.94998 20.67H18.07C19.47 20.67 20.5 20.23 20.98 19.42C21.46 18.61 21.34 17.5 20.66 16.27L14.59 5.36C13.86 4.06 12.94 3.34 12 3.34Z" fill="currentColor" /></svg>
                            {risk}%</span>
                        <p className="text-[15px]">تعداد ارز ها </p>
                        <span className="font-bold text-[17px]">
                            <svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block ml-1">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M4 5C3.44772 5 3 5.44772 3 6C3 6.55228 3.44772 7 4 7H20C20.5523 7 21 6.55228 21 6C21 5.44772 20.5523 5 20 5H4ZM7 12C7 11.4477 7.44772 11 8 11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H8C7.44772 13 7 12.5523 7 12ZM13 18C13 17.4477 13.4477 17 14 17H20C20.5523 17 21 17.4477 21 18C21 18.5523 20.5523 19 20 19H14C13.4477 19 13 18.5523 13 18Z" fill="currentColor" />
                            </svg>
                            {coins}
                        </span>
                    </div>
                </div>

                <div className="">
                    <TailwindGaugePretty value={risk} />
                </div>
            </div>
        </Link>
    );
};

export default ExchangeCard;
