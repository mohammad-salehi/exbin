import React, { useState } from 'react'
import ExpandableTable, { Column } from "../../../ExpandableTable/ExpandableTable";
import { Modal, Button, Input } from "@heathmont/moon-core-tw";

type Person = {
    id: string;
    name?: string;
    role?: string;
    phoneNumber?: string;
    nationalCode?: string;
    startDate?: string;
    insuranceStartDate?: string;
    insuranceEndDate?: string;
    educationHistory?: string;
    careerHistory?: string;
    sharePercentage?: string;
    email?: string;
};

const EmployeeInfo = () => {
    const [data, setData] = useState<Person[]>([
        {
            id: "1",
            name: "محمد",
            startDate: "1404/04/04",
            insuranceStartDate: "1404/04/04",
            insuranceEndDate: "1404/04/04",
            role: "رئیس هیئت‌مدیره",
            phoneNumber: "09121234567",
            nationalCode: "1400765432",
            educationHistory: "لیسانس مدیریت",
            careerHistory: "۱۰ سال سابقه مدیریت",
            sharePercentage: "30",
            email: "test@test.com",
        },
        {
            id: "2",
            name: "محمد",
            startDate: "1404/04/04",
            insuranceStartDate: "1404/04/04",
            insuranceEndDate: "1404/04/04",
            role: "رئیس هیئت‌مدیره",
            phoneNumber: "09121234567",
            nationalCode: "1400765432",
            educationHistory: "لیسانس مدیریت",
            careerHistory: "۱۰ سال سابقه مدیریت",
            sharePercentage: "30",
            email: "test@test.com",
        },
    ]);

    const [form, setForm] = useState<Person>({
        id: "",
        name: "",
        role: "",
        phoneNumber: "",
        nationalCode: "",
        startDate: "",
        insuranceStartDate: "",
        insuranceEndDate: "",
        educationHistory: "",
        careerHistory: "",
        sharePercentage: "",
        email: "",
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

    const handleSave = () => {
        if (!editingId) return;
        setData((prev) =>
            prev.map((item) =>
                item.id === editingId ? { ...form, id: editingId } : item
            )
        );
        closeModal();
    };

    const columns: Column<Person>[] = [
        { header: "نام و نام‌خانوادگی", accessorKey: "name" },
        { header: "سمت", accessorKey: "role" },
        { header: "شماره همراه", accessorKey: "phoneNumber" },
        { header: "کدملی", accessorKey: "nationalCode" },
        { header: "سوابق تحصیلی", accessorKey: "educationHistory" },
        { header: "سوابق شغلی", accessorKey: "careerHistory" },
        { header: "تاریخ شروع کار", accessorKey: "startDate" },
        { header: "تاریخ شروع بیمه", accessorKey: "insuranceStartDate" },
        { header: "تاریخ پایان بیمه", accessorKey: "insuranceEndDate" },
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none" className="cursor-pointer">
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
            name: "",
            role: "",
            phoneNumber: "",
            nationalCode: "",
            startDate: "",
            insuranceStartDate: "",
            insuranceEndDate: "",
            educationHistory: "",
            careerHistory: "",
            sharePercentage: "",
            email: "",
        });
        setIsAddOpen(true);
    };

    const closeAddModal = () => setIsAddOpen(false);

    const handleAdd = () => {
        const newId = (data.length + 1).toString();
        setData((prev) => [...prev, { ...form, id: newId }]);
        closeAddModal();
    };

    return (
        <div className="mt-4">
            <div className="flex justify-between items-center mb-3">
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
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="سمت" />
                            </div>
                            <div>
                                <label>شماره همراه</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} placeholder="شماره همراه" />
                            </div>
                            <div>
                                <label>کد ملی</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.nationalCode} onChange={(e) => setForm({ ...form, nationalCode: e.target.value })} placeholder="کد ملی" />
                            </div>
                            <div>
                                <label>تاریخ شروع کار</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} placeholder="تاریخ شروع کار" />
                            </div>
                            <div>
                                <label>تاریخ شروع بیمه</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.insuranceStartDate} onChange={(e) => setForm({ ...form, insuranceStartDate: e.target.value })} placeholder="تاریخ شروع بیمه" />
                            </div>
                            <div>
                                <label>تاریخ پایان بیمه</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.insuranceEndDate} onChange={(e) => setForm({ ...form, insuranceEndDate: e.target.value })} placeholder="تاریخ پایان بیمه" />
                            </div>
                            <div>
                                <label>سوابق تحصیلی</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.educationHistory} onChange={(e) => setForm({ ...form, educationHistory: e.target.value })} placeholder="سوابق تحصیلی" />
                            </div>
                            <div>
                                <label>سوابق شغلی</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.careerHistory} onChange={(e) => setForm({ ...form, careerHistory: e.target.value })} placeholder="سوابق شغلی" />
                            </div>
                            <div>
                                <label>درصد سهام</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" type="number" value={form.sharePercentage} onChange={(e) => setForm({ ...form, sharePercentage: e.target.value })} placeholder="درصد سهام" />
                            </div>
                            <div>
                                <label>ایمیل</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ایمیل" />
                            </div>
                        </div>

                        <div className="p-4 border-t border-boxBorderColor dark:border-boxBorderColor-dark flex justify-end gap-2">
                            <Button variant="ghost" onClick={closeModal}>
                                انصراف
                            </Button>
                            <Button variant="primary" onClick={handleSave}>
                                ذخیره اطلاعات
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
                                <Input  className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="نام و نام‌خانوادگی" />
                            </div>
                            <div>
                                <label>سمت</label>
                                <Input  className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="سمت" />
                            </div>
                            <div>
                                <label>شماره همراه</label>
                                <Input  className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} placeholder="شماره همراه" />
                            </div>
                            <div>
                                <label>کد ملی</label>
                                <Input  className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.nationalCode} onChange={(e) => setForm({ ...form, nationalCode: e.target.value })} placeholder="کد ملی" />
                            </div>
                            <div>
                                <label>تاریخ شروع کار</label>
                                <Input  className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} placeholder="تاریخ شروع کار" />
                            </div>
                            <div>
                                <label>تاریخ شروع بیمه</label>
                                <Input  className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.insuranceStartDate} onChange={(e) => setForm({ ...form, insuranceStartDate: e.target.value })} placeholder="تاریخ شروع بیمه" />
                            </div>
                            <div>
                                <label>تاریخ پایان بیمه</label>
                                <Input  className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.insuranceEndDate} onChange={(e) => setForm({ ...form, insuranceEndDate: e.target.value })} placeholder="تاریخ پایان بیمه" />
                            </div>
                            <div>
                                <label>سوابق تحصیلی</label>
                                <Input  className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.educationHistory} onChange={(e) => setForm({ ...form, educationHistory: e.target.value })} placeholder="سوابق تحصیلی" />
                            </div>
                            <div>
                                <label>سوابق شغلی</label>
                                <Input  className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.careerHistory} onChange={(e) => setForm({ ...form, careerHistory: e.target.value })} placeholder="سوابق شغلی" />
                            </div>
                            <div>
                                <label>درصد سهام</label>
                                <Input  className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" type="number" value={form.sharePercentage} onChange={(e) => setForm({ ...form, sharePercentage: e.target.value })} placeholder="درصد سهام" />
                            </div>
                            <div>
                                <label>ایمیل</label>
                                <Input  className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ایمیل" />
                            </div>
                        </div>

                        {/* دکمه‌ها */}
                        <div className="p-4 border-t border-boxBorderColor dark:border-boxBorderColor-dark flex justify-end gap-2">
                            <Button variant="ghost" onClick={closeAddModal}>
                                انصراف
                            </Button>
                            <Button variant="primary" onClick={handleAdd}>
                                ذخیره
                            </Button>
                        </div>
                    </Modal.Panel>
                </div>
            </Modal>

        </div>
    );
};

export default EmployeeInfo;
