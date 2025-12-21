import React, { useEffect, useState } from "react";
import ExpandableTable, {
  Column,
} from "../../../ExpandableTable/ExpandableTable";
import {
  Modal,
  Button,
  Input,
  Dropdown,
  MenuItem,
} from "@heathmont/moon-core-tw";
import { GetRequest } from "../../../../functions/GetRequest";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { LoaderCircle } from "../../../Loader/Loader";

import { validateEmail } from "../../../../functions/Validations";
import { validateNumbers } from "../../../../functions/Validations";

import { PostRequest } from "../../../../functions/PostRequest";
import { PutRequest } from "../../../../functions/PostRequest";
import { handlePostErrors } from "../../../../functions/handlePostErrors";
import { DeleteRequest } from "../../../../functions/GetRequest";

import Pagination from "../../../Pagination/Pagination";
import { LogViewer } from "../../../../functions/changesHandler";
import LoadingComponent from "../../../LoadingComponent/LoadingComponent";

import { BoardmemderRoleTypes } from "../../../../functions/BoardmemberRoleTypes";
import { ControlsChevronDown } from "@heathmont/moon-icons-tw";

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
  const [editLoading, SetEditLoading] = useState<boolean>(false);
  const [addLoading, SetAddLoading] = useState<boolean>(false);
  const [deleteLoading, SetdeleteLoading] = useState<boolean>(false);

  const [isLogOpen, setisLogOpen] = useState(false);
  const [LogNumber, setLogNumber] = useState(0);
  const [LogPage, setLogPage] = useState(0);
  const [LogLoading, setLogLoading] = useState(false);
  const [Changes, setChanges] = useState<string[]>([]);

  const closeModal = () => setIsOpen(false);
  const openModal = () => {
    setIsOpen(true);
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
        <div className="flex items-center gap-2 text-titleText dark:text-titleText-dark">
          {BoardmemderRoleTypes.find((item) => item.value === row.role)?.label}
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
        <div className="flex items-center gap-2 text-titleText dark:text-titleText-dark">
          <button  id={`EditBoardMember${row.id}`} className="transition-colors py-1 rounded-md" onClick={() => handleEdit(row)}>
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <title />
              <g id="Complete">
                <g id="edit">
                  <g>
                    <path d="M20,16v4a2,2,0,0,1-2,2H4a2,2,0,0,1-2-2V6A2,2,0,0,1,4,4H8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                    <polygon fill="none" points="12.5 15.8 22 6.2 17.8 2 8.3 11.5 8 16 12.5 15.8" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                  </g>
                </g>
              </g>
            </svg>
          </button>
          <button id={`ChangesBoardMember${row.id}`} className=" transition-colors py-1 rounded-md" onClick={async () => {
            setEditingId(row.id), setisLogOpen(true);
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12L14.5 14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M5.60423 5.60423L5.0739 5.0739V5.0739L5.60423 5.60423ZM4.33785 6.87061L3.58786 6.87438C3.58992 7.28564 3.92281 7.61853 4.33408 7.6206L4.33785 6.87061ZM6.87963 7.63339C7.29384 7.63547 7.63131 7.30138 7.63339 6.88717C7.63547 6.47296 7.30138 6.13549 6.88717 6.13341L6.87963 7.63339ZM5.07505 4.32129C5.07296 3.90708 4.7355 3.57298 4.32129 3.57506C3.90708 3.57715 3.57298 3.91462 3.57507 4.32882L5.07505 4.32129ZM3.75 12C3.75 11.5858 3.41421 11.25 3 11.25C2.58579 11.25 2.25 11.5858 2.25 12H3.75ZM16.8755 20.4452C17.2341 20.2378 17.3566 19.779 17.1492 19.4204C16.9418 19.0619 16.483 18.9393 16.1245 19.1468L16.8755 20.4452ZM19.1468 16.1245C18.9393 16.483 19.0619 16.9418 19.4204 17.1492C19.779 17.3566 20.2378 17.2341 20.4452 16.8755L19.1468 16.1245ZM5.14033 5.07126C4.84598 5.36269 4.84361 5.83756 5.13505 6.13191C5.42648 6.42626 5.90134 6.42862 6.19569 6.13719L5.14033 5.07126ZM18.8623 5.13786C15.0421 1.31766 8.86882 1.27898 5.0739 5.0739L6.13456 6.13456C9.33366 2.93545 14.5572 2.95404 17.8017 6.19852L18.8623 5.13786ZM5.0739 5.0739L3.80752 6.34028L4.86818 7.40094L6.13456 6.13456L5.0739 5.0739ZM4.33408 7.6206L6.87963 7.63339L6.88717 6.13341L4.34162 6.12062L4.33408 7.6206ZM5.08784 6.86684L5.07505 4.32129L3.57507 4.32882L3.58786 6.87438L5.08784 6.86684ZM12 3.75C16.5563 3.75 20.25 7.44365 20.25 12H21.75C21.75 6.61522 17.3848 2.25 12 2.25V3.75ZM12 20.25C7.44365 20.25 3.75 16.5563 3.75 12H2.25C2.25 17.3848 6.61522 21.75 12 21.75V20.25ZM16.1245 19.1468C14.9118 19.8483 13.5039 20.25 12 20.25V21.75C13.7747 21.75 15.4407 21.2752 16.8755 20.4452L16.1245 19.1468ZM20.25 12C20.25 13.5039 19.8483 14.9118 19.1468 16.1245L20.4452 16.8755C21.2752 15.4407 21.75 13.7747 21.75 12H20.25ZM6.19569 6.13719C7.68707 4.66059 9.73646 3.75 12 3.75V2.25C9.32542 2.25 6.90113 3.32791 5.14033 5.07126L6.19569 6.13719Z" fill="currentColor" />
            </svg>
          </button>
          <button id={`DeleteBoardMember${row.id}`} className="transition-colors py-1 rounded-md" onClick={() => {
            setdeleteForm(row);
            SetDeleteBox(true);
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M14 12V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M4 7H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M6 10V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      ),
    },
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
    GetRequest(
      process.env.NEXT_PUBLIC_API_URL +
      `/api/exchanges/${params.id}/board-members`
    )
      .then((response) => {
        const getData = response.result.content;
        setData(getData);
        SetC3(true);
      })
      .catch((err) => {
        console.log(err);
        SetC3(true);
      });
  }, []);

  const Audit = () => {
    setLogLoading(true);
    GetRequest(
      `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/audit/board-members/${editingId}?page=${LogPage}&size=10&sort=updatedAt,DESC`
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
    DeleteRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/board-members/${row.id}`)
      .then((response) => {
        toast.success("عضو هیئت‌مدیره و سهامداران با موفقیت حذف شد.", { position: "bottom-left" });
        setData(prevData => prevData.filter(person => person.id !== row.id));
        SetDeleteBox(false);
      })
      .catch((err) => {
        handlePostErrors(err)
      })
      .finally(() => {
        SetdeleteLoading(false);
      })
  };

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
  const isDigits = (val: string, len?: number) =>
    /^\d+$/.test(val) && (!len || val.length === len);
  const hasNoSpecialChars = (val: string) =>
    /^[\u0600-\u06FFa-zA-Z0-9\s]+$/.test(val);

  const handleSave = async () => {
    if (!editingId) return;

    const name = normalize(form.name);
    const phoneNumber = normalize(form.phoneNumber);
    const nationalCode = normalize(form.nationalCode);
    const role = normalize(form.role);
    const email = normalize(form.email);
    const sharePercentage = Number(form.sharePercentage ?? 0);

    // ✅ ولیدیشن‌ها
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
    if (!role)
      return toast.error("سمت یا نقش الزامی است", { position: "bottom-left" });
    if (isNaN(sharePercentage))
      return toast.error("درصد سهام را به‌درستی وارد کنید", {
        position: "bottom-left",
      });
    if (sharePercentage < 0 || sharePercentage > 100)
      return toast.error("درصد سهام باید بین ۰ تا ۱۰۰ باشد", {
        position: "bottom-left",
      });
    if (email && !validateEmail(email))
      return toast.error("ایمیل را به‌درستی وارد کنید", {
        position: "bottom-left",
      });

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

    PutRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/board-members/${editingId}`, payload)
      .then((res) => {
        toast.success("عضو هیئت‌مدیره و سهامداران با موفقیت ویرایش شد.", {
          position: "bottom-left",
        });
        setData((prev) =>
          prev.map((item) =>
            item.id === editingId ? { ...form, id: editingId } : item
          )
        );
        closeModal();
      })
      .catch((err) => {
        handlePostErrors(err)
      })
      .finally(() => {
        SetEditLoading(false);
      })
  };

  const handleAdd = async () => {
    const name = normalize(form.name);
    const phoneNumber = normalize(form.phoneNumber);
    const nationalCode = normalize(form.nationalCode);
    const role = normalize(form.role);
    const email = normalize(form.email);

    // ولیدیشن‌ها...
    if (!name)
      return toast.error("نام و نام‌خانوادگی الزامی است", {
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
    if (!role)
      return toast.error("سمت یا نقش الزامی است", { position: "bottom-left" });
    const sharePercentageNum = parseFloat(
      String(form.sharePercentage ?? "").trim()
    );
    if (isNaN(sharePercentageNum))
      return toast.error("درصد سهام را به‌درستی وارد کنید", {
        position: "bottom-left",
      });
    if (sharePercentageNum < 0 || sharePercentageNum > 100)
      return toast.error("درصد سهام باید بین ۰ تا ۱۰۰ باشد", {
        position: "bottom-left",
      });
    if (email && !validateEmail(email))
      return toast.error("ایمیل را به‌درستی وارد کنید", {
        position: "bottom-left",
      });

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

    PostRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/board-members`, payload)
      .then((res) => {
        toast.success("عضو جدید هیئت‌مدیره و سهامداران با موفقیت افزوده شد.", {
          position: "bottom-left",
        });
        setData((prev) => [
          ...prev,
          {
            ...payload,
            id: res?.result?.id ?? String(prev.length + 1),
          },
        ]);

        closeAddModal();
      })
      .catch((err) => {
        handlePostErrors(err)
      })
      .finally(() => {
        SetAddLoading(false);
      })
  };

  return (
    <div className="mt-4">
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
                <label>نقش *</label>
                <div className="relative w-full mt-2">
                  <Dropdown
                    onChange={(e) => {
                      if (typeof e === "string") {
                        setForm({ ...form, role: e });
                      }
                    }}
                    value={form.role}
                  >
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
                        <span>
                          {form.role !== ""
                            ? BoardmemderRoleTypes.find(
                              (item) => item.value === form.role
                            )?.label
                            : "انتخاب"}
                        </span>
                      </Button>
                    </Dropdown.Trigger>

                    <Dropdown.Options
                      className="absolute left-0 mt-2 w-72 pl-2 pr-2
                 text-gray-700 bg-white dark:bg-buttonColor-dark
                 border border-gray-300 dark:border-buttonBorderColor-dark 
                 rounded-lg dark:text-gray-100 appearance-none z-50
                 max-h-60 overflow-y-auto"
                    >
                      {BoardmemderRoleTypes.map((item, index) => {
                        return (
                          <Dropdown.Option
                            value={item.value}
                            key={`option${index}`}
                          >
                            {({ selected, active }) => (
                              <MenuItem
                                isActive={active}
                                isSelected={selected}
                                className={`border mt-2 mb-1 rounded-md border-gray-100 dark:border-buttonBorderColor-dark ${form.role === item.value
                                  ? "bg-gray-100 border-gray-200 dark:bg-gray-700"
                                  : ""
                                  }`}
                              >
                                <MenuItem.Title>{item.label}</MenuItem.Title>
                              </MenuItem>
                            )}
                          </Dropdown.Option>
                        );
                      })}
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
                  onChange={(e) =>
                    setForm({ ...form, educationalHistory: e.target.value })
                  }
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
            <div className="p-4 border-t border-boxBorderColor dark:border-boxBorderColor-dark flex justify-end gap-2">
              <Button variant="ghost" onClick={closeModal}>
                انصراف
              </Button>
              <Button variant="ghost" onClick={handleSave}>
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
          <Modal.Panel className="w-full max-w-xl rounded-lg bg-white dark:bg-bgColor-dark shadow-lg mt-[200px] text-titleText dark:text-titleText-dark">
            <div className="p-4 border-b border-boxBorderColor dark:border-boxBorderColor-dark">
              <Modal.Title className="text-lg font-bold text-titleText dark:text-titleText-dark">
                افزودن عضو جدید هیئت‌مدیره و سهامداران
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
                <label>نقش *</label>
                <div className="relative w-full mt-2">
                  <Dropdown
                    onChange={(e) => {
                      if (typeof e === "string") {
                        setForm({ ...form, role: e });
                      }
                    }}
                    value={form.role}
                  >
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
                      {BoardmemderRoleTypes.map((item, index) => {
                        return (
                          <Dropdown.Option
                            value={item.label}
                            key={`option${index}`}
                          >
                            {({ selected, active }) => (
                              <MenuItem
                                isActive={active}
                                isSelected={selected}
                                className={`border mt-2 mb-1 rounded-md border-gray-100 dark:border-buttonBorderColor-dark ${form.role === item.label
                                  ? "bg-gray-100 border-gray-200 dark:bg-gray-700"
                                  : ""
                                  }`}
                              >
                                <MenuItem.Title>{item.label}</MenuItem.Title>
                              </MenuItem>
                            )}
                          </Dropdown.Option>
                        );
                      })}
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
                  onChange={(e) =>
                    setForm({ ...form, educationalHistory: e.target.value })
                  }
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
            <div className="p-4 border-t flex justify-end gap-2 border-boxBorderColor dark:border-boxBorderColor-dark">
              <Button variant="ghost" onClick={closeAddModal}>
                انصراف
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  handleAdd();
                }}
              >
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
            <h4 className="mb-2 mt-2">
              تغییرات مشخصات عضو هیئت‌مدیره و سهامداران
            </h4>
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
              حذف عضو هیئت‌مدیره و سهامداران
            </h3>

            <p className="text-sm mb-6 text-center leading-relaxed">
              {`آیا از حذف عضو هیئت‌مدیره و سهامداران مطمئن هستید؟`}
            </p>

            <div className="flex justify-center gap-4 w-full">
              <button
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

export default BoardMemberTable;
