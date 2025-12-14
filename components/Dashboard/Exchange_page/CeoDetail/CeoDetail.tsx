import React, { useEffect, useState } from "react";
import ExpandableTable, {
  Column,
} from "../../../../components/ExpandableTable/ExpandableTable";
import { Modal, Button, Input } from "@heathmont/moon-core-tw";
import { GetRequest } from "../../../../functions/GetRequest";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { LoaderCircle } from "../../../Loader/Loader";

import { validateEmail } from "../../../../functions/Validations";
import { validateNumbers } from "../../../../functions/Validations";
import Pagination from "../../../Pagination/Pagination";
import { LogViewer } from "../../../../functions/changesHandler";
import LoadingComponent from "../../../LoadingComponent/LoadingComponent";
import { PostRequest, PutRequest } from "../../../../functions/PostRequest";

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
    console.log(row);
    setForm(row);
    setEditingId(row.id);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingId(null);
  };

  const handleSave = () => {
    // ✅ Validation
    const isEmpty = (val?: string) => !val || val.trim() === "";
    const isDigits = (val: string, len?: number) =>
      /^\d+$/.test(val) && (!len || val.length === len);

    if (isEmpty(form.name))
      return toast.error("نام و نام‌خانوادگی را وارد کنید", {
        position: "bottom-left",
      });

    if (isEmpty(form.phoneNumber))
      return toast.error("شماره همراه را وارد کنید", {
        position: "bottom-left",
      });

    if (!/^0\d{10}$/.test(form.phoneNumber))
      return toast.error("شماره همراه باید ۱۱ رقم و با ۰ شروع شود", {
        position: "bottom-left",
      });

    if (isEmpty(form.nationalCode))
      return toast.error("کد ملی را وارد کنید", {
        position: "bottom-left",
      });

    if (!isDigits(form.nationalCode, 10))
      return toast.error("کد ملی باید دقیقاً ۱۰ رقم باشد", {
        position: "bottom-left",
      });

    if (form.email && !validateEmail(form.email))
      return toast.error("ایمیل وارد شده معتبر نیست", {
        position: "bottom-left",
      });

    const rawShare = form.sharePercentage ?? "";
    const share = rawShare === "" ? NaN : Number(rawShare);
    if (isNaN(share))
      return toast.error("درصد سهام را به‌درستی وارد کنید", {
        position: "bottom-left",
      });
    if (share < 0 || share > 100)
      return toast.error("درصد سهام باید بین ۰ تا ۱۰۰ باشد", {
        position: "bottom-left",
      });

    const updatedForm = {
      ...form,
      educationalHistory: form.educationalHistory || "",
      careerHistory: form.careerHistory || "",
      sharePercentage: form.sharePercentage || "0",
    };

    // 👇 از اینجا به بعد: فقط then / catch
    setLoading(true);

    const isEdit = !!editingId && data.length !== 0;
    const url = isEdit
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/manager/${editingId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/manager`;

    const requestPromise = isEdit
      ? PutRequest(url, updatedForm)
      : PostRequest(url, updatedForm);

    requestPromise
      .then((res: any) => {
        // اگر بک‌اند result برگردونه، بگیریم؛ وگرنه خود فرم
        const payload = res && typeof res === "object" ? res : null;
        const result = payload?.result ?? null;

        toast.success("مشخصات مدیرعامل با موفقیت ذخیره شد.", {
          position: "bottom-left",
        });

        if (isEdit) {
          setData((prev) =>
            prev.map((item) =>
              item.id === editingId ? { ...form, id: editingId } : item
            )
          );
        } else {
          const newManager = result || updatedForm;
          setData([newManager]);
        }

        closeModal();
      })
      .catch((err: any) => {
        console.error(err);
        const msg = String(err?.message ?? "");

        // اگر توکن نداشتیم
        if (msg === "Token not found") {
          toast.error("توکن موجود نیست، لطفاً وارد سیستم شوید.", {
            position: "bottom-left",
          });
          return;
        }

        // اگر بدنهٔ ارور JSON بوده (از PostRequest) سعی کنیم پارس کنیم
        let parsed: any = null;
        if (msg.startsWith("{") && msg.endsWith("}")) {
          try {
            parsed = JSON.parse(msg);
          } catch {
            parsed = null;
          }
        }

        const errorObj = parsed;

        // ولیدیشن‌های فیلدی بک‌اند (result به صورت آبجکت)
        if (errorObj?.result && typeof errorObj.result === "object") {
          Object.entries(errorObj.result).forEach(([_, value]) => {
            const text = Array.isArray(value)
              ? value.join("، ")
              : String(value ?? "");
            if (text) {
              toast.error(text, { position: "bottom-left" });
            }
          });
          return;
        }

        // پیام متنی مستقیم
        if (typeof errorObj?.error === "string" && errorObj.error.trim() !== "") {
          toast.error(errorObj.error, { position: "bottom-left" });
          return;
        }

        // اگر پیام شبیه HTTP 401/403 بود
        if (msg.includes("HTTP 401") || msg.includes("HTTP 403")) {
          toast.error("نشست شما منقضی شده است. لطفاً دوباره وارد شوید.", {
            position: "bottom-left",
          });
          return;
        }

        // فالبک عمومی
        toast.error("خطا در ذخیره مشخصات مدیرعامل", {
          position: "bottom-left",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };


  useEffect(() => {
    GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/exchanges/${params.id}`)
      .then((response) => {
        const managerInfo = response.result.managerInfo;
        setData([
          {
            id: managerInfo.id,
            name: managerInfo.name,
            phoneNumber: managerInfo.phoneNumber,
            nationalCode: managerInfo.nationalCode,
            educationalHistory: managerInfo.educationalHistory,
            careerHistory: managerInfo.careerHistory,
            sharePercentage: managerInfo.sharePercentage,
            email: managerInfo.email,
          },
        ]);
        SetC2(true);
      })
      .catch((err) => {
        SetC2(true);
      });
  }, []);


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
        <div className="flex items-center gap-2 text-titleText dark:text-titleText-dark cursor-pointer">
          <button className="bg-gray-100 hover:bg-gray-200 dark:bg-boxColor-dark dark:hover:bg-gray-700 transition-colors px-2 py-1 rounded-md min-w-[100px]" onClick={() => openModal(row)}>
            ویرایش
          </button>
          <button className="bg-gray-100 hover:bg-gray-200 dark:bg-boxColor-dark dark:hover:bg-gray-700 transition-colors px-2 py-1 rounded-md min-w-[100px]" onClick={() => {
            setForm(row), setisLogOpen(true);
          }}>
            تغییرات
          </button>
        </div>
      ),
    },
  ];

  const Audit = () => {
    setLogLoading(true);
    GetRequest(
      `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/audit/manager/${form.id}?page=${LogPage}&size=10&sort=updatedAt,DESC`
    )
      .then((response) => {
        setLogLoading(false);
        setChanges(response.result.content);
        setLogNumber(response.result.totalElements);
      })
      .catch((err) => {
        setLogLoading(false);
        setChanges([]);
      });
  };

  useEffect(() => {
    if (isLogOpen) {
      Audit();
    }
  }, [isLogOpen, LogPage]);

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-3">
        <h5 className="font-bold text-lg text-titleText dark:text-titleText-dark mb-2">
          مشخصات مدیرعامل
        </h5>
        {data.length === 0 ? (
          <Button
            variant="primary"
            onClick={() => {
              setIsOpen(true);
            }}
            className="text-primary dark:text-primary-dark border border-primary rounded-md"
          >
            افزودن مدیرعامل
          </Button>
        ) : null}
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
                <label>نام و نام‌خانوادگی *</label>
                <Input
                  className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
      bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
      shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark"
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                  }}
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
                      setForm({ ...form, phoneNumber: e.target.value });
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
                      setForm({ ...form, nationalCode: e.target.value });
                    }
                  }}
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
                <label>درصد سهام *</label>
                <Input
                  className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
      bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
      shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark"
                  type="text"
                  value={form.sharePercentage ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;

                    // اجازه خالی
                    if (value === "") {
                      setForm({ ...form, sharePercentage: "" });
                      return;
                    }

                    // فقط عدد + یک نقطه
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
                  style={{ direction: "ltr" }}
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
                {Loading ? (
                  <LoaderCircle size={8} color="border-white-500" />
                ) : (
                  "ذخیره اطلاعات"
                )}
              </Button>
            </div>
          </Modal.Panel>
        </div>
      </Modal>

      <Modal
        open={isLogOpen}
        onClose={() => {
          setisLogOpen(false);
        }}
      >
        <Modal.Backdrop />
        <div className="fixed inset-0 flex z-50 backdrop-blur-sm bg-white/10">
          <Modal.Panel className="w-full max-w-2xl rounded-lg bg-white dark:bg-bgColor-dark shadow-lg mt-[200px] text-titleText dark:text-titleText-dark p-4">
            <h4 className="mb-2 mt-2">تغییرات مشخصات مدیرعامل</h4>
            {LogLoading ? (
              <div className="mt-4">
                <LoadingComponent />
              </div>
            ) : (
              <LogViewer logs={Changes} />
            )}
            <Pagination
              rtl
              totalItems={LogNumber}
              pageSize={10}
              currentPage={LogPage + 1}
              onPageChange={(e) => {
                setLogPage(e - 1);
              }}
            />
            <div className="flex justify-end gap-4 w-full mt-2">
              <button
                onClick={() => {
                  setisLogOpen(false);
                }}
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
