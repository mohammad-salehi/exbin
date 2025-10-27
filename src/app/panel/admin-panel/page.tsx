'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { GenericSearch } from '@heathmont/moon-icons-tw';
import ExpandableTable, { Column } from '../../../../components/ExpandableTable/ExpandableTable';
import Pagination from '../../../../components/Pagination/Pagination';
import { Modal, Input } from '@heathmont/moon-core-tw';
import { GetRequest } from '../../../../functions/GetRequest';
import toast from 'react-hot-toast';
import { LoaderCircle } from '../../../../components/Loader/Loader';
import LoadingComponent from '../../../../components/LoadingComponent/LoadingComponent';
import { PostRequest } from '../../../../functions/PostRequest';
type Role = 'ADMIN' | 'USER';

type Person = {
    id: string;
    firstName: string;
    lastName: string;
    role: Role;
    username: string;
};

const Page: React.FC = () => {

    const [Loading, setLoading] = useState<boolean>(false);
    // -------- داده‌ها --------
    const [rows, setRows] = useState<Person[]>([]);

    // -------- جست‌وجو --------
    const [query, setQuery] = useState<string>('');
    const norm = (s: unknown) => (s ?? '').toString().toLowerCase();
    const filtered: Person[] = useMemo(() => {
        const q = norm(query).trim();
        if (!q) return rows;
        return rows.filter(r =>
            [r.firstName, r.username, r.role, r.lastName].some(f => norm(f).includes(q))
        );
    }, [rows, query]);

    // -------- ویرایش --------
    const [EditLoading, SetEditLoading] = useState<boolean>(false);
    const [editOpen, setEditOpen] = useState<boolean>(false);
    const [form, setForm] = useState<Person | null>(null);

    const onEdit = (p: Person) => { setForm({ ...p }); setEditOpen(true); };
    const onEditClose = () => { setEditOpen(false); setForm(null); };

    const onFormInputChange = (key: Exclude<keyof Person, 'role' | 'id'>) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setForm(prev => (prev ? { ...prev, [key]: e.target.value } : prev));
        };

    const onEditSave = async () => {
        if (!form) return;

        const memberInfo = {
            firstName: form.firstName,
            lastName: form.lastName,
            role: 'USER'
        }

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

            SetEditLoading(true)
            const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/api/users/${form.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(memberInfo),

            });

            if (!response.ok) {
                console.log(response)
                SetEditLoading(false)
                return toast.error(`خطا در ویرایش کاربر`);
            } else {
                setRows(prev => prev.map(r => (r.id === form.id ? form : r)));
                onEditClose();
                SetEditLoading(false)
                toast.success("کاربر با موفقیت ویرایش شد.", { position: "bottom-left" });
            }

        } catch (err) {
            console.error(err);
            SetEditLoading(false)
            return toast.error(`خطا در ویرایش کاربر`);
        }


    };

    // -------- حذف + تأیید --------
    const [DeleteLoading, setDeleteLoading] = useState<boolean>(false);
    const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
    const [target, setTarget] = useState<{ id: string; firstName: string; lastName: string } | null>(null);

    const openDeleteConfirm = (p: Person) => { setTarget({ id: p.id, firstName: p.firstName, lastName: p.lastName }); setConfirmOpen(true); };
    const closeDeleteConfirm = () => { setConfirmOpen(false); setTarget(null); };
    const confirmDelete = async () => {
        if (!target) return;

        try {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('token='))
                ?.split('=')[1];

            if (!token) {
                toast.error("توکن موجود نیست، لطفاً وارد سیستم شوید.", { position: "bottom-left" });
                return;
            }

            setDeleteLoading(true)
            const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/api/users/${target.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                console.log(response)
                setDeleteLoading(false)
                return toast.error(`خطا در حذف کاربر`);
            } else {
                setDeleteLoading(false)
                const responseData = await response.json();
                console.log(responseData);
                toast.success("کاربر با موفقیت حذف شد.", { position: "bottom-left" });
                setRows(prev => prev.filter(r => r.id !== target.id));
                closeDeleteConfirm();
            }

        } catch (err) {
            console.error(err);
            setDeleteLoading(false)
            return toast.error(`خطا در حذف کاربر`);
        }


    };

    // -------- افزودن --------
    const [AddLoading, SetAddLoading] = useState<boolean>(false);
    const [addOpen, setAddOpen] = useState<boolean>(false);
    const [addForm, setAddForm] = useState<Person>({
        id: '',
        firstName: '',
        lastName: '',
        role: 'USER',
        username: '',
    });

    const openAdd = () => {
        setAddForm({ id: '', firstName: '', lastName: '', role: 'USER', username: '' });
        setAddOpen(true);
    };
    const onAddClose = () => setAddOpen(false);

    const onAddInputChange = (key: Exclude<keyof Person, 'role' | 'id'>) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setAddForm(prev => ({ ...prev, [key]: e.target.value }));
        };

    const onAddSave = async () => {
        try {
            if (!addForm) return;

            // ✅ ولیدیشن‌های پایه
            if (!addForm.firstName?.trim()) {
                toast.error("نام را وارد کنید", { position: "bottom-left" });
                return;
            }
            if (!addForm.username?.trim()) {
                toast.error("نام کاربری را وارد کنید", { position: "bottom-left" });
                return;
            }

            const Member = {
                firstName: addForm.firstName,
                lastName: addForm.lastName ?? "",
                username: addForm.username,
                role: addForm.role ?? "USER",
            };

            SetAddLoading(true);

            const res: any = await PostRequest(
                `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
                Member // JSON ارسال می‌شود
            );

            toast.success("کاربر باموفقیت افزوده شد.", { position: "bottom-left" });

            // اگر لازم داری قبل از افزودن، دوباره چک کنی:
            if (!addForm.firstName.trim() || !addForm.username.trim() || !Member.role) return;

            const newItem: Person = { ...addForm, id: Date.now().toString() };
            setRows(prev => [newItem, ...prev]);

            onAddClose();
        } catch (e: any) {
            console.log(e);
            toast.error(e?.message || "خطا در ذخیره کاربر", { position: "bottom-left" });
        } finally {
            SetAddLoading(false);
        }
    };

    // -------- ستون‌ها --------
    const columns: Column<Person>[] = useMemo<Column<Person>[]>(() => [
        { header: 'نام', accessorKey: 'firstName' },
        { header: 'نام خانوادگی', accessorKey: 'lastName' },
        { header: 'شماره همراه', accessorKey: 'username' },
        { header: 'نقش', accessorKey: 'role' },
        {
            header: 'عملیات',
            cell: (row: Person): React.ReactNode => (
                <div className="flex items-center gap-2">
                    {/* ادیت */}
                    <button
                        type="button"
                        onClick={() => onEdit(row)}
                        className=""
                        aria-label={`ویرایش ${row.firstName} ${row.lastName}`}
                        title="ویرایش"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                            <path d="M13.259 3.6 5.049 12.29c-.31.33-.61.98-.67 1.43l-.37 3.24c-.13 1.17.71 1.97 1.87 1.77l3.22-.55c.45-.08 1.08-.41 1.39-.75l8.21-8.69c1.42-1.5 2.06-3.21-.15-5.3-2.2-2.07-3.87-1.34-5.31.16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M11.891 5.05c.43 2.76 2.67 4.87 5.45 5.15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M3 22h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    {/* حذف */}
                    <button
                        type="button"
                        onClick={() => openDeleteConfirm(row)}
                        className=""
                        aria-label={`حذف ${row.firstName} ${row.lastName}`}
                        title="حذف"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                            <path d="M21 5.98C17.67 5.65 14.32 5.48 10.98 5.48c-1.98 0-3.96.1-5.94.3L3 5.98" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M8.5 4.97 8.72 3.66C8.88 2.71 9 2 10.69 2h2.62c1.69 0 1.82.75 1.97 1.67l.22 1.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M18.85 9.14 18.2 19.21c-.11 1.57-.2 2.79-2.99 2.79H8.79c-2.79 0-2.88-1.22-2.99-2.79L5.15 9.14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M10.33 16.5h3.33M9.5 12.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    <a

                        type="button"
                        href={`/panel/admin-panel/timeline/${10}`}
                        className="cursor-pointer"
                        aria-label={`خط زمانی ${row.firstName} ${row.lastName}`}
                        title="خط زمانی"
                    >
                        <svg width="22" height="22" viewBox="0 0 48 48" version="1" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 48 48">
                            <path fill="currentColor" d="M42,29H20.8c-0.5,0-1-0.2-1.4-0.6l-3.7-3.7c-0.4-0.4-0.4-1,0-1.4l3.7-3.7c0.4-0.4,0.9-0.6,1.4-0.6H42 c0.6,0,1,0.4,1,1v8C43,28.6,42.6,29,42,29z" />
                            <rect x="9" y="6" fill="#CFD8DC" width="2" height="36" />
                            <g fill="currentColor">
                                <circle cx="10" cy="10" r="3" />
                                <circle cx="10" cy="24" r="3" />
                                <circle cx="10" cy="38" r="3" />
                            </g>
                            <path fill="currentColor" d="M34,43H20.8c-0.5,0-1-0.2-1.4-0.6l-3.7-3.7c-0.4-0.4-0.4-1,0-1.4l3.7-3.7c0.4-0.4,0.9-0.6,1.4-0.6H34 c0.6,0,1,0.4,1,1v8C35,42.6,34.6,43,34,43z" />
                            <path fill="currentColor" d="M35,15H20.8c-0.5,0-1-0.2-1.4-0.6l-3.7-3.7c-0.4-0.4-0.4-1,0-1.4l3.7-3.7C19.8,5.2,20.3,5,20.8,5H35 c0.6,0,1,0.4,1,1v8C36,14.6,35.6,15,35,15z" />
                        </svg>
                    </a>

                </div>
            ),
        },
    ], []);

    useEffect(() => {
        setLoading(true)
        GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/users`)
            .then((response) => {
                setRows(response.result)
                setLoading(false)
            })
            .catch((err) => {
                console.log(err)
                setLoading(false)
            })
    }, [])

    return (
        <div className='p-2 sm:p-0'>
            {/* Search */}
            <div className="relative w-full md:w-[500px] h-[48px] mb-4 mt-8">
                <input
                    className="flex w-full h-full p-0 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark border border-boxBorderColor dark:border-boxBorderColor-dark pl-4 pr-10 focus:outline-none focus:ring-0"
                    placeholder="جست‌وجو"
                    value={query}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                />
                <GenericSearch className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xl" />
            </div>

            <h5 className="font-medium text-[24px] leading-[100%] tracking-[0] text-right align-middle mt-8 text-titleText dark:text-titleText-dark">
                لیست کاربران
            </h5>

            <div className="mt-4">
                {
                    Loading ?
                        <LoadingComponent />
                        :
                        <ExpandableTable<Person>
                            data={filtered}
                            columns={columns}
                            rowDetailsMode="row"
                            rowDetailsClassName="rounded-xl p-3"
                        />
                }


                <Pagination
                    rtl
                    totalItems={filtered.length}
                    pageSize={10}
                    currentPage={1}
                    onPageChange={() => { }}
                />
            </div>

            {/* دکمه افزودن */}
            <div className="relative w-full mt-4">
                <div className="flex justify-between items-center w-full">
                    <div className="text-sm text-titleText dark:text-titleText-dark"></div>
                    <div className="text-sm text-titleText dark:text-titleText-dark w-full sm:w-auto">
                        <button
                            onClick={openAdd}
                            className="w-full sm:w-72 bg-primary h-[48px] rounded-lg text-white shadow-lg flex justify-center items-center"

                        >
                            {
                                "افزودن کاربر جدید"
                            }
                        </button>
                    </div>
                </div>
            </div>

            {/* -------- مودال ویرایش -------- */}
            <Modal open={editOpen} onClose={onEditClose}>
                {/* بک‌دراپ، تمام صفحه، یک لایه پایین‌تر از پنل */}
                <Modal.Backdrop className="fixed inset-0 w-screen h-screen bg-black/50 z-[2147483646]" />

                {/* کانتینر مرکزی پنل، بالاتر از بک‌دراپ */}
                <div className="fixed inset-0 z-[2147483647] flex items-center justify-center">
                    <Modal.Panel className="bg-boxColor dark:bg-bgColor-dark shadow-xl rounded-xl text-titleText dark:text-titleText-dark w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold mb-4">ویرایش کاربر</h3>
                        {form && (
                            <div className="">
                                <div>
                                    <label className=''>
                                        نام
                                    </label>
                                    <Input className=" p-0 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" placeholder="نام" value={form.firstName} onChange={onFormInputChange('firstName')} />
                                </div>
                                <div className='mt-4'>
                                    <label>
                                        نام خانوادگی
                                    </label>
                                    <Input className=" p-0 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" placeholder="نام‌خانوادگی" value={form.lastName} onChange={onFormInputChange('lastName')} />
                                </div>
                                <div className='mt-4'>
                                    <label className=''>
                                        شماره همراه
                                    </label>
                                    <Input disabled className=" p-0 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" placeholder="شماره همراه" value={form.username} onChange={onFormInputChange('username')} />
                                </div>

                                <div className="relative w-full mt-6">
                                    <div className=" justify-between items-center w-full">
                                        <div className="text-sm text-titleText dark:text-titleText-dark"></div>
                                        <div className="text-sm text-titleText dark:text-titleText-dark w-full sm:w-auto">
                                            <button
                                                onClick={onEditSave}
                                                className="w-full bg-primary h-[48px] rounded-lg text-white shadow-lg flex justify-center items-center"

                                            >
                                                {
                                                    EditLoading ?
                                                        <LoaderCircle size={8} color="border-white-500" />
                                                        :
                                                        "ذخیره"
                                                }
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )}
                    </Modal.Panel>
                </div>
            </Modal>

            {/* -------- مودال تأیید حذف -------- */}
            <Modal open={confirmOpen} onClose={closeDeleteConfirm}>
                {/* بک‌دراپ، تمام صفحه، یک لایه پایین‌تر از پنل */}
                <Modal.Backdrop className="fixed inset-0 w-screen h-screen bg-black/50 z-[2147483646]" />

                {/* کانتینر مرکزی پنل، بالاتر از بک‌دراپ */}
                <div className="fixed inset-0 z-[2147483647] flex items-center justify-center">
                    <Modal.Panel className="bg-boxColor dark:bg-bgColor-dark shadow-xl rounded-xl text-titleText dark:text-titleText-dark w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold mb-3 text-center">
                            حذف کاربر
                        </h3>

                        <p className="text-sm mb-6 text-center leading-relaxed">
                            {`آیا از حذف ${target?.firstName ?? ''} ${target?.lastName ?? ''} مطمئن هستید؟`}
                        </p>

                        <div className="flex justify-center gap-4 w-full">
                            <button
                                onClick={closeDeleteConfirm}
                                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            >
                                انصراف
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-lg transition"
                            >
                                {
                                    DeleteLoading ?
                                        <LoaderCircle size={8} color="border-white-500" />
                                        :
                                        'حذف'
                                }

                            </button>
                        </div>
                    </Modal.Panel>
                </div>
            </Modal>

            {/* -------- مودال افزودن -------- */}
            <Modal open={addOpen} onClose={onAddClose}>
                {/* بک‌دراپ، تمام صفحه، یک لایه پایین‌تر از پنل */}
                <Modal.Backdrop className="fixed inset-0 w-screen h-screen bg-black/50 z-[2147483646]" />

                {/* کانتینر مرکزی پنل، بالاتر از بک‌دراپ */}
                <div className="fixed inset-0 z-[2147483647] flex items-center justify-center">
                    <Modal.Panel className="bg-boxColor dark:bg-bgColor-dark shadow-xl rounded-xl text-titleText dark:text-titleText-dark w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold mb-4">افزودن کاربر جدید</h3>
                        <div>
                            <div>
                                <label className='mt-2'>
                                    نام
                                </label>
                                <Input className=" p-0 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" placeholder="نام و نام‌خانوادگی" value={addForm.firstName} onChange={onAddInputChange('firstName')} />
                            </div>
                            <div className='mt-4'>
                                <label className='mt-2'>
                                    نام خانوادگی
                                </label>
                                <Input className=" p-0 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" placeholder="نام و نام‌خانوادگی" value={addForm.lastName} onChange={onAddInputChange('lastName')} />
                            </div>
                            <div className='mt-4'>
                                <label className='mt-2'>
                                    شماره همراه
                                </label>
                                <Input className=" p-0 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" placeholder="شماره همراه" value={addForm.username} onChange={onAddInputChange('username')} />
                            </div>

                            <div className="relative w-full mt-6">
                                <div className=" justify-between items-center w-full">
                                    <div className="text-sm text-titleText dark:text-titleText-dark"></div>
                                    <div className="text-sm text-titleText dark:text-titleText-dark w-full sm:w-auto">
                                        <button
                                            onClick={onAddSave}
                                            className="w-full bg-primary h-[48px] rounded-lg text-white shadow-lg flex justify-center items-center"

                                        >
                                            {
                                                AddLoading ?
                                                    <LoaderCircle size={8} color="border-white-500" />
                                                    :
                                                    "افزودن"
                                            }
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal.Panel>
                </div>
            </Modal>
        </div>
    );
};

export default Page;
