import React, { useState } from "react";
import ExpandableTable, { Column } from "../../../ExpandableTable/ExpandableTable";
import { Modal, Button, Input } from "@heathmont/moon-core-tw";
import toast from "react-hot-toast";

import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

type Person = {
    id: string;
    name: string;
    jobPosition: string;
    startDate: string;
    educationalHistory: string;
    careerHistory: string;
    insuranceStartDate: string;
    insuranceEndDate: string;
    isSpecialAccess: boolean | null;
    nationalCode: string;
    phoneNumber: string;
};

interface GetExchangeInfoProps {
    SetStep: React.Dispatch<React.SetStateAction<number>>;
    ID: number | undefined;
}


type EmployeeForm = Person;

const Employee_Info: React.FC<GetExchangeInfoProps> = ({ SetStep, ID }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [Loading, setLoading] = useState<boolean>(false);

    const closeModal = () => setIsOpen(false);
    const openModal = () => setIsOpen(true);

    const columns: Column<Person>[] = [
        { header: "نام و نام‌خانوادگی", accessorKey: "name" },
        { header: "سمت", accessorKey: "jobPosition", align: "center" },
        { header: "تاریخ شروع به کار", accessorKey: "startDate", align: "center" },
        { header: "تاریخ شروع بیمه", accessorKey: "insuranceStartDate", align: "center" },
        { header: "تاریخ پایان بیمه", accessorKey: "insuranceEndDate", align: "center" },
        { header: "دسترسی خاص", accessorKey: "isSpecialAccess", align: "center" },
        {
            header: "عملیات",
            cell: (row: Person) => (
                <div className="flex items-center gap-2 text-titleText dark:text-titleText-dark">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="25"
                        height="24"
                        viewBox="0 0 25 24"
                        fill="none"
                        className="cursor-pointer"
                        onClick={() => {
                            setForm({ ...row });
                            setEditingId(row.id);
                            openModal();
                        }}
                    >
                        <path
                            d="M13.7603 3.60022L5.55034 12.2902C5.24034 12.6202 4.94034 13.2702 4.88034 13.7202L4.51034 16.9602C4.38034 18.1302 5.22034 18.9302 6.38034 18.7302L9.60034 18.1802C10.0503 18.1002 10.6803 17.7702 10.9903 17.4302L19.2003 8.74022C20.6203 7.24022 21.2603 5.53022 19.0503 3.44022C16.8503 1.37022 15.1803 2.10022 13.7603 3.60022Z"
                            stroke="#A8A8A8"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M12.3896 5.0498C12.8196 7.8098 15.0596 9.9198 17.8396 10.1998"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M3.5 22H21.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            ),
        },
    ];

    const [data, SetData] = useState<Person[]>([]);

    const [form, setForm] = useState<EmployeeForm>({
        id: "",
        name: "",
        jobPosition: "",
        startDate: "",
        educationalHistory: "",
        careerHistory: "",
        insuranceStartDate: "",
        insuranceEndDate: "",
        isSpecialAccess: null,
        nationalCode: "",
        phoneNumber: "",
    });

    const handleChange = <K extends keyof EmployeeForm>(field: K, value: EmployeeForm[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
      };

    const handleSave = () => {
        if (!form.name.trim() || !form.phoneNumber.trim() || !form.nationalCode.trim()) {
            toast.error("نام، شماره همراه و کد ملی الزامی هستند", { position: "bottom-left" });
            return;
        }

        if (editingId) {
            const updated = data.map((emp) =>
                emp.id === editingId ? { ...emp, ...form } : emp
            );
            SetData(updated);
        } else {
            const newEmployee: Person = { ...form, id: String(data.length + 1) };
            const updated = [...data, newEmployee];
            SetData(updated);
        }

        closeModal();
        setEditingId(null);
        setForm({
            id: "",
            name: "",
            jobPosition: "",
            startDate: "",
            educationalHistory: "",
            careerHistory: "",
            insuranceStartDate: "",
            insuranceEndDate: "",
            isSpecialAccess: null,
            nationalCode: "",
            phoneNumber: "",
        });
    };

    const nextStep = async () => {

        const getData = []
        for (let i = 0; i < data.length; i++) {
            getData.push(
                {
                    name:data[i].name,
                    jobPosition:data[i].jobPosition,
                    startDate:data[i].startDate,
                    educationalHistory:data[i].educationalHistory,
                    careerHistory:data[i].careerHistory,
                    insuranceStartDate:data[i].insuranceStartDate,
                    insuranceEndDate:data[i].insuranceEndDate,
                    isSpecialAccess: data[i].isSpecialAccess,
                    nationalCode:data[i].nationalCode,
                    phoneNumber:data[i].phoneNumber,
                }
            )
        }
        console.log(getData)
        console.log(JSON.stringify(getData))
        try {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('token='))
                ?.split('=')[1];

            if (!token) {
                toast.error("توکن موجود نیست، لطفاً وارد سیستم شوید.", { position: "bottom-left" });
                return;
            }

            // ارسال درخواست به API
            setLoading(true)
            const response = await fetch(`https://sand-em-api.bahfara.ir/api/exchanges/${ID}/employees`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(getData),
            });

            if (!response.ok) {
                setLoading(false)
                return toast.error(`خطا در ذخیره کارمندان`);
            }
            const responseData = await response.json();
            console.log(responseData);
            toast.success("کارمندان با موفقیت ذخیره شدند.", { position: "bottom-left" });
            setLoading(false)
            SetStep(4)
        } catch (err) {
            console.error(err);
            return toast.error(`خطا در ذخیره کارمندان`);
        }
    }

    return (
        <div className="mt-4">
            {/* تیتر و دکمه */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch gap-4">
                <h5 className="font-bold text-lg text-titleText dark:text-titleText-dark">
                    مشخصات کارمندان
                </h5>
                <button
                    className="text-primary border border-primary px-4 py-2 rounded-md"
                    onClick={() => {
                        setEditingId(null); // ریست کردن حالت ویرایش
                        setForm({
                            id: "",
                            name: "",
                            jobPosition: "",
                            startDate: "",
                            educationalHistory: "",
                            careerHistory: "",
                            insuranceStartDate: "",
                            insuranceEndDate: "",
                            isSpecialAccess: null,
                            nationalCode: "",
                            phoneNumber: "",
                        });
                        openModal();
                    }}
                >
                    افزودن کارمند جدید
                </button>
            </div>

            {/* جدول */}
            <div className="mt-4">
                <ExpandableTable<Person>
                    rowDetailsMode="row"
                    rowDetailsClassName="rounded-xl p-3"
                    data={data}
                    columns={columns}
                />
            </div>

            {/* دکمه‌های پایین */}
            <div className="relative w-full mt-4">
                <div className="flex justify-between items-center">
                    <div />
                    <div className="text-sm text-titleText dark:text-titleText-dark">
                        <button
                            className="w-36 ml-2 bg-primary h-[48px] rounded-lg text-white shadow-lg"
                            onClick={() => {
                                SetStep(4);
                            }}
                        >
                            صفحه قبل
                        </button>
                        <button
                            className="w-36 bg-primary h-[48px] rounded-lg text-white shadow-lg"
                            onClick={() => {
                                nextStep()
                            }}
                        >
                            اتمام
                        </button>
                    </div>
                </div>
            </div>

            {/* مودال */}
            <Modal open={isOpen} onClose={closeModal}>
                <Modal.Backdrop />
                <div className="fixed inset-0 flex z-50 backdrop-blur-sm bg-white/10">
                    <Modal.Panel className="w-full max-w-xl rounded-lg bg-white dark:bg-bgColor-dark shadow-lg mt-[200px] text-titleText dark:text-titleText-dark">
                        <div className="p-4 border-b border-boxBorderColor dark:border-boxBorderColor-dark">
                            <Modal.Title className="text-lg font-bold">
                                {editingId ? "ویرایش کارمند" : "افزودن کارمند جدید"}
                            </Modal.Title>
                        </div>

                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* نام */}
                            <div>
                                <label>نام و نام‌خانوادگی</label>
                                <Input
                                    className="p-0 pr-2 mt-2 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm border border-boxBorderColor dark:border-boxBorderColor-dark"
                                    value={form.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    placeholder="نام و نام‌خانوادگی"
                                />
                            </div>

                            {/* شماره همراه */}
                            <div>
                                <label>شماره همراه</label>
                                <Input
                                    className="p-0 pr-2 mt-2 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm border border-boxBorderColor dark:border-boxBorderColor-dark"
                                    value={form.phoneNumber}
                                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                                    placeholder="شماره همراه"
                                />
                            </div>

                            {/* کد ملی */}
                            <div>
                                <label>کد ملی</label>
                                <Input
                                    className="p-0 pr-2 mt-2 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm border border-boxBorderColor dark:border-boxBorderColor-dark"
                                    value={form.nationalCode}
                                    onChange={(e) => handleChange("nationalCode", e.target.value)}
                                    placeholder="کد ملی"
                                />
                            </div>

                            {/* سمت */}
                            <div>
                                <label>سمت</label>
                                <Input
                                    className="p-0 pr-2 mt-2 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm border border-boxBorderColor dark:border-boxBorderColor-dark"
                                    value={form.jobPosition}
                                    onChange={(e) => handleChange("jobPosition", e.target.value)}
                                    placeholder="سمت"
                                />
                            </div>

                            {/* سوابق تحصیلی */}
                            <div>
                                <label>سوابق تحصیلی</label>
                                <textarea
                                    className="w-full mt-2 pr-2 pt-2 focus:outline-none rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm border border-boxBorderColor dark:border-boxBorderColor-dark"
                                    value={form.educationalHistory}
                                    onChange={(e) => handleChange("educationalHistory", e.target.value)}
                                    placeholder="سوابق تحصیلی"
                                />
                            </div>

                            {/* سوابق شغلی */}
                            <div>
                                <label>سوابق شغلی</label>
                                <textarea
                                    className="w-full mt-2 pr-2 pt-2 focus:outline-none rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm border border-boxBorderColor dark:border-boxBorderColor-dark"
                                    value={form.careerHistory}
                                    onChange={(e) => handleChange("careerHistory", e.target.value)}
                                    placeholder="سوابق شغلی"
                                />
                            </div>

                            {/* تاریخ شروع به کار */}
                            <div>
                                <label>تاریخ شروع به کار</label>
                                <DatePicker
                                    value={form.startDate}
                                    onChange={(date) => handleChange("startDate", date ? date.format("YYYY/MM/DD") : "")}
                                    calendar={persian}
                                    locale={persian_fa}
                                    calendarPosition="bottom-right"
                                    containerClassName="w-full"
                                    render={(val, openCalendar) => (
                                        <div className="relative flex items-center w-full mt-2 text-titleText dark:text-titleText-dark">
                                            <Input
                                                readOnly
                                                value={val}
                                                onClick={openCalendar}
                                                placeholder="انتخاب تاریخ"
                                                className="w-full pr-10 pl-10 flex-shrink-0 rounded-md bg-bgColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm border border-boxBorderColor dark:border-boxBorderColor-dark"
                                            />
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="25"
                                                viewBox="0 0 24 25"
                                                fill="none"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                            >
                                                <path
                                                    d="M19.125 10.4742H4.875M8.71154 7.73381V5.5415M15.2885 7.73381L15.2885 5.5415M4.875 8.82997L4.875 17.5992C4.875 18.81 5.85653 19.7915 7.06731 19.7915L16.9327 19.7915C18.1435 19.7915 19.125 18.81 19.125 17.5992V8.82999C19.125 7.61921 18.1435 6.63768 16.9327 6.63768L7.06731 6.63766C5.85653 6.63766 4.875 7.61919 4.875 8.82997Z"
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                            <svg
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleChange("startDate", "");
                                                }}
                                                className="cursor-pointer absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:dark:text-gray-300 transition"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M6 6L18 18M6 18L18 6"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                />
                            </div>

                            {/* تاریخ شروع بیمه */}
                            <div>
                                <label>تاریخ شروع بیمه</label>
                                <DatePicker
                                    value={form.insuranceStartDate}
                                    onChange={(date) => handleChange("insuranceStartDate", date ? date.format("YYYY/MM/DD") : "")}
                                    calendar={persian}
                                    locale={persian_fa}
                                    calendarPosition="bottom-right"
                                    containerClassName="w-full"
                                    render={(val, openCalendar) => (
                                        <div className="relative flex items-center w-full mt-2 text-titleText dark:text-titleText-dark">
                                            <Input
                                                readOnly
                                                value={val}
                                                onClick={openCalendar}
                                                placeholder="انتخاب تاریخ"
                                                className="w-full pr-10 pl-10 flex-shrink-0 rounded-md bg-bgColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm border border-boxBorderColor dark:border-boxBorderColor-dark"
                                            />
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="25"
                                                viewBox="0 0 24 25"
                                                fill="none"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                            >
                                                <path
                                                    d="M19.125 10.4742H4.875M8.71154 7.73381V5.5415M15.2885 7.73381L15.2885 5.5415M4.875 8.82997L4.875 17.5992C4.875 18.81 5.85653 19.7915 7.06731 19.7915L16.9327 19.7915C18.1435 19.7915 19.125 18.81 19.125 17.5992V8.82999C19.125 7.61921 18.1435 6.63768 16.9327 6.63768L7.06731 6.63766C5.85653 6.63766 4.875 7.61919 4.875 8.82997Z"
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                            <svg
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleChange("insuranceStartDate", "");
                                                }}
                                                className="cursor-pointer absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:dark:text-gray-300 transition"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M6 6L18 18M6 18L18 6"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                />
                            </div>

                            {/* تاریخ پایان بیمه */}
                            <div>
                                <label>تاریخ پایان بیمه</label>
                                <DatePicker
                                    value={form.insuranceEndDate}
                                    onChange={(date) => handleChange("insuranceEndDate", date ? date.format("YYYY/MM/DD") : "")}
                                    calendar={persian}
                                    locale={persian_fa}
                                    calendarPosition="bottom-right"
                                    containerClassName="w-full"
                                    render={(val, openCalendar) => (
                                        <div className="relative flex items-center w-full mt-2 text-titleText dark:text-titleText-dark">
                                            <Input
                                                readOnly
                                                value={val}
                                                onClick={openCalendar}
                                                placeholder="انتخاب تاریخ"
                                                className="w-full pr-10 pl-10 flex-shrink-0 rounded-md bg-bgColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm border border-boxBorderColor dark:border-boxBorderColor-dark"
                                            />
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="25"
                                                viewBox="0 0 24 25"
                                                fill="none"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                            >
                                                <path
                                                    d="M19.125 10.4742H4.875M8.71154 7.73381V5.5415M15.2885 7.73381L15.2885 5.5415M4.875 8.82997L4.875 17.5992C4.875 18.81 5.85653 19.7915 7.06731 19.7915L16.9327 19.7915C18.1435 19.7915 19.125 18.81 19.125 17.5992V8.82999C19.125 7.61921 18.1435 6.63768 16.9327 6.63768L7.06731 6.63766C5.85653 6.63766 4.875 7.61919 4.875 8.82997Z"
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                            <svg
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleChange("insuranceEndDate", "");
                                                }}
                                                className="cursor-pointer absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:dark:text-gray-300 transition"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M6 6L18 18M6 18L18 6"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                />
                            </div>

                            {/* دسترسی خاص */}
                            <div className="flex items-center gap-2 mt-6">
                                <input
                                    type="checkbox"
                                    id="isSpecialAccess"
                                    checked={form.isSpecialAccess === true}
                                    onChange={(e) => handleChange("isSpecialAccess", e.target.checked)}
                                    className="w-4 h-4 accent-primary cursor-pointer"
                                />
                                <label htmlFor="isSpecialAccess" className="cursor-pointer">دسترسی خاص</label>
                            </div>
                        </div>

                        <div className="p-4 border-t border-boxBorderColor dark:border-boxBorderColor-dark flex justify-end gap-2">
                            <Button variant="ghost" onClick={closeModal}>
                                انصراف
                            </Button>
                            <Button onClick={handleSave}>
                                {editingId ? "ذخیره تغییرات" : "ذخیره"}
                            </Button>
                        </div>
                    </Modal.Panel>
                </div>
            </Modal>
        </div>
    );
};

export default Employee_Info;
