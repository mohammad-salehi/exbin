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
import JalaliLocalDatePicker from "../../../DatePicker/JalaliLocalDatePicker";
import { toJalaliDate } from "../../../../functions/toJalaliDate";

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
        {
            header: "تاریخ شروع به کار *",
            cell: (row: Person) => {
                return (
                    <span>{toJalaliDate(row.startDate)}</span> // محتوای دیگری که در صورت غیرفعال بودن دسترسی خاص می‌خواهید
                );
            },
        },
        {
            header: "تاریخ شروع بیمه *",
            cell: (row: Person) => {
                return (
                    <span>{toJalaliDate(row.insuranceStartDate)}</span> // محتوای دیگری که در صورت غیرفعال بودن دسترسی خاص می‌خواهید
                );
            },
        },
        {
            header: "تاریخ پایان بیمه *",
            cell: (row: Person) => {
                return (
                    <span>{toJalaliDate(row.insuranceEndDate)}</span> // محتوای دیگری که در صورت غیرفعال بودن دسترسی خاص می‌خواهید
                );
            },
        },
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
        if (!form.name.trim()) {
            toast.error("نام و نام‌خانوادگی را وارد کنید", { position: "bottom-left" });
            return;
        }
        if (!form.phoneNumber.trim()) {
            toast.error("شماره همراه را وارد کنید", { position: "bottom-left" });
            return;
        }
        if (!form.nationalCode.trim()) {
            toast.error("کد ملی را وارد کنید", { position: "bottom-left" });
            return;
        }
        if (!form.jobPosition.trim()) {
            toast.error("سمت شغلی را وارد کنید", { position: "bottom-left" });
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
                    startDate: (form.startDate),
                    educationalHistory: form.educationalHistory,
                    careerHistory: form.careerHistory,
                    insuranceStartDate: (form.insuranceStartDate),
                    insuranceEndDate: (form.insuranceEndDate),
                    isSpecialAccess: form.isSpecialAccess === true, // boolean خالص
                    nationalCode: form.nationalCode,
                    phoneNumber: form.phoneNumber,
                };
                console.log(Member)
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

    const [open, setOpen] = useState(false);
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
                            <Modal.Title className="text-lg font-bold text-titleText dark:text-titleText-dark">
                                {editingId ? "ویرایش کارمند" : "افزودن کارمند جدید"}
                            </Modal.Title>
                        </div>

                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* نام */}
                            <div>
                                <label>نام و نام‌خانوادگی *</label>
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
                                <label>شماره همراه *</label>
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
                                <label>کد ملی *</label>
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
                                <label>سمت *</label>
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
                                <div className="mt-2">
                                    <JalaliLocalDatePicker
                                        value={form.startDate}
                                        onChange={(val) => setForm(p => ({ ...p, startDate: val !== null ? val : '' }))}
                                        placeholder=""
                                        clearable
                                        min="1900-01-01"
                                        max="2030-12-31"
                                    />
                                </div>

                            </div>

                            {/* تاریخ شروع بیمه */}
                            <div>
                                <label>تاریخ شروع بیمه</label>
                                <div className="mt-2">
                                    <JalaliLocalDatePicker
                                        value={form.insuranceStartDate}
                                        onChange={(val) => {
                                            setForm(p => ({ ...p, insuranceStartDate: val !== null ? val : '' }))
                                            console.log(val)
                                        }}
                                        placeholder=""
                                        clearable
                                        min="1900-01-01"
                                        max="2030-12-31"
                                    />
                                </div>
                            </div>

                            {/* تاریخ پایان بیمه */}
                            <div>
                                <label>تاریخ پایان بیمه</label>
                                <div className="mt-2">
                                    <JalaliLocalDatePicker
                                        value={form.insuranceEndDate}
                                        onChange={(val) => setForm(p => ({ ...p, insuranceEndDate: val !== null ? val : '' }))}
                                        placeholder=""
                                        clearable
                                        min="1900-01-01"
                                        max="2030-12-31"
                                    />
                                </div>
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
