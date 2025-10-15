'use client';

import React, { useMemo, useState } from 'react';
import { GenericSearch } from '@heathmont/moon-icons-tw';
import ExpandableTable, { Column } from '../../../../components/ExpandableTable/ExpandableTable';
import Pagination from '../../../../components/Pagination/Pagination';
import { Button, Modal, Input } from '@heathmont/moon-core-tw';

type Role = 'admin' | 'manager' | 'user';

type Person = {
    id: string;
    name: string;
    role: Role;
    phoneNumber: string;
    email: string;
};

const roles: ReadonlyArray<{ label: string; value: Role }> = [
    { label: 'مدیر', value: 'admin' },
    { label: 'مدیر میانی', value: 'manager' },
    { label: 'کاربر', value: 'user' },
] as const;

const Page: React.FC = () => {
    // -------- داده‌ها --------
    const [rows, setRows] = useState<Person[]>([
        { id: '1', name: 'علی رضایی', role: 'admin', phoneNumber: '09120000000', email: 'ali@example.com' },
        { id: '2', name: 'نگار محمدی', role: 'manager', phoneNumber: '09350000000', email: 'negar@example.com' },
        { id: '3', name: 'سارا احمدی', role: 'user', phoneNumber: '09130000000', email: 'sara@example.com' },
    ]);

    // -------- جست‌وجو --------
    const [query, setQuery] = useState<string>('');
    const norm = (s: unknown) => (s ?? '').toString().toLowerCase();
    const filtered: Person[] = useMemo(() => {
        const q = norm(query).trim();
        if (!q) return rows;
        return rows.filter(r =>
            [r.name, r.email, r.phoneNumber, r.role].some(f => norm(f).includes(q))
        );
    }, [rows, query]);

    // -------- ویرایش --------
    const [editOpen, setEditOpen] = useState<boolean>(false);
    const [form, setForm] = useState<Person | null>(null);

    const onEdit = (p: Person) => { setForm({ ...p }); setEditOpen(true); };
    const onEditClose = () => { setEditOpen(false); setForm(null); };

    const onFormInputChange = (key: Exclude<keyof Person, 'role' | 'id'>) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setForm(prev => (prev ? { ...prev, [key]: e.target.value } : prev));
        };

    const onFormRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as Role;
        setForm(prev => (prev ? { ...prev, role: value } : prev));
    };

    const onEditSave = () => {
        if (!form) return;
        setRows(prev => prev.map(r => (r.id === form.id ? form : r)));
        onEditClose();
    };

    // -------- حذف + تأیید --------
    const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
    const [target, setTarget] = useState<{ id: string; name: string } | null>(null);

    const openDeleteConfirm = (p: Person) => { setTarget({ id: p.id, name: p.name }); setConfirmOpen(true); };
    const closeDeleteConfirm = () => { setConfirmOpen(false); setTarget(null); };
    const confirmDelete = () => {
        if (!target) return;
        setRows(prev => prev.filter(r => r.id !== target.id));
        closeDeleteConfirm();
    };

    // -------- افزودن --------
    const [addOpen, setAddOpen] = useState<boolean>(false);
    const [addForm, setAddForm] = useState<Person>({
        id: '',
        name: '',
        role: 'user',
        phoneNumber: '',
        email: '',
    });

    const openAdd = () => {
        setAddForm({ id: '', name: '', role: 'user', phoneNumber: '', email: '' });
        setAddOpen(true);
    };
    const onAddClose = () => setAddOpen(false);

    const onAddInputChange = (key: Exclude<keyof Person, 'role' | 'id'>) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setAddForm(prev => ({ ...prev, [key]: e.target.value }));
        };

    const onAddRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as Role;
        setAddForm(prev => ({ ...prev, role: value }));
    };

    const onAddSave = () => {
        if (!addForm.name.trim() || !addForm.phoneNumber.trim() || !addForm.role) return;
        const newItem: Person = { ...addForm, id: Date.now().toString() };
        setRows(prev => [newItem, ...prev]);
        onAddClose();
    };

    // -------- ستون‌ها --------
    const columns: Column<Person>[] = useMemo<Column<Person>[]>(() => [
        { header: 'نام و نام‌خانوادگی', accessorKey: 'name' },
        { header: 'شماره همراه', accessorKey: 'phoneNumber' },
        { header: 'ایمیل', accessorKey: 'email' },
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
                        aria-label={`ویرایش ${row.name}`}
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
                        aria-label={`حذف ${row.name}`}
                        title="حذف"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                            <path d="M21 5.98C17.67 5.65 14.32 5.48 10.98 5.48c-1.98 0-3.96.1-5.94.3L3 5.98" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M8.5 4.97 8.72 3.66C8.88 2.71 9 2 10.69 2h2.62c1.69 0 1.82.75 1.97 1.67l.22 1.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M18.85 9.14 18.2 19.21c-.11 1.57-.2 2.79-2.99 2.79H8.79c-2.79 0-2.88-1.22-2.99-2.79L5.15 9.14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M10.33 16.5h3.33M9.5 12.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            ),
        },
    ], []);

    return (
        <div>
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

            <h5 className="font-medium text-[24px] leading-[100%] tracking-[0] text-right align-middle mt-8">
                لیست کاربران
            </h5>

            <div className="mt-4">
                <ExpandableTable<Person>
                    data={filtered}
                    columns={columns}
                    rowDetailsMode="row"
                    rowDetailsClassName="rounded-xl p-3"
                />

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
                            {"افزودن کاربر جدید"
                            }
                        </button>
                    </div>
                </div>
            </div>

            {/* -------- مودال ویرایش -------- */}
            <Modal open={editOpen} onClose={onEditClose}>
                <Modal.Backdrop />
                <Modal.Panel className="fixed left-[33px] top-[73px] h-[calc(100vh-60px)] w-full max-w-xl bg-boxColor dark:bg-bgColor-dark shadow-lg rounded-lg text-titleText dark:text-titleText-dark overflow-y-auto p-4">
                    <h3 className="text-lg font-semibold mb-4">ویرایش کاربر</h3>
                    {form && (
                        <div className="">
                            <div>

                                <label className=''>
                                    نام و نام‌خانوادگی
                                </label>
                                <Input className=" p-0 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" placeholder="نام و نام‌خانوادگی" value={form.name} onChange={onFormInputChange('name')} />
                            </div>
                            <div className='mt-4'>
                                <label className=''>
                                    شماره همراه
                                </label>
                                <Input className=" p-0 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" placeholder="شماره همراه" value={form.phoneNumber} onChange={onFormInputChange('phoneNumber')} />
                            </div>
                            <div className='mt-4'>
                                <label className=''>
                                    ایمیل
                                </label>
                                <Input className=" p-0 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" placeholder="ایمیل" value={form.email} onChange={onFormInputChange('email')} />
                            </div>
                            <div className='mt-4'>
                                <label className="block text-sm mb-1">نقش</label>
                                <select
                                    value={form.role}
                                    onChange={onFormRoleChange}
                                    className="w-full h-10 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark border border-boxBorderColor dark:border-boxBorderColor-dark px-3"
                                >
                                    {roles.map(r => (
                                        <option key={r.value} value={r.value}>
                                            {r.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="relative w-full mt-4">
                                <div className="flex justify-between items-center w-full">
                                    <div className="text-sm text-titleText dark:text-titleText-dark"></div>
                                    <div className="text-sm text-titleText dark:text-titleText-dark w-full sm:w-auto">
                                        <button
                                            onClick={onEditSave}
                                            className="w-full sm:w-72 bg-primary h-[48px] rounded-lg text-white shadow-lg flex justify-center items-center"

                                        >
                                            {"ذخیره"
                                            }
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                </Modal.Panel>
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
                            {`آیا از حذف ${target?.name ?? ''} مطمئن هستید؟`}
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
                                حذف
                            </button>
                        </div>
                    </Modal.Panel>
                </div>
            </Modal>


            {/* -------- مودال افزودن -------- */}
            <Modal open={addOpen} onClose={onAddClose}>
                <Modal.Backdrop />
                <Modal.Panel className="fixed left-[33px] top-[73px] h-[calc(100vh-60px)] w-full max-w-xl bg-boxColor dark:bg-bgColor-dark shadow-lg rounded-lg text-titleText dark:text-titleText-dark overflow-y-auto p-4">
                    <h3 className="text-lg font-semibold mb-4">افزودن کاربر جدید</h3>
                    <div>
                        <div>
                            <label className='mt-2'>
                                نام و نام‌خانوادگی
                            </label>
                            <Input className=" p-0 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" placeholder="نام و نام‌خانوادگی" value={addForm.name} onChange={onAddInputChange('name')} />
                        </div>
                        <div className='mt-4'>
                            <label className='mt-2'>
                                شماره همراه
                            </label>
                            <Input className=" p-0 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" placeholder="شماره همراه" value={addForm.phoneNumber} onChange={onAddInputChange('phoneNumber')} />
                        </div>
                        <div className='mt-4'>
                            <label className='mt-2'>
                                ایمیل
                            </label>
                            <Input className=" p-0 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" placeholder="ایمیل" value={addForm.email} onChange={onAddInputChange('email')} />
                        </div>
                        <div className='mt-4'>
                            <label className="block text-sm mb-1">نقش</label>
                            <select
                                value={addForm.role}
                                onChange={onAddRoleChange}
                                className="w-full h-10 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark border border-boxBorderColor dark:border-boxBorderColor-dark px-3"
                            >
                                {roles.map(r => (
                                    <option key={r.value} value={r.value}>
                                        {r.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="relative w-full mt-4">
                            <div className="flex justify-between items-center w-full">
                                <div className="text-sm text-titleText dark:text-titleText-dark"></div>
                                <div className="text-sm text-titleText dark:text-titleText-dark w-full sm:w-auto">
                                    <button
                                        onClick={onAddSave}
                                        className="w-full sm:w-72 bg-primary h-[48px] rounded-lg text-white shadow-lg flex justify-center items-center"

                                    >
                                        {"افزودن"
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Panel>
            </Modal>
        </div>
    );
};

export default Page;
