import React, { useEffect, useState } from 'react'
import ExpandableTable, { Column } from "../../../../components/ExpandableTable/ExpandableTable";
import { Modal, Button, Input } from "@heathmont/moon-core-tw";
import { GetRequest } from '../../../../functions/GetRequest';
import { useParams } from "next/navigation";
import toast from 'react-hot-toast';
import { LoaderCircle } from '../../../Loader/Loader';

import { validateEmail } from '../../../../functions/Validations';
import { validateNumbers } from '../../../../functions/Validations';
import Pagination from '../../../Pagination/Pagination';
import { LogViewer } from '../../../../functions/changesHandler';
import LoadingComponent from '../../../LoadingComponent/LoadingComponent';

type Person = {
    id: string;
    name: string;
    phoneNumber: string;
    nationalCode: string;
    educationalHistory: string;
    careerHistory: string;
    sharePercentage: string;
    email: string;
};


type ExchangeInfoProps = {
    SetC2: React.Dispatch<React.SetStateAction<boolean>>;
};

const CeoDetail = ({ SetC2 }: ExchangeInfoProps) => {
    const params = useParams<{ id: string }>();

    const [data, setData] = useState<Person[]>([]);

    const [form, setForm] = useState<Person>({
        id: "",
        name: "",
        phoneNumber: "",
        nationalCode: "",
        educationalHistory: "",
        careerHistory: "",
        sharePercentage: "",
        email: "",
    });

    const [isOpen, setIsOpen] = useState(false);
    const [Loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [isLogOpen, setisLogOpen] = useState(false);
    const [LogNumber, setLogNumber] = useState(0);
    const [LogPage, setLogPage] = useState(0);
    const [LogLoading, setLogLoading] = useState(false);
    const [Changes, setChanges] = useState<string[]>([]);

    const openModal = (row: Person) => {
        console.log(row)
        setForm(row);
        setEditingId(row.id);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setEditingId(null);
    };

    const handleSave = () => {
        if (editingId || data.length === 0) {

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
            if (!validateEmail(form.email) && form.email !== '') {
                toast.error("ایمیل مورد نظر را به درستی وارد کنید", { position: "bottom-left" });
                return;
            }

            const updatedForm = {
                ...form,
                educationalHistory: form.educationalHistory || "", // اگر خالی بود، "" قرار بده
                careerHistory: form.careerHistory || "",
                sharePercentage: form.sharePercentage || "0", // مثلا درصد سهام باید عدد باشد
            };

            setLoading(true)
            GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/exchanges/${params.id}`)
                .then(async (response) => {
                    let managerInfo = response.result
                    managerInfo.managerInfo = updatedForm
                    try {
                        const token = document.cookie
                            .split('; ')
                            .find(row => row.startsWith('token='))
                            ?.split('=')[1];

                        if (!token) {
                            toast.error("توکن موجود نیست، لطفاً وارد سیستم شوید.", { position: "bottom-left" });
                            return;
                        }

                        const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/api/exchanges/${params.id}`, {
                            method: 'PUT',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(managerInfo),
                        });

                        if (!response.ok) {
                            console.log(response)
                            setLoading(false)
                            return toast.error(`خطا در ذخیره مدیرعامل`);
                        } else {
                            toast.success("مشخصات مدیرعامل با موفقیت ذخیره شد.", { position: "bottom-left" });
                            setData((prev) =>
                                prev.map((item) =>
                                    item.id === editingId ? { ...form, id: editingId } : item
                                )
                            );
                            closeModal();
                            setLoading(false)
                            setIsOpen(false);
                        }

                    } catch (err) {
                        console.error(err);
                        return toast.error(`خطا در ذخیره مدیرعامل`);
                    }
                })
                .catch((err) => {
                    setLoading(false)
                })
        }

    };

    useEffect(() => {
        GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/exchanges/${params.id}`)
            .then((response) => {
                const managerInfo = response.result.managerInfo
                setData(
                    [{
                        id: managerInfo.id,
                        name: managerInfo.name,
                        phoneNumber: managerInfo.phoneNumber,
                        nationalCode: managerInfo.nationalCode,
                        educationalHistory: managerInfo.educationalHistory,
                        careerHistory: managerInfo.careerHistory,
                        sharePercentage: managerInfo.sharePercentage,
                        email: managerInfo.email
                    }]
                )
                SetC2(true)
            })
            .catch((err) => {
                SetC2(true)
            })
    }, [])

    const columns: Column<Person>[] = [
        { header: "نام و نام‌خانوادگی", accessorKey: "name" },
        { header: "شماره همراه", accessorKey: "phoneNumber" },
        { header: "کدملی", accessorKey: "nationalCode" },
        { header: "سوابق تحصیلی", accessorKey: "educationalHistory" },
        { header: "سوابق شغلی", accessorKey: "careerHistory" },
        { header: "درصد سهام", accessorKey: "sharePercentage" },
        { header: "ایمیل", accessorKey: "email" },
        {
            header: "عملیات",
            cell: (row: Person) => (
                <div
                    className="flex items-center gap-2 text-titleText dark:text-titleText-dark cursor-pointer"

                >
                    <svg
                        onClick={() => openModal(row)}
                        xmlns="http://www.w3.org/2000/svg"
                        width="25"
                        height="24"
                        viewBox="0 0 25 24"
                        fill="none"
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

                    <svg onClick={() => { setForm(row), setisLogOpen(true) }} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex items-center gap-2 text-titleText dark:text-titleText-dark cursor-pointer">
                        <path d="M5.06152 12C5.55362 8.05369 8.92001 5 12.9996 5C17.4179 5 20.9996 8.58172 20.9996 13C20.9996 17.4183 17.4179 21 12.9996 21H8M13 13V9M11 3H15M3 15H8M5 18H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            ),
        },
    ];


    const Audit = () => {
        setLogLoading(true)
        GetRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/audit/manager/${form.id}?page=${LogPage}&size=10&sort=updatedAt,DESC`)
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

    return (
        <div className="mt-4">
            <div className="flex justify-between items-center mb-3">
                <h5 className="font-bold text-lg text-titleText dark:text-titleText-dark mb-2">
                    مشخصات مدیرعامل
                </h5>
                {
                    data.length === 0 ?
                        <Button
                            variant="primary"
                            onClick={() => { setIsOpen(true) }}
                            className="text-primary dark:text-primary-dark border border-primary rounded-md"
                        >
                            افزودن مدیرعامل
                        </Button>
                        :
                        null
                }

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
                    <Modal.Panel className="w-full max-w-xl rounded-lg bg-white dark:bg-bgColor-dark shadow-lg mt-[200px] text-titleText dark:text-titleText-dark">
                        <div className="p-4 border-b border-boxBorderColor dark:border-boxBorderColor-dark">
                            <Modal.Title className="text-lg font-bold text-titleText dark:text-titleText-dark">
                                ویرایش مشخصات مدیرعامل
                            </Modal.Title>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label>نام و نام‌خانوادگی</label>
                                <Input

                                    className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
      bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
      shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark"
                                    value={form.name}
                                    onChange={(e) => { setForm({ ...form, name: e.target.value }) }}
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
                                    }}
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
                            <div>
                                <label>سوابق تحصیلی</label>
                                <textarea

                                    className=" w-full p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md pt-2 
                                bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark focus:outline-none"
                                    value={form.educationalHistory}
                                    onChange={(e) =>
                                        setForm({ ...form, educationalHistory: e.target.value })
                                    }
                                    placeholder="سوابق تحصیلی"
                                />
                            </div>
                            <div>
                                <label>سوابق شغلی</label>
                                <textarea
                                    className=" w-full p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md pt-2 
                                bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark focus:outline-none"
                                    value={form.careerHistory}
                                    onChange={(e) =>
                                        setForm({ ...form, careerHistory: e.target.value })
                                    }
                                    placeholder="سوابق شغلی"
                                />
                            </div>
                            <div>
                                <label>درصد سهام</label>
                                <Input

                                    className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
      bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
      shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark"
                                    type="number"
                                    value={form.sharePercentage}
                                    onChange={(e) => {
                                        if (validateNumbers(e.target.value)) {
                                            setForm({ ...form, sharePercentage: e.target.value })
                                        }
                                    }
                                    }
                                    placeholder="درصد سهام"
                                />
                            </div>
                            <div>
                                <label>ایمیل</label>
                                <Input

                                    className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
      bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
      shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="ایمیل"
                                />
                            </div>
                        </div>
                        <div className="p-4 border-t border-boxBorderColor dark:border-boxBorderColor-dark flex justify-end gap-2 ">
                            <Button variant="ghost" onClick={closeModal}>
                                انصراف
                            </Button>
                            <Button variant="primary" onClick={handleSave}>
                                {
                                    Loading ?
                                        <LoaderCircle size={8} color="border-white-500" />
                                        :
                                        "ذخیره اطلاعات"
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
                        <h4 className="mb-2 mt-2">تغییرات مشخصات مدیرعامل</h4>
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
        </div>
    );
};

export default CeoDetail;
