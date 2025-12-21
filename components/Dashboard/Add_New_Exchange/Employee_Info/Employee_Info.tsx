import React, { useState } from "react";
import ExpandableTable, {
  Column,
} from "../../../ExpandableTable/ExpandableTable";
import { Modal, Button, Input } from "@heathmont/moon-core-tw";
import toast from "react-hot-toast";

import { LoaderCircle } from "../../../Loader/Loader";
import { PostRequest } from "../../../../functions/PostRequest";
import { validateNumbers } from "../../../../functions/Validations";
import JalaliLocalDatePicker from "../../../DatePicker/JalaliLocalDatePicker";
import { toJalaliDate } from "../../../../functions/toJalaliDate";
import { refreshTokenOnly } from "../../../../functions/TokenRefresh";
import { handlePostErrors } from "../../../../functions/handlePostErrors";

type Person = {
  id: string;
  name: string;
  jobPosition: string;
  startDate: string;
  educationalHistory: string;
  careerHistory: string;
  insuranceStartDate: string;
  insuranceEndDate: string;
  isSpecialAccess: boolean | null;
  nationalCode: string;
  phoneNumber: string;
};

interface GetExchangeInfoProps {
  SetStep: React.Dispatch<React.SetStateAction<number>>;
  ID: number | undefined;
}

type EmployeeForm = Person;

