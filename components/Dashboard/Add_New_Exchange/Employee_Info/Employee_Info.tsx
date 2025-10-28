import React, { useState } from "react";
import ExpandableTable, { Column } from "../../../ExpandableTable/ExpandableTable";
import { Modal, Button, Input } from "@heathmont/moon-core-tw";
import toast from "react-hot-toast";

import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { LoaderCircle } from "../../../Loader/Loader";

import { validateEmail } from '../../../../functions/Validations';
import { validateNumbers } from '../../../../functions/Validations';
import { PostRequest } from "../../../../functions/PostRequest";
import { toLocalDate } from '../../../../functions/toLocalDate';

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
        {
            header: "دسترسی خاص",
            cell: (row: Person) => {
                if (row.isSpecialAccess) {
                    return (
                        <span className='text-green-500 dark:text-green-300'>دارد</span> // اینجا محتوای مورد نظر را قرار دهید
                    );
                } else {
                    return (
                        <span className='text-red-500 dark:text-red-300'>ندارد</span> // محتوای دیگری که در صورت غیرفعال بودن دسترسی خاص می‌خواهید
                    );
                }
            },
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
    const handleSave = async () => {
        // ✅ یک‌بار ولیدیشن کافی است
        if (!form.name.trim() || !form.phoneNumber.trim() || !form.nationalCode.trim()) {
          toast.error("نام، شماره همراه و کد ملی الزامی هستند", { position: "bottom-left" });
          return;
        }
      
        try {
          if (editingId) {
            // 🟢 ویرایش در استیت محلی
            SetData(data.map(member => (member.id === editingId ? { ...member, ...form } : member)));
          } else {
            // 🟢 افزودن جدید
            const Member = {
              id: form.id,
              name: form.name,
              jobPosition: form.jobPosition,
              startDate: toLocalDate(form.startDate),
              educationalHistory: form.educationalHistory,
              careerHistory: form.careerHistory,
              insuranceStartDate: toLocalDate(form.insuranceStartDate),
              insuranceEndDate: toLocalDate(form.insuranceEndDate),
              isSpecialAccess: form.isSpecialAccess === true, // boolean خالص
              nationalCode: form.nationalCode,
              phoneNumber: form.phoneNumber,
            };
      
            setLoading(true);
      
            await PostRequest(
              `${process.env.NEXT_PUBLIC_API_URL ?? "https://sand-em-api.bahfara.ir"}/api/exchanges/${ID}/employees`,
              Member // JSON ارسال می‌شود
            );
      
            toast.success("کارمند سکو باموفقیت افزوده شد.", { position: "bottom-left" });
      
            const newMember: Person = { ...form };
            SetData([...data, newMember]);
          }
      
          // فقط بعد از موفقیت مودال را ببند
          closeModal();
          setEditingId(null);
      
          // ریست فرم
          setForm({
            id: '',
            name: '',
            jobPosition: '',
            startDate: '',
            educationalHistory: '',
            careerHistory: '',
            insuranceStartDate: '',
            insuranceEndDate: '',
            isSpecialAccess: null,
            nationalCode: '',
            phoneNumber: '',
          });
        } catch (e: any) {
          toast.error(e?.message || "خطا در ذخیره کارمند", { position: "bottom-left" });
        } finally {
          setLoading(false);
        }
      };

    const nextStep = async () => {
        window.location.assign(`/panel/exchange/${ID}`)
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

            <div className="relative w-full mt-4">
                <div className="flex justify-between items-center w-full">
                    <div className="text-sm text-titleText dark:text-titleText-dark"></div>
                    <div className="text-sm text-titleText dark:text-titleText-dark w-full sm:w-auto">
                    <button
                            className="w-full sm:w-72 bg-primary h-[48px] rounded-lg text-white shadow-lg flex justify-center items-center"
                            onClick={() => { nextStep() }}
                        >
                            {"اتمام"
                            }
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
                                    onChange={(e) => {
                                        handleChange("name", e.target.value)
                                    }}
                                    placeholder="نام و نام‌خانوادگی"
                                />
                            </div>

                            {/* شماره همراه */}
                            <div>
                                <label>شماره همراه</label>
                                <Input
                                    className="p-0 pr-2 mt-2 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm border border-boxBorderColor dark:border-boxBorderColor-dark"
                                    value={form.phoneNumber}
                                    onChange={(e) => {
                                        if (validateNumbers(e.target.value)) {
                                            handleChange("phoneNumber", e.target.value)
                                        }
                                    }}
                                    placeholder="شماره همراه"
                                />
                            </div>

                            {/* کد ملی */}
                            <div>
                                <label>کد ملی</label>
                                <Input
                                    className="p-0 pr-2 mt-2 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm border border-boxBorderColor dark:border-boxBorderColor-dark"
                                    value={form.nationalCode}
                                    onChange={(e) => {
                                        if (validateNumbers(e.target.value)) {
                                            handleChange("nationalCode", e.target.value)
                                        }
                                    }}
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
                                {Loading ?
                                    <div>
                                        <LoaderCircle size={8} color="border-white-500" />
                                    </div>
                                    :
                                    "افزودن"
                                }
                            </Button>
                        </div>
                    </Modal.Panel>
                </div>
            </Modal>
        </div>
    );
};

export default Employee_Info;
