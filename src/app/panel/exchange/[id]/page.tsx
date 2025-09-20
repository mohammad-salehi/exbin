"use client";

import React from 'react'
import DetailBox from '../../../../../components/Dashboard/Exchange_page/DetailBox/DetailBox';
import CeoDetail from '../../../../../components/Dashboard/Exchange_page/CeoDetail/CeoDetail';
import BoardMemberTable from '../../../../../components/Dashboard/Exchange_page/BoardMemberInfo/BoardMemberInfo';
import ExchangeAgentInfo from '../../../../../components/Dashboard/Exchange_page/ExchangeAgentInfo/ExchangeAgentInfo';
import EmployeeInfo from '../../../../../components/Dashboard/Exchange_page/EmployeeInfo/EmployeeInfo';
const Page = () => {
    const invoiceData = [
        {
            title: "مشخصات پایه",
            content: [
                {
                    title: "صرافی نوبیتکس",
                    content: '',
                    image: "data:image/png;base64,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", // افزودن مسیر تصویر کنار محتوی
                },
                { title: "نام حقوقی", content: 'راهکار فناوری نویان' },
                { title: "تاریخ تاسیس", content: "1404/03/03" },
                { title: "شناسه ملی صرافی", content: "44332211-021" },
                { title: "نوع صرافی", content: "p2p" },
                { title: "شکل حقوقی صرافی", content: "سهامی" },


            ],
        },
        {
            title: "اطلاعات تماس",
            content: [
                {
                    title: "آدرس سایت",
                    content: (
                        <a href="https://www.example.com" className="text-primary dark:text-primary-dark">
                            مراجعه به سایت
                        </a>
                    ),
                },
                { title: "شماره تماس", content: "9876543210" },
                { title: "شماره تماس اضطراری", content: "9876543210" },
                { title: "آدرس دفتر", content: "9876543210" },
                { title: "ایمیل", content: "9876543210" },

            ],
        },
        {
            title: "اسناد",
            content: [
                {
                    title: "اساسنامه",
                    content: (
                        <a href="https://www.example.com" className="text-primary dark:text-primary-dark">
                            دریافت
                        </a>
                    ),
                },
                {
                    title: "صورت‌ مالی 1404",
                    content: (
                        <a href="https://www.example.com" className="text-primary dark:text-primary-dark">
                            دریافت
                        </a>
                    ),
                },
                {
                    title: "صورت‌ مالی 1403",
                    content: (
                        <a href="https://www.example.com" className="text-primary dark:text-primary-dark">
                            دریافت
                        </a>
                    ),
                },

            ],
        },
        {
            title: "عملیات",
            content: [
                {
                    content: (
                        <div className='text-center w-full cursor-pointer'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className='inline-block ml-1'>
                                <path d="M13.2594 3.60022L5.04936 12.2902C4.73936 12.6202 4.43936 13.2702 4.37936 13.7202L4.00936 16.9602C3.87936 18.1302 4.71936 18.9302 5.87936 18.7302L9.09936 18.1802C9.54936 18.1002 10.1794 17.7702 10.4894 17.4302L18.6994 8.74022C20.1194 7.24022 20.7594 5.53022 18.5494 3.44022C16.3494 1.37022 14.6794 2.10022 13.2594 3.60022Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M11.8906 5.0498C12.3206 7.8098 14.5606 9.9198 17.3406 10.1998" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M3 22H21" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>ویرایش</span>

                        </div>

                    ),
                },
                {
                    content: (
                        <div className='text-center w-full cursor-pointer ' >
                            <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='inline-block ml-1'>
                                <path d="M12 3V16M12 16L16 11.625M12 16L8 11.625" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M15 21H9C6.17157 21 4.75736 21 3.87868 20.1213C3 19.2426 3 17.8284 3 15M21 15C21 17.8284 21 19.2426 20.1213 20.1213C19.8215 20.4211 19.4594 20.6186 19 20.7487" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>دریافت</span>

                        </div>

                    ),
                },

            ],
        },
    ];

    return (
        <div className='px-4 xl:px-0 mb-4'>
            <h5 className='font-bold text-lg text-titleText dark:text-titleText-dark'>
                مشخصات صرافی
            </h5>
            <DetailBox data={invoiceData} downloadLink="/path/to/pdf" />
            <CeoDetail/>
            <BoardMemberTable/>
            <ExchangeAgentInfo/>
            <EmployeeInfo/>
        </div>
    )
}

export default Page
