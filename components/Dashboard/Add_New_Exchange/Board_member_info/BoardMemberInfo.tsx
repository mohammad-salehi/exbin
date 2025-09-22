import React, { useState } from 'react'
import ExpandableTable, { Column } from '../../../ExpandableTable/ExpandableTable';
import { Modal, Button, Input } from "@heathmont/moon-core-tw";
import toast from 'react-hot-toast';
import { GetRequest } from '../../../../functions/GetRequest';

type Person = {
    id: string;
    name: string;
    phoneNumber: string;
    nationalCode: string;
    role: string;
    careerHistory: string,
    educationalHistory: string,
    sharePercentage: number | null,
    email: string,
};

interface GetExchangeInfoProps {
    SetStep: React.Dispatch<React.SetStateAction<number>>;
    ID: number | undefined;
}

type PersonForm = Omit<Person, "id">;

const BoardMemberInfo: React.FC<GetExchangeInfoProps> = ({ SetStep, ID }) => {

    const [form, setForm] = useState<Omit<Person, "id">>({
        name: "",
        phoneNumber: "",
        nationalCode: "",
        role: "",
        careerHistory: "",
        educationalHistory: "",
        sharePercentage: 0,
        email: "",
    });
    const [data, SetData] = useState<Person[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [Loading, setLoading] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState(false);

    const closeModal = () => setIsOpen(false);
    const openModal = () => setIsOpen(true);

    const columns: Column<Person>[] = [
        { header: "نام و نام‌خانوادگی", accessorKey: "name" },
        { header: "شماره همراه", accessorKey: "phoneNumber", align: "center", className: "tabular-nums" },
        { header: "کد ملی", accessorKey: "nationalCode", align: "center", className: "tabular-nums" },
        { header: "سمت", accessorKey: "role", align: "center", className: "tabular-nums" },
        {
            header: "عملیات",
            cell: (row: Person) => (
                <div className="flex items-center gap-2 text-titleText dark:text-titleText-dark" >
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none" className="cursor-pointer"
                        onClick={() => {
                            setForm({
                                name: row.name,
                                phoneNumber: row.phoneNumber,
                                nationalCode: row.nationalCode,
                                role: row.role,
                                careerHistory: row.careerHistory,
                                educationalHistory: row.educationalHistory,
                                sharePercentage: row.sharePercentage,
                                email: row.email,
                            });
                            setEditingId(row.id); // مشخص کنیم داریم ویرایش می‌کنیم
                            openModal();
                        }}
                    >
                        <path d="M13.7603 3.60022L5.55034 12.2902C5.24034 12.6202 4.94034 13.2702 4.88034 13.7202L4.51034 16.9602C4.38034 18.1302 5.22034 18.9302 6.38034 18.7302L9.60034 18.1802C10.0503 18.1002 10.6803 17.7702 10.9903 17.4302L19.2003 8.74022C20.6203 7.24022 21.2603 5.53022 19.0503 3.44022C16.8503 1.37022 15.1803 2.10022 13.7603 3.60022Z" stroke="#A8A8A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12.3896 5.0498C12.8196 7.8098 15.0596 9.9198 17.8396 10.1998" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M3.5 22H21.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            ),
        },
    ];

    const handleChange = <K extends keyof PersonForm>(field: K, value: PersonForm[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (!form.name.trim() || !form.phoneNumber.trim() || !form.nationalCode.trim()) {
            toast.error("نام، شماره همراه و کد ملی الزامی هستند", { position: "bottom-left" });
            return;
        }

        if (form.sharePercentage !== null && (form.sharePercentage < 0 || form.sharePercentage > 100)) {
            toast.error("درصد سهام باید بین ۰ تا ۱۰۰ باشد", { position: "bottom-left" });
            return;
        }

        if (editingId) {
            // 🟢 ویرایش
            SetData(data.map(member =>
                member.id === editingId ? { ...member, ...form } : member
            ));
        } else {
            // 🟢 افزودن جدید
            const newMember: Person = {
                id: String(data.length + 1),
                ...form,
            };
            SetData([...data, newMember]);
        }

        closeModal();
        setEditingId(null); // بعد از ذخیره ریست می‌کنیم
        setForm({
            name: "",
            phoneNumber: "",
            nationalCode: "",
            role: "",
            careerHistory: "",
            educationalHistory: "",
            sharePercentage: null,
            email: "",
        });
    };

    const nextStep = async () => {

        const getData = []
        for (let i = 0; i < data.length; i++) {
            getData.push(
                {
                    name: data[i].name,
                    phoneNumber: data[i].phoneNumber,
                    nationalCode: data[i].nationalCode,
                    role: data[i].role,
                    careerHistory: data[i].careerHistory,
                    educationalHistory: data[i].educationalHistory,
                    sharePercentage: data[i].sharePercentage,
                    email: data[i].email,
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
            const response = await fetch(`https://sand-em-api.bahfara.ir/api/exchanges/${ID}/board-members`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(getData),
            });

            if (!response.ok) {
                setLoading(false)
                return toast.error(`خطا در ذخیره اعضای هیئت‌مدیره`);
            }
            const responseData = await response.json();
            console.log(responseData);
            toast.success("اعضای هیئت‌مدیره با موفقیت ذخیره شدند.", { position: "bottom-left" });
            setLoading(false)
            SetStep(4)
        } catch (err) {
            console.error(err);
            return toast.error(`خطا در ذخیره اعضای هیئت‌مدیره`);
        }
    }

    return (
        <div className='mt-4'>
            {/* تیتر و دکمه */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch gap-4">
                <h5 className='font-bold text-lg text-titleText dark:text-titleText-dark'>
                    مشخصات اعضای هیئت‌مدیره
                </h5>
                <button className='text-primary border border-primary px-4 py-2 rounded-md' onClick={openModal}>
                    افزودن عضو جدید
                </button>
            </div>

            {/* جدول */}
            <div className='mt-4'>
                <ExpandableTable<Person>
                    rowDetailsMode="row"
                    rowDetailsClassName="rounded-xl p-3"
                    data={data}
                    columns={columns}
                />
            </div>
            <div className="relative w-full mt-4 ">
                <div className="flex justify-between items-center">
                    <div className="text-sm text-titleText dark:text-titleText-dark"></div>

                    <div className="text-sm text-titleText dark:text-titleText-dark">
                        <button className="w-36 bg-primary h-[48px] rounded-lg text-white shadow-lg" onClick={() => {
                            nextStep()
                        }}>
                            صفحه بعد
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
                                {editingId ? "ویرایش عضو" : "افزودن عضو جدید"}
                            </Modal.Title>
                        </div>

                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label>نام و نام‌خانوادگی</label>
                                <Input className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder='نام و نام‌خانوادگی' />
                            </div>
                            <div>
                                <label>شماره همراه</label>
                                <Input className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.phoneNumber} onChange={(e) => handleChange("phoneNumber", e.target.value)} placeholder='شماره همراه' />
                            </div>
                            <div>
                                <label>کد ملی</label>
                                <Input className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.nationalCode} onChange={(e) => handleChange("nationalCode", e.target.value)} placeholder='کد ملی' />
                            </div>
                            <div>
                                <label>نقش</label>
                                <Input className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.role} onChange={(e) => handleChange("role", e.target.value)} placeholder='نقش' />
                            </div>
                            <div>
                                <label>سوابق تحصیلی</label>
                                <textarea className="w-full p-0 pt-2 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark  focus:outline-none" value={form.educationalHistory} onChange={(e) => handleChange("educationalHistory", e.target.value)} placeholder='سوابق تحصیلی' />
                            </div>
                            <div>
                                <label>سوابق شغلی</label>
                                <textarea className="w-full p-0 pt-2 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark  focus:outline-none" value={form.careerHistory} onChange={(e) => handleChange("careerHistory", e.target.value)} placeholder='سوابق شغلی' />
                            </div>
                            <div>
                                <label>درصد سهام</label>
                                <Input
                                    className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
             bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
             shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark"
                                    type="number"
                                    value={form.sharePercentage !== null && form.sharePercentage !== undefined
                                        ? form.sharePercentage
                                        : ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        handleChange(
                                            "sharePercentage",
                                            value === "" ? null : Number(value)
                                        );
                                    }}
                                    placeholder="درصد سهام"
                                />

                            </div>
                            <div>
                                <label>ایمیل</label>
                                <Input className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.email} onChange={(e) => handleChange("email", e.target.value)} placeholder='ایمیل' />
                            </div>
                        </div>

                        <div className="p-4 border-t border-boxBorderColor dark:border-boxBorderColor-dark flex justify-end gap-2">
                            <Button variant="ghost" onClick={closeModal}>انصراف</Button>
                            <Button onClick={handleSave}>
                                {editingId ? "ذخیره تغییرات" : "ذخیره"}
                            </Button>
                        </div>
                    </Modal.Panel>
                </div>
            </Modal>
        </div>
    )
}

export default BoardMemberInfo
