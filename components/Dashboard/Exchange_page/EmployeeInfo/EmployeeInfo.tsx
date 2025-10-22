import React, { useEffect, useState } from 'react'
import ExpandableTable, { Column } from "../../../ExpandableTable/ExpandableTable";
import { Modal, Button, Input } from "@heathmont/moon-core-tw";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import { GetRequest } from '../../../../functions/GetRequest';
import { LoaderCircle } from '../../../Loader/Loader';

import { validateEmail } from '../../../../functions/Validations';
import { validateNumbers } from '../../../../functions/Validations';
import { PostRequest } from '../../../../functions/PostRequest';

type Person = {
    id: string;
    name: string,
    jobPosition: string,
    startDate: string,
    educationalHistory: string,
    careerHistory: string,
    insuranceStartDate: string,
    insuranceEndDate: string,
    isSpecialAccess: boolean,
    nationalCode: string,
    phoneNumber: string
};

type ExchangeInfoProps = {
    SetC5: React.Dispatch<React.SetStateAction<boolean>>;
};

const EmployeeInfo = ({ SetC5 }: ExchangeInfoProps) => {

    const params = useParams<{ id: string }>();

    const [data, setData] = useState<Person[]>([]);
    const [editLoading, SetEditLoading] = useState<boolean>(false)
    const [addLoading, SetAddLoading] = useState<boolean>(false)
    const [form, setForm] = useState<Person>({
        id: "",
        name: '',
        jobPosition: '',
        startDate: '',
        educationalHistory: '',
        careerHistory: '',
        insuranceStartDate: '',
        insuranceEndDate: '',
        isSpecialAccess: false,
        nationalCode: '',
        phoneNumber: ''
    });

    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const openModal = (row: Person) => {
        setForm(row);
        setEditingId(row.id);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setEditingId(null);
    };

    const handleSave = async () => {
        if (!editingId) return;

        if (form.name === '') {
            toast.error("نام و نام‌خانوادگی را وارد کنید", { position: "bottom-left" });
            return;
        }
        if (form.phoneNumber === '') {
            toast.error("شماره همراه را وارد کنید", { position: "bottom-left" });
            return;
        }
        if (form.nationalCode === '') {
            toast.error("کد ملی را وارد کنید", { position: "bottom-left" });
            return;
        }

        const toEnglishDigits = (s: string) =>
            s.replace(/[۰-۹]/g, d => "0123456789"["۰۱۲۳۴۵۶۷۸۹".indexOf(d)])
                .replace(/[٠-٩]/g, d => "0123456789"["٠١٢٣٤٥٦٧٨٩".indexOf(d)]);

        // 2) نرمال‌سازی کلی تاریخ
        const normalizeDateInput = (input?: string) => {
            if (!input) return "";
            return toEnglishDigits(input)
                .replace(/[\u200c\u200e\u200f\ufeff]/g, "") // حذف ZWNJ/RTL marks/BOM
                .replace(/[⁄∕／]/g, "/")                    // انواع slash به /
                .replace(/\s+/g, "")                        // حذف فاصله‌ها
                .trim();
        };

        // 3) regex روی الگوی yyyy/mm/dd با اعداد لاتین
        const dateRegex = /^(\d{4})\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/;

        // استفاده:
        const startIns = normalizeDateInput(form.insuranceStartDate);
        if (!dateRegex.test(startIns)) {
            toast.error("تاریخ شروع بیمه را به درستی وارد کنید", { position: "bottom-left" });
            return;
        }

        const endIns = normalizeDateInput(form.insuranceEndDate);
        if (!dateRegex.test(endIns)) {
            toast.error("تاریخ پایان بیمه را به درستی وارد کنید", { position: "bottom-left" });
            return;
        }

        const startWork = normalizeDateInput(form.startDate);
        if (!dateRegex.test(startWork)) {
            toast.error("تاریخ شروع کار را به درستی وارد کنید", { position: "bottom-left" });
            return;
        }

        let memberInfo = {
            name: form.name !== null ? form.name : "",
            jobPosition: form.jobPosition !== null ? form.jobPosition : "",
            startDate: form.startDate !== null ? form.startDate : "",
            educationalHistory: form.educationalHistory !== null ? form.educationalHistory : "",
            careerHistory: form.careerHistory !== null ? form.careerHistory : "",
            insuranceStartDate: form.insuranceStartDate !== null ? form.insuranceStartDate : "",
            insuranceEndDate: form.insuranceEndDate !== null ? form.insuranceEndDate : "",
            isSpecialAccess: form.isSpecialAccess !== null ? form.isSpecialAccess : "",
            nationalCode: form.nationalCode !== null ? form.nationalCode : "",
            phoneNumber: form.phoneNumber !== null ? form.phoneNumber : "",
        }
        memberInfo = {
            ...memberInfo,
            educationalHistory: form.educationalHistory || "", // اگر خالی بود، "" قرار بده
            careerHistory: form.careerHistory || "",
            jobPosition: form.jobPosition !== undefined ? form.jobPosition : "",
        }
        SetEditLoading(true)
        try {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('token='))
                ?.split('=')[1];

            if (!token) {
                SetEditLoading(false)
                toast.error("توکن موجود نیست، لطفاً وارد سیستم شوید.", { position: "bottom-left" });
                return;
            }

            // setLoading(true)
            const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/api/exchanges/${params.id}/employees/${editingId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(memberInfo),

            });

            if (!response.ok) {
                console.log(response)
                // setLoading(false)
                SetEditLoading(false)
                return toast.error(`خطا در ویرایش کارمند`);
            } else {
                const responseData = await response.json();
                console.log(responseData);
                SetEditLoading(false)
                toast.success("کارمند با موفقیت ویرایش شد.", { position: "bottom-left" });
            }

        } catch (err) {
            console.error(err);
            SetEditLoading(false)
            return toast.error(`خطا در ذخیره کارمند`);
        }


        setData((prev) =>
            prev.map((item) =>
                item.id === editingId ? { ...form, id: editingId } : item
            )
        );
        closeModal();
    };

    const columns: Column<Person>[] = [
        { header: "نام و نام‌خانوادگی", accessorKey: "name" },
        { header: "سمت", accessorKey: "jobPosition" },
        { header: "شماره همراه", accessorKey: "phoneNumber" },
        { header: "کدملی", accessorKey: "nationalCode" },
        { header: "سوابق تحصیلی", accessorKey: "educationalHistory" },
        { header: "سوابق شغلی", accessorKey: "careerHistory" },
        { header: "تاریخ شروع کار", accessorKey: "startDate" },
        { header: "تاریخ شروع بیمه", accessorKey: "insuranceStartDate" },
        { header: "تاریخ پایان بیمه", accessorKey: "insuranceEndDate" },
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

        {
            header: "عملیات",
            cell: (row: Person) => (
                <div
                    className="flex items-center gap-2 text-titleText dark:text-titleText-dark cursor-pointer"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="25"
                        height="24"
                        viewBox="0 0 25 24"
                        fill="none"
                        onClick={() => openModal(row)}
                    >
                        <path
                            d="M13.7603 3.60022L5.55034 12.2902C5.24034 12.6202 4.94034 13.2702 4.88034 13.7202L4.51034 16.9602C4.38034 18.1302 5.22034 18.9302 6.38034 18.7302L9.60034 18.1802C10.0503 18.1002 10.6803 17.7702 10.9903 17.4302L19.2003 8.74022C20.6203 7.24022 21.2603 5.53022 19.0503 3.44022C16.8503 1.37022 15.1803 2.10022 13.7603 3.60022Z"
                            stroke="#A8A8A8"
                            strokeWidth="1.5"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M12.3896 5.0498C12.8196 7.8098 15.0596 9.9198 17.8396 10.1998"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M3.5 22H21.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none" className="cursor-pointer"
                        onClick={async () => {
                            try {
                                const token = document.cookie
                                    .split('; ')
                                    .find(row => row.startsWith('token='))
                                    ?.split('=')[1];

                                if (!token) {
                                    toast.error("توکن موجود نیست، لطفاً وارد سیستم شوید.", { position: "bottom-left" });
                                    return;
                                }

                                // setLoading(true)
                                const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/api/exchanges/${params.id}/employees/${row.id}`, {
                                    method: 'DELETE',
                                    headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json',
                                    },
                                });

                                if (!response.ok) {
                                    console.log(response)
                                    // setLoading(false)
                                    return toast.error(`خطا در حذف کارمند`);
                                } else {
                                    const responseData = await response.json();
                                    console.log(responseData);
                                    toast.success("کارمند با موفقیت حذف شد.", { position: "bottom-left" });
                                    setData((prevData) => prevData.filter(person => person.id !== row.id));
                                }

                            } catch (err) {
                                console.error(err);
                                return toast.error(`خطا در حذف کارمند`);
                            }
                        }}
                    >
                        <path d="M21.5 5.97998C18.17 5.64998 14.82 5.47998 11.48 5.47998C9.5 5.47998 7.52 5.57998 5.54 5.77998L3.5 5.97998" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M9 4.97L9.22 3.66C9.38 2.71 9.5 2 11.19 2H13.81C15.5 2 15.63 2.75 15.78 3.67L16 4.97" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M19.3504 9.14014L18.7004 19.2101C18.5904 20.7801 18.5004 22.0001 15.7104 22.0001H9.29039C6.50039 22.0001 6.41039 20.7801 6.30039 19.2101L5.65039 9.14014" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10.8301 16.5H14.1601" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 12.5H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            ),
        },
    ];

    const [isAddOpen, setIsAddOpen] = useState(false);

    const openAddModal = () => {
        setForm({
            id: "",
            name: '',
            jobPosition: '',
            startDate: '',
            educationalHistory: '',
            careerHistory: '',
            insuranceStartDate: '',
            insuranceEndDate: '',
            isSpecialAccess: false,
            nationalCode: '',
            phoneNumber: ''
        });
        setIsAddOpen(true);
    };

    const closeAddModal = () => setIsAddOpen(false);

    const handleAdd = async () => {
        const newId = (data.length + 1).toString();
      
        if (form.name === '') {
          toast.error("نام و نام‌خانوادگی را وارد کنید", { position: "bottom-left" });
          return;
        }
        if (form.phoneNumber === '') {
          toast.error("شماره همراه را وارد کنید", { position: "bottom-left" });
          return;
        }
        if (form.nationalCode === '') {
          toast.error("کد ملی را وارد کنید", { position: "bottom-left" });
          return;
        }
      
        // اعداد فارسی/عربی → انگلیسی
        const toEnglishDigits = (s: string) =>
          s.replace(/[۰-۹]/g, d => "0123456789"["۰۱۲۳۴۵۶۷۸۹".indexOf(d)])
           .replace(/[٠-٩]/g, d => "0123456789"["٠١٢٣٤٥٦٧٨٩".indexOf(d)]);
      
        // نرمال‌سازی تاریخ ورودی
        const normalizeDateInput = (input?: string) => {
          if (!input) return "";
          return toEnglishDigits(input)
            .replace(/[\u200c\u200e\u200f\ufeff]/g, "") // حذف ZWNJ/RTL/BOM
            .replace(/[⁄∕／]/g, "/")                    // اسلش‌های مختلف → /
            .replace(/\s+/g, "")                        // حذف فاصله
            .trim();
        };
      
        // yyyy/mm/dd
        const dateRegex = /^(\d{4})\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/;
      
        const startIns = normalizeDateInput(form.insuranceStartDate);
        if (!dateRegex.test(startIns)) {
          toast.error("تاریخ شروع بیمه را به درستی وارد کنید", { position: "bottom-left" });
          return;
        }
      
        const endIns = normalizeDateInput(form.insuranceEndDate);
        if (!dateRegex.test(endIns)) {
          toast.error("تاریخ پایان بیمه را به درستی وارد کنید", { position: "bottom-left" });
          return;
        }
      
        const startWork = normalizeDateInput(form.startDate);
        if (!dateRegex.test(startWork)) {
          toast.error("تاریخ شروع کار را به درستی وارد کنید", { position: "bottom-left" });
          return;
        }
      
        // ساخت payload نهایی (با فیلدهای خالی به صورت "")
        const memberInfo = {
          name: form.name || "",
          jobPosition: form.jobPosition ?? "",
          startDate: startWork || "",
          educationalHistory: form.educationalHistory || "",
          careerHistory: form.careerHistory || "",
          insuranceStartDate: startIns || "",
          insuranceEndDate: endIns || "",
          isSpecialAccess: (form as any).isSpecialAccess ?? "", // اگر boolean است، می‌توانید true/false بفرستید
          nationalCode: form.nationalCode || "",
          phoneNumber: form.phoneNumber || "",
        };
      
        try {
          SetAddLoading(true);
      
          await PostRequest(
            `${process.env.NEXT_PUBLIC_API_URL ?? "https://sand-em-api.bahfara.ir"}/api/exchanges/${params.id}/employees`,
            memberInfo
            // asFormData لازم نیست؛ JSON می‌فرستیم
          );
      
          toast.success("کارمند باموفقیت افزوده شد.", { position: "bottom-left" });
      
          // به‌روزرسانی لیست محلی با داده‌های نرمال‌شده
          setData(prev => [...prev, { ...form, ...memberInfo, id: newId }]);
      
          closeAddModal();
        } catch (e: any) {
          toast.error(e?.message || "خطا در ذخیره کارمند", { position: "bottom-left" });
        } finally {
          SetAddLoading(false);
        }
      };

    useEffect(() => {
        GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/exchanges/${params.id}/employees`)
            .then((response) => {
                const getData = (response.result.content)
                setData(getData)
                SetC5(true)
            })
            .catch((err) => {
                console.log(err)
                SetC5(true)
            })
    }, [])

    return (
        <div className="mt-4">
            <div className="flex justify-between items-center mt-2">
                <h5 className="font-bold text-lg text-titleText dark:text-titleText-dark mb-2">
                    مشخصات کارمندان
                </h5>
                <div className="flex justify-end mb-3">
                    <Button variant="primary" onClick={openAddModal} className='text-primary dark:text-primary-dark border border-primary rounded-md'>
                        افزودن کارمند جدید
                    </Button>
                </div>
            </div>
            <ExpandableTable<Person>
                data={data}
                columns={columns}
                rowDetailsMode="row"
                rowDetailsClassName="rounded-xl p-3"
            />

            {/* Modal */}
            <Modal open={isOpen} onClose={closeModal}>
                <Modal.Backdrop />

                <div className="fixed inset-0 flex z-50 backdrop-blur-sm bg-white/10">
                    <Modal.Panel className="w-full max-w-2xl rounded-lg bg-white dark:bg-bgColor-dark shadow-lg mt-[200px] text-titleText dark:text-titleText-dark">
                        <div className="p-4 border-b border-boxBorderColor dark:border-boxBorderColor-dark">
                            <Modal.Title className="text-lg font-bold">
                                ویرایش مشخصات کارمند
                            </Modal.Title>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label>نام و نام‌خانوادگی</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="نام و نام‌خانوادگی" />
                            </div>

                            <div>
                                <label>سمت</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.jobPosition} onChange={(e) => setForm({ ...form, jobPosition: e.target.value })} placeholder="سمت" />
                            </div>

                            <div>
                                <label>شماره همراه</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.phoneNumber} onChange={(e) => {
                                        if (validateNumbers(e.target.value)) {
                                            setForm({ ...form, phoneNumber: e.target.value })
                                        }
                                    }
                                    } placeholder="شماره همراه" />
                            </div>

                            <div>
                                <label>کد ملی</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.nationalCode} onChange={(e) => {
                                        if (validateNumbers(e.target.value)) {
                                            setForm({ ...form, nationalCode: e.target.value })
                                        }
                                    }
                                    } placeholder="کد ملی" />
                            </div>

                            <div>
                                <label>تاریخ شروع کار</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.startDate}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (!/^[0-9/]*$/.test(value)) return;
                                        if (value.length > 10) return;
                                        if (value.length <= 4) {
                                            if (!/^\d{0,4}$/.test(value)) return;
                                        } else if (value.length === 5) {
                                            if (!/^\d{4}\/$/.test(value)) return;
                                        } else if (value.length <= 7) {
                                            if (!/^\d{4}\/\d{0,2}$/.test(value)) return;
                                        } else if (value.length === 8) {
                                            if (!/^\d{4}\/\d{2}\/$/.test(value)) return;
                                        } else {
                                            if (!/^\d{4}\/\d{2}\/\d{0,2}$/.test(value)) return;
                                        }
                                        setForm({ ...form, startDate: e.target.value });
                                    }
                                    }
                                    placeholder="تاریخ شروع کار" />
                            </div>

                            <div>
                                <label>تاریخ شروع بیمه</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.insuranceStartDate}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (!/^[0-9/]*$/.test(value)) return;
                                        if (value.length > 10) return;
                                        if (value.length <= 4) {
                                            if (!/^\d{0,4}$/.test(value)) return;
                                        } else if (value.length === 5) {
                                            if (!/^\d{4}\/$/.test(value)) return;
                                        } else if (value.length <= 7) {
                                            if (!/^\d{4}\/\d{0,2}$/.test(value)) return;
                                        } else if (value.length === 8) {
                                            if (!/^\d{4}\/\d{2}\/$/.test(value)) return;
                                        } else {
                                            if (!/^\d{4}\/\d{2}\/\d{0,2}$/.test(value)) return;
                                        }
                                        setForm({ ...form, insuranceStartDate: value });
                                    }
                                    }
                                    placeholder="تاریخ شروع بیمه" />
                            </div>

                            <div>
                                <label>تاریخ پایان بیمه</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.insuranceEndDate}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (!/^[0-9/]*$/.test(value)) return;
                                        if (value.length > 10) return;
                                        if (value.length <= 4) {
                                            if (!/^\d{0,4}$/.test(value)) return;
                                        } else if (value.length === 5) {
                                            if (!/^\d{4}\/$/.test(value)) return;
                                        } else if (value.length <= 7) {
                                            if (!/^\d{4}\/\d{0,2}$/.test(value)) return;
                                        } else if (value.length === 8) {
                                            if (!/^\d{4}\/\d{2}\/$/.test(value)) return;
                                        } else {
                                            if (!/^\d{4}\/\d{2}\/\d{0,2}$/.test(value)) return;
                                        }
                                        setForm({ ...form, insuranceEndDate: e.target.value })
                                    }

                                    } placeholder="تاریخ پایان بیمه" />
                            </div>

                            <div>
                                <label>سوابق تحصیلی</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.educationalHistory} onChange={(e) => setForm({ ...form, educationalHistory: e.target.value })} placeholder="سوابق تحصیلی" />
                            </div>

                            <div>
                                <label>سوابق شغلی</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.careerHistory} onChange={(e) => setForm({ ...form, careerHistory: e.target.value })} placeholder="سوابق شغلی" />
                            </div>

                            <div className="flex items-center gap-2 mt-6">
                                <input
                                    type="checkbox"
                                    id="isSpecialAccess"
                                    checked={form.isSpecialAccess === true}
                                    onChange={(e) => setForm({ ...form, isSpecialAccess: e.target.checked })}
                                    className="w-4 h-4 accent-primary cursor-pointer"
                                />
                                <label htmlFor="isSpecialAccess" className="cursor-pointer">دسترسی خاص</label>
                            </div>
                        </div>

                        <div className="p-4 border-t border-boxBorderColor dark:border-boxBorderColor-dark flex justify-end gap-2">
                            <Button variant="ghost" onClick={closeModal}>
                                انصراف
                            </Button>
                            <Button variant="primary" onClick={handleSave}>
                                {
                                    editLoading ?
                                        <LoaderCircle size={8} color="border-white-500" />
                                        :
                                        'ذخیره اطلاعات'
                                }

                            </Button>
                        </div>
                    </Modal.Panel>
                </div>
            </Modal>

            <Modal open={isAddOpen} onClose={closeAddModal}>
                <Modal.Backdrop />

                <div className="fixed inset-0 flex z-50 backdrop-blur-sm bg-white/10">
                    <Modal.Panel className="w-full max-w-2xl rounded-lg bg-white dark:bg-bgColor-dark shadow-lg mt-[200px] text-titleText dark:text-titleText-dark">
                        <div className="p-4 border-b border-boxBorderColor dark:border-boxBorderColor-dark">
                            <Modal.Title className="text-lg font-bold">
                                افزودن کارمند جدید
                            </Modal.Title>
                        </div>

                        {/* فرم اضافه کردن */}
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label>نام و نام‌خانوادگی</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="نام و نام‌خانوادگی" />
                            </div>
                            <div>
                                <label>سمت</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.jobPosition} onChange={(e) => setForm({ ...form, jobPosition: e.target.value })} placeholder="سمت" />
                            </div>
                            <div>
                                <label>شماره همراه</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.phoneNumber} onChange={(e) => {
                                        if (validateNumbers(e.target.value)) {
                                            setForm({ ...form, phoneNumber: e.target.value })
                                        }
                                    }
                                    } placeholder="شماره همراه" />
                            </div>
                            <div>
                                <label>کد ملی</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.nationalCode} onChange={(e) => {
                                        if (validateNumbers(e.target.value)) {
                                            setForm({ ...form, nationalCode: e.target.value })
                                        }
                                    }
                                    } placeholder="کد ملی" />
                            </div>
                            <div>
                                <label>تاریخ شروع کار</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.startDate}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (!/^[0-9/]*$/.test(value)) return;
                                        if (value.length > 10) return;
                                        if (value.length <= 4) {
                                            if (!/^\d{0,4}$/.test(value)) return;
                                        } else if (value.length === 5) {
                                            if (!/^\d{4}\/$/.test(value)) return;
                                        } else if (value.length <= 7) {
                                            if (!/^\d{4}\/\d{0,2}$/.test(value)) return;
                                        } else if (value.length === 8) {
                                            if (!/^\d{4}\/\d{2}\/$/.test(value)) return;
                                        } else {
                                            if (!/^\d{4}\/\d{2}\/\d{0,2}$/.test(value)) return;
                                        }
                                        setForm({ ...form, startDate: e.target.value });
                                    }
                                    }
                                    placeholder="تاریخ شروع کار" />
                            </div>
                            <div>
                                <label>تاریخ شروع بیمه</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.insuranceStartDate}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (!/^[0-9/]*$/.test(value)) return;
                                        if (value.length > 10) return;
                                        if (value.length <= 4) {
                                            if (!/^\d{0,4}$/.test(value)) return;
                                        } else if (value.length === 5) {
                                            if (!/^\d{4}\/$/.test(value)) return;
                                        } else if (value.length <= 7) {
                                            if (!/^\d{4}\/\d{0,2}$/.test(value)) return;
                                        } else if (value.length === 8) {
                                            if (!/^\d{4}\/\d{2}\/$/.test(value)) return;
                                        } else {
                                            if (!/^\d{4}\/\d{2}\/\d{0,2}$/.test(value)) return;
                                        }
                                        setForm({ ...form, insuranceStartDate: e.target.value });
                                    }
                                    }
                                    placeholder="تاریخ شروع بیمه" />
                            </div>
                            <div>
                                <label>تاریخ پایان بیمه</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.insuranceEndDate}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (!/^[0-9/]*$/.test(value)) return;
                                        if (value.length > 10) return;
                                        if (value.length <= 4) {
                                            if (!/^\d{0,4}$/.test(value)) return;
                                        } else if (value.length === 5) {
                                            if (!/^\d{4}\/$/.test(value)) return;
                                        } else if (value.length <= 7) {
                                            if (!/^\d{4}\/\d{0,2}$/.test(value)) return;
                                        } else if (value.length === 8) {
                                            if (!/^\d{4}\/\d{2}\/$/.test(value)) return;
                                        } else {
                                            if (!/^\d{4}\/\d{2}\/\d{0,2}$/.test(value)) return;
                                        }
                                        setForm({ ...form, insuranceEndDate: e.target.value });
                                    }}
                                    placeholder="تاریخ پایان بیمه" />
                            </div>
                            <div>
                                <label>سوابق تحصیلی</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.educationalHistory} onChange={(e) => setForm({ ...form, educationalHistory: e.target.value })} placeholder="سوابق تحصیلی" />
                            </div>
                            <div>
                                <label>سوابق شغلی</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.careerHistory} onChange={(e) => setForm({ ...form, careerHistory: e.target.value })} placeholder="سوابق شغلی" />
                            </div>

                            <div className="flex items-center gap-2 mt-6">
                                <input
                                    type="checkbox"
                                    id="isSpecialAccess"
                                    checked={form.isSpecialAccess === true}
                                    onChange={(e) => setForm({ ...form, isSpecialAccess: e.target.checked })}
                                    className="w-4 h-4 accent-primary cursor-pointer"
                                />
                                <label htmlFor="isSpecialAccess" className="cursor-pointer">دسترسی خاص</label>
                            </div>
                        </div>

                        {/* دکمه‌ها */}
                        <div className="p-4 border-t border-boxBorderColor dark:border-boxBorderColor-dark flex justify-end gap-2">
                            <Button variant="ghost" onClick={closeAddModal}>
                                انصراف
                            </Button>
                            <Button variant="primary" onClick={handleAdd}>
                                {
                                    addLoading ?
                                        <LoaderCircle size={8} color="border-white-500" />
                                        :
                                        'ذخیره اطلاعات'
                                }
                            </Button>
                        </div>
                    </Modal.Panel>
                </div>
            </Modal>

        </div>
    );
};

export default EmployeeInfo;