const Employee_Info: React.FC<GetExchangeInfoProps> = ({ SetStep, ID }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [Loading, setLoading] = useState<boolean>(false);

  const closeModal = () => setIsOpen(false);
  const openModal = () => setIsOpen(true);

  const columns: Column<Person>[] = [
    { header: "نام و نام‌خانوادگی", accessorKey: "name" },
    { header: "سمت", accessorKey: "jobPosition", align: "center" },
    {
      header: "تاریخ شروع به کار",
      cell: (row: Person) => {
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
            <span className="text-green-500 dark:text-green-300">دارد</span> // اینجا محتوای مورد نظر را قرار دهید
          );
        } else {
          return (
            <span className="text-red-500 dark:text-red-300">ندارد</span> // محتوای دیگری که در صورت غیرفعال بودن دسترسی خاص می‌خواهید
          );
        }
      },
    },
  ];

  const [data, SetData] = useState<Person[]>([]);

  const [form, setForm] = useState<EmployeeForm>({
    id: "",
    name: "",
    jobPosition: "",
    startDate: "",
    educationalHistory: "",
    careerHistory: "",
    insuranceStartDate: "",
    insuranceEndDate: "",
    isSpecialAccess: null,
    nationalCode: "",
    phoneNumber: "",
  });

  const handleChange = <K extends keyof EmployeeForm>(
    field: K,
    value: EmployeeForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // === Local Validations ===
    if (!form.name.trim()) return toast.error("نام و نام‌خانوادگی الزامی است");
    if (/[@#!]/.test(form.name))
      return toast.error("نام نباید شامل کاراکترهای خاص باشد (#, @, !)");
    if (form.name.length > 200)
      return toast.error("طول نام نباید بیشتر از ۲۰۰ کاراکتر باشد");
    if (form.jobPosition && form.jobPosition.length > 100)
      return toast.error("طول سمت نباید بیشتر از ۱۰۰ کاراکتر باشد");
    if (form.jobPosition && /[@#!]/.test(form.jobPosition))
      return toast.error("سمت نباید شامل کاراکترهای خاص باشد (#, @, !)");
    if (!form.phoneNumber.trim()) return toast.error("شماره همراه الزامی است");
    if (!/^0\d{10}$/.test(form.phoneNumber))
      return toast.error("شماره همراه باید ۱۱ رقم و با ۰ شروع شود");
    if (!form.nationalCode.trim()) return toast.error("کد ملی الزامی است");
    if (!/^\d{10}$/.test(form.nationalCode))
      return toast.error("کد ملی باید دقیقاً ۱۰ رقم باشد");

    const today = new Date().toISOString().split("T")[0];
    if (form.startDate && form.startDate > today)
      return toast.error("تاریخ شروع به کار نمی‌تواند در آینده باشد");
    if (form.insuranceStartDate && form.insuranceStartDate > today)
      return toast.error("تاریخ شروع بیمه نمی‌تواند در آینده باشد");
    if (form.insuranceEndDate && form.insuranceEndDate > today)
      return toast.error("تاریخ پایان بیمه نمی‌تواند در آینده باشد");
    if (
      form.insuranceStartDate &&
      form.insuranceEndDate &&
      form.insuranceStartDate > form.insuranceEndDate
    )
      return toast.error("تاریخ شروع بیمه باید قبل از تاریخ پایان بیمه باشد");
    if (form.educationalHistory && form.educationalHistory.length > 1000)
      return toast.error("طول سوابق تحصیلی نباید بیشتر از ۱۰۰۰ کاراکتر باشد");
    if (form.educationalHistory && /[@#!]/.test(form.educationalHistory))
      return toast.error(
        "سوابق تحصیلی نباید شامل کاراکترهای خاص باشد (#, @, !)"
      );
    if (form.careerHistory && form.careerHistory.length > 1000)
      return toast.error("طول سوابق شغلی نباید بیشتر از ۱۰۰۰ کاراکتر باشد");
    if (form.careerHistory && /[@#!]/.test(form.careerHistory))
      return toast.error("سوابق شغلی نباید شامل کاراکترهای خاص باشد (#, @, !)");

    // === Prepare Data ===
    const Member = {
      name: form.name,
      jobPosition: form.jobPosition,
      startDate: form.startDate,
      educationalHistory: form.educationalHistory,
      careerHistory: form.careerHistory,
      insuranceStartDate: form.insuranceStartDate,
      insuranceEndDate: form.insuranceEndDate,
      isSpecialAccess: form.isSpecialAccess === true,
      nationalCode: form.nationalCode,
      phoneNumber: form.phoneNumber,
    };

    setLoading(true)
    PostRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${ID}/employees`, Member)
      .then((response) => {
        toast.success("کارمند با موفقیت افزوده شد.", { position: "bottom-left" })
        SetData([...data, { ...form, id: String(data.length + 1) }]);
        closeModal();
        setEditingId(null);
        setForm({
          id: "",
          name: "",
          jobPosition: "",
          startDate: "",
          educationalHistory: "",
          careerHistory: "",
          insuranceStartDate: "",
          insuranceEndDate: "",
          isSpecialAccess: null,
          nationalCode: "",
          phoneNumber: "",
        })
      })
      .catch((err) => {
        handlePostErrors(err)
      })
      .finally(() => {
        setLoading(false)
      })
  };

  const nextStep = async () => {
    window.location.assign(`/panel/exchanges-list/exchange/${ID}`);
  };

  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4">
      {/* تیتر و دکمه */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch gap-4">
        <h5 className="font-bold text-lg text-titleText dark:text-titleText-dark">
          مشخصات کارمندان
        </h5>
        <button
          className="text-primary border border-primary px-4 py-2 rounded-md"
          onClick={() => {
            setEditingId(null); // ریست کردن حالت ویرایش
            setForm({
              id: "",
              name: "",
              jobPosition: "",
              startDate: "",
              educationalHistory: "",
              careerHistory: "",
              insuranceStartDate: "",
              insuranceEndDate: "",
              isSpecialAccess: null,
              nationalCode: "",
              phoneNumber: "",
            });
            openModal();
          }}
        >
          افزودن کارمند جدید
        </button>
      </div>

      {/* جدول */}
      <div className="mt-4">
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
              onClick={() => {
                nextStep();
              }}
              id='endExCreating'
            >
              {"اتمام"}
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
                {editingId ? "ویرایش کارمند" : "افزودن کارمند جدید"}
              </Modal.Title>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* نام */}
              <div>
                <label>نام و نام‌خانوادگی *</label>
                <Input
                  className="p-0 pr-2 mt-2 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm border border-boxBorderColor dark:border-boxBorderColor-dark"
                  value={form.name}
                  onChange={(e) => {
                    handleChange("name", e.target.value);
                  }}
                  placeholder="نام و نام‌خانوادگی"
                />
              </div>

              {/* شماره همراه */}
              <div>
                <label>شماره همراه *</label>
                <Input
                  className="p-0 pr-2 mt-2 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm border border-boxBorderColor dark:border-boxBorderColor-dark"
                  value={form.phoneNumber}
                  onChange={(e) => {
                    if (validateNumbers(e.target.value)) {
                      handleChange("phoneNumber", e.target.value);
                    }
                  }}
                  placeholder="شماره همراه"
                />
              </div>

              {/* کد ملی */}
              <div>
                <label>کد ملی *</label>
                <Input
                  className="p-0 pr-2 mt-2 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm border border-boxBorderColor dark:border-boxBorderColor-dark"
                  value={form.nationalCode}
                  onChange={(e) => {
                    if (validateNumbers(e.target.value)) {
                      handleChange("nationalCode", e.target.value);
                    }
                  }}
                  placeholder="کد ملی"
                />
              </div>

              {/* سمت */}
              <div>
                <label>سمت *</label>
                <Input
                  className="p-0 pr-2 mt-2 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm border border-boxBorderColor dark:border-boxBorderColor-dark"
                  value={form.jobPosition}
                  onChange={(e) => handleChange("jobPosition", e.target.value)}
                  placeholder="سمت"
                />
              </div>

              {/* سوابق تحصیلی */}
              <div>
                <label>سوابق تحصیلی</label>
                <textarea
                  className="w-full mt-2 pr-2 pt-2 focus:outline-none rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm border border-boxBorderColor dark:border-boxBorderColor-dark"
                  value={form.educationalHistory}
                  onChange={(e) =>
                    handleChange("educationalHistory", e.target.value)
                  }
                  placeholder="سوابق تحصیلی"
                />
              </div>

              {/* سوابق شغلی */}
              <div>
                <label>سوابق شغلی</label>
                <textarea
                  className="w-full mt-2 pr-2 pt-2 focus:outline-none rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm border border-boxBorderColor dark:border-boxBorderColor-dark"
                  value={form.careerHistory}
                  onChange={(e) =>
                    handleChange("careerHistory", e.target.value)
                  }
                  placeholder="سوابق شغلی"
                />
              </div>

              {/* تاریخ شروع به کار */}
              <div>
                <label>تاریخ شروع به کار</label>
                <div className="mt-2">
                  <JalaliLocalDatePicker
                    value={form.startDate}
                    onChange={(val) =>
                      setForm((p) => ({
                        ...p,
                        startDate: val !== null ? val : "",
                      }))
                    }
                    placeholder=""
                    clearable
                    min="1900-01-01"
                    max="2030-12-31"
                  />
                </div>
              </div>

              {/* تاریخ شروع بیمه */}
              <div>
                <label>تاریخ شروع بیمه</label>
                <div className="mt-2">
                  <JalaliLocalDatePicker
                    value={form.insuranceStartDate}
                    onChange={(val) => {
                      setForm((p) => ({
                        ...p,
                        insuranceStartDate: val !== null ? val : "",
                      }));
                      console.log(val);
                    }}
                    placeholder=""
                    clearable
                    min="1900-01-01"
                    max="2030-12-31"
                  />
                </div>
              </div>

              {/* تاریخ پایان بیمه */}
              <div>
                <label>تاریخ پایان بیمه</label>
                <div className="mt-2">
                  <JalaliLocalDatePicker
                    value={form.insuranceEndDate}
                    onChange={(val) =>
                      setForm((p) => ({
                        ...p,
                        insuranceEndDate: val !== null ? val : "",
                      }))
                    }
                    placeholder=""
                    clearable
                    min="2000-01-01"
                    max="2030-12-31"
                  />
                </div>
              </div>

              {/* دسترسی خاص */}
              <div className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  id="isSpecialAccess"
                  checked={form.isSpecialAccess === true}
                  onChange={(e) =>
                    handleChange("isSpecialAccess", e.target.checked)
                  }
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <label htmlFor="isSpecialAccess" className="cursor-pointer">
                  دسترسی خاص
                </label>
              </div>
            </div>

            <div className="p-4 border-t border-boxBorderColor dark:border-boxBorderColor-dark flex justify-end gap-2">
              <Button variant="ghost" onClick={closeModal}>
                انصراف
              </Button>
              <Button onClick={handleSave}  id='addEmployee'>
                {Loading ? (
                  <div>
                    <LoaderCircle size={8} color="border-white-500" />
                  </div>
                ) : (
                  "افزودن"
                )}
              </Button>
            </div>
          </Modal.Panel>
        </div>
      </Modal>
    </div>
  );
};

export default Employee_Info;
