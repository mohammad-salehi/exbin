import React, { useEffect, useMemo, useRef, useState } from "react";
import DetailBox from "../../../DetailBox/DetailBox";
import {
  Modal,
  Button,
  Input,
  Label,
  Dropdown,
  MenuItem,
} from "@heathmont/moon-core-tw";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import { LoaderCircle } from "../../../Loader/Loader";
import LoadingComponent from "../../../LoadingComponent/LoadingComponent";
import Pagination from "../../../Pagination/Pagination";
import JalaliLocalDatePicker from "../../../DatePicker/JalaliLocalDatePicker";
import PersianYearSelect from "../../../YearSelection/YearSelection";
import { ControlsChevronDown } from "@heathmont/moon-icons-tw";

import { GetRequest, GetRequestRaw, DeleteRequest } from "../../../../functions/GetRequest";
import { PostRequest, PutRequest } from "../../../../functions/PostRequest";
import {
  addHttps,
  removeProtocolAndWWW,
  validateEmail,
  validateNumbers,
} from "../../../../functions/Validations";
import { LogViewer } from "../../../../functions/changesHandler";
import { toJalaliDate } from "../../../../functions/toJalaliDate";
import { BoardmemderRoleTypes } from "../../../../functions/BoardmemberRoleTypes";
import { ExchangeLegalTypes } from "../../../../functions/ExchangeLegalTypes";
import { handlePostErrors } from "../../../../functions/handlePostErrors";

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

const cx = (...c: Array<string | false | undefined | null>) => c.filter(Boolean).join(" ");

const Field = ({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cx("flex flex-col gap-2", className)}>
    <Label className="text-sm font-medium text-titleText dark:text-titleText-dark">
      {label}
    </Label>
    {children}
  </div>
);

const inputBase =
  "h-12 px-4 rounded-xl bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark " +
  "border border-boxBorderColor dark:border-boxBorderColor-dark shadow-sm " +
  "focus:outline-none focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary-dark/30";

const panelBase =
  "w-full rounded-2xl bg-white dark:bg-bgColor-dark shadow-lg ring-1 ring-black/5 dark:ring-white/5";

const sectionTitle =
  "text-lg font-bold text-titleText dark:text-titleText-dark";

const subtleText =
  "text-sm text-titleText/70 dark:text-titleText-dark/70";

