import React, { JSX, useEffect, useRef, useState } from "react";
import DetailBox from "../../../DetailBox/DetailBox";
import { Modal, Button, Input, Label, Dropdown, MenuItem } from "@heathmont/moon-core-tw";
import { GetRequest } from "../../../../functions/GetRequest";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { LoaderCircle } from "../../../Loader/Loader";
import { PostRequest } from "../../../../functions/PostRequest";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  addHttps,
  removeProtocolAndWWW,
  validateDomainExtension,
  validateEmail,
} from "../../../../functions/Validations";
import { validateNumbers } from "../../../../functions/Validations";
import { dateValidation } from "../../../../functions/Validations";
import { LogViewer } from "../../../../functions/changesHandler";
import LoadingComponent from "../../../LoadingComponent/LoadingComponent";
import Pagination from "../../../Pagination/Pagination";
import { toJalaliDate } from "../../../../functions/toJalaliDate";
import JalaliLocalDatePicker from "../../../DatePicker/JalaliLocalDatePicker";
import { ControlsChevronDown } from "@heathmont/moon-icons-tw";
import PersianYearSelect from "../../../YearSelection/YearSelection";

type AnyObj = Record<string, any>;

interface InvoiceContent {
  id: number;
  title: string;
  content: React.ReactNode;
}

interface InvoiceSection {
  id: number;
  title: string;
  content: InvoiceContent[];
}

type ExchangeInfoProps = {
  SetC1: React.Dispatch<React.SetStateAction<boolean>>;
};

