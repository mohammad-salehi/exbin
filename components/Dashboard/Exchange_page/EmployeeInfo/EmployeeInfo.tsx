import React, { useEffect, useState } from 'react'
import ExpandableTable, { Column } from "../../../ExpandableTable/ExpandableTable";
import { Modal, Button, Input } from "@heathmont/moon-core-tw";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import { GetRequest } from '../../../../functions/GetRequest';
import { LoaderCircle } from '../../../Loader/Loader';

import { validateNumbers } from '../../../../functions/Validations';

import { PostRequest } from '../../../../functions/PostRequest';
import { PutRequest } from '../../../../functions/PostRequest';
import { handlePostErrors } from '../../../../functions/handlePostErrors';
import { DeleteRequest } from '../../../../functions/GetRequest';

import Pagination from '../../../Pagination/Pagination';
import { LogViewer } from '../../../../functions/changesHandler';
import LoadingComponent from '../../../LoadingComponent/LoadingComponent';
import JalaliLocalDatePicker from '../../../DatePicker/JalaliLocalDatePicker';
import { toJalaliDate } from '../../../../functions/toJalaliDate';

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



    const [isLogOpen, setisLogOpen] = useState(false);
    const [LogNumber, setLogNumber] = useState(0);
    const [LogPage, setLogPage] = useState(0);
    const [LogLoading, setLogLoading] = useState(false);
    const [Changes, setChanges] = useState<string[]>([]);
    const [deleteLoading, SetdeleteLoading] = useState<boolean>(false)


    const openModal = (row: Person) => {
        setForm(row);
        setEditingId(row.id);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setEditingId(null);
    };

    const columns: Column<Person>[] = [
        { header: "نام و نام‌خانوادگی", accessorKey: "name" },
        { header: "سمت", accessorKey: "jobPosition" },
        { header: "شماره همراه", accessorKey: "phoneNumber" },
        { header: "کدملی", accessorKey: "nationalCode" },
        { header: "سوابق تحصیلی", accessorKey: "educationalHistory" },
        { header: "سوابق شغلی", accessorKey: "careerHistory" },
        {
            header: "تاریخ شروع کار",
            cell: (row: Person) => {
                console.log(row.startDate)
                return (
                    <span>{toJalaliDate(row.startDate)}</span> // محتوای دیگری که در صورت غیرفعال بودن دسترسی خاص می‌خواهید
                );
            },
        },
        {
            header: "تاریخ شروع بیمه",
            cell: (row: Person) => {
                return (
                    <span>{toJalaliDate(row.insuranceStartDate)}</span> // محتوای دیگری که در صورت غیرفعال بودن دسترسی خاص می‌خواهید
                );
            },
        },
        {
            header: "تاریخ پایان بیمه",
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

        {
            header: "عملیات",
            cell: (row: Person) => (
                <div
                    className="flex items-center gap-2 text-titleText dark:text-titleText-dark cursor-pointer"
                >
                    <button className="bg-gray-100 hover:bg-gray-200 dark:bg-boxColor-dark dark:hover:bg-gray-700 transition-colors px-2 py-1 rounded-md min-w-[80px]" onClick={() => openModal(row)}>
                        ویرایش
                    </button>
                    <button className="bg-gray-100 hover:bg-gray-200 dark:bg-boxColor-dark dark:hover:bg-gray-700 transition-colors px-2 py-1 rounded-md min-w-[80px]" onClick={async () => {
                        setEditingId(row.id), setisLogOpen(true)
                    }}>
                        تغییرات
                    </button>
                    <button className="bg-gray-100 hover:bg-gray-200 dark:bg-boxColor-dark dark:hover:bg-gray-700 transition-colors px-2 py-1 rounded-md min-w-[80px]"
                        onClick={() => {
                            setdeleteForm(row)
                            SetDeleteBox(true)
                        }}>
                        حذف
                    </button>
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

    // ✅ Helper functions
    const normalize = (val: any) => String(val ?? "").trim();
    const isDigits = (val: string, len?: number) => /^\d+$/.test(val) && (!len || val.length === len);
    const hasNoSpecialChars = (val: string) => /^[\u0600-\u06FFa-zA-Z0-9\s]+$/.test(val);

    // ✅ ویرایش (handleSave)
    const handleSave = async () => {
        if (!editingId) return;

        const name = normalize(form.name);
        const jobPosition = normalize(form.jobPosition);
        const phoneNumber = normalize(form.phoneNumber);
        const nationalCode = normalize(form.nationalCode);

        if (!name) return toast.error("نام و نام‌خانوادگی الزامی است", { position: "bottom-left" });
        if (!hasNoSpecialChars(name)) return toast.error("نام نباید شامل کاراکترهای خاص باشد", { position: "bottom-left" });
        if (!jobPosition) return toast.error("سمت الزامی است", { position: "bottom-left" });
        if (!/^0\d{10}$/.test(phoneNumber)) return toast.error("شماره همراه باید ۱۱ رقم و با ۰ شروع شود", { position: "bottom-left" });
        if (!isDigits(nationalCode, 10)) return toast.error("کد ملی باید دقیقاً ۱۰ رقم باشد", { position: "bottom-left" });

        const payload = {
            ...form,
            name,
            jobPosition,
            phoneNumber,
            nationalCode,
            educationalHistory: normalize(form.educationalHistory),
            careerHistory: normalize(form.careerHistory),
        };

        SetEditLoading(true);
        PutRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/employees/${editingId}`, payload)
            .then((res) => {
                toast.success("کارمند با موفقیت ویرایش شد.", { position: "bottom-left" });
                setData(prev => prev.map(p => (p.id === editingId ? { ...p, ...payload } : p)));
                closeModal();
            })
            .catch((err) => {
                handlePostErrors(err)
            })
            .finally(() => {
                SetEditLoading(false);
            })
    };

    // ✅ افزودن (handleAdd)
    const handleAdd = async () => {
        const name = normalize(form.name);
        const jobPosition = normalize(form.jobPosition);
        const phoneNumber = normalize(form.phoneNumber);
        const nationalCode = normalize(form.nationalCode);

        if (!name) return toast.error("نام و نام‌خانوادگی الزامی است", { position: "bottom-left" });
        if (!hasNoSpecialChars(name)) return toast.error("نام نباید شامل کاراکترهای خاص باشد", { position: "bottom-left" });
        if (!jobPosition) return toast.error("سمت الزامی است", { position: "bottom-left" });
        if (!/^0\d{10}$/.test(phoneNumber)) return toast.error("شماره همراه باید ۱۱ رقم و با ۰ شروع شود", { position: "bottom-left" });
        if (!isDigits(nationalCode, 10)) return toast.error("کد ملی باید دقیقاً ۱۰ رقم باشد", { position: "bottom-left" });

        const payload = {
            name,
            jobPosition,
            startDate: form.startDate || "",
            educationalHistory: normalize(form.educationalHistory),
            careerHistory: normalize(form.careerHistory),
            insuranceStartDate: form.insuranceStartDate || "",
            insuranceEndDate: form.insuranceEndDate || "",
            isSpecialAccess: !!form.isSpecialAccess,
            nationalCode,
            phoneNumber,
        };

        SetAddLoading(true);
        PostRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/employees`, payload)
            .then((res: any) => {
                toast.success("کارمند با موفقیت افزوده شد.", { position: "bottom-left" });
                const result = res?.result ?? res;
                setData(prev => [
                    ...prev,
                    {
                        ...payload,
                        id: result?.id || String(prev.length + 1),
                    },
                ]);

                closeAddModal();
            })
            .catch((err) => {
                handlePostErrors(err);
            })
            .finally(() => {
                SetAddLoading(false);
            });
    };


    const Audit = () => {
        setLogLoading(true)
        GetRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/audit/employees/${editingId}?page=${LogPage}&size=10&sort=updatedAt,DESC`)
            .then((response) => {
                setLogLoading(false)
                setChanges(response.result.content)
                setLogNumber(response.result.totalElements)
            })
            .catch((err) => {
                setLogLoading(false)
                setChanges([])
            })
    }

    useEffect(() => {
        if (isLogOpen) {
            Audit()
        }
    }, [isLogOpen, LogPage])


    const [deleteBox, SetDeleteBox] = useState(false)
    const deleteMember = async (row: Person) => {
        SetdeleteLoading(true);
        DeleteRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/employees/${row.id}`)
            .then((response) => {
                toast.success("کارمند با موفقیت حذف شد.", { position: "bottom-left" });
                setData(prevData => prevData.filter(person => person.id !== row.id));
                SetDeleteBox(false);
            })
            .catch((err) => {
                handlePostErrors(err)
            })
            .finally(() => {
                SetdeleteLoading(false);
            })
    };

    const [deleteform, setdeleteForm] = useState<Person>({
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
                            <Modal.Title className="text-lg font-bold text-titleText dark:text-titleText-dark">
                                ویرایش مشخصات کارمند
                            </Modal.Title>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label>نام و نام‌خانوادگی *</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="نام و نام‌خانوادگی" />
                            </div>

                            <div>
                                <label>سمت *</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.jobPosition} onChange={(e) => setForm({ ...form, jobPosition: e.target.value })} placeholder="سمت" />
                            </div>

                            <div>
                                <label>شماره همراه *</label>
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
                                <label>کد ملی *</label>
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
                                <div className='mt-2'>
                                    <JalaliLocalDatePicker
                                        value={form.startDate}
                                        onChange={(val) => setForm(p => ({ ...p, startDate: val !== null ? val : '' }))}
                                        placeholder=""
                                        clearable
                                        min="2000-01-01"
                                        max="2030-12-31"
                                    />
                                </div>
                            </div>

                            <div>
                                <label>تاریخ شروع بیمه</label>
                                <div className='mt-2'>
                                    <JalaliLocalDatePicker
                                        value={form.insuranceStartDate}
                                        onChange={(val) => setForm(p => ({ ...p, insuranceStartDate: val !== null ? val : '' }))}
                                        placeholder=""
                                        clearable
                                        min="2000-01-01"
                                        max="2030-12-31"
                                    />
                                </div>
                            </div>

                            <div>
                                <label>تاریخ پایان بیمه</label>
                                <div className='mt-2'>
                                    <JalaliLocalDatePicker
                                        value={form.insuranceEndDate}
                                        onChange={(val) => setForm(p => ({ ...p, insuranceEndDate: val !== null ? val : '' }))}
                                        placeholder=""
                                        clearable
                                        min="2000-01-01"
                                        max="2030-12-31"
                                    />
                                </div>
                            </div>

                            <div>
                                <label>سوابق تحصیلی</label>
                                <textarea
                                    className="w-full mt-2 pr-2 pt-2 focus:outline-none rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm border border-boxBorderColor dark:border-boxBorderColor-dark"
                                    value={form.educationalHistory} onChange={(e) => setForm({ ...form, educationalHistory: e.target.value })} placeholder="سوابق تحصیلی"
                                />
                            </div>

                            <div>
                                <label>سوابق شغلی</label>
                                <textarea
                                    className="w-full mt-2 pr-2 pt-2 focus:outline-none rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm border border-boxBorderColor dark:border-boxBorderColor-dark"
                                    value={form.careerHistory} onChange={(e) => setForm({ ...form, careerHistory: e.target.value })} placeholder="سوابق شغلی"
                                />
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
                            <Modal.Title className="text-lg font-bold text-titleText dark:text-titleText-dark">
                                افزودن کارمند جدید
                            </Modal.Title>
                        </div>

                        {/* فرم اضافه کردن */}
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label>نام و نام‌خانوادگی *</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="نام و نام‌خانوادگی" />
                            </div>
                            <div>
                                <label>سمت *</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.jobPosition} onChange={(e) => setForm({ ...form, jobPosition: e.target.value })} placeholder="سمت" />
                            </div>
                            <div>
                                <label>شماره همراه *</label>
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
                                <label>کد ملی *</label>
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
                                <div className='mt-2'>
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
                            <div>
                                <label>تاریخ شروع بیمه</label>
                                <div className='mt-2'>
                                    <JalaliLocalDatePicker
                                        value={form.insuranceStartDate}
                                        onChange={(val) => setForm(p => ({ ...p, insuranceStartDate: val !== null ? val : '' }))}
                                        placeholder=""
                                        clearable
                                        min="1900-01-01"
                                        max="2030-12-31"
                                    />
                                </div>
                            </div>
                            <div>
                                <label>تاریخ پایان بیمه</label>
                                <div className='mt-2'>
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
                            <div>
                                <label>سوابق تحصیلی</label>
                                <textarea
                                    className="w-full mt-2 pr-2 pt-2 focus:outline-none rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm border border-boxBorderColor dark:border-boxBorderColor-dark"
                                    value={form.educationalHistory} onChange={(e) => setForm({ ...form, educationalHistory: e.target.value })} placeholder="سوابق تحصیلی"
                                />
                            </div>
                            <div>
                                <label>سوابق شغلی</label>
                                <textarea
                                    className="w-full mt-2 pr-2 pt-2 focus:outline-none rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm border border-boxBorderColor dark:border-boxBorderColor-dark"
                                    value={form.careerHistory} onChange={(e) => setForm({ ...form, careerHistory: e.target.value })} placeholder="سوابق شغلی"
                                />
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

            <Modal open={isLogOpen} onClose={() => { setisLogOpen(false) }}>
                <Modal.Backdrop />
                <div className="fixed inset-0 flex z-50 backdrop-blur-sm bg-white/10">
                    <Modal.Panel className="w-full max-w-2xl rounded-lg bg-white dark:bg-bgColor-dark shadow-lg mt-[200px] text-titleText dark:text-titleText-dark p-4">
                        <h4 className="mb-2 mt-2">تغییرات مشخصات کارمند</h4>
                        {
                            LogLoading ?
                                <div className="mt-4">
                                    <LoadingComponent />
                                </div>
                                :
                                <LogViewer logs={Changes} />
                        }
                        <Pagination
                            rtl
                            totalItems={LogNumber}
                            pageSize={10}
                            currentPage={LogPage + 1}
                            onPageChange={
                                (e) => {
                                    setLogPage(e - 1)
                                }
                            }
                        />
                        <div className="flex justify-end gap-4 w-full mt-2">
                            <button
                                onClick={() => { setisLogOpen(false) }}
                                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            >
                                بستن
                            </button>
                        </div>
                    </Modal.Panel>
                </div>
            </Modal>

            {/* -------- مودال تأیید حذف -------- */}
            <Modal open={deleteBox} onClose={() => { SetDeleteBox(false) }}>
                {/* بک‌دراپ، تمام صفحه، یک لایه پایین‌تر از پنل */}
                <Modal.Backdrop className="fixed inset-0 w-screen h-screen bg-black/50 z-[2147483646]" />

                {/* کانتینر مرکزی پنل، بالاتر از بک‌دراپ */}
                <div className="fixed inset-0 z-[2147483647] flex items-center justify-center">
                    <Modal.Panel className="bg-boxColor dark:bg-bgColor-dark shadow-xl rounded-xl text-titleText dark:text-titleText-dark w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold mb-3 text-center">
                            حذف کارمند سکو
                        </h3>

                        <p className="text-sm mb-6 text-center leading-relaxed">
                            {`آیا از حذف کارمند سکو مطمئن هستید؟`}
                        </p>

                        <div className="flex justify-center gap-4 w-full">

                            <button
                                onClick={() => { deleteMember(deleteform) }}
                                className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-lg transition"
                            >
                                {
                                    deleteLoading ?
                                        'درحال حذف...'
                                        :
                                        'حذف'
                                }

                            </button>
                        </div>
                    </Modal.Panel>
                </div>
            </Modal>
        </div>
    );
};

export default EmployeeInfo;