const Exchange_info = ({ SetC1 }: ExchangeInfoProps) => {
  const params = useParams<{ id: string }>();

  const [logo, SetLogo] = useState<string>("");
  const [name, SetName] = useState<string>("");

  const [ConfirmDelete, SetConfirmDelete] = useState<string>("");

  const [DownloadLoading, SetDownloadLoading] = useState<boolean>(false);

  const [AddFileModal, SetAddFileModal] = useState<boolean>(false);
  const [type, Settype] = useState<string>("");
  const [FinancialName, SetFinancialName] = useState<number>(0);

  const [Loading, setLoading] = useState<boolean>(false); // save
  const [isOpen, setIsOpen] = useState(false); // edit modal
  const [isLogOpen, setisLogOpen] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const [LogNumber, setLogNumber] = useState(0);
  const [LogPage, setLogPage] = useState(0);
  const [LogLoading, setLogLoading] = useState(false);
  const [Changes, setChanges] = useState<string[]>([]);

  const [confirmAssociationOpen, setConfirmAssociationOpen] = useState(false);
  const [confirmDeleteExchangeOpen, setconfirmDeleteExchangeOpen] = useState(false);
  const [confirmFinancialOpen, setConfirmFinancialOpen] = useState(false);

  const [financialToDelete, setFinancialToDelete] = useState<{ id: number; date: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [ExchangedeleteLoading, setDeleteExchangeLoading] = useState(false);

  const didInit = useRef(false);

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
    zipCode: "",
  });

  async function generateCompanyExcel(data: AnyObj) {
    const wb = new ExcelJS.Workbook();

    const base = wb.addWorksheet("مشخصات پایه");
    base.columns = [
      { header: "عنوان", key: "label", width: 25 },
      { header: "مقدار", key: "value", width: 45 },
    ];

    [
      ["عنوان", data.name],
      ["عنوان حقوقی", data.legalName],
      ["نوع پلتفرم", data.type],
      ["شکل حقوقی", data.exchangeType],
      ["شماره ثبت", data.registrationNumber],
      ["شناسه ملی", data.nationalCode],
      ["کد اقتصادی", data.financialCode],
      ["تاریخ تأسیس", data.establishmentDate ? toJalaliDate(data.establishmentDate) : ""],
      ["تلفن", data.phoneNumber],
      ["تلفن اضطراری", data.emergencyPhoneNumber],
      ["ایمیل", data.email],
      ["وب‌سایت", data.siteAddress],
      ["آدرس دفتر", data.officeAddress],
    ].forEach(([label, value]) => {
      base.addRow({ label, value: value ?? "-" });
    });

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

      data.boardMemberInfo.forEach((m: AnyObj) => {
        const matchedRole =
          BoardmemderRoleTypes.find((r) => r.value === m.role)?.label || "-";

        ws.addRow({
          ...m,
          role: matchedRole,
        });
      });
    }

    if (Array.isArray(data.exchangeAgentInfo) && data.exchangeAgentInfo.length) {
      const ws = wb.addWorksheet("نمایندگان");
      ws.columns = [
        { header: "نام", key: "name", width: 20 },
        { header: "تلفن", key: "phoneNumber", width: 20 },
        { header: "کد ملی", key: "nationalCode", width: 20 },
      ];
      data.exchangeAgentInfo.forEach((a: AnyObj) => ws.addRow(a));
    }

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

      data.employeeInfo.forEach((e: AnyObj) => {
        ws.addRow({
          ...e,
          startDate: e.startDate ? toJalaliDate(e.startDate) : "",
          insuranceStartDate: e.insuranceStartDate ? toJalaliDate(e.insuranceStartDate) : "",
          insuranceEndDate: e.insuranceEndDate ? toJalaliDate(e.insuranceEndDate) : "",
          isSpecialAccess: e.isSpecialAccess ? "دارد" : "ندارد",
        });
      });
    }

    if (Array.isArray(data.financialStatements) && data.financialStatements.length) {
      const ws = wb.addWorksheet("صورت‌های مالی");
      ws.columns = [
        { header: "عنوان", key: "title", width: 25 },
        { header: "تاریخ", key: "date", width: 20 },
        { header: "توضیحات", key: "description", width: 40 },
      ];
      data.financialStatements.forEach((f: AnyObj) => ws.addRow(f));
    }

    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf]), `${data.name || "report"}.xlsx`);
  }

  const download = async () => {
    try {
      SetDownloadLoading(true);
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
      SetDownloadLoading(false);
    }
  };

  const deleteExchange = async () => {
    if (ConfirmDelete !== name) return;

    setDeleteExchangeLoading(true);
    try {
      await DeleteRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}`
      );
      toast.success("کارگزاری با موفقیت حذف شد");
      window.location.assign(`/panel/exchanges-list`);
    } catch (err) {
      toast.error("خطا در حذف کارگزاری");
    } finally {
      setDeleteExchangeLoading(false);
    }
  };

  const [invoiceData, setInvoiceData] = useState<InvoiceSection[]>([
    {
      id: 1,
      title: "مشخصات پایه",
      content: [
        { id: 1, title: "نام حقوقی", content: "" },
        { id: 2, title: "تاریخ تاسیس", content: "" },
        { id: 3, title: "شناسه ملی کارگزاری", content: "" },
        { id: 4, title: "نوع کارگزاری", content: "" },
        { id: 5, title: "شکل حقوقی کارگزاری", content: "" },
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
        { id: 4, title: "آدرس پستی", content: "" },
        { id: 5, title: "کد پستی", content: "" },
        { id: 6, title: "ایمیل", content: "" },
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
      content: [],
    },
  ]);

  const handleEdit = (sectionId: number, contentId: number, newContent: React.ReactNode) => {
    setInvoiceData((prevData) =>
      prevData.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          content: section.content.map((item) =>
            item.id === contentId ? { ...item, content: newContent } : item
          ),
        };
      })
    );
  };

  // استخراج اسم فایل از هدر (اگر بود)
  function filenameFromContentDisposition(res: Response, fallback: string) {
    const cd = res.headers.get("Content-Disposition") || "";
    const m = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(cd);
    const rawName = m?.[1] || m?.[2];
    if (!rawName) return fallback;
    try {
      return decodeURIComponent(rawName);
    } catch {
      return rawName;
    }
  }

  // دانلودِ blob و ذخیره‌سازی
  async function saveBlobResponse(res: Response, fallbackName: string) {
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const name = filenameFromContentDisposition(res, fallbackName);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const handleDownload = async () => {
    try {
      const res = await GetRequestRaw(
        `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/association/download`
      );
      const disposition = res.headers.get("Content-Disposition");
      let filename = "";

      if (disposition) {
        const starMatch = disposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
        if (starMatch && starMatch[1]) filename = decodeURIComponent(starMatch[1]);
        else {
          const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (match && match[1]) filename = match[1].replace(/['"]/g, "");
        }
      }

      if (!filename) filename = "association";
      await saveBlobResponse(res, filename);
      toast.success("دانلود اساسنامه آغاز شد.", { position: "bottom-left" });
    } catch (err) {
      console.error(err);
      toast.error("خطا در دانلود اساسنامه", { position: "bottom-left" });
    }
  };

  const handleDownloadFinancial = async (fileId: number, date: string) => {
    try {
      const res = await GetRequestRaw(
        `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/financial-statements/${fileId}/download`
      );
      const disposition = res.headers.get("Content-Disposition");
      let filename = `financial-${date || fileId}`;

      if (disposition && disposition.includes("filename=")) {
        const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) filename = match[1].replace(/['"]/g, "");
      }

      await saveBlobResponse(res, filename);
      toast.success("دانلود صورت مالی آغاز شد.", { position: "bottom-left" });
    } catch (err: any) {
      toast.error(err?.error || "خطا در دانلود صورت مالی", { position: "bottom-left" });
    }
  };

  const handleConfirmDeleteAssociation = async () => {
    setDeleteLoading(true);
    try {
      await DeleteRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/association/delete`
      );
      toast.success("اساسنامه با موفقیت حذف شد.", { position: "bottom-left" });
      window.location.reload();
    } catch (err) {
      toast.error("خطا در حذف اساسنامه", { position: "bottom-left" });
    } finally {
      setDeleteLoading(false);
      setConfirmAssociationOpen(false);
    }
  };

  const handleConfirmDeleteFinancial = async () => {
    if (!financialToDelete) return;

    setDeleteLoading(true);
    try {
      await DeleteRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/financial-statements/${financialToDelete.id}`
      );
      toast.success("صورت مالی با موفقیت حذف شد.", { position: "bottom-left" });
      window.location.reload();
    } catch (err) {
      toast.error("خطا در حذف صورت مالی", { position: "bottom-left" });
    } finally {
      setDeleteLoading(false);
      setConfirmFinancialOpen(false);
      setFinancialToDelete(null);
    }
  };

  const operations = useMemo(
    () => [
      {
        id: 1,
        title: "",
        content: (
          <button
            id="EditExInfo"
            className={cx(
              "w-full flex items-center justify-between",
              "rounded-xl border border-boxBorderColor dark:border-boxBorderColor-dark",
              "bg-boxColor/30 dark:bg-boxColor-dark/30",
              "px-4 py-3 hover:bg-boxColor/60 dark:hover:bg-boxColor-dark/60 transition"
            )}
            onClick={() => setIsOpen(true)}
          >
            <span className="font-medium">ویرایش</span>
          </button>
        ),
      },
      {
        id: 2,
        title: "",
        content: (
          <button
            id="DownloadExInfo"
            className={cx(
              "w-full flex items-center justify-between",
              "rounded-xl border border-boxBorderColor dark:border-boxBorderColor-dark",
              "bg-boxColor/30 dark:bg-boxColor-dark/30",
              "px-4 py-3 hover:bg-boxColor/60 dark:hover:bg-boxColor-dark/60 transition"
            )}
            onClick={download}
            disabled={DownloadLoading}
          >
            <span className="font-medium">دریافت Excel</span>
            <span className="flex items-center gap-2">
              {DownloadLoading ? <LoaderCircle size={8} color="border-white-500" /> : null}
            </span>
          </button>
        ),
      },
      {
        id: 3,
        title: "",
        content: (
          <button
            id="DeleteExInfo"
            className={cx(
              "w-full flex items-center justify-between",
              "rounded-xl border border-red-200/60 dark:border-red-500/30",
              "bg-red-50/60 dark:bg-red-900/10",
              "px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/15 transition"
            )}
            onClick={() => {
              setconfirmDeleteExchangeOpen(true);
              SetConfirmDelete("");
            }}
          >
            <span className="font-medium text-red-700 dark:text-red-300">حذف کارگزاری</span>
          </button>
        ),
      },
    ],
    [DownloadLoading, name]
  );

  const buildDocumentsBlock = (
    association?: string | null,
    financialStatement: Array<{ id: number; date: string; file: string }> = []
  ) => {
    const key = Date.now();

    return {
      id: key,
      title: "",
      content: (
        <div className="w-full col-span-full flex flex-col gap-3">
          {association && (
            <div
              className={cx(
                "flex items-center justify-between gap-3 w-full",
                "rounded-2xl border border-boxBorderColor dark:border-boxBorderColor-dark",
                "bg-boxColor/30 dark:bg-boxColor-dark/30 px-4 py-3"
              )}
            >
              <div className="flex flex-col">
                <span className="font-semibold">اساسنامه</span>
                <span className={subtleText}>فایل بارگذاری‌شده</span>
              </div>

              <div className="flex items-center gap-2">
                <Button id="downloadAssociation" variant="ghost" onClick={handleDownload}>
                  دانلود
                </Button>
                <Button
                  id="deleteAssociation"
                  variant="ghost"
                  onClick={() => setConfirmAssociationOpen(true)}
                  className="text-red-600 dark:text-red-300"
                >
                  حذف
                </Button>
              </div>
            </div>
          )}

          {financialStatement.map((item, index) => (
            <div
              key={`${item.id}-${item.date}-${index}`}
              className={cx(
                "flex items-center justify-between gap-3 w-full",
                "rounded-2xl border border-boxBorderColor dark:border-boxBorderColor-dark",
                "bg-boxColor/30 dark:bg-boxColor-dark/30 px-4 py-3"
              )}
            >
              <div className="flex flex-col">
                <span className="font-semibold">صورت مالی {item.date}</span>
                <span className={subtleText}>فایل بارگذاری‌شده</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  id={`DownloadFinancial${index}`}
                  variant="ghost"
                  onClick={() => handleDownloadFinancial(item.id, item.date)}
                >
                  دانلود
                </Button>
                <Button
                  id={`DeleteFinancial${index}`}
                  variant="ghost"
                  onClick={() => {
                    setFinancialToDelete({ id: item.id, date: item.date });
                    setConfirmFinancialOpen(true);
                  }}
                  className="text-red-600 dark:text-red-300"
                >
                  حذف
                </Button>
              </div>
            </div>
          ))}

          <Button
            id="AddDocument"
            variant="primary"
            className="w-full rounded-xl border border-primary bg-transparent text-primary dark:text-primary-dark"
            onClick={() => SetAddFileModal(true)}
          >
            افزودن مورد جدید
          </Button>
        </div>
      ),
    };
  };

  const addAssociationDocuments = (
    association?: string | null,
    financialStatement: Array<{ id: number; date: string; file: string }> = []
  ) => {
    setInvoiceData((prev) =>
      prev.map((section) =>
        section.id === 3
          ? {
            ...section,
            content: [buildDocumentsBlock(association, financialStatement)],
          }
          : section
      )
    );
  };

  const Audit = () => {
    setLogLoading(true);
    GetRequest(
      `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/audit/exchange/${params.id}?page=${LogPage}&size=10&sort=updatedAt,DESC`
    )
      .then((response) => {
        setLogLoading(false);
        setChanges(response.result.content);
        setLogNumber(response.result.totalElements);
      })
      .catch(() => {
        setLogLoading(false);
        setChanges([]);
      });
  };

  const handleSave = async () => {
    const isDigits = (val: string, len?: number) =>
      /^\d+$/.test(val) && (!len || val.length === len);
    const hasNoSpecialChars = (val: string) =>
      /^[\u0600-\u06FFa-zA-Z0-9\s]+$/.test(val);

    const legalName = String(form.legalName || "");
    const nationalCode = String(form.nationalCode || "");
    const financialCode = String(form.financialCode || "");
    const registrationNumber = String(form.registrationNumber || "");
    const phoneNumber = String(form.phoneNumber || "");
    const zipCode = String(form.zipCode || "");
    const email = String(form.email || "");

    if (!legalName.trim()) return toast.error("نام حقوقی کارگزاری الزامی است", { position: "bottom-left" });
    if (!hasNoSpecialChars(legalName))
      return toast.error("نام حقوقی نباید شامل کاراکترهای خاص باشد", { position: "bottom-left" });
    if (!isDigits(nationalCode, 11))
      return toast.error("شناسه ملی باید دقیقاً ۱۱ رقم باشد", { position: "bottom-left" });
    if (!/^\d{11,16}$/.test(financialCode))
      return toast.error("کد اقتصادی باید بین ۱۱ تا ۱۶ رقم باشد", { position: "bottom-left" });
    if (!/^\d{6}$/.test(registrationNumber))
      return toast.error("شماره ثبت باید عددی ۶ رقمی باشد", { position: "bottom-left" });
    if (!form.type) return toast.error("نوع کارگزاری را انتخاب کنید", { position: "bottom-left" });
    if (!form.exchangeType)
      return toast.error("شکل حقوقی کارگزاری را انتخاب کنید", { position: "bottom-left" });
    if (phoneNumber === "")
      return toast.error("شماره تماس اشتباه وارد شده است", { position: "bottom-left" });
    if (zipCode && !isDigits(zipCode, 10))
      return toast.error("کد پستی باید دقیقاً ۱۰ رقم باشد", { position: "bottom-left" });
    if (email && !validateEmail(email))
      return toast.error("ایمیل وارد شده معتبر نیست", { position: "bottom-left" });
    if (!form.establishmentDate)
      return toast.error("تاریخ تأسیس را وارد کنید", { position: "bottom-left" });

    setLoading(true);
    try {
      await PutRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}`,
        form
      );

      toast.success("مشخصات کارگزاری با موفقیت به‌روزرسانی شد.", { position: "bottom-left" });

      handleEdit(1, 1, form.legalName);
      handleEdit(1, 2, toJalaliDate(form.establishmentDate));
      handleEdit(1, 3, form.nationalCode);
      handleEdit(1, 4, form.type);
      handleEdit(
        1,
        5,
        ExchangeLegalTypes.find((item) => item.value === form.exchangeType)?.label
      );
      handleEdit(1, 6, form.financialCode);
      handleEdit(1, 7, form.registrationNumber ? String(form.registrationNumber) : "");

      handleEdit(
        2,
        1,
        form.siteAddress ? (
          <a href={form.siteAddress} className="text-primary dark:text-primary-dark underline underline-offset-4">
            {form.siteAddress}
          </a>
        ) : (
          ""
        )
      );
      handleEdit(2, 2, form.phoneNumber);
      handleEdit(2, 3, form.emergencyPhoneNumber);
      handleEdit(2, 4, form.officeAddress);
      handleEdit(2, 5, form.zipCode);
      handleEdit(2, 6, form.email);

      setIsOpen(false);
    } catch (err) {
      handlePostErrors(err);
    } finally {
      setLoading(false);
    }
  };

  const onPickFile = (f: File | null) => {
    setFile(f);
    setFileName(f ? f.name : "");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    onPickFile(f);
  };

  const uploadFile = async () => {
    try {
      setUploading(true);

      if (!type) {
        toast.error("نوع فایل را انتخاب کنید");
        return;
      }

      // اساسنامه
      if (type === "اساسنامه") {
        if (!file) {
          toast.error("فایلی انتخاب نشده");
          return;
        }

        await PostRequest(
          `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/association/upload`,
          { association: file },
          { asFormData: true }
        );

        toast.success("اساسنامه با موفقیت بارگذاری شد");
        setTimeout(() => window.location.reload(), 500);
        return;
      }

      // صورت مالی
      if (type === "صورت مالی") {
        if (!file) {
          toast.error("فایل صورت مالی انتخاب نشده");
          return;
        }

        if (!FinancialName) {
          toast.error("عنوان یا تاریخ صورت مالی مشخص نشده");
          return;
        }

        const result = await PostRequest(
          `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/financial-statements`,
          { date: String(FinancialName) }
        );

        const fileId = result?.result?.id;
        if (!fileId) {
          toast.error("خطا در ایجاد رکورد صورت مالی");
          return;
        }

        await PostRequest(
          `${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${params.id}/financial-statements/${fileId}/upload`,
          { financialFile: file },
          { asFormData: true }
        );

        toast.success("صورت مالی با موفقیت بارگذاری شد");
        onPickFile(null);
        SetAddFileModal(false);
        setTimeout(() => window.location.reload(), 500);
        return;
      }
    } catch (e: any) {
      toast.error(e?.message || "خطا در آپلود");
    } finally {
      setUploading(false);
    }
  };

  const handleSelectChange = (event: string) => Settype(event);

  // Drag & Drop (بدون کتابخانه)
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0] || null;
    onPickFile(f);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    // عملیات‌ها را داخل سکشن ۴ بنشان
    setInvoiceData((prev) =>
      prev.map((s) => (s.id === 4 ? { ...s, content: operations } : s))
    );

    GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/exchanges/${params.id}`)
      .then((response) => {
        const r = response.result;

        SetLogo(r.logo);
        SetName(r.name);

        handleEdit(1, 1, r.legalName);
        handleEdit(1, 2, toJalaliDate(r.establishmentDate));
        handleEdit(1, 3, r.nationalCode);
        handleEdit(1, 4, r.type);
        handleEdit(1, 5, ExchangeLegalTypes.find((item) => item.value === r.exchangeType)?.label);
        handleEdit(1, 6, r.financialCode);
        handleEdit(1, 7, String(r.registrationNumber));

        if (r.siteAddress) {
          handleEdit(
            2,
            1,
            <a href={r.siteAddress} className="text-primary dark:text-primary-dark underline underline-offset-4">
              {r.siteAddress}
            </a>
          );
        }

        handleEdit(2, 2, r.phoneNumber);
        handleEdit(2, 3, r.emergencyPhoneNumber);
        handleEdit(2, 4, r.officeAddress);
        handleEdit(2, 5, r.zipCode);
        handleEdit(2, 6, r.email);

        addAssociationDocuments(r.association, r.financialStatements);

        setForm({
          legalName: r.legalName,
          establishmentDate: r.establishmentDate,
          nationalCode: r.nationalCode,
          type: r.type,
          exchangeType: r.exchangeType,
          siteAddress: r.siteAddress,
          phoneNumber: r.phoneNumber,
          emergencyPhoneNumber: r.emergencyPhoneNumber,
          officeAddress: r.officeAddress,
          email: r.email,
          financialCode: r.financialCode,
          registrationNumber: r.registrationNumber,
          zipCode: r.zipCode,
        });

        SetC1(true);
      })
      .catch(() => {
        SetC1(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isLogOpen) Audit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogOpen, LogPage]);

  return (
    <div className="space-y-5">
      {/* Header Card */}
      <div className="relative overflow-hidden rounded-[36px] border border-white/30 dark:border-white/10 bg-gradient-to-br from-white/90 via-white/70 to-white/60 dark:from-[#0b0f15]/95 dark:via-[#0d131c]/85 dark:to-[#0a0f15]/90 backdrop-blur-2xl shadow-[0_25px_70px_-35px_rgba(0,0,0,0.55)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(1200px_400px_at_top,rgba(255,255,255,0.35),transparent)] dark:bg-[radial-gradient(1200px_400px_at_top,rgba(255,255,255,0.08),transparent)]" />
        </div>

        <div className="relative flex items-center gap-5 p-7 md:p-8">
          <div className="h-14 w-14 rounded-2xl bg-white/70 dark:bg-white/5 border border-white/40 dark:border-white/10 shadow-[0_8px_25px_-15px_rgba(0,0,0,0.7)] flex items-center justify-center">
            {logo ? (
              <img src={logo} className="w-10 h-10 object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-boxColor dark:bg-boxColor-dark" />
            )}
          </div>

          <div className="min-w-0">
            <div className="text-[11px] tracking-wider uppercase text-titleText/50 dark:text-titleText-dark/50">
              Exchange Identify
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight truncate text-titleText dark:text-titleText-dark">
              {name}
            </h3>
          </div>

        </div>
      </div>

      {/* Detail Box */}

      <div className={cx(panelBase, "p-5 lux-panel")}>
        <h5 className={cx(sectionTitle, "mb-4 px-3 py-2 lux-title")}>
          مشخصات کارگزاری
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
                    : "",
            })),
          }))}
          downloadLink="/path/to/pdf"
        />
      </div>


      {/* ویرایش کارگزاری */}
      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <Modal.Backdrop />
        <div className="fixed inset-0 flex z-50 backdrop-blur-sm bg-black/10 dark:bg-black/30 p-4">
          <Modal.Panel className={cx(panelBase, "max-w-3xl mx-auto my-10 overflow-hidden")}>
            <div className="px-5 py-4 border-b border-boxBorderColor dark:border-boxBorderColor-dark">
              <Modal.Title className={cx("text-xl font-extrabold", "text-titleText dark:text-titleText-dark")}>
                ویرایش مشخصات کارگزاری <span className="font-black">{name}</span>
              </Modal.Title>
              <p className={cx(subtleText, "mt-1")}>اطلاعات را ویرایش کنید و در پایان ذخیره کنید.</p>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="نام حقوقی">
                <Input
                  className={inputBase}
                  value={form.legalName}
                  onChange={(e) => setForm({ ...form, legalName: e.target.value })}
                />
              </Field>

              <Field label="تاریخ تأسیس">
                <div className="h-12">
                  <JalaliLocalDatePicker
                    value={form.establishmentDate}
                    onChange={(val) =>
                      setForm((p) => ({ ...p, establishmentDate: val !== null ? val : "" }))
                    }
                    placeholder=""
                    clearable
                    min="2000-01-01"
                    max="2030-12-31"
                  />
                </div>
              </Field>

              <Field label="شناسه ملی کارگزاری">
                <Input
                  className={inputBase}
                  value={form.nationalCode}
                  onChange={(e) => {
                    if (validateNumbers(e.target.value)) {
                      setForm({ ...form, nationalCode: e.target.value });
                    }
                  }}
                />
              </Field>

              <Field label="نوع کارگزاری">
                <div className="relative">
                  <Dropdown
                    value={form.type}
                    onChange={(v: unknown) => {
                      if (v === "P2P" || v === "OTC") setForm((p) => ({ ...p, type: v }));
                    }}
                  >
                    <Dropdown.Trigger className="w-full">
                      <Button
                        as="span"
                        role="button"
                        variant="ghost"
                        className={cx(
                          "w-full h-12 rounded-xl border border-boxBorderColor dark:border-boxBorderColor-dark",
                          "bg-boxColor dark:bg-boxColor-dark",
                          "flex items-center justify-between px-4",
                          "text-titleText dark:text-titleText-dark"
                        )}
                      >
                        <span>{form.type ? form.type : "انتخاب"}</span>
                      </Button>
                    </Dropdown.Trigger>

                    <Dropdown.Options
                      className={cx(
                        "absolute left-0 mt-2 w-full p-2 z-50",
                        "rounded-xl border border-boxBorderColor dark:border-boxBorderColor-dark",
                        "bg-white dark:bg-buttonColor-dark",
                        "max-h-60 overflow-y-auto"
                      )}
                    >
                      {["P2P", "OTC"].map((v) => (
                        <Dropdown.Option value={v} key={v}>
                          {({ selected, active }) => (
                            <MenuItem
                              isActive={active}
                              isSelected={selected}
                              className={cx(
                                "rounded-lg border mt-1 mb-1",
                                "border-gray-100 dark:border-buttonBorderColor-dark",
                                form.type === v && "bg-gray-100 border-gray-200 dark:bg-gray-700"
                              )}
                            >
                              <MenuItem.Title>{v}</MenuItem.Title>
                            </MenuItem>
                          )}
                        </Dropdown.Option>
                      ))}
                    </Dropdown.Options>
                  </Dropdown>
                  <ControlsChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-titleText dark:text-titleText-dark pointer-events-none" />
                </div>
              </Field>

              <Field label="کد اقتصادی">
                <Input
                  className={inputBase}
                  value={form.financialCode}
                  onChange={(e) => {
                    if (validateNumbers(e.target.value)) setForm({ ...form, financialCode: e.target.value });
                  }}
                />
              </Field>

              <Field label="شماره ثبت">
                <Input
                  className={inputBase}
                  value={form.registrationNumber}
                  onChange={(e) => {
                    if (validateNumbers(e.target.value)) setForm({ ...form, registrationNumber: e.target.value });
                  }}
                />
              </Field>

              <Field label="شکل حقوقی">
                <div className="relative">
                  <Dropdown
                    value={form.exchangeType}
                    onChange={(v: unknown) => {
                      if (typeof v === "string") setForm((p) => ({ ...p, exchangeType: v }));
                    }}
                  >
                    <Dropdown.Trigger className="w-full">
                      <Button
                        as="span"
                        role="button"
                        variant="ghost"
                        className={cx(
                          "w-full h-12 rounded-xl border border-boxBorderColor dark:border-boxBorderColor-dark",
                          "bg-boxColor dark:bg-boxColor-dark",
                          "flex items-center justify-between px-4",
                          "text-titleText dark:text-titleText-dark"
                        )}
                      >
                        <span>
                          {form.exchangeType
                            ? ExchangeLegalTypes.find((item) => item.value === form.exchangeType)?.label
                            : "انتخاب"}
                        </span>
                      </Button>
                    </Dropdown.Trigger>

                    <Dropdown.Options
                      className={cx(
                        "absolute left-0 mt-2 w-full p-2 z-50",
                        "rounded-xl border border-boxBorderColor dark:border-boxBorderColor-dark",
                        "bg-white dark:bg-buttonColor-dark",
                        "max-h-60 overflow-y-auto"
                      )}
                    >
                      {ExchangeLegalTypes.map((item, index) => (
                        <Dropdown.Option value={item.value} key={`option-${index}`}>
                          {({ selected, active }) => (
                            <MenuItem
                              isActive={active}
                              isSelected={selected}
                              className={cx(
                                "rounded-lg border mt-1 mb-1",
                                "border-gray-100 dark:border-buttonBorderColor-dark",
                                form.exchangeType === item.value &&
                                "bg-gray-100 border-gray-200 dark:bg-gray-700"
                              )}
                            >
                              <MenuItem.Title>{item.label}</MenuItem.Title>
                            </MenuItem>
                          )}
                        </Dropdown.Option>
                      ))}
                    </Dropdown.Options>
                  </Dropdown>
                  <ControlsChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-titleText dark:text-titleText-dark pointer-events-none" />
                </div>
              </Field>

              <Field label="آدرس سایت">
                <Input
                  className={inputBase}
                  value={form.siteAddress}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      siteAddress: addHttps(removeProtocolAndWWW(e.target.value)),
                    })
                  }
                />
              </Field>

              <Field label="شماره تماس">
                <Input
                  className={inputBase}
                  value={form.phoneNumber}
                  onChange={(e) => {
                    if (validateNumbers(e.target.value)) setForm({ ...form, phoneNumber: e.target.value });
                  }}
                />
              </Field>

              <Field label="شماره تماس اضطراری">
                <Input
                  className={inputBase}
                  value={form.emergencyPhoneNumber}
                  onChange={(e) => {
                    if (validateNumbers(e.target.value))
                      setForm({ ...form, emergencyPhoneNumber: e.target.value });
                  }}
                />
              </Field>

              <Field label="آدرس دفتر" className="md:col-span-2">
                <Input
                  className={inputBase}
                  value={form.officeAddress}
                  onChange={(e) => setForm({ ...form, officeAddress: e.target.value })}
                />
              </Field>

              <Field label="کد پستی">
                <Input
                  className={inputBase}
                  value={form.zipCode}
                  onChange={(e) => {
                    if (validateNumbers(e.target.value)) setForm({ ...form, zipCode: e.target.value });
                  }}
                />
              </Field>

              <Field label="ایمیل">
                <Input
                  className={inputBase}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>
            </div>

            {/* Footer sticky-ish */}
            <div className="px-5 py-4 border-t border-boxBorderColor dark:border-boxBorderColor-dark flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 bg-white/80 dark:bg-bgColor-dark/80 backdrop-blur">
              <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl text-titleText dark:text-titleText-dark">
                انصراف
              </Button>
              <Button variant="primary" onClick={handleSave} className="rounded-xl text-titleText dark:text-titleText-dark">
                {Loading ? <LoaderCircle size={8} color="border-white-500" /> : "ذخیره"}
              </Button>
            </div>
          </Modal.Panel>
        </div>
      </Modal>

      {/* افزودن فایل */}
      <Modal open={AddFileModal} onClose={() => SetAddFileModal(false)}>
        <Modal.Backdrop />
        <div className="fixed inset-0 flex z-50 backdrop-blur-sm bg-black/10 dark:bg-black/30 p-4">
          <Modal.Panel className={cx(panelBase, "max-w-xl mx-auto my-16 overflow-hidden")}>
            <div className="px-5 py-4 border-b border-boxBorderColor dark:border-boxBorderColor-dark">
              <Modal.Title className={cx("text-xl font-extrabold", "text-titleText dark:text-titleText-dark")}>
                افزودن فایل
              </Modal.Title>
              <p className={cx(subtleText, "mt-1")}>نوع فایل را انتخاب کنید و سپس فایل را بارگذاری کنید.</p>
            </div>

            <div className="p-5 space-y-5">
              <Field label="نوع فایل">
                <div className="relative">
                  <Dropdown onChange={handleSelectChange} value={type}>
                    <Dropdown.Trigger className="w-full">
                      <Button
                        as="span"
                        role="button"
                        variant="ghost"
                        className={cx(
                          "w-full h-12 rounded-xl border border-boxBorderColor dark:border-boxBorderColor-dark",
                          "bg-boxColor dark:bg-boxColor-dark",
                          "flex items-center justify-between px-4",
                          "text-titleText dark:text-titleText-dark"
                        )}
                      >
                        <span>{type ? type : "انتخاب"}</span>
                      </Button>
                    </Dropdown.Trigger>

                    <Dropdown.Options
                      className={cx(
                        "absolute left-0 mt-2 w-full p-2 z-50",
                        "rounded-xl border border-boxBorderColor dark:border-boxBorderColor-dark",
                        "bg-white dark:bg-buttonColor-dark  text-titleText dark:text-titleText-dark",
                        "max-h-60 overflow-y-auto"
                      )}
                    >
                      {["اساسنامه", "صورت مالی"].map((v) => (
                        <Dropdown.Option value={v} key={v}>
                          {({ selected, active }) => (
                            <MenuItem
                              isActive={active}
                              isSelected={selected}
                              className={cx(
                                "rounded-lg border mt-1 mb-1",
                                "border-gray-100 dark:border-buttonBorderColor-dark",
                                type === v && "bg-gray-100 border-gray-200 dark:bg-gray-700 text-titleText dark:text-titleText-dark"
                              )}
                            >
                              <MenuItem.Title>{v}</MenuItem.Title>
                            </MenuItem>
                          )}
                        </Dropdown.Option>
                      ))}
                    </Dropdown.Options>
                  </Dropdown>

                  <ControlsChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-titleText dark:text-titleText-dark pointer-events-none" />
                </div>
              </Field>

              {type === "صورت مالی" ? (
                <Field label="عنوان / سال">
                  <PersianYearSelect
                    onChange={(e) => SetFinancialName(e !== null ? e : 0)}
                    value={FinancialName}
                  />
                </Field>
              ) : null}

              <Field label="بارگذاری فایل">
                <div
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  className={cx(
                    "rounded-2xl border-2 border-dashed p-4",
                    "bg-boxColor/20 dark:bg-boxColor-dark/20",
                    "border-boxBorderColor dark:border-boxBorderColor-dark",
                    isDragging && "border-primary dark:border-primary-dark bg-primary/5 dark:bg-primary-dark/10"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold  text-titleText dark:text-titleText-dark">فایل را بکشید و رها کنید</p>
                      <p className={cx(subtleText, "mt-1")}>
                        یا از دکمه «انتخاب فایل» استفاده کنید.
                      </p>
                      <p className={cx("mt-2 text-sm", fileName ? "text-titleText dark:text-titleText-dark" : subtleText)}>
                        {fileName ? `انتخاب شده: ${fileName}` : "هنوز فایلی انتخاب نشده"}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <label className="cursor-pointer">
                        <span
                          className={cx(
                            "inline-flex items-center justify-center",
                            "h-10 px-4 rounded-xl",
                            "border border-boxBorderColor dark:border-boxBorderColor-dark",
                            "bg-white dark:bg-bgColor-dark",
                            "text-titleText dark:text-titleText-dark",
                            "hover:bg-boxColor/40 dark:hover:bg-boxColor-dark/40 transition"
                          )}
                        >
                          انتخاب فایل
                        </span>
                        <input
                          type="file"
                          accept="*/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </Field>

              <Button
                variant="primary"
                className="w-full rounded-xl  text-titleText dark:text-titleText-dark"
                disabled={!file || uploading}
                onClick={uploadFile}
              >
                {uploading ? "در حال بارگذاری..." : "بارگذاری"}
              </Button>
            </div>
          </Modal.Panel>
        </div>
      </Modal>

      {/* تغییر مشخصات کارگزاری */}
      <Modal open={isLogOpen} onClose={() => setisLogOpen(false)}>
        <Modal.Backdrop />
        <div className="fixed inset-0 flex z-50 backdrop-blur-sm bg-black/10 dark:bg-black/30 p-4">
          <Modal.Panel className={cx(panelBase, "max-w-3xl mx-auto my-16 overflow-hidden")}>
            <div className="px-5 py-4 border-b border-boxBorderColor dark:border-boxBorderColor-dark">
              <h4 className={cx("text-xl font-extrabold", "text-titleText dark:text-titleText-dark")}>
                تغییرات مشخصات کارگزاری
              </h4>
              <p className={cx(subtleText, "mt-1")}>لاگ تغییرات اخیر نمایش داده می‌شود.</p>
            </div>

            <div className="p-5">
              {LogLoading ? (
                <div className="mt-2">
                  <LoadingComponent />
                </div>
              ) : (
                <LogViewer logs={Changes} />
              )}

              <div className="mt-4">
                <Pagination
                  rtl
                  totalItems={LogNumber}
                  pageSize={10}
                  currentPage={LogPage + 1}
                  onPageChange={(e) => setLogPage(e - 1)}
                />
              </div>

              <div className="mt-4 flex justify-end">
                <Button variant="ghost" className="rounded-xl" onClick={() => setisLogOpen(false)}>
                  بستن
                </Button>
              </div>
            </div>
          </Modal.Panel>
        </div>
      </Modal>

      {/* Modal تأیید حذف اساسنامه */}
      <Modal open={confirmAssociationOpen} onClose={() => !deleteLoading && setConfirmAssociationOpen(false)}>
        <Modal.Backdrop />
        <div className="fixed inset-0 flex z-50 backdrop-blur-sm bg-black/10 dark:bg-black/30 p-4">
          <Modal.Panel className={cx(panelBase, "max-w-md mx-auto my-24 overflow-hidden")}>
            <div className="p-5">
              <p className="font-semibold mb-2 text-titleText dark:text-titleText-dark">
                حذف اساسنامه
              </p>
              <p className={subtleText}>
                آیا از حذف اساسنامه کارگزاری مطمئن هستید؟ این عملیات قابل بازگشت نیست.
              </p>

              <div className="mt-5 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  disabled={deleteLoading}
                  className="rounded-xl text-titleText dark:text-titleText-dark"
                  onClick={() => setConfirmAssociationOpen(false)}
                >
                  انصراف
                </Button>
                <Button
                  variant="primary"
                  disabled={deleteLoading}
                  className="rounded-xl bg-red-600 hover:bg-red-700 text-titleText dark:text-titleText-dark"
                  onClick={handleConfirmDeleteAssociation}
                >
                  {deleteLoading ? <LoaderCircle size={8} color="border-white-500" /> : "حذف"}
                </Button>
              </div>
            </div>
          </Modal.Panel>
        </div>
      </Modal>

      {/* Modal تأیید حذف کارگزاری */}
      <Modal open={confirmDeleteExchangeOpen} onClose={() => !deleteLoading && setconfirmDeleteExchangeOpen(false)}>
        <Modal.Backdrop />
        <div className="fixed inset-0 flex z-50 backdrop-blur-sm bg-black/10 dark:bg-black/30 p-4">
          <Modal.Panel className={cx(panelBase, "max-w-md mx-auto my-20 overflow-hidden")}>
            <div className="p-5">
              <p className="font-semibold mb-2 text-titleText dark:text-titleText-dark">حذف کارگزاری</p>
              <p className={subtleText}>
                آیا از حذف کارگزاری مطمئن هستید؟ این عملیات قابل بازگشت نیست.
              </p>

              <div className="mt-4">
                <small className={cx(subtleText, "select-none")}>
                  نام کارگزاریی مورد نظر (<b>{name}</b>) را در کادر زیر وارد کنید
                </small>

                <Input
                  className={cx(inputBase, "mt-2")}
                  placeholder={name}
                  value={ConfirmDelete}
                  onChange={(e) => SetConfirmDelete(e.target.value)}
                />
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  disabled={ExchangedeleteLoading}
                  className="rounded-xl text-titleText dark:text-titleText-dark"
                  onClick={() => setconfirmDeleteExchangeOpen(false)}
                >
                  انصراف
                </Button>
                <Button
                  variant="primary"
                  onClick={deleteExchange}
                  disabled={ExchangedeleteLoading || name !== ConfirmDelete}
                  className="rounded-xl text-white bg-red-600 hover:bg-red-700"
                >
                  {ExchangedeleteLoading ? <LoaderCircle size={8} color="border-white-500" /> : "حذف"}
                </Button>
              </div>
            </div>
          </Modal.Panel>
        </div>
      </Modal>

      {/* Modal تأیید حذف صورت مالی */}
      <Modal open={confirmFinancialOpen} onClose={() => !deleteLoading && setConfirmFinancialOpen(false)}>
        <Modal.Backdrop />
        <div className="fixed inset-0 flex z-50 backdrop-blur-sm bg-black/10 dark:bg-black/30 p-4">
          <Modal.Panel className={cx(panelBase, "max-w-md mx-auto my-24 overflow-hidden")}>
            <div className="p-5">
              <p className="font-semibold mb-2  text-titleText dark:text-titleText-dark">حذف صورت مالی</p>
              <p className={subtleText}>
                {`آیا از حذف صورت مالی ${financialToDelete?.date ?? ""} مطمئن هستید؟ این عملیات قابل بازگشت نیست.`}
              </p>

              <div className="mt-5 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  disabled={deleteLoading}
                  className="rounded-xl text-titleText dark:text-titleText-dark"
                  onClick={() => {
                    setConfirmFinancialOpen(false);
                    setFinancialToDelete(null);
                  }}
                >
                  انصراف
                </Button>
                <Button
                  variant="primary"
                  disabled={deleteLoading}
                  className="rounded-xl  text-titleText dark:text-titleText-dark bg-red-600 hover:bg-red-700"
                  onClick={handleConfirmDeleteFinancial}
                >
                  {deleteLoading ? <LoaderCircle size={8} color="border-white-500" /> : "حذف"}
                </Button>
              </div>
            </div>
          </Modal.Panel>
        </div>
      </Modal>
    </div>
  );
};

export default Exchange_info;
