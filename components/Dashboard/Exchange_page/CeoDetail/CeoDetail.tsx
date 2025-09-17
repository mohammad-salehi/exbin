

import React from 'react'
import ExpandableTable, { Column } from "../../../../components/ExpandableTable/ExpandableTable";

type Person = {
    id: string;
    name?: string;
    phoneNumber?: string;
    nationalCode?: string;
    educationHistory?: string;
    careerHistory?: string;
    sharePercentage?: string;
    email?: string;
};

const CeoDetail = () => {

    const data: Person[] = [
        { id: "5", name: "محمد", phoneNumber: "09121234567", nationalCode: '1400765432', educationHistory: '4040404040', careerHistory: '9129991111', sharePercentage:'30', email:'' },
    ];

    const columns: Column<Person>[] = [
        { header: "نام و نام‌خانوادگی", accessorKey: "name" },
        { header: "شماره همراه", accessorKey: "phoneNumber" },
        { header: "کدملی", accessorKey: "nationalCode" },
        { header: "سوابق تحصیلی", accessorKey: "educationHistory" },
        { header: "سوابق شغلی", accessorKey: "careerHistory" },
        { header: "درصد سهام", accessorKey: "sharePercentage" },
        { header: "ایمیل", accessorKey: "email" },
        {
            header: "عملیات",
            cell: (row: Person) => (
                <div className="flex items-center gap-2 text-titleText dark:text-titleText-dark">
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none" className="cursor-pointer">
                        <path d="M13.7603 3.60022L5.55034 12.2902C5.24034 12.6202 4.94034 13.2702 4.88034 13.7202L4.51034 16.9602C4.38034 18.1302 5.22034 18.9302 6.38034 18.7302L9.60034 18.1802C10.0503 18.1002 10.6803 17.7702 10.9903 17.4302L19.2003 8.74022C20.6203 7.24022 21.2603 5.53022 19.0503 3.44022C16.8503 1.37022 15.1803 2.10022 13.7603 3.60022Z" stroke="#A8A8A8" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12.3896 5.0498C12.8196 7.8098 15.0596 9.9198 17.8396 10.1998" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M3.5 22H21.5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            ),
        },
    ];


    return (
        <div className='mt-4'>
            <h5 className='font-bold text-lg text-titleText dark:text-titleText-dark mb-2'>
                مشخصات مدیرعامل
            </h5>
            <ExpandableTable<Person>
                data={data}          // ← فقط دیتای فیلترشده را بده
                columns={columns}
                rowDetailsMode="row"
                rowDetailsClassName="rounded-xl p-3"
            />
        </div>
    )
}

export default CeoDetail
