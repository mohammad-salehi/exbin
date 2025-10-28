import React, { useEffect, useState } from 'react'
import ExpandableTable, { Column } from "../../../ExpandableTable/ExpandableTable";
import { Modal, Button, Input } from "@heathmont/moon-core-tw";
import { GetRequest } from '../../../../functions/GetRequest';
import { useParams } from "next/navigation";
import toast from 'react-hot-toast';
import { LoaderCircle } from '../../../Loader/Loader';

import { validateEmail } from '../../../../functions/Validations';
import { validateNumbers } from '../../../../functions/Validations';
import { PostRequest } from '../../../../functions/PostRequest';
import Pagination from '../../../Pagination/Pagination';
import { LogViewer } from '../../../../functions/changesHandler';
import LoadingComponent from '../../../LoadingComponent/LoadingComponent';

type Person = {
    id: string;
    name?: string;
    phoneNumber?: string;
    nationalCode?: string;
};

type ExchangeInfoProps = {
    SetC4: React.Dispatch<React.SetStateAction<boolean>>;
};


const ExchangeAgentInfo = ({ SetC4 }: ExchangeInfoProps) => {

    const params = useParams<{ id: string }>();

    const [data, setData] = useState<Person[]>([
        { id: "1", name: "محمد", phoneNumber: "09121234567", nationalCode: "1400765432" },
        { id: "2", name: "علی", phoneNumber: "09351234567", nationalCode: "1400123456" },
        { id: "3", name: "رضا", phoneNumber: "09221234567", nationalCode: "1400987654" },
    ]);

    const [form, setForm] = useState<Person>({
        id: "",
        name: "",
        phoneNumber: "",
        nationalCode: "",
    });

    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editLoading, SetEditLoading] = useState<boolean>(false)
    const [addLoading, SetAddLoading] = useState<boolean>(false)


    const [isLogOpen, setisLogOpen] = useState(false);
    const [LogNumber, setLogNumber] = useState(0);
    const [LogPage, setLogPage] = useState(0);
    const [LogLoading, setLogLoading] = useState(false);
    const [Changes, setChanges] = useState<string[]>([]);


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

        const memberInfo = {
            name: form.name !== null ? form.name : "",
            phoneNumber: form.phoneNumber !== null ? form.phoneNumber : "",
            nationalCode: form.nationalCode !== null ? form.nationalCode : "",
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
            const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/api/exchanges/${params.id}/exchange-agents/${editingId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(memberInfo),

            });

            if (!response.ok) {

                // setLoading(false)
                SetEditLoading(false)
                return toast.error(`خطا در ویرایش نماینده سکو`);
            } else {
                const responseData = await response.json();
                console.log(responseData);
                SetEditLoading(false)
                toast.success("نماینده سکو با موفقیت ویرایش شد.", { position: "bottom-left" });
            }

        } catch (err) {
            console.error(err);
            SetEditLoading(false)
            return toast.error(`خطا در ذخیره نماینده سکو`);
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
        { header: "شماره همراه", accessorKey: "phoneNumber" },
        { header: "کدملی", accessorKey: "nationalCode" },
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
                            setdeleteForm(row)
                            SetDeleteBox(true)
                        }}
                    >
                        <path d="M21.5 5.97998C18.17 5.64998 14.82 5.47998 11.48 5.47998C9.5 5.47998 7.52 5.57998 5.54 5.77998L3.5 5.97998" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M9 4.97L9.22 3.66C9.38 2.71 9.5 2 11.19 2H13.81C15.5 2 15.63 2.75 15.78 3.67L16 4.97" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M19.3504 9.14014L18.7004 19.2101C18.5904 20.7801 18.5004 22.0001 15.7104 22.0001H9.29039C6.50039 22.0001 6.41039 20.7801 6.30039 19.2101L5.65039 9.14014" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10.8301 16.5H14.1601" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 12.5H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>

                    <svg onClick={() => { setEditingId(row.id), setisLogOpen(true) }} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex items-center gap-2 text-titleText dark:text-titleText-dark cursor-pointer">
                        <path d="M5.06152 12C5.55362 8.05369 8.92001 5 12.9996 5C17.4179 5 20.9996 8.58172 20.9996 13C20.9996 17.4183 17.4179 21 12.9996 21H8M13 13V9M11 3H15M3 15H8M5 18H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            ),
        },
    ];

    const [isAddOpen, setIsAddOpen] = useState(false);

    const openAddModal = () => {
        setForm({ id: "", name: "", phoneNumber: "", nationalCode: "" });
        setIsAddOpen(true);
    };

    const closeAddModal = () => setIsAddOpen(false);

    const handleAdd = async () => {
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

        const Member = {
            name: form.name,
            nationalCode: form.nationalCode,
            phoneNumber: form.phoneNumber,
        };

        try {
            SetAddLoading(true);

            const newResponse = await PostRequest(
                `${process.env.NEXT_PUBLIC_API_URL ?? "https://sand-em-api.bahfara.ir"}/api/exchanges/${params.id}/exchange-agents`,
                Member
                // JSON ارسال می‌کنیم؛ نیازی به asFormData نیست
            );

            toast.success("نماینده سکو باموفقیت افزوده شد.", { position: "bottom-left" });
            setData(prev => [...prev, { ...form, id: newResponse.result.id }]);
            closeAddModal();
        } catch (e: any) {
            toast.error(e?.message || "خطا در ذخیره نماینده سکو", { position: "bottom-left" });
        } finally {
            SetAddLoading(false);
        }
    };

    useEffect(() => {
        GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/exchanges/${params.id}/exchange-agents`)
            .then((response) => {
                const getData = (response.result.content)
                setData(getData)
                SetC4(true)
            })
            .catch((err) => {
                console.log(err)
                SetC4(true)
            })
    }, [])

    const Audit = () => {
        setLogLoading(true)
        GetRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/audit/exchange-agents/${editingId}?page=${LogPage}&size=10&sort=updatedAt,DESC`)
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
            const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/api/exchanges/${params.id}/exchange-agents/${row.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                console.log(response)
                // setLoading(false)
                return toast.error(`خطا در حذف نماینده سکو`);
            } else {
                const responseData = await response.json();
                console.log(responseData);
                toast.success("نماینده سکو با موفقیت حذف شد.", { position: "bottom-left" });
                setData((prevData) => prevData.filter(person => person.id !== row.id));
                SetDeleteBox(false)
            }

        } catch (err) {
            console.error(err);
            return toast.error(`خطا در ذخیره نماینده سکو`);
        }
    }
    const [deleteform, setdeleteForm] = useState<Person>({
        id: "",
        name: "",
        phoneNumber: "",
        nationalCode: "",
    });
    return (
        <div className="mt-4">
            <div className="flex justify-between items-center mt-2">
                <h5 className="font-bold text-lg text-titleText dark:text-titleText-dark mb-2">
                    مشخصات نمایندگان سکو
                </h5>
                <div className="flex justify-end mb-3">
                    <Button variant="primary" onClick={openAddModal} className='text-primary dark:text-primary-dark border border-primary rounded-md'>
                        افزودن نماینده جدید
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
                    <Modal.Panel className="w-full max-w-md rounded-lg bg-white dark:bg-bgColor-dark shadow-lg mt-[200px] text-titleText dark:text-titleText-dark">
                        <div className="p-4 border-b border-boxBorderColor dark:border-boxBorderColor-dark">
                            <Modal.Title className="text-lg font-bold text-titleText dark:text-titleText-dark">
                                ویرایش مشخصات نماینده سکو
                            </Modal.Title>
                        </div>
                        <div className="p-4 grid grid-cols-1 gap-4">
                            <div>
                                <label>نام و نام‌خانوادگی</label>
                                <Input

                                    className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
      bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
      shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="نام و نام‌خانوادگی"
                                />
                            </div>
                            <div>
                                <label>شماره همراه</label>
                                <Input

                                    className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
      bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
      shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark"
                                    value={form.phoneNumber}
                                    onChange={(e) => {
                                        if (validateNumbers(e.target.value)) {
                                            setForm({ ...form, phoneNumber: e.target.value })
                                        }
                                    }
                                    }
                                    placeholder="شماره همراه"
                                />
                            </div>
                            <div>
                                <label>کد ملی</label>
                                <Input

                                    className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
      bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
      shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark"
                                    value={form.nationalCode}
                                    onChange={(e) => {
                                        if (validateNumbers(e.target.value)) {
                                            setForm({ ...form, nationalCode: e.target.value })
                                        }
                                    }
                                    }
                                    placeholder="کد ملی"
                                />
                            </div>
                        </div>

                        <div className="p-4 border-t flex justify-end gap-2 border-boxBorderColor dark:border-boxBorderColor-dark">
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
                    <Modal.Panel className="w-full max-w-md rounded-lg bg-white dark:bg-bgColor-dark shadow-lg mt-[200px] text-titleText dark:text-titleText-dark">
                        <div className="p-4 border-b border-boxBorderColor dark:border-boxBorderColor-dark">
                            <Modal.Title className="text-lg font-bold text-titleText dark:text-titleText-dark">
                                افزودن نماینده جدید
                            </Modal.Title>
                        </div>
                        <div className="p-4 grid grid-cols-1 gap-4">
                            <div>
                                <label>نام و نام‌خانوادگی</label>
                                <Input className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
      bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
      shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="نام و نام‌خانوادگی" />
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
                        </div>
                        <div className="p-4 border-t flex justify-end gap-2 border-boxBorderColor dark:border-boxBorderColor-dark">
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
                        <h4 className="mb-2 mt-2">تغییرات مشخصات عضو هیئت‌مدیره</h4>
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
                            حذف نماینده سکو
                        </h3>

                        <p className="text-sm mb-6 text-center leading-relaxed">
                            {`آیا از حذف نماینده سکو مطمئن هستید؟`}
                        </p>

                        <div className="flex justify-center gap-4 w-full">

                            <button
                                onClick={() => { deleteMember(deleteform) }}
                                className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-lg transition"
                            >
                                {
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

export default ExchangeAgentInfo;
