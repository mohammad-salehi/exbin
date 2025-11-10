import React, { useState } from 'react'
import ExpandableTable, { Column } from '../../../ExpandableTable/ExpandableTable';
import { Modal, Button, Input } from "@heathmont/moon-core-tw";
import toast from 'react-hot-toast';
import { LoaderCircle } from '../../../Loader/Loader';
import { validateEmail } from '../../../../functions/Validations';
import { validateNumbers } from '../../../../functions/Validations';
import { PostRequest } from '../../../../functions/PostRequest';
import { refreshTokenOnly } from '../../../../functions/TokenRefresh';

type Person = {
    id: string;
    name: string;
    phoneNumber: string;
    nationalCode: string;
};

interface GetExchangeInfoProps {
    SetStep: React.Dispatch<React.SetStateAction<number>>;
    ID: number | undefined;
}


const Exchange_Agent_Info: React.FC<GetExchangeInfoProps> = ({ SetStep, ID }) => {

    const [editingId, setEditingId] = useState<string | null>(null);
    const [Loading, setLoading] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState(false);
    const closeModal = () => setIsOpen(false);
    const openModal = () => setIsOpen(true);

    const nextStep = async () => {
        SetStep(5)
    }

    const columns: Column<Person>[] = [
        { header: "نام و نام‌خانوادگی", accessorKey: "name" },
        { header: "شماره همراه", accessorKey: "phoneNumber", align: "center", className: "tabular-nums" },
        { header: "کد ملی", accessorKey: "nationalCode", align: "center", className: "tabular-nums" },
    ];

    const [data, SetData] = useState<Person[]>([]);

    // 🟢 استیت برای ورودی‌های مودال
    const [form, setForm] = useState<Omit<Person, "id">>({
        name: "",
        phoneNumber: "",
        nationalCode: "",
    });

    const handleChange = <K extends keyof Person>(field: K, value: Person[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!form.name.trim()) return toast.error("نام و نام‌خانوادگی الزامی است");
        if (/[@#!]/.test(form.name))
            return toast.error("نام نباید شامل کاراکترهای خاص باشد (#, @, !)");
        if (form.name.length > 200)
            return toast.error("طول نام نباید بیشتر از ۲۰۰ کاراکتر باشد");
        if (!form.phoneNumber.trim()) return toast.error("شماره همراه الزامی است");
        if (!/^0\d{10}$/.test(form.phoneNumber))
            return toast.error("شماره همراه باید ۱۱ رقم و با ۰ شروع شود");
        if (!form.nationalCode.trim()) return toast.error("کد ملی الزامی است");
        if (!/^\d{10}$/.test(form.nationalCode))
            return toast.error("کد ملی باید دقیقاً ۱۰ رقم باشد");

        try {
            // حالت ویرایش فقط لوکاله
            if (editingId) {
              SetData((prev) =>
                prev.map((member) =>
                  member.id === editingId ? { ...member, ...form } : member
                )
              );
            } else {
              // ایجاد نماینده جدید
              const Member = {
                name: form.name,
                nationalCode: form.nationalCode,
                phoneNumber: form.phoneNumber,
              };
        
              setLoading(true);
        
              const token = document.cookie
                .split("; ")
                .find((r) => r.startsWith("token="))
                ?.split("=")[1];
        
              if (!token) {
                toast.error("توکن موجود نیست، لطفاً وارد سیستم شوید.", {
                  position: "bottom-left",
                });
                setLoading(false);
                return;
              }
        
              const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${ID}/exchange-agents`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(Member),
                }
              );
        
              // 👈 اول 403
              if (response.status === 403) {
                await refreshTokenOnly();
                setLoading(false);
              }
        
              // بعدش 400/409
              if (response.status === 400 || response.status === 409) {
                const resData = await response.json();
        
                if (resData?.result && typeof resData.result === "object") {
                  Object.entries(resData.result).forEach(([field, message]) => {
                    if (message)
                      toast.error(`${field} : ${message}`, {
                        position: "bottom-left",
                      });
                  });
                  setLoading(false);
                  return;
                }
        
                if (resData?.error) {
                  const duplicateMatch = resData.error.match(
                    /identifier:\s*(\w+):\s*(\d+)/i
                  );
                  if (duplicateMatch) {
                    const field = duplicateMatch[1];
                    const value = duplicateMatch[2];
                    const fieldLabels: Record<string, string> = {
                      nationalCode: "کد ملی",
                      phoneNumber: "شماره تماس",
                    };
                    const label = fieldLabels[field] || field;
                    toast.error(`${label} ${value} قبلاً ثبت شده است.`, {
                      position: "bottom-left",
                    });
                    setLoading(false);
                    return;
                  }
                }
        
                toast.error("خطا در ذخیره نماینده سکو", {
                  position: "bottom-left",
                });
                setLoading(false);
                return;
              }
        
              // موفق نبود ولی 400/403 هم نبود
              if (!response.ok) {
                setLoading(false);
                return toast.error("خطا در ذخیره نماینده سکو", {
                  position: "bottom-left",
                });
              }
        
              const responseData = await response.json();
              toast.success("نماینده سکو با موفقیت افزوده شد.", {
                position: "bottom-left",
              });
        
              const newMember: Person = {
                id: String(data.length + 1),
                ...form,
              };
              SetData((prev) => [...prev, newMember]);
            }
        
            // بستن مودال و ریست فرم
            closeModal();
            setEditingId(null);
            setForm({
              name: "",
              phoneNumber: "",
              nationalCode: "",
            });
          } catch (e: any) {
            console.error(e);
            toast.error(e?.message || "خطا در ذخیره نماینده سکو", {
              position: "bottom-left",
            });
          } finally {
            setLoading(false);
          }
    };


    return (
        <div className='mt-4'>
            {/* تیتر و دکمه */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch gap-4">
                <h5 className='font-bold text-lg text-titleText dark:text-titleText-dark'>
                    مشخصات نمایندگان
                </h5>
                <button className='text-primary border border-primary px-4 py-2 rounded-md' onClick={openModal}>
                    افزودن نماینده جدید
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

            <div className="relative w-full mt-4">
                <div className="flex justify-between items-center w-full">
                    <div className="text-sm text-titleText dark:text-titleText-dark"></div>
                    <div className="text-sm text-titleText dark:text-titleText-dark w-full sm:w-auto">
                        <button
                            className="w-full sm:w-72 bg-primary h-[48px] rounded-lg text-white shadow-lg flex justify-center items-center"
                            onClick={() => { nextStep() }}
                        >
                            {"صفحه بعد"
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
                                {editingId ? "ویرایش عضو" : "افزودن عضو جدید"}
                            </Modal.Title>
                        </div>

                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label>نام و نام‌خانوادگی *</label>
                                <Input className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder='نام و نام‌خانوادگی' />
                            </div>
                            <div>
                                <label>شماره همراه *</label>
                                <Input className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.phoneNumber} onChange={(e) => {
                                    if (validateNumbers(e.target.value)) {
                                        handleChange("phoneNumber", e.target.value)
                                    }
                                }} placeholder='شماره همراه' />
                            </div>
                            <div>
                                <label>کد ملی *</label>
                                <Input className=" p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark" value={form.nationalCode} onChange={(e) => {
                                    if (validateNumbers(e.target.value)) {
                                        handleChange("nationalCode", e.target.value)
                                    }
                                }} placeholder='کد ملی' />
                            </div>
                        </div>

                        <div className="p-4 border-t border-boxBorderColor dark:border-boxBorderColor-dark flex justify-end gap-2">
                            <Button variant="ghost" onClick={closeModal}>انصراف</Button>
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
    )
}

export default Exchange_Agent_Info
