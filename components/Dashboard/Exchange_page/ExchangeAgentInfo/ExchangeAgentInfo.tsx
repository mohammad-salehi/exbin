import React, { useEffect, useState } from "react";
import ExpandableTable, {
  Column,
} from "../../../ExpandableTable/ExpandableTable";
import { Modal, Button, Input } from "@heathmont/moon-core-tw";
import { GetRequest } from "../../../../functions/GetRequest";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { LoaderCircle } from "../../../Loader/Loader";

import { validateNumbers } from "../../../../functions/Validations";

import { PostRequest } from "../../../../functions/PostRequest";
import { PutRequest } from "../../../../functions/PostRequest";
import { handlePostErrors } from "../../../../functions/handlePostErrors";
import { DeleteRequest } from "../../../../functions/GetRequest";

import Pagination from "../../../Pagination/Pagination";
import { LogViewer } from "../../../../functions/changesHandler";
import LoadingComponent from "../../../LoadingComponent/LoadingComponent";

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

  const [data, setData] = useState<Person[]>([]);

  const [form, setForm] = useState<Person>({
    id: "",
    name: "",
    phoneNumber: "",
    nationalCode: "",
  });

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLoading, SetEditLoading] = useState<boolean>(false);
  const [addLoading, SetAddLoading] = useState<boolean>(false);
  const [deleteLoading, SetdeleteLoading] = useState<boolean>(false);

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

  const columns: Column<Person>[] = [
    { header: "نام و نام‌خانوادگی", accessorKey: "name" },
    { header: "شماره همراه", accessorKey: "phoneNumber" },
    { header: "کدملی", accessorKey: "nationalCode" },
    {
      header: "عملیات",
      cell: (row: Person) => (
        <div className="flex items-center gap-2 text-titleText dark:text-titleText-dark cursor-pointer">
          <button className="bg-gray-100 hover:bg-gray-200 dark:bg-boxColor-dark dark:hover:bg-gray-700 transition-colors px-2 py-1 rounded-md min-w-[80px]" onClick={() => openModal(row)}>
            ویرایش
          </button>
          <button className="bg-gray-100 hover:bg-gray-200 dark:bg-boxColor-dark dark:hover:bg-gray-700 transition-colors px-2 py-1 rounded-md min-w-[80px]" onClick={async () => {
            setEditingId(row.id), setisLogOpen(true);
          }}>
            تغییرات
          </button>
          <button className="bg-gray-100 hover:bg-gray-200 dark:bg-boxColor-dark dark:hover:bg-gray-700 transition-colors px-2 py-1 rounded-md min-w-[80px]" onClick={() => {
            
            setdeleteForm(row);
            SetDeleteBox(true);
          }}>
            حذف
          </button>
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

  useEffect(() => {
    GetRequest(
      process.env.NEXT_PUBLIC_API_URL +
      `/api/exchanges/${params.id}/exchange-agents`
    )
      .then((response) => {
        const getData = response.result.content;
        setData(getData);
        SetC4(true);
      })
      .catch((err) => {
        console.log(err);
        SetC4(true);
      });
  }, []);

  const Audit = () => {
    setLogLoading(true);
    GetRequest(
      `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/audit/exchange-agents/${editingId}?page=${LogPage}&size=10&sort=updatedAt,DESC`
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

  const [deleteBox, SetDeleteBox] = useState(false);
  const deleteMember = async (row: Person) => {
    SetdeleteLoading(true);
    DeleteRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/exchange-agents/${row.id}`)
      .then((response) => {
        toast.success("نماینده سکو با موفقیت حذف شد.", {
          position: "bottom-left",
        });
        setData((prevData) => prevData.filter((person) => person.id !== row.id));
        SetDeleteBox(false);
      })
      .catch((err) => {
        handlePostErrors(err)
      })
      .finally(() => {
        SetdeleteLoading(false)
      })
  };

  const [deleteform, setdeleteForm] = useState<Person>({
    id: "",
    name: "",
    phoneNumber: "",
    nationalCode: "",
  });

  // 🔹 Helper Functions
  const normalize = (val: any) => String(val ?? "").trim();
  const isDigits = (val: string, len?: number) =>
    /^\d+$/.test(val) && (!len || val.length === len);
  const hasNoSpecialChars = (val: string) =>
    /^[\u0600-\u06FFa-zA-Z0-9\s]+$/.test(val);

  // 🟢 ویرایش نماینده سکو
  const handleSave = async () => {
    if (!editingId) return;

    const name = normalize(form.name);
    const phoneNumber = normalize(form.phoneNumber);
    const nationalCode = normalize(form.nationalCode);

    // ✅ اعتبارسنجی‌ها
    if (!name)
      return toast.error("نام و نام‌خانوادگی الزامی است", {
        position: "bottom-left",
      });
    if (!hasNoSpecialChars(name))
      return toast.error("نام نباید شامل کاراکترهای خاص باشد", {
        position: "bottom-left",
      });
    if (!/^0\d{10}$/.test(phoneNumber))
      return toast.error("شماره همراه باید ۱۱ رقم و با ۰ شروع شود", {
        position: "bottom-left",
      });
    if (!isDigits(nationalCode, 10))
      return toast.error("کد ملی باید دقیقاً ۱۰ رقم باشد", {
        position: "bottom-left",
      });

    const payload = { name, phoneNumber, nationalCode };

    SetEditLoading(true)
    PutRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/exchange-agents/${editingId}`, payload)
      .then((res) => {
        toast.success("نماینده سکو با موفقیت ویرایش شد.", {
          position: "bottom-left",
        });
        setData((prev) =>
          prev.map((p) => (p.id === editingId ? { ...p, ...payload } : p))
        );
        closeModal();
      })
      .catch((err) => {
        handlePostErrors(err)
      })
      .finally(() => {
        SetEditLoading(false)
      })
  };

  // 🟣 افزودن نماینده سکو
  const handleAdd = async () => {
    const name = normalize(form.name);
    const phoneNumber = normalize(form.phoneNumber);
    const nationalCode = normalize(form.nationalCode);

    // ✅ اعتبارسنجی‌ها
    if (!name)
      return toast.error("نام و نام‌خانوادگی الزامی است", {
        position: "bottom-left",
      });
    if (!hasNoSpecialChars(name))
      return toast.error("نام نباید شامل کاراکترهای خاص باشد", {
        position: "bottom-left",
      });
    if (!/^0\d{10}$/.test(phoneNumber))
      return toast.error("شماره همراه باید ۱۱ رقم و با ۰ شروع شود", {
        position: "bottom-left",
      });
    if (!isDigits(nationalCode, 10))
      return toast.error("کد ملی باید دقیقاً ۱۰ رقم باشد", {
        position: "bottom-left",
      });

    const payload = { name, phoneNumber, nationalCode };

    SetAddLoading(true);
    PostRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/exchange-agents`, payload)
      .then((res) => {
        toast.success("نماینده سکو با موفقیت افزوده شد.", {
          position: "bottom-left",
        });
        setData((prev) => [
          ...prev,
          { ...payload, id: res?.result?.id || String(prev.length + 1) },
        ]);
        closeAddModal();
      })
      .catch((err) => {
        handlePostErrors(err)
      })
      .finally(() => {
        SetAddLoading(false)
      })
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mt-2">
        <h5 className="font-bold text-lg text-titleText dark:text-titleText-dark mb-2">
          مشخصات نمایندگان سکو
        </h5>
        <div className="flex justify-end mb-3">
          <Button
            variant="primary"
            onClick={openAddModal}
            className="text-primary dark:text-primary-dark border border-primary rounded-md"
          >
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
            </div>

            <div className="p-4 border-t flex justify-end gap-2 border-boxBorderColor dark:border-boxBorderColor-dark">
              <Button variant="ghost" onClick={closeModal}>
                انصراف
              </Button>
              <Button variant="primary" onClick={handleSave}>
                {editLoading ? (
                  <LoaderCircle size={8} color="border-white-500" />
                ) : (
                  "ذخیره اطلاعات"
                )}
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
            </div>
            <div className="p-4 border-t flex justify-end gap-2 border-boxBorderColor dark:border-boxBorderColor-dark">
              <Button variant="ghost" onClick={closeAddModal}>
                انصراف
              </Button>
              <Button variant="primary" onClick={handleAdd}>
                {addLoading ? (
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
            <h4 className="mb-2 mt-2">تغییرات مشخصات عضو هیئت‌مدیره</h4>
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

      {/* -------- مودال تأیید حذف -------- */}
      <Modal
        open={deleteBox}
        onClose={() => {
          SetDeleteBox(false);
        }}
      >
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
                disabled={deleteLoading}
                onClick={() => {
                  deleteMember(deleteform);
                }}
                className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-lg transition"
              >
                {deleteLoading ? "درحال حذف..." : "حذف"}
              </button>
            </div>
          </Modal.Panel>
        </div>
      </Modal>
    </div>
  );
};

export default ExchangeAgentInfo;