const Exchange_info = ({ SetC1 }: ExchangeInfoProps) => {
  const params = useParams<{ id: string }>();
  const [logo, SetLogo] = useState<string>("");
  const [name, SetName] = useState<string>("");
  const [DownloadLoading, SetDownloadLoading] = useState<boolean>(false);
  const [AddFileModal, SetAddFileModal] = useState<boolean>(false)
  const [type, Settype] = useState<string>("")
  const [FinancialName, SetFinancialName] = useState<number>(0)
  const [composing, setComposing] = useState(false);
  const [Loading, setLoading] = useState<boolean>(false);
  const [form, setForm] = useState({
    legalName: "",
    establishmentDate: "",
    nationalCode: "",
    type: "",
    exchangeType: "",
    siteAddress: "",
    phoneNumber: "",
    emergencyPhoneNumber: "",
    officeAddress: "",
    email: "",
    financialCode: "",
    registrationNumber: "",
  });
  const [LogNumber, setLogNumber] = useState(0);
  const [LogPage, setLogPage] = useState(0);
  const [LogLoading, setLogLoading] = useState(false);
  const [isLogOpen, setisLogOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading2] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [Changes, setChanges] = useState<string[]>([]);

  const didInit = useRef(false);

  async function generateCompanyExcel(data: AnyObj) {
    const wb = new ExcelJS.Workbook();

    // مشخصات پایه
    const base = wb.addWorksheet("مشخصات پایه");
    base.columns = [
      { header: "عنوان", key: "label", width: 25 },
      { header: "مقدار", key: "value", width: 40 },
    ];
    [
      ["عنوان", data.name],
      ["عنوان حقوقی", data.legalName],
      ["نوع پلتفرم", data.type],
      ["شکل حقوقی", data.exchangeType],
      ["شماره ثبت", data.registrationNumber],
      ["شناسه ملی", data.nationalCode],
      ["کد اقتصادی", data.financialCode],
      ["تاریخ تأسیس", data.establishmentDate],
      ["تلفن", data.phoneNumber],
      ["تلفن اضطراری", data.emergencyPhoneNumber],
      ["ایمیل", data.email],
      ["وب‌سایت", data.siteAddress],
      ["آدرس دفتر", data.officeAddress],
    ].forEach(([label, value]) => {
      base.addRow({ label, value: value ?? "-" });
    });

    // مدیرعامل
    if (data.managerInfo) {
      const ws = wb.addWorksheet("مدیرعامل");
      ws.columns = [
        { header: "نام", key: "name", width: 20 },
        { header: "تلفن", key: "phoneNumber", width: 20 },
        { header: "کد ملی", key: "nationalCode", width: 20 },
        { header: "تحصیلات", key: "educationalHistory", width: 25 },
        { header: "سوابق شغلی", key: "careerHistory", width: 25 },
        { header: "درصد سهام", key: "sharePercentage", width: 15 },
        { header: "ایمیل", key: "email", width: 30 },
      ];
      ws.addRow(data.managerInfo);
    }

    // هیئت مدیره
    if (Array.isArray(data.boardMemberInfo) && data.boardMemberInfo.length) {
      const ws = wb.addWorksheet("هیئت‌مدیره");
      ws.columns = [
        { header: "نام", key: "name", width: 20 },
        { header: "تلفن", key: "phoneNumber", width: 20 },
        { header: "کد ملی", key: "nationalCode", width: 20 },
        { header: "تحصیلات", key: "educationalHistory", width: 25 },
        { header: "سوابق شغلی", key: "careerHistory", width: 25 },
        { header: "درصد سهام", key: "sharePercentage", width: 15 },
        { header: "ایمیل", key: "email", width: 30 },
        { header: "نقش", key: "role", width: 20 },
      ];
      data.boardMemberInfo.forEach((m: AnyObj) => ws.addRow(m));
    }

    // نمایندگان
    if (
      Array.isArray(data.exchangeAgentInfo) &&
      data.exchangeAgentInfo.length
    ) {
      const ws = wb.addWorksheet("نمایندگان");
      ws.columns = [
        { header: "نام", key: "name", width: 20 },
        { header: "تلفن", key: "phoneNumber", width: 20 },
        { header: "کد ملی", key: "nationalCode", width: 20 },
      ];
      data.exchangeAgentInfo.forEach((a: AnyObj) => ws.addRow(a));
    }

    // کارکنان
    if (Array.isArray(data.employeeInfo) && data.employeeInfo.length) {
      const ws = wb.addWorksheet("کارکنان");
      ws.columns = [
        { header: "نام", key: "name", width: 20 },
        { header: "سمت", key: "jobPosition", width: 20 },
        { header: "تلفن", key: "phoneNumber", width: 20 },
        { header: "کد ملی", key: "nationalCode", width: 20 },
        { header: "تاریخ شروع", key: "startDate", width: 20 },
        { header: "تحصیلات", key: "educationalHistory", width: 25 },
        { header: "سوابق شغلی", key: "careerHistory", width: 25 },
        { header: "شروع بیمه", key: "insuranceStartDate", width: 20 },
        { header: "پایان بیمه", key: "insuranceEndDate", width: 20 },
        { header: "دسترسی ویژه", key: "isSpecialAccess", width: 15 },
      ];
      data.employeeInfo.forEach((e: AnyObj) =>
        ws.addRow({
          ...e,
          isSpecialAccess: e.isSpecialAccess ? "دارد" : "ندارد",
        })
      );
    }

    // صورت‌های مالی
    if (
      Array.isArray(data.financialStatements) &&
      data.financialStatements.length
    ) {
      const ws = wb.addWorksheet("صورت‌های مالی");
      ws.columns = [
        { header: "عنوان", key: "title", width: 25 },
        { header: "تاریخ", key: "date", width: 20 },
        { header: "توضیحات", key: "description", width: 40 },
      ];
      data.financialStatements.forEach((f: AnyObj) => ws.addRow(f));
    }

    // ذخیره به فایل
    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf]), `${data.name || "report"}.xlsx`);
  }
  const download = async () => {
    try {
      const res = await GetRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}`
      );
      if (!res?.result) {
        toast.error("داده‌ای دریافت نشد");
        return;
      }
      await generateCompanyExcel(res.result);
      toast.success("دانلود با موفقیت انجام شد");
    } catch (error) {
      console.error(error);
      toast.error("خطا در دانلود داده‌ها");
    } finally {
    }
  };
  const [invoiceData, setInvoiceData] = useState<InvoiceSection[]>([
    {
      id: 1,
      title: "مشخصات پایه",
      content: [
        { id: 1, title: "نام حقوقی", content: "" },
        { id: 2, title: "تاریخ تاسیس", content: "" },
        { id: 3, title: "شناسه ملی صرافی", content: "" },
        { id: 4, title: "نوع صرافی", content: "" },
        { id: 5, title: "شکل حقوقی صرافی", content: "" },
        { id: 6, title: "کد اقتصادی", content: "" },
        { id: 7, title: "شماره ثبت", content: "" },
      ],
    },
    {
      id: 2,
      title: "اطلاعات تماس",
      content: [
        { id: 1, title: "آدرس سایت", content: "" },
        { id: 2, title: "شماره تماس", content: "" },
        { id: 3, title: "شماره تماس اضطراری", content: "" },
        { id: 4, title: "آدرس", content: "" },
        { id: 5, title: "ایمیل", content: "" },
      ],
    },
    {
      id: 3,
      title: "اسناد",
      content: [],
    },
    {
      id: 4,
      title: "عملیات",
      content: [
        {
          id: 1,
          content: (
            <div
              className="text-center w-full cursor-pointer"
              onClick={() => {
                setIsOpen(true);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="inline-block ml-1"
              >
                <path
                  d="M13.2594 3.60022L5.04936 12.2902C4.73936 12.6202 4.43936 13.2702 4.37936 13.7202L4.00936 16.9602C3.87936 18.1302 4.71936 18.9302 5.87936 18.7302L9.09936 18.1802C9.54936 18.1002 10.1794 17.7702 10.4894 17.4302L18.6994 8.74022C20.1194 7.24022 20.7594 5.53022 18.5494 3.44022C16.3494 1.37022 14.6794 2.10022 13.2594 3.60022Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11.8906 5.0498C12.3206 7.8098 14.5606 9.9198 17.3406 10.1998"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 22H21"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <span>ویرایش</span>
            </div>
          ),
          title: "",
        },
        {
          id: 2,
          content: (
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => {
                download();
              }}
            >
              <span className="flex items-center ml-1">
                {
                  DownloadLoading ?
                    <LoaderCircle size={8} color="border-white-500" />
                    :
                    <svg
                      width="24px"
                      height="24px"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 3V16M12 16L16 11.625M12 16L8 11.625"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M15 21H9C6.17157 21 4.75736 21 3.87868 20.1213C3 19.2426 3 17.8284 3 15M21 15C21 17.8284 21 19.2426 20.1213 20.1213C19.8215 20.4211 19.4594 20.6186 19 20.7487"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                }

              </span>
              <p className="text-right">دریافت Excel</p>
            </div>
          ),
          title: "",
        },
        {
          id: 3,
          content: (
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => {
                setisLogOpen(true)
                setLogPage(0)
                setLogNumber(0)
              }}
            >
              <span className="flex items-center ml-1 text-titleText dark:text-titleText-dark">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.06152 12C5.55362 8.05369 8.92001 5 12.9996 5C17.4179 5 20.9996 8.58172 20.9996 13C20.9996 17.4183 17.4179 21 12.9996 21H8M13 13V9M11 3H15M3 15H8M5 18H10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>           </span>
              <p className="text-right">تاریخچه تغییرات</p>
            </div>
          ),
          title: "",
        },
      ],
    },
  ]);
  const handleEdit = (
    sectionId: number,
    contentId: number,
    newContent: React.ReactNode
  ) => {
    setInvoiceData((prevData) =>
      prevData.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            content: section.content.map((item) => {
              if (item.id === contentId) {
                return { ...item, content: newContent };
              }
              return item;
            }),
          };
        }
        return section;
      })
    );
  };
  const handleDownload = async () => {
    try {
      SetDownloadLoading(true)
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/association/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) { throw new Error("خطا در دریافت فایل") } else {
        SetDownloadLoading(false)
      };

      // باینری فایل رو بگیر و دانلود کن
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "assasname.pdf"; // یا از header سرور بگیر
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      SetDownloadLoading(false)
      toast.error("خطا در دانلود فایل");
    }
  };
  const addAssociationDocuments = (financialStatement?: string | null) => {

    const buildItem = () => ({
      id: Date.now(),
      title: "",
      content: (
        // اطمینان از تمام‌عرض بودن در هر دو حالت Grid و Flex
        <div className="w-full col-span-full flex flex-col">

          {financialStatement && (
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center">
                <h6 className="inline-block">اساسنامه</h6>
              </div>
              <div className="flex items-center">
                <button
                  onClick={handleDownload}
                  className="text-titleText dark:text-titleText-dark mr-2"
                >
                  {/* ... SVG دانلود ... */}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 3V16M12 16L16 11.625M12 16L8 11.625"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15 21H9C6.17157 21 4.75736 21 3.87868 20.1213C3 19.2426 3 17.8284 3 15M21 15C21 17.8284 21 19.2426 20.1213 20.1213C19.8215 20.4211 19.4594 20.6186 19 20.7487"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <button
                  onClick={async () => {
                    try {
                      const token = document.cookie
                        .split("; ")
                        .find((row) => row.startsWith("token="))
                        ?.split("=")[1];

                      if (!token) {
                        toast.error("توکن موجود نیست، لطفاً وارد سیستم شوید.", { position: "bottom-left" });
                        return;
                      }

                      const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/association/delete`,
                        {
                          method: "DELETE",
                          headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                          },
                        }
                      );

                      if (!response.ok) {
                        return toast.error("خطا در حذف اساسنامه");
                      } else {
                        toast.success("اساسنامه با موفقیت حذف شد.", { position: "bottom-left" });
                        window.location.reload();
                      }
                    } catch (err) {
                      console.error(err);
                      return toast.error("خطا در حذف اساسنامه");
                    }
                  }}
                  className="text-titleText dark:text-titleText-dark mr-1"
                >
                  {/* ... SVG حذف ... */}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 1024 1024"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="currentColor"
                      d="M160 256H96a32 32 0 0 1 0-64h256V95.936a32 32 0 0 1 32-32h256a32 32 0 0 1 32 32V192h256a32 32 0 1 1 0 64h-64v672a32 32 0 0 1-32 32H192a32 32 0 0 1-32-32V256zm448-64v-64H416v64h192zM224 896h576V256H224v640zm192-128a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32zm192 0a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
          {/* ردیف دوم: دکمه افزودن — همیشه زیرِ ردیف اول می‌آید */}
          <div className="mt-4 w-full">
            <Button
              variant="primary"
              className="text-primary dark:text-primary-dark border border-primary rounded-md w-full"
              onClick={() => SetAddFileModal(true)}
            >
              افزودن مورد جدید
            </Button>
          </div>
        </div>
      ),
    });


    // الحاق (append) به سکشن ۳؛ نه جایگزینی کل content
    setInvoiceData((prev) =>
      prev.map((section) =>
        section.id === 3
          ? {
            ...section,
            content: [...section.content, buildItem()], // ← اضافه‌کردن به انتهای لیست
          }
          : section
      )
    );
  };
  useEffect(() => {
    if (didInit.current) return;   // ← جلوی بار دوم را می‌گیرد
    didInit.current = true;

    GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/exchanges/${params.id}`)
      .then((response) => {
        SetLogo(response.result.logo);
        SetName(response.result.name);
        handleEdit(1, 1, response.result.legalName);
        handleEdit(1, 2, toJalaliDate(response.result.establishmentDate));
        handleEdit(1, 3, response.result.nationalCode);
        handleEdit(1, 4, response.result.type);
        handleEdit(1, 5, response.result.exchangeType === 'STOCK' ? 'سهامی' : response.result.exchangeType === 'LIMITED_LIABILITY' ? 'مسئولیت محدود' : '');
        handleEdit(1, 6, response.result.financialCode);
        handleEdit(1, 7, String(response.result.registrationNumber));
        if (
          response.result.siteAddress !== "" &&
          response.result.siteAddress !== null
        ) {
          handleEdit(
            2,
            1,
            <a
              href={response.result.siteAddress}
              className="text-primary dark:text-primary-dark"
            >
              {response.result.siteAddress}
            </a>
          );
        }

        handleEdit(2, 2, response.result.phoneNumber);
        handleEdit(2, 3, response.result.emergencyPhoneNumber);
        handleEdit(2, 4, response.result.officeAddress);
        handleEdit(2, 5, response.result.email);
        if (
          response.result.association !== null &&
          response.result.association !== ""
        ) {
          handleEdit(
            3,
            1,
            <a
              href={response.result.association}
              className="text-primary dark:text-primary-dark"
            >
              دریافت
            </a>
          );
        }
        addAssociationDocuments(response.result.association);

        setForm({
          legalName: response.result.legalName,
          establishmentDate: response.result.establishmentDate,
          nationalCode: response.result.nationalCode,
          type: response.result.type,
          exchangeType: response.result.exchangeType,
          siteAddress: response.result.siteAddress,
          phoneNumber: response.result.phoneNumber,
          emergencyPhoneNumber: response.result.emergencyPhoneNumber,
          officeAddress: response.result.officeAddress,
          email: response.result.email,
          financialCode: response.result.financialCode,
          registrationNumber: response.result.registrationNumber,
        });
        SetC1(true);
      })
      .catch((err) => {
        SetC1(true);
      });
  }, []);
  const handleSave = () => {
    if (form.legalName === "") {
      toast.error("نام حقوقی صرافی مورد نظر را انتخاب کنید", {
        position: "bottom-left",
      });
      return;
    }
    if (form.nationalCode === "") {
      toast.error("شناسه ملی صرافی مورد نظر را انتخاب کنید", {
        position: "bottom-left",
      });
      return;
    }
    if (form.financialCode === "") {
      toast.error("کد اقتصادی صرافی مورد نظر را انتخاب کنید", {
        position: "bottom-left",
      });
      return;
    }
    if (form.registrationNumber === "") {
      toast.error("شماره ثبت صرافی مورد نظر را انتخاب کنید", {
        position: "bottom-left",
      });
      return;
    }
    if (form.exchangeType === "") {
      toast.error("شکل حقوقی صرافی مورد نظر را انتخاب کنید", {
        position: "bottom-left",
      });
      return;
    }
    if (form.type === "") {
      toast.error("نوع صرافی مورد نظر را انتخاب کنید", {
        position: "bottom-left",
      });
      return;
    }
    if (form.establishmentDate === "") {
      toast.error("تاریخ تاسیس صرافی مورد نظر را انتخاب کنید", {
        position: "bottom-left",
      });
      return;
    }
    if (form.siteAddress === "") {
      toast.error("وبسایت صرافی مورد نظر را انتخاب کنید", {
        position: "bottom-left",
      });
      return;
    }
    if (form.phoneNumber === "") {
      toast.error("شماره تماس صرافی مورد نظر را انتخاب کنید", {
        position: "bottom-left",
      });
      return;
    }
    if (!validateEmail(form.email) && form.email !== "") {
      toast.error("ایمیل صرافی مورد نظر را به درستی وارد کنید", {
        position: "bottom-left",
      });
      return;
    }
    if (!validateDomainExtension(form.siteAddress)) {
      toast.error("پسوند سایت صرافی مورد نظر را به درستی وارد کنید", {
        position: "bottom-left",
      });
      return;
    }

    setLoading(true);
    GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/exchanges/${params.id}`)
      .then(async (response) => {
        const managerInfo = response.result;

        managerInfo.legalName = form.legalName;
        managerInfo.establishmentDate = form.establishmentDate;
        managerInfo.nationalCode = form.nationalCode;
        managerInfo.type = form.type;
        managerInfo.exchangeType = form.exchangeType;
        managerInfo.siteAddress = form.siteAddress;
        managerInfo.phoneNumber = form.phoneNumber;
        managerInfo.emergencyPhoneNumber = form.emergencyPhoneNumber;
        managerInfo.officeAddress = form.officeAddress;
        managerInfo.email = form.email;
        managerInfo.financialCode = form.financialCode;
        managerInfo.registrationNumber = form.registrationNumber;

        try {
          const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1];

          if (!token) {
            toast.error("توکن موجود نیست، لطفاً وارد سیستم شوید.", {
              position: "bottom-left",
            });
            return;
          }

          setLoading(true);
          const response = await fetch(
            process.env.NEXT_PUBLIC_API_URL + `/api/exchanges/${params.id}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(managerInfo),
            }
          );

          if (!response.ok) {
            console.log(response);
            setLoading(false);
            return toast.error(`خطا در ذخیره مشخصات صرافی`);
          } else {
            const responseData = await response.json();
            console.log(responseData);
            toast.success("مشخصات با موفقیت ذخیره شد.", {
              position: "bottom-left",
            });
            setLoading(false);
            setInvoiceData((prev) => {
              const newData = [...prev];
              newData[0].content = [
                { id: 1, title: "نام حقوقی", content: form.legalName },
                {
                  id: 2,
                  title: "تاریخ تاسیس",
                  content: form.establishmentDate,
                },
                { id: 3, title: "شناسه ملی صرافی", content: form.nationalCode },
                { id: 4, title: "نوع صرافی", content: form.type },
                { id: 5, title: "شکل حقوقی صرافی", content: form.exchangeType },
                { id: 6, title: "کد اقتصادی", content: form.financialCode },
                {
                  id: 7,
                  title: "شماره ثبت",
                  content: String(form.registrationNumber),
                },
              ];
              newData[1].content = [
                {
                  id: 1,
                  title: "آدرس سایت",
                  content: (
                    <a
                      href={form.siteAddress}
                      className="text-primary dark:text-primary-dark"
                    >
                      {form.siteAddress}
                    </a>
                  ),
                },
                { id: 2, title: "شماره تماس", content: form.phoneNumber },
                {
                  id: 3,
                  title: "شماره تماس اضطراری",
                  content: form.emergencyPhoneNumber,
                },
                { id: 4, title: "آدرس", content: form.officeAddress },
                { id: 5, title: "ایمیل", content: form.email },
              ];

              return newData;
            });

            setIsOpen(false);
          }
        } catch (err) {
          setLoading(false);
          console.error(err);
          return toast.error(`خطا در ذخیره اطلاعات صرافی`);
        }
      })
      .catch((err) => {
        console.log(err);
        return toast.error(`خطا در ذخیره اطلاعات صرافی`);
      });
  };
  function handleEstablishmentDateChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = e.target.value;
    const prev = form.establishmentDate ?? "";
    const inputType = (e.nativeEvent as InputEvent | undefined)?.inputType;
    if (value === "") {
      setForm((p) => ({ ...p, establishmentDate: "" }));
      return;
    }
    const isDeleting =
      inputType?.startsWith("delete") || value.length < prev.length;
    if (isDeleting) {
      setForm((p) => ({ ...p, establishmentDate: value }));
      return;
    }
    if (composing) {
      setForm((p) => ({ ...p, establishmentDate: value }));
      return;
    }
    if (dateValidation(value)) {
      setForm((p) => ({ ...p, establishmentDate: value }));
    }
  }
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setFileName(f ? f.name : "");
  };
  const uploadFile = async () => {
    try {
      setLoading2(true);

      if (type === 'اساسنامه') {
        if (!file) { toast.error("فایلی انتخاب نشده"); return; }

        await PostRequest(
          `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/association/upload`,
          { association: file },
          { asFormData: true }
        );

        toast.success("اساسنامه با موفقیت بارگذاری شد");

      } else if (type === 'صورت مالی') {
        await PostRequest(
          `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/financial-statements`,
          { date: String(FinancialName) }
        );
        toast.success("صورت مالی با موفقیت بارگذاری شد");
      }

      setFile(null);
      setFileName("");
      SetAddFileModal(false);

      // اگر واقعا نیاز به ریفرش داری، یک تاخیر کوتاه بده تا UI آپدیت شود
      setTimeout(() => window.location.reload(), 500);

    } catch (e: any) {
      toast.error(e?.message || "خطا در آپلود");
    } finally {
      setLoading2(false);
    }
  };
  const handleSelectChange = (event: string) => {
    Settype(event);
  };
  const Audit = () => {
    setLogLoading(true)
    GetRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/audit/exchange/${params.id}?page=${LogPage}&size=10`)
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
    <div>
      {logo !== null && logo !== "" ? (
        <img alt="image" className="w-8 h-8 inline-block" src={logo} />
      ) : (
        <div
          className=" items-center text-titleText dark:text-titleText-dark inline-block "
          style={{ marginBottom: "-6px" }}
        >
          <svg
            width="30px"
            height="30px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.2639 15.9376L12.5958 14.2835C11.7909 13.4852 11.3884 13.0861 10.9266 12.9402C10.5204 12.8119 10.0838 12.8166 9.68048 12.9537C9.22188 13.1096 8.82814 13.5173 8.04068 14.3327L4.04409 18.2802M14.2639 15.9376L14.6053 15.5991C15.4112 14.7999 15.8141 14.4003 16.2765 14.2544C16.6831 14.1262 17.12 14.1312 17.5236 14.2688C17.9824 14.4252 18.3761 14.834 19.1634 15.6515L20 16.4936M14.2639 15.9376L18.275 19.9566M20.9992 6.00011H14.9992M11 3.99951L7.2 4.00011C6.07989 4.00011 5.51984 4.00011 5.09202 4.21809C4.71569 4.40984 4.40973 4.7158 4.21799 5.09213C4 5.51995 4 6.08 4 7.20011V16.8001C4 17.4576 4 17.9222 4.04409 18.2802M20 9.99951V16.4936M4.04409 18.2802C4.07512 18.5322 4.12796 18.7314 4.21799 18.9081C4.40973 19.2844 4.71569 19.5904 5.09202 19.7821C5.51984 20.0001 6.07989 20.0001 7.2 20.0001H16.8C17.9201 20.0001 18.4802 20.0001 18.908 19.7821C19.2843 19.5904 19.5903 19.2844 19.782 18.9081C20 18.4803 20 17.9202 20 16.8001V16.4936"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
      <h3 className="inline-block text-2xl text-bold mr-2 text-titleText dark:text-titleText-dark">
        {name}
      </h3>
      <h5 className="font-bold text-lg text-titleText dark:text-titleText-dark mt-4">
        مشخصات صرافی
      </h5>
      <DetailBox
        data={invoiceData.map((section) => ({
          title: section.title,
          content: section.content.map((item) => ({
            title: item.title,
            content:
              typeof item.content === "string"
                ? item.content
                : React.isValidElement(item.content)
                  ? item.content
                  : "", // تبدیل به string یا Element
          })),
        }))}
        downloadLink="/path/to/pdf"
      />

      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <Modal.Backdrop />
        <div className="fixed inset-0 flex z-50 backdrop-blur-sm bg-white/10">
          <Modal.Panel className="w-full max-w-2xl rounded-lg bg-white dark:bg-bgColor-dark shadow-lg mt-[200px] text-titleText dark:text-titleText-dark">
            <div className="p-4 border-b border-boxBorderColor dark:border-boxBorderColor-dark">
              <Modal.Title className="text-lg font-bold">
                ویرایش مشخصات صرافی {"نوبیتکس"}
              </Modal.Title>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label>نام حقوقی</label>
                <Input
                  className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark"
                  value={form.legalName}
                  onChange={(e) =>
                    setForm({ ...form, legalName: e.target.value })
                  }
                />
              </div>
              <div>
                <label>تاریخ تأسیس</label>
                <div className="mt-2">
                  <JalaliLocalDatePicker
                    value={form.establishmentDate}
                    onChange={(val) => setForm(p => ({ ...p, establishmentDate: val !== null ? val : '' }))}
                    placeholder=""
                    clearable
                    min="2000-01-01"
                    max="2030-12-31"
                  />
                </div>

              </div>
              <div>
                <label>شناسه ملی صرافی</label>
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
                />
              </div>
              <div>
                <label>نوع صرافی</label>

                <div className="relative w-full mt-2">
                  <Dropdown
                    value={form.type}
                    onChange={(v: unknown) => {
                      if (v === "P2P" || v === "OTC") {
                        setForm((p) => ({ ...p, type: v }));
                      }
                    }}
                  >
                    <Dropdown.Trigger className="w-full">
                      <Button
                        as="span"
                        role="button"
                        variant="ghost"
                        className="flex items-center justify-between w-full pl-10 py-2 bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark
                    border border-gray-300 
                   rounded-lg dark:border-buttonBorderColor-dark focus:outline-none 
                   appearance-none relative"
                      >
                        <span>{form.type !== "" ? form.type : "انتخاب"}</span>
                      </Button>
                    </Dropdown.Trigger>

                    <Dropdown.Options
                      className="absolute left-0 mt-2 w-72 pl-2 pr-2
                 text-gray-700 bg-white dark:bg-buttonColor-dark
                 border border-gray-300 dark:border-buttonBorderColor-dark 
                 rounded-lg dark:text-gray-100 appearance-none z-50
                 max-h-60 overflow-y-auto"
                    >
                      <Dropdown.Option value="P2P" key="option1">
                        {({ selected, active }) => (
                          <MenuItem
                            isActive={active}
                            isSelected={selected}
                            className={`border mt-2 mb-1 rounded-md border-gray-100 dark:border-buttonBorderColor-dark ${form.type === "P2P"
                              ? "bg-gray-100 border-gray-200 dark:bg-gray-700"
                              : ""
                              }`}
                          >
                            <MenuItem.Title>P2P</MenuItem.Title>
                          </MenuItem>
                        )}
                      </Dropdown.Option>
                      <Dropdown.Option value="OTC" key="option2">
                        {({ active }) => (
                          <MenuItem
                            isActive={active}
                            className={`border mt-2 mb-1 rounded-md border-gray-100 dark:border-buttonBorderColor-dark ${form.type === "OTC"
                              ? "bg-gray-100 border-gray-200 dark:bg-gray-700"
                              : ""
                              }`}
                          >
                            <MenuItem.Title>OTC</MenuItem.Title>
                          </MenuItem>
                        )}
                      </Dropdown.Option>
                    </Dropdown.Options>
                  </Dropdown>
                  <ControlsChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-titleText dark:text-titleText-dark pointer-events-none" />
                </div>
              </div>
              <div>
                <label>کد اقتصادی</label>
                <Input
                  className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark"
                  value={form.financialCode}
                  onChange={(e) => {
                    if (validateNumbers(e.target.value)) {
                      setForm({ ...form, financialCode: e.target.value });
                    }
                  }}
                />
              </div>
              <div>
                <label>شماره ثبت</label>
                <Input
                  className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark"
                  value={form.registrationNumber}
                  onChange={(e) => {
                    if (validateNumbers(e.target.value)) {
                      setForm({ ...form, registrationNumber: e.target.value });
                    }
                  }}
                />
              </div>
              <div>
                <label>شکل حقوقی</label>

                <div className="relative w-full mt-2">
                  <Dropdown
                    value={form.exchangeType}
                    onChange={(v: unknown) => {
                      if (v === "STOCK" || v === "LIMITED_LIABILITY") {
                        setForm((p) => ({ ...p, exchangeType: v }));
                      }
                    }}
                  >
                    <Dropdown.Trigger className="w-full">
                      <Button
                        as="span"
                        role="button"
                        variant="ghost"
                        className="flex items-center justify-between w-full pl-10 py-2 bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark
                    border border-gray-300 
                   rounded-lg dark:border-buttonBorderColor-dark focus:outline-none 
                    appearance-none relative"
                      >
                        <span>{form.exchangeType === "LIMITED_LIABILITY" ? 'مسئولیت محدود' : form.exchangeType === "STOCK" ? 'سهامی' : ''}</span>
                      </Button>
                    </Dropdown.Trigger>

                    <Dropdown.Options
                      className="absolute left-0 mt-2 w-72 pl-2 pr-2
                 text-gray-700 bg-white dark:bg-buttonColor-dark
                 border border-gray-300 dark:border-buttonBorderColor-dark 
                 rounded-lg dark:text-gray-100 appearance-none z-50
                 max-h-60 overflow-y-auto"
                    >
                      <Dropdown.Option value="LIMITED_LIABILITY" key="option1">
                        {({ selected, active }) => (
                          <MenuItem
                            isActive={active}
                            isSelected={selected}
                            className={`border mt-2 mb-1 rounded-md border-gray-100 dark:border-buttonBorderColor-dark ${form.exchangeType === "LIMITED_LIABILITY"
                              ? "bg-gray-100 border-gray-200 dark:bg-gray-700"
                              : ""
                              }`}
                          >
                            <MenuItem.Title>مسئولیت محدود</MenuItem.Title>
                          </MenuItem>
                        )}
                      </Dropdown.Option>
                      <Dropdown.Option value="STOCK" key="option2">
                        {({ active }) => (
                          <MenuItem
                            isActive={active}
                            className={`border mt-2 mb-1 rounded-md border-gray-100 dark:border-buttonBorderColor-dark ${form.exchangeType === "STOCK"
                              ? "bg-gray-100 border-gray-200 dark:bg-gray-700"
                              : ""
                              }`}
                          >
                            <MenuItem.Title>سهامی</MenuItem.Title>
                          </MenuItem>
                        )}
                      </Dropdown.Option>
                    </Dropdown.Options>
                  </Dropdown>
                  <ControlsChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-titleText dark:text-titleText-dark pointer-events-none" />
                </div>
              </div>
              <div>
                <label>آدرس سایت</label>
                <Input
                  className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark"
                  value={form.siteAddress}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      siteAddress: addHttps(
                        removeProtocolAndWWW(e.target.value)
                      ),
                    });
                  }}
                />
              </div>
              <div>
                <label>شماره تماس</label>
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
                />
              </div>
              <div>
                <label>شماره تماس اضطراری</label>
                <Input
                  className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark"
                  value={form.emergencyPhoneNumber}
                  onChange={(e) => {
                    if (validateNumbers(e.target.value)) {
                      setForm({
                        ...form,
                        emergencyPhoneNumber: e.target.value,
                      });
                    }
                  }}
                />
              </div>
              <div className="md:col-span-2">
                <label>آدرس دفتر</label>
                <Input
                  className="p-0 mt-2 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md 
                                    bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark 
                                    shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark"
                  value={form.officeAddress}
                  onChange={(e) =>
                    setForm({ ...form, officeAddress: e.target.value })
                  }
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
                />
              </div>
            </div>

            <div className="p-4 border-t border-boxBorderColor dark:border-boxBorderColor-dark flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsOpen(false)}>
                انصراف
              </Button>
              <Button variant="primary" onClick={handleSave}>
                {Loading ? (
                  <LoaderCircle size={8} color="border-white-500" />
                ) : (
                  "ذخیره"
                )}
              </Button>
            </div>
          </Modal.Panel>
        </div>
      </Modal>

      <Modal open={AddFileModal} onClose={() => { SetAddFileModal(false); }}>
        <Modal.Backdrop />
        <div className="fixed inset-0 flex z-50 backdrop-blur-sm bg-white/10">
          <Modal.Panel className="w-full max-w-xl rounded-lg bg-white dark:bg-bgColor-dark shadow-lg mt-[200px] text-titleText dark:text-titleText-dark">
            <div className="p-4 border-b border-boxBorderColor dark:border-boxBorderColor-dark">
              <Modal.Title className="text-lg font-bold">افزودن فایل</Modal.Title>

              <Label className="mt-4">نوع فایل</Label>
              <Dropdown onChange={handleSelectChange} value={type}>
                <Dropdown.Trigger className="w-full">
                  <Button
                    as="span"
                    role="button"
                    variant="ghost"
                    className="flex items-center justify-between w-full pl-10
                      text-gray-700 border border-gray-300 
                      rounded-lg dark:border-buttonBorderColor-dark focus:outline-none 
                      dark:text-gray-100 appearance-none relative bg-bgColor dark:bg-bgColor-dark"
                  >
                    <span>{type !== "" ? type : "انتخاب"}</span>
                  </Button>
                </Dropdown.Trigger>

                <Dropdown.Options
                  className="absolute left-0 mt-2 w-72 pl-2 pr-2
                    text-gray-700 bg-white dark:bg-buttonColor-dark
                    border border-gray-300 dark:border-buttonBorderColor-dark 
                    rounded-lg dark:text-gray-100 appearance-none z-50
                    max-h-60 overflow-y-auto"
                >
                  <Dropdown.Option value="اساسنامه" key="option1">
                    {({ selected, active }) => (
                      <MenuItem
                        isActive={active}
                        isSelected={selected}
                        className={`border mt-2 mb-1 rounded-md border-gray-100 dark:border-buttonBorderColor-dark ${type === "اساسنامه" ? "bg-gray-100 border-gray-200 dark:bg-gray-700" : ""
                          }`}
                      >
                        <MenuItem.Title>اساسنامه</MenuItem.Title>
                      </MenuItem>
                    )}
                  </Dropdown.Option>
                  <Dropdown.Option value="صورت مالی" key="option2">
                    {({ active }) => (
                      <MenuItem
                        isActive={active}
                        className={`border mt-2 mb-1 rounded-md border-gray-100 dark:border-buttonBorderColor-dark ${type === "صورت مالی" ? "bg-gray-100 border-gray-200 dark:bg-gray-700" : ""
                          }`}
                      >
                        <MenuItem.Title>صورت مالی</MenuItem.Title>
                      </MenuItem>
                    )}
                  </Dropdown.Option>
                </Dropdown.Options>
              </Dropdown>

              {type === "صورت مالی" ? (
                <div>
                  <Label className="mt-4">عنوان</Label>
                  <PersianYearSelect onChange={(e) => { if (e !== null) { SetFinancialName(e) } else { SetFinancialName(0) } }} value={FinancialName} />
                </div>
              ) : null}

              {/* ✅ NEW: اینپوت فقط‌خوان برای نمایش نام فایل + دکمه انتخاب فایل */}
              <div className="items-center gap-2">
                <Label className="mt-4">بارگذاری</Label>
                <label className="block cursor-pointer p-2 rounded-md border border-boxBorderColor dark:border-boxBorderColor-dark bg-bgColor dark:bg-bgColor-dark text-titleText dark:text-titleText-dark shadow-sm">
                  <span className="block truncate text-start" title={fileName || "انتخاب فایل"}>
                    {fileName || "انتخاب فایل"}
                  </span>
                  <input
                    type="file"
                    accept="*/*"              // یا این خط رو کاملاً حذف کن
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <Button
                variant="primary"
                className="bg-primary dark:bg-primary-dark border text-white border-primary rounded-md w-full mt-4"
                disabled={!file || loading}
                onClick={uploadFile}
              >
                {loading ? "در حال بارگذاری..." : "بارگذاری"}
              </Button>
            </div>
          </Modal.Panel>
        </div>
      </Modal>

      <Modal open={isLogOpen} onClose={() => { setisLogOpen(false) }}>
        <Modal.Backdrop />
        <div className="fixed inset-0 flex z-50 backdrop-blur-sm bg-white/10">
          <Modal.Panel className="w-full max-w-2xl rounded-lg bg-white dark:bg-bgColor-dark shadow-lg mt-[200px] text-titleText dark:text-titleText-dark p-4">
            <h4 className="mb-2 mt-2">تغییرات مشخصات صرافی</h4>
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

export default Exchange_info;
