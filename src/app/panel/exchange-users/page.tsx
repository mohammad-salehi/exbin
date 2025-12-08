'use client'

import React, { useEffect, useState } from 'react'
import RiskSwitch from '../../../../components/Dashboard/ExchangeList/Switch/Switch'
import { Dropdown, MenuItem } from "@heathmont/moon-core-tw";
import { Button } from "@heathmont/moon-base-tw";
import { ControlsChevronDown } from '@heathmont/moon-icons-tw';
import JalaliLocalDatePicker from '../../../../components/DatePicker/JalaliLocalDatePicker';
import LoadingComponent from '../../../../components/LoadingComponent/LoadingComponent';
import ExpandableTable from '../../../../components/ExpandableTable/ExpandableTable';
import Pagination from '../../../../components/Pagination/Pagination';
import { GetRequest } from '../../../../functions/GetRequest';

const Page = () => {
    const [usersLoading, setusersLoading] = useState(false);
    const [Loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("deposit");
    const [ExchangeSelected, setExchangeSelected] = useState<string>('');
    const [startPicker, setStartPicker] = useState<any>();
    const [endPicker, setEndPicker] = useState<any>();
    const [Exchanges, SetExchanges] = useState<Company[]>([])
    type Option = {
        label: string;
        value: string;
    };

    const defaultOptions: Option[] = [
        { label: "واریز", value: "deposit" },
        { label: "برداشت", value: "withdraw" },
    ];
    type Person = {
        id: string;
        firstName: string;
        lastName: string;
        username: string;
    };
    type Company = {
        id: number;
        name: string;
        logo: string;
        legalName: string;
        registrationNumber: string;
        siteAddress: string;
    };

    useEffect(() => {
        GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/exchanges?page=0&size=100`)
            .then((response) => {

                const people: Company[] = response.result.content.map((item: Company) => ({
                    id: String(item.id),
                    name: item.name,
                    logo: item.logo,
                    legalName: item.legalName,
                    registrationNumber: item.registrationNumber,
                    siteAddress: item.siteAddress,
                }));

                people.sort((a, b) => Number(b.id) - Number(a.id));
                console.log('people')
                console.log(people)
                SetExchanges(people);
            })
            .catch((err) => {
            })
    }, [])

    return (
        <div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4'>
                <div className='sm:col-span-2 lg:col-span-2'>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="relative w-full text-sm text-titleText dark:text-titleText-dark">
                            صرافی
                            <Dropdown
                                value={ExchangeSelected}        // ✅ به‌جای '' از استیت استفاده کن
                                className="outline-none"
                                onChange={(v: string) => {
                                    const val = (v as string) ?? "";
                                    setExchangeSelected(val);     // ✅ مقدار جدید رو ذخیره کن
                                }}
                            >
                                <Dropdown.Trigger className="w-full">
                                    <Button
                                        as="span"
                                        role="button"
                                        variant="ghost"
                                        className="flex items-center justify-between w-full pl-10 py-2 bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark
            border border-gray-300 rounded-lg dark:border-buttonBorderColor-dark focus:outline-none appearance-none relative outline-none shadow-none"
                                    >
                                        <span>
                                            {usersLoading
                                                ? "در حال بارگذاری..."
                                                : ExchangeSelected
                                                    ? (Exchanges.find(u => u.name === ExchangeSelected)?.name ?? ExchangeSelected)
                                                    : "همه سکوها"}
                                        </span>
                                    </Button>
                                </Dropdown.Trigger>

                                <Dropdown.Options
                                    className="absolute left-0 mt-2 w-72 pl-2 pr-2 text-gray-700 bg-white dark:bg-buttonColor-dark
          border border-gray-300 dark:border-buttonBorderColor-dark rounded-lg dark:text-gray-100 appearance-none z-50
          max-h-60 overflow-y-auto"
                                >
                                    {/* گزینهٔ «همه کاربران» */}
                                    <Dropdown.Option value="">
                                        {({ selected, active }) => (
                                            <MenuItem isActive={active} isSelected={selected}
                                                className={`border mt-2 mb-1 rounded-md border-gray-100 dark:border-buttonBorderColor-dark ${selected ? "bg-gray-100 border-gray-200 dark:bg-gray-700" : ""}`}>
                                                <MenuItem.Title>همه سکوها</MenuItem.Title>
                                            </MenuItem>
                                        )}
                                    </Dropdown.Option>

                                    {/* کاربران از API */}
                                    {Exchanges.map((u) => {
                                        const label = u.name; // اگر خواستی: `${u.firstName ?? ""} ${u.lastName ?? ""} (${u.name})`
                                        return (
                                            <Dropdown.Option value={u.name} key={u.id}>
                                                {({ selected, active }) => (
                                                    <MenuItem isActive={active} isSelected={selected}
                                                        className={`border mt-2 mb-1 rounded-md border-gray-100 dark:border-buttonBorderColor-dark ${selected ? "bg-gray-100 border-gray-200 dark:bg-gray-700" : ""}`}>
                                                        <MenuItem.Title>{label}</MenuItem.Title>
                                                    </MenuItem>
                                                )}
                                            </Dropdown.Option>
                                        );
                                    })}
                                </Dropdown.Options>
                            </Dropdown>

                            <ControlsChevronDown className="absolute left-3 top-[33px] text-titleText dark:text-titleText-dark pointer-events-none" />
                        </div>
                    </div>

                </div>
            </div>
            <div className="mt-4">
                {Loading ? (
                    <LoadingComponent />
                ) : (
                    <ExpandableTable<Person>
                        data={[]}  // 👈 فقط داده‌های صفحه فعلی
                        columns={[]}
                        rowDetailsMode="row"
                        rowDetailsClassName="rounded-xl p-3"
                    />
                )}

                <Pagination
                    rtl
                    totalItems={1}   // کل تعداد رکوردها
                    pageSize={12}
                    currentPage={1}     // 👈 استیت واقعی صفحه
                    onPageChange={() => {

                    }}  // 👈 صفحه عوض شد
                />
            </div>
        </div>
    )
}

export default Page
