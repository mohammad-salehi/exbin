import React, { useState } from 'react'
import ExpandableTable, { Column } from '../../../ExpandableTable/ExpandableTable';
import { Modal, Button, Input, Dropdown, MenuItem } from "@heathmont/moon-core-tw";
import toast from 'react-hot-toast';
import { LoaderCircle } from '../../../Loader/Loader';
import { validateNumbers } from '../../../../functions/Validations';
import { BoardmemderRoleTypes } from '../../../../functions/BoardmemberRoleTypes';
import { ControlsChevronDown } from '@heathmont/moon-icons-tw';
import { refreshTokenOnly } from '../../../../functions/TokenRefresh';

type Person = {
    id: string;
    name: string;
    phoneNumber: string;
    nationalCode: string;
    role: string;
    careerHistory: string,
    educationalHistory: string,
    sharePercentage: string | null,
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
        sharePercentage: null,
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
        { header: "درصد سهام", accessorKey: "sharePercentage", align: "center", className: "tabular-nums" },
    ];

    const handleChange = <K extends keyof PersonForm>(field: K, value: PersonForm[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        // === Local Validations ===
        if (!form.name.trim()) return toast.error("نام و نام‌خانوادگی الزامی است");
        if (/[@#!]/.test(form.name)) return toast.error("نام نباید شامل کاراکترهای خاص باشد (#, @, !)");
        if (form.name.length > 200) return toast.error("طول نام نباید بیشتر از ۲۰۰ کاراکتر باشد");
        if (!form.phoneNumber.trim()) return toast.error("شماره همراه الزامی است");
        if (!/^0\d{10}$/.test(form.phoneNumber))
            return toast.error("شماره همراه باید ۱۱ رقم و با ۰ شروع شود");
        if (!form.nationalCode.trim()) return toast.error("کد ملی الزامی است");
        if (!/^\d{10}$/.test(form.nationalCode))
            return toast.error("کد ملی باید دقیقاً ۱۰ رقم باشد");
        if (!form.role.trim()) return toast.error("سمت (نقش) الزامی است");
        if (form.sharePercentage === null || form.sharePercentage === "")
            return toast.error("درصد سهام الزامی است");
        const share = parseFloat(String(form.sharePercentage));
        if (isNaN(share) || share < 0 || share > 100) {
            return toast.error("درصد سهام باید بین ۰ تا ۱۰۰ باشد");
        }
        if (form.educationalHistory && form.educationalHistory.length > 1000)
            return toast.error("طول سوابق تحصیلی نباید بیشتر از ۱۰۰۰ کاراکتر باشد");
        if (form.educationalHistory && /[@#!]/.test(form.educationalHistory))
            return toast.error("سوابق تحصیلی نباید شامل کاراکترهای خاص باشد (#, @, !)");
        if (form.careerHistory && form.careerHistory.length > 1000)
            return toast.error("طول سوابق شغلی نباید بیشتر از ۱۰۰۰ کاراکتر باشد");
        if (form.careerHistory && /[@#!]/.test(form.careerHistory))
            return toast.error("سوابق شغلی نباید شامل کاراکترهای خاص باشد (#, @, !)");
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            return toast.error("ایمیل وارد شده معتبر نیست");

        // === Prepare Data ===
        const Member = {
            name: form.name,
            phoneNumber: form.phoneNumber,
            nationalCode: form.nationalCode,
            role: BoardmemderRoleTypes.find(item => item.label === form.role)?.value,
            careerHistory: form.careerHistory,
            educationalHistory: form.educationalHistory,
            sharePercentage: share,
            email: form.email,
        };

        const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1];

        if (!token) {
            toast.error("توکن موجود نیست، لطفاً وارد سیستم شوید.", { position: "bottom-left" });
            return;
        }

        try {
            setLoading(true);
        
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${ID}/board-members`,
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
        
            // === Handle 400 / 409 ===
            if (response.status === 400 || response.status === 409) {
              const resData = await response.json();
        
              if (resData?.result && typeof resData.result === "object") {
                Object.entries(resData.result).forEach(([field, message]) => {
                  if (message)
                    toast.error(`${field} : ${message}`, { position: "bottom-left" });
                });
                setLoading(false);
                return;
              }
        
              if (resData?.error) {
                const duplicateMatch = resData.error.match(/identifier:\s*(\w+):\s*(\d+)/i);
                if (duplicateMatch) {
                  const field = duplicateMatch[1];
                  const value = duplicateMatch[2];
                  const fieldLabels: Record<string, string> = {
                    nationalCode: "کد ملی",
                    phoneNumber: "شماره تماس",
                    email: "ایمیل",
                  };
                  const label = fieldLabels[field] || field;
                  toast.error(`${label} ${value} قبلاً ثبت شده است.`, {
                    position: "bottom-left",
                  });
                  setLoading(false);
                  return;
                }
              }
        
              toast.error("خطا در ذخیره عضو هیئت‌مدیره و سهامداران", {
                position: "bottom-left",
              });
              setLoading(false);
              return;
            }
        
            // === Success ===
            if (!response.ok) {
              setLoading(false);
              return toast.error("خطا در ذخیره عضو هیئت‌مدیره و سهامداران", {
                position: "bottom-left",
              });
            }
        
            const responseData = await response.json();
            toast.success("عضو هیئت‌مدیره و سهامداران با موفقیت افزوده شد.", {
              position: "bottom-left",
            });
        
            const newMember: Person = {
              id: String(data.length + 1),
              ...form,
            };
            SetData([...data, newMember]);
        
            closeModal();
            setEditingId(null);
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
          } catch (e: any) {
            console.error(e);
            toast.error("خطا در ذخیره عضو هیئت‌مدیره و سهامداران", {
              position: "bottom-left",
            });
          } finally {
            setLoading(false);
          }
    };


    const nextStep = async () => {
        SetStep(4)
    }

    return (
        <div className='mt-4'>
            {/* تیتر و دکمه */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch gap-4">
                <h5 className='font-bold text-lg text-titleText dark:text-titleText-dark'>
                    مشخصات اعضای هیئت‌مدیره و سهامداران
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
                            <div>
                                <label>نقش *</label>
                                <div className="relative w-full mt-2">
                                    <Dropdown onChange={(e) => { if (typeof (e) === 'string') { handleChange("role", e) } }} value={form.role}>
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
                                    type="text"
                                    value={form.sharePercentage ?? ""}
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        // اجازه بده خالی باشه
                                        if (value === "") {
                                            handleChange("sharePercentage", value);
                                            return;
                                        }

                                        // فقط عدد و یک نقطه
                                        const decimalRegex = /^\d*\.?\d*$/;
                                        if (decimalRegex.test(value)) {
                                            handleChange("sharePercentage", value);
                                        }
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

export default BoardMemberInfo
