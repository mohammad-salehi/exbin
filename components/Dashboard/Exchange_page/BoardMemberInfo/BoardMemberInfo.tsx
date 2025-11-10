

import React, { useEffect, useState } from 'react'
import ExpandableTable, { Column } from "../../../ExpandableTable/ExpandableTable";
import { Modal, Button, Input, Dropdown, MenuItem } from "@heathmont/moon-core-tw";
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

import { BoardmemderRoleTypes } from '../../../../functions/BoardmemberRoleTypes';
import { ControlsChevronDown } from '@heathmont/moon-icons-tw';
import { refreshTokenOnly } from '../../../../functions/TokenRefresh';

type Person = {
    id: string;
    name: string;
    role: string;
    phoneNumber: string;
    nationalCode: string;
    educationalHistory: string;
    careerHistory: string;
    sharePercentage: string;
    email: string;
};

type ExchangeInfoProps = {
    SetC3: React.Dispatch<React.SetStateAction<boolean>>;
};


const BoardMemberTable = ({ SetC3 }: ExchangeInfoProps) => {
    const params = useParams<{ id: string }>();

    const [form, setForm] = useState<Person>({
        id: "",
        name: "",
        phoneNumber: "",
        nationalCode: "",
        role: "",
        careerHistory: "",
        educationalHistory: "",
        sharePercentage: "",
        email: "",
    });

    const [isOpen, setIsOpen] = useState(false);
    const [editLoading, SetEditLoading] = useState<boolean>(false)
    const [addLoading, SetAddLoading] = useState<boolean>(false)
    const [deleteLoading, SetdeleteLoading] = useState<boolean>(false)

    const [isLogOpen, setisLogOpen] = useState(false);
    const [LogNumber, setLogNumber] = useState(0);
    const [LogPage, setLogPage] = useState(0);
    const [LogLoading, setLogLoading] = useState(false);
    const [Changes, setChanges] = useState<string[]>([]);


    const closeModal = () => setIsOpen(false);
    const openModal = () => {
        setIsOpen(true)
    };

    const [data, setData] = useState<Person[]>([]);

    const [editingId, setEditingId] = useState<string | null>(null);

    const handleEdit = (row: Person) => {
        setForm(row);
        setEditingId(row.id);
        openModal();
    };

    const columns: Column<Person>[] = [
        { header: "نام و نام‌خانوادگی", accessorKey: "name" },
        {
            header: "سمت",
            cell: (row: Person) => (
                <div
                    className="flex items-center gap-2 text-titleText dark:text-titleText-dark"
                >
                    {BoardmemderRoleTypes.find(item => item.value === row.role)?.label}
                </div>
            ),
        },
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
                    className="flex items-center gap-2 text-titleText dark:text-titleText-dark"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="25"
                        height="24"
                        viewBox="0 0 25 24"
                        fill="none"
                        className="cursor-pointer"
                        onClick={() => handleEdit(row)}

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
                        <path d="M5.06152 12C5.55362 8.05369 8.92001 5 12.9996 5C17.4179 5 20.9996 8.58172 20.9996 13C20.9996 17.4183 17.4179 21 12.9996 21H8M13 13V9M11 3H15M3 15H8M5 18H10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>
            ),
        }
    ];

    const [isAddOpen, setIsAddOpen] = useState(false);
    const openAddModal = () => {
        setForm({
            id: "",
            name: "",
            phoneNumber: "",
            nationalCode: "",
            role: "",
            careerHistory: "",
            educationalHistory: "",
            sharePercentage: "",
            email: "",
        });
        setIsAddOpen(true);
    };
    const closeAddModal = () => setIsAddOpen(false);


    useEffect(() => {
        GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/exchanges/${params.id}/board-members`)
            .then((response) => {
                const getData = (response.result.content)
                setData(getData)
                SetC3(true)
            })
            .catch((err) => {
                console.log(err)
                SetC3(true)

            })
    }, [])


    const Audit = () => {
        setLogLoading(true)
        GetRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/audit/board-members/${editingId}?page=${LogPage}&size=10&sort=updatedAt,DESC`)
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
        SetdeleteLoading(true)
        try {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('token='))
                ?.split('=')[1];

            if (!token) {
                toast.error("توکن موجود نیست، لطفاً وارد سیستم شوید.", { position: "bottom-left" });
                SetdeleteLoading(false)
                return;
            }

            // setLoading(true)
            const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/api/exchanges/${params.id}/board-members/${row.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                console.log(response)
                SetdeleteLoading(false)
                // setLoading(false)
                return toast.error(`خطا در حذف عضو هیئت‌مدیره و سهامداران`);
            } else {
                toast.success("عضو هیئت‌مدیره و سهامداران با موفقیت حذف شد.", { position: "bottom-left" });
                setData((prevData) => prevData.filter(person => person.id !== row.id));
                SetdeleteLoading(false)
                SetDeleteBox(false)
            }

        } catch (err) {
            console.error(err);
            return toast.error(`خطا در حذف عضو هیئت‌مدیره و سهامداران`);
        }
    }
    const [deleteform, setdeleteForm] = useState<Person>({
        id: "",
        name: "",
        phoneNumber: "",
        nationalCode: "",
        role: "",
        careerHistory: "",
        educationalHistory: "",
        sharePercentage: "",
        email: "",
    });


    const normalize = (val: any) => String(val ?? "").trim();
    const isDigits = (val: string, len?: number) => /^\d+$/.test(val) && (!len || val.length === len);
    const hasNoSpecialChars = (val: string) => /^[\u0600-\u06FFa-zA-Z0-9\s]+$/.test(val);

    const handleSave = async () => {
        if (!editingId) return;

        const name = normalize(form.name);
        const phoneNumber = normalize(form.phoneNumber);
        const nationalCode = normalize(form.nationalCode);
        const role = normalize(form.role);
        const email = normalize(form.email);
        const sharePercentage = Number(form.sharePercentage ?? 0);

        // ✅ ولیدیشن‌ها
        if (!name) return toast.error("نام و نام‌خانوادگی الزامی است", { position: "bottom-left" });
        if (!hasNoSpecialChars(name)) return toast.error("نام نباید شامل کاراکترهای خاص باشد", { position: "bottom-left" });
        if (!/^0\d{10}$/.test(phoneNumber)) return toast.error("شماره همراه باید ۱۱ رقم و با ۰ شروع شود", { position: "bottom-left" });
        if (!isDigits(nationalCode, 10)) return toast.error("کد ملی باید دقیقاً ۱۰ رقم باشد", { position: "bottom-left" });
        if (!role) return toast.error("سمت یا نقش الزامی است", { position: "bottom-left" });
        if (isNaN(sharePercentage)) {
            return toast.error("درصد سهام را به‌درستی وارد کنید", { position: "bottom-left" });
        }
        if (sharePercentage < 0 || sharePercentage > 100) {
            return toast.error("درصد سهام باید بین ۰ تا ۱۰۰ باشد", { position: "bottom-left" });
        }
        if (email && !validateEmail(email)) return toast.error("ایمیل را به‌درستی وارد کنید", { position: "bottom-left" });

        const payload = {
            name,
            phoneNumber,
            nationalCode,
            role,
            educationalHistory: normalize(form.educationalHistory),
            careerHistory: normalize(form.careerHistory),
            sharePercentage,
            email,
        };

        SetEditLoading(true);
        try {
            const token = document.cookie.split("; ").find(r => r.startsWith("token="))?.split("=")[1];
            if (!token) throw new Error("توکن یافت نشد");
        
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/board-members/${editingId}`,
              {
                method: "PUT",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
              }
            );
        
            // ⛔️ اول 403
            if (res.status === 403) {
              await refreshTokenOnly();
              SetEditLoading(false);
            }
        
            const dataRes = await res.json();
        
            // ✅ هندل خطا
            if (!res.ok) {
              if (res.status === 400 || res.status === 409) {
                if (dataRes?.result) {
                  Object.entries(dataRes.result).forEach(([_, msg]) =>
                    toast.error(String(msg), { position: "bottom-left" })
                  );
                  return;
                }
                if (dataRes?.error) {
                  const match = dataRes.error.match(/identifier:\s*(\w+):\s*([\w-]+)/);
                  if (match) {
                    const [, field, value] = match;
                    toast.error(`${field} با مقدار ${value} قبلاً ثبت شده است.`, { position: "bottom-left" });
                  } else {
                    toast.error(dataRes.error, { position: "bottom-left" });
                  }
                  return;
                }
              }
              throw new Error("خطا در ذخیره اطلاعات عضو هیئت‌مدیره و سهامداران");
            }
        
            // ✅ موفق
            toast.success("عضو هیئت‌مدیره و سهامداران با موفقیت ویرایش شد.", { position: "bottom-left" });
            setData(prev =>
              prev.map(item => (item.id === editingId ? { ...form, id: editingId } : item))
            );
            closeModal();
          } catch (err: any) {
            toast.error(err.message || "خطا در ارتباط با سرور", { position: "bottom-left" });
          } finally {
            SetEditLoading(false);
          }
    };

    const handleAdd = async () => {
        const name = normalize(form.name);
        const phoneNumber = normalize(form.phoneNumber);
        const nationalCode = normalize(form.nationalCode);
        const role = normalize(form.role);
        const email = normalize(form.email);
        // ولیدیشن‌ها...
        if (!name) return toast.error("نام و نام‌خانوادگی الزامی است", { position: "bottom-left" });
        if (!/^0\d{10}$/.test(phoneNumber)) return toast.error("شماره همراه باید ۱۱ رقم و با ۰ شروع شود", { position: "bottom-left" });
        if (!isDigits(nationalCode, 10)) return toast.error("کد ملی باید دقیقاً ۱۰ رقم باشد", { position: "bottom-left" });
        if (!role) return toast.error("سمت یا نقش الزامی است", { position: "bottom-left" });
        const sharePercentageNum = parseFloat(String(form.sharePercentage ?? "").trim());
        if (isNaN(sharePercentageNum)) {
            return toast.error("درصد سهام را به‌درستی وارد کنید", { position: "bottom-left" });
        }
        if (sharePercentageNum < 0 || sharePercentageNum > 100) {
            return toast.error("درصد سهام باید بین ۰ تا ۱۰۰ باشد", { position: "bottom-left" });
        }
        if (email && !validateEmail(email)) return toast.error("ایمیل را به‌درستی وارد کنید", { position: "bottom-left" });

        const roleValue =
            BoardmemderRoleTypes.find((item) => item.label === role)?.value ?? "";

        const payload: Omit<Person, "id"> = {
            name,
            phoneNumber,
            nationalCode,
            role: roleValue,
            educationalHistory: normalize(form.educationalHistory),
            careerHistory: normalize(form.careerHistory),
            sharePercentage: String(sharePercentageNum),
            email,
        };

        SetAddLoading(true);
        try {
            const token = document.cookie.split("; ").find((r) => r.startsWith("token="))?.split("=")[1];
            if (!token) throw new Error("توکن یافت نشد");
        
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/board-members`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  ...payload,
                  sharePercentage: sharePercentageNum, // بک‌اندت اینو عدد میخواد
                }),
              }
            );
        
            // ⛔️ اول 403
            if (res.status === 403) {
              await refreshTokenOnly();
              SetAddLoading(false);
            }
        
            const dataRes = await res.json();
        
            if (!res.ok) {
              // اگه دوست داری اینجا هم 400/409 رو مثل بالا ریزتر هندل کن
              throw new Error(dataRes?.error || "خطا در افزودن عضو هیئت‌مدیره و سهامداران");
            }
        
            setData((prev) => [
              ...prev,
              {
                ...payload,
                id: dataRes.result?.id ?? String(prev.length + 1),
              },
            ]);
        
            closeAddModal();
            toast.success("عضو هیئت‌مدیره و سهامداران با موفقیت افزوده شد.", {
              position: "bottom-left",
            });
          } catch (err: any) {
            toast.error(err.message || "خطا در ارتباط با سرور", { position: "bottom-left" });
          } finally {
            SetAddLoading(false);
          }
    };


    return (
        <div className='mt-4'>
            <div className="flex justify-between items-center mb-3">
                <h5 className="font-bold text-lg text-titleText dark:text-titleText-dark">
                    مشخصات اعضای هیئت‌مدیره و سهامداران
                </h5>
                <Button
                    variant="primary"
                    onClick={openAddModal}
                    className="text-primary dark:text-primary-dark border border-primary rounded-md"
                >
                    افزودن عضو جدید
                </Button>
            </div>
            <ExpandableTable<Person>
                data={data}
                columns={columns}
                rowDetailsMode="row"
                rowDetailsClassName="rounded-xl p-3"
            />

            <Modal open={isOpen} onClose={closeModal}>
                <Modal.Backdrop />
                <div className="fixed inset-0 flex z-50 backdrop-blur-sm bg-white/10">
                    <Modal.Panel className="w-full max-w-xl rounded-lg bg-white dark:bg-bgColor-dark shadow-lg mt-[200px] text-titleText dark:text-titleText-dark">
                        <div className="p-4 border-b border-boxBorderColor dark:border-boxBorderColor-dark">
                            <Modal.Title className="text-lg font-bold text-titleText dark:text-titleText-dark">
                                ویرایش عضو هیئت‌مدیره و سهامداران
                            </Modal.Title>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label>نام و نام‌خانوادگی *</label>
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
                                <label>شماره همراه *</label>
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
                                <label>کد ملی *</label>
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
                                <label>نقش *</label>
                                <div className="relative w-full mt-2">
                                    <Dropdown onChange={(e) => { if (typeof (e) === 'string') { setForm({ ...form, role: e }) } }} value={form.role}>
                                        <Dropdown.Trigger className="w-full">
                                            <Button
                                                as="span"
                                                role="button"
                                                variant="ghost"
                                                className="flex items-center justify-between w-full pl-10  py-2 
                   text-gray-700 border border-gray-300 
                   rounded-lg dark:border-buttonBorderColor-dark focus:outline-none 
                   dark:text-gray-100 appearance-none relative bg-boxColor dark:bg-boxColor-dark"
                                            >
                                                <span>{form.role !== "" ? BoardmemderRoleTypes.find(item => item.value === form.role)?.label : "انتخاب"}</span>
                                            </Button>
                                        </Dropdown.Trigger>

                                        <Dropdown.Options
                                            className="absolute left-0 mt-2 w-72 pl-2 pr-2
                 text-gray-700 bg-white dark:bg-buttonColor-dark
                 border border-gray-300 dark:border-buttonBorderColor-dark 
                 rounded-lg dark:text-gray-100 appearance-none z-50
                 max-h-60 overflow-y-auto"
                                        >
                                            {
                                                BoardmemderRoleTypes.map((item, index) => {
                                                    return (
                                                        <Dropdown.Option value={item.value} key={`option${index}`}>
                                                            {({ selected, active }) => (
                                                                <MenuItem isActive={active} isSelected={selected}
                                                                    className={`border mt-2 mb-1 rounded-md border-gray-100 dark:border-buttonBorderColor-dark ${form.role === item.value
                                                                        ? "bg-gray-100 border-gray-200 dark:bg-gray-700"
                                                                        : ""
                                                                        }`}
                                                                >
                                                                    <MenuItem.Title>{item.label}</MenuItem.Title>
                                                                </MenuItem>
                                                            )}
                                                        </Dropdown.Option>
                                                    )
                                                })
                                            }
                                        </Dropdown.Options>
                                    </Dropdown>

                                    {/* فلش سمت راست */}
                                    <ControlsChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-titleText dark:text-titleText-dark pointer-events-none" />

                                </div>
                            </div>

                            <div>
                                <label>سوابق تحصیلی</label>
                                <textarea
                                    className="w-full p-0 pt-2 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
      bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
      shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark focus:outline-none"
                                    value={form.educationalHistory}
                                    onChange={(e) => setForm({ ...form, educationalHistory: e.target.value })}
                                    placeholder="سوابق تحصیلی"
                                />
                            </div>

                            <div>
                                <label>سوابق شغلی</label>
                                <textarea
                                    className="w-full p-0 pt-2 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
      bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
      shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark focus:outline-none"
                                    value={form.careerHistory}
                                    onChange={(e) => setForm({ ...form, careerHistory: e.target.value })}
                                    placeholder="سوابق شغلی"
                                />
                            </div>

                            <div>
                                <label>درصد سهام *</label>
                                <Input
                                    className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark"
                                    type="text"
                                    value={form.sharePercentage}
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        // اجازه خالی
                                        if (value === "") {
                                            setForm({ ...form, sharePercentage: "" });
                                            return;
                                        }

                                        // فقط عدد + یک اعشار
                                        const decimalRegex = /^\d*\.?\d*$/;
                                        if (decimalRegex.test(value)) {
                                            setForm({ ...form, sharePercentage: value });
                                        }
                                    }}
                                    placeholder="درصد سهام"
                                />
                            </div>

                            <div>
                                <label>ایمیل</label>
                                <Input
                                    style={{ direction: 'ltr' }}
                                    className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
      bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
      shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="ایمیل"
                                />
                            </div>

                        </div>
                        <div className="p-4 border-t border-boxBorderColor dark:border-boxBorderColor-dark flex justify-end gap-2">
                            <Button variant="ghost" onClick={closeModal}>
                                انصراف
                            </Button>
                            <Button variant="ghost" onClick={handleSave}>
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
                    <Modal.Panel className="w-full max-w-xl rounded-lg bg-white dark:bg-bgColor-dark shadow-lg mt-[200px] text-titleText dark:text-titleText-dark">
                        <div className="p-4 border-b border-boxBorderColor dark:border-boxBorderColor-dark">
                            <Modal.Title className="text-lg font-bold text-titleText dark:text-titleText-dark">
                                افزودن عضو جدید هیئت‌مدیره و سهامداران
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
                                <label>نقش *</label>
                                <div className="relative w-full mt-2">
                                    <Dropdown onChange={(e) => { if (typeof (e) === 'string') { setForm({ ...form, role: e }) } }} value={form.role}>
                                        <Dropdown.Trigger className="w-full">
                                            <Button
                                                as="span"
                                                role="button"
                                                variant="ghost"
                                                className="flex items-center justify-between w-full pl-10  py-2 
                   text-gray-700 border border-gray-300 
                   rounded-lg dark:border-buttonBorderColor-dark focus:outline-none 
                   dark:text-gray-100 appearance-none relative bg-boxColor dark:bg-boxColor-dark"
                                            >
                                                <span>{form.role !== "" ? form.role : "انتخاب"}</span>
                                            </Button>
                                        </Dropdown.Trigger>

                                        <Dropdown.Options
                                            className="absolute left-0 mt-2 w-72 pl-2 pr-2
                 text-gray-700 bg-white dark:bg-buttonColor-dark
                 border border-gray-300 dark:border-buttonBorderColor-dark 
                 rounded-lg dark:text-gray-100 appearance-none z-50
                 max-h-60 overflow-y-auto"
                                        >
                                            {
                                                BoardmemderRoleTypes.map((item, index) => {
                                                    return (
                                                        <Dropdown.Option value={item.label} key={`option${index}`}>
                                                            {({ selected, active }) => (
                                                                <MenuItem isActive={active} isSelected={selected}
                                                                    className={`border mt-2 mb-1 rounded-md border-gray-100 dark:border-buttonBorderColor-dark ${form.role === item.label
                                                                        ? "bg-gray-100 border-gray-200 dark:bg-gray-700"
                                                                        : ""
                                                                        }`}
                                                                >
                                                                    <MenuItem.Title>{item.label}</MenuItem.Title>
                                                                </MenuItem>
                                                            )}
                                                        </Dropdown.Option>
                                                    )
                                                })
                                            }
                                        </Dropdown.Options>
                                    </Dropdown>

                                    {/* فلش سمت راست */}
                                    <ControlsChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-titleText dark:text-titleText-dark pointer-events-none" />

                                </div>
                            </div>
                            <div>
                                <label>سوابق تحصیلی</label>
                                <textarea
                                    className="w-full p-0 pt-2 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
      bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
      shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark focus:outline-none"
                                    value={form.educationalHistory} onChange={(e) => setForm({ ...form, educationalHistory: e.target.value })} placeholder="سوابق تحصیلی" />
                            </div>
                            <div>
                                <label>سوابق شغلی</label>
                                <textarea
                                    className="w-full p-0 pt-2 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
      bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
      shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark focus:outline-none"
                                    value={form.careerHistory} onChange={(e) => setForm({ ...form, careerHistory: e.target.value })} placeholder="سوابق شغلی" />
                            </div>
                            <div>
                                <label>درصد سهام *</label>
                                <Input
                                    className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark"
                                    type="text"
                                    value={form.sharePercentage}
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        // اجازه خالی
                                        if (value === "") {
                                            setForm({ ...form, sharePercentage: "" });
                                            return;
                                        }

                                        // فقط عدد + یک اعشار
                                        const decimalRegex = /^\d*\.?\d*$/;
                                        if (decimalRegex.test(value)) {
                                            setForm({ ...form, sharePercentage: value });
                                        }
                                    }}
                                    placeholder="درصد سهام"
                                />
                            </div>
                            <div>
                                <label>ایمیل</label>
                                <Input style={{ direction: 'ltr' }} className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
      bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
      shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ایمیل" />
                            </div>
                        </div>
                        <div className="p-4 border-t flex justify-end gap-2 border-boxBorderColor dark:border-boxBorderColor-dark">
                            <Button variant="ghost" onClick={closeAddModal}>
                                انصراف
                            </Button>
                            <Button variant="primary" onClick={() => { handleAdd() }}>
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
                        <h4 className="mb-2 mt-2">تغییرات مشخصات عضو هیئت‌مدیره و سهامداران</h4>
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
                            حذف عضو هیئت‌مدیره و سهامداران
                        </h3>

                        <p className="text-sm mb-6 text-center leading-relaxed">
                            {`آیا از حذف عضو هیئت‌مدیره و سهامداران مطمئن هستید؟`}
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
    )
}

export default BoardMemberTable
