"use client";

import React, { useEffect, useMemo, useState } from "react";
import { GenericSearch } from "@heathmont/moon-icons-tw";
import ExpandableTable, {
  Column,
} from "../../components/ExpandableTable/ExpandableTable";
import Pagination from "../../components/Pagination/Pagination";
import { Modal, Input, Button } from "@heathmont/moon-core-tw";
import { GetRequest } from "../../functions/GetRequest";
import toast from "react-hot-toast";
import { LoaderCircle } from "../../components/Loader/Loader";
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import { PostRequest } from "../../functions/PostRequest";
import { refreshTokenOnly } from "../../functions/TokenRefresh";

type Role = "ADMIN" | "USER";

type Person = {
  id: string;
  firstName: string;
  lastName: string;
  role: Role;
  username: string;
};

type AddForm = {
  id: string;
  firstName: string;
  lastName: string;
  role: Role;
  username: string;
  password: string; // 👈 پسورد
};

const AdminPanel: React.FC = () => {
  const [Loading, setLoading] = useState<boolean>(false);
  // -------- داده‌ها --------
  const [rows, setRows] = useState<Person[]>([]);

  // -------- جست‌وجو --------
  const [query, setQuery] = useState<string>("");
  const norm = (s: unknown) => (s ?? "").toString().toLowerCase();
  const filtered: Person[] = useMemo(() => {
    const q = norm(query).trim();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.firstName, r.username, r.role, r.lastName].some((f) =>
        norm(f).includes(q)
      )
    );
  }, [rows, query]);

  // -------- ویرایش --------
  const [EditLoading, SetEditLoading] = useState<boolean>(false);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [form, setForm] = useState<Person | null>(null);

  const onEdit = (p: Person) => {
    setForm({ ...p });
    setEditOpen(true);
  };
  const onEditClose = () => {
    setEditOpen(false);
    setForm(null);
  };

  const onFormInputChange =
    (key: Exclude<keyof Person, "id">) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => (prev ? { ...prev, [key]: e.target.value } : prev));
    };

  const getTokenFromCookie = () =>
    document.cookie
      .split("; ")
      .find((r) => r.startsWith("token="))
      ?.split("=")[1] || "";

  type InitFactory = () => RequestInit;

  /** یک‌بار تلاش + اگر 401/403 شد: refresh و یک‌بار retry */
  async function fetchWithAuthRetry(url: string, initFactory: InitFactory) {
    let res = await fetch(url, initFactory());
    if (res.status === 401 || res.status === 403) {
      try {
        await refreshTokenOnly(); // کوکی‌ها آپدیت می‌شوند
        res = await fetch(url, initFactory()); // تلاش دوم با توکن تازه
      } catch {
        return res; // رفرش هم شکست خورد
      }
    }
    return res;
  }

  const onEditSave = async () => {
    if (!form) return;

    // ✅ فقط ADMIN
    const memberInfo = {
      firstName: form.firstName,
      lastName: form.lastName,
      role: "ADMIN" as Role,
      username: form.username,
    };

    try {
      const firstToken = getTokenFromCookie();
      if (!firstToken) {
        SetEditLoading(false);
        toast.error("توکن موجود نیست، لطفاً وارد سیستم شوید.", {
          position: "bottom-left",
        });
        return;
      }

      SetEditLoading(true);

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/users/${form.id}`;
      const response = await fetchWithAuthRetry(url, () => {
        const fresh = getTokenFromCookie();
        if (!fresh) throw new Error("NO_TOKEN");
        return {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${fresh}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(memberInfo),
        };
      });

      if (!response.ok) {
        // تلاش برای پیام خطا
        try {
          const j = await response.json();
          toast.error(j?.error || j?.message || "خطا در ویرایش کاربر", {
            position: "bottom-left",
          });
        } catch {
          toast.error("خطا در ویرایش کاربر", { position: "bottom-left" });
        }
        return;
      }

      // ✅ استیت هم همیشه ADMIN بماند
      const updatedForm: Person = { ...form, role: "ADMIN" };

      setRows((prev) =>
        prev.map((r) => (r.id === form.id ? updatedForm : r))
      );
      onEditClose();
      toast.success("کاربر با موفقیت ویرایش شد.", { position: "bottom-left" });
    } catch (err: any) {
      const msg =
        err?.message === "NO_TOKEN"
          ? "توکن موجود نیست، لطفاً وارد سیستم شوید."
          : "خطا در ویرایش کاربر";
      console.error(err);
      toast.error(msg, { position: "bottom-left" });
    } finally {
      SetEditLoading(false);
    }
  };

  // -------- حذف + تأیید --------
  const [DeleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [target, setTarget] = useState<{
    id: string;
    firstName: string;
    lastName: string;
  } | null>(null);

  const openDeleteConfirm = (p: Person) => {
    setTarget({ id: p.id, firstName: p.firstName, lastName: p.lastName });
    setConfirmOpen(true);
  };
  const closeDeleteConfirm = () => {
    setConfirmOpen(false);
    setTarget(null);
  };
  const confirmDelete = async () => {
    if (!target) return;

    try {
      const token = getTokenFromCookie();
      if (!token) {
        toast.error("توکن موجود نیست، لطفاً وارد سیستم شوید.", {
          position: "bottom-left",
        });
        return;
      }

      setDeleteLoading(true);

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/users/${target.id}`;
      const response = await fetchWithAuthRetry(url, () => {
        const fresh = getTokenFromCookie();
        if (!fresh) throw new Error("NO_TOKEN");
        return {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${fresh}`,
            "Content-Type": "application/json",
          },
        };
      });

      if (!response.ok) {
        try {
          const j = await response.json();
          toast.error(j?.error || j?.message || "خطا در حذف کاربر", {
            position: "bottom-left",
          });
        } catch {
          toast.error("خطا در حذف کاربر", { position: "bottom-left" });
        }
        return;
      }

      toast.success("کاربر با موفقیت حذف شد.", { position: "bottom-left" });
      setRows((prev) => prev.filter((r) => r.id !== target.id));
      closeDeleteConfirm();
    } catch (err: any) {
      const msg =
        err?.message === "NO_TOKEN"
          ? "توکن موجود نیست، لطفاً وارد سیستم شوید."
          : "خطا در حذف کاربر";
      console.error(err);
      toast.error(msg, { position: "bottom-left" });
    } finally {
      setDeleteLoading(false);
    }
  };

  // -------- افزودن --------
  const [AddLoading, SetAddLoading] = useState<boolean>(false);
  const [changePasswordId, setchangePasswordId] = useState<string>("");
  const [newPassword, setnewPassword] = useState<string>("");
  const [addOpen, setAddOpen] = useState<boolean>(false);
  const [changePassword, setChangePassword] = useState<boolean>(false);
  const [addForm, setAddForm] = useState<AddForm>({
    id: "",
    firstName: "",
    lastName: "",
    role: "ADMIN", // ✅ دستی ADMIN
    username: "",
    password: "", // 👈
  });

  const openAdd = () => {
    setAddForm({
      id: "",
      firstName: "",
      lastName: "",
      role: "ADMIN", // ✅ دستی ADMIN
      username: "",
      password: "",
    });
    setAddOpen(true);
  };
  const onAddClose = () => setAddOpen(false);

  const onAddInputChange =
    (key: Exclude<keyof Person, "role" | "id">) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAddForm((prev) => ({ ...prev, [key]: e.target.value }));
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
      if (!addForm.password?.trim()) {
        toast.error("رمز عبور را وارد کنید", { position: "bottom-left" });
        return;
      }
      if (addForm.password.length < 8) {
        toast.error("رمز عبور باید حداقل ۸ کاراکتر باشد", {
          position: "bottom-left",
        });
        return;
      }

      const Member = {
        firstName: addForm.firstName,
        lastName: addForm.lastName ?? "",
        username: addForm.username,
        role: "ADMIN" as Role, // ✅ دستی ADMIN
        password: addForm.password, // 👈 ارسال پسورد
      };

      SetAddLoading(true);

      const res: any = await PostRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
        Member
      );

      toast.success("کاربر باموفقیت افزوده شد.", { position: "bottom-left" });

      // اگر لازم داری قبل از افزودن، دوباره چک کنی:
      if (!addForm.firstName.trim() || !addForm.username.trim() || !Member.role)
        return;

      const newItem: Person = {
        id: Date.now().toString(),
        firstName: addForm.firstName,
        lastName: addForm.lastName,
        username: addForm.username,
        role: "ADMIN", // ✅ دستی ADMIN
      };

      setRows((prev) => [...prev, { ...newItem, id: res.result.id }]);
      onAddClose();
    } catch (e: any) {
      console.log(e);
      toast.error(e?.message || "خطا در ذخیره کاربر", {
        position: "bottom-left",
      });
    } finally {
      SetAddLoading(false);
    }
  };

  // -------- ستون‌ها --------
  const columns: Column<Person>[] = useMemo<Column<Person>[]>(
    () => [
      {
        header: "نام",
        accessorKey: "firstName",
        cell: (row: Person) => (
          <span className="font-medium text-gray-800 dark:text-gray-100">
            {row.firstName || "—"}
          </span>
        ),
      },
  
      {
        header: "نام خانوادگی",
        accessorKey: "lastName",
        cell: (row: Person) => (
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {row.lastName || "—"}
          </span>
        ),
      },
  
      {
        header: "نام کاربری",
        accessorKey: "username",
        cell: (row: Person) => (
          <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-white/10 text-sm font-mono text-gray-700 dark:text-gray-200">
            {row.username}
          </span>
        ),
      },
  
      {
        header: "نقش",
        accessorKey: "role",
        cell: (row: Person) => (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
            {row.role}
          </span>
        ),
      },
  
      {
        header: "عملیات",
        cell: (row: Person): React.ReactNode => (
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="px-3 py-1.5 rounded-lg text-sm bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 hover:bg-primary/20 hover:text-primary transition"
              onClick={() => onEdit(row)}
            >
              ویرایش
            </button>
  
            <button
              className="px-3 py-1.5 rounded-lg text-sm bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 transition"
              onClick={() => openDeleteConfirm(row)}
            >
              حذف
            </button>
  
            <a href={`/panel/admin-panel/timeline/${row.username}`}>
              <button className="px-3 py-1.5 rounded-lg text-sm bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 hover:bg-primary/20 hover:text-primary transition">
                خط زمانی
              </button>
            </a>
  
            <button
              className="px-3 py-1.5 rounded-lg text-sm bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 hover:bg-primary/20 hover:text-primary transition"
              onClick={() => {
                setchangePasswordId(row.id);
                setChangePassword(true);
              }}
            >
              تغییر رمزعبور
            </button>
          </div>
        ),
      },
    ],
    []
  );
  

  useEffect(() => {
    setLoading(true);
    GetRequest(process.env.NEXT_PUBLIC_API_URL + `/api/users`)
      .then((response) => {
        // ✅ اگر از بک USER هم بیاد، اینجا می‌تونی force کنی ADMIN بمونه (اگه نمی‌خوای، حذفش کن)
        setRows(response.result);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  const [changePwdLoading, setChangePwdLoading] = useState(false);
  const changepasswordHandler = async () => {
    const user = rows.find((r) => r.id === changePasswordId);
    if (!user)
      return toast.error("کاربر یافت نشد", { position: "bottom-left" });

    if (!newPassword?.trim())
      return toast.error("رمز عبور را وارد کنید", { position: "bottom-left" });
    if (newPassword.length < 8)
      return toast.error("رمز عبور باید حداقل ۸ کاراکتر باشد", {
        position: "bottom-left",
      });

    try {
      setChangePwdLoading(true);

      const token = getTokenFromCookie();
      if (!token) {
        toast.error("توکن موجود نیست، لطفاً وارد سیستم شوید.", {
          position: "bottom-left",
        });
        return;
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/users/reset-password`;
      const res = await fetchWithAuthRetry(url, () => {
        const fresh = getTokenFromCookie();
        if (!fresh) throw new Error("NO_TOKEN");
        return {
          method: "POST",
          headers: {
            Authorization: `Bearer ${fresh}`,
            "Content-Type": "application/json",
            accept: "*/*",
          },
          body: JSON.stringify({
            username: user.username,
            newPassword: newPassword,
          }),
        };
      });

      if (!res.ok) {
        let msg = `خطای سرور (${res.status})`;
        try {
          const j = await res.json();
          msg = j?.message || j?.error || msg;
        } catch {}
        throw new Error(msg);
      }

      toast.success("رمز عبور با موفقیت تغییر کرد.", {
        position: "bottom-left",
      });
      setChangePassword(false);
      setnewPassword("");
      setchangePasswordId("");
    } catch (e: any) {
      const msg =
        e?.message === "NO_TOKEN"
          ? "توکن موجود نیست، لطفاً وارد سیستم شوید."
          : e?.message || "خطا در تغییر رمز عبور";
      toast.error(msg, { position: "bottom-left" });
    } finally {
      setChangePwdLoading(false);
    }
  };

  const pageSize = 10; // می‌تونی از props هم بگیری

  const [currentPage, setCurrentPage] = useState(1);

  // هر بار filtered یا currentPage عوض شد، دیتا رو صفحه‌بندی کن
  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filtered.slice(start, end);
  }, [filtered, currentPage]);

  return (
    <div className="p-2 sm:p-0">
      {/* Search */}
      <div className="relative w-full md:w-[500px] h-[48px] mb-4 mt-8">
        <input
          className="flex w-full h-full p-0 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark border border-boxBorderColor dark:border-boxBorderColor-dark pl-4 pr-10 focus:outline-none focus:ring-0"
          placeholder="جست‌وجو"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setQuery(e.target.value)
          }
        />
        <GenericSearch className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xl" />
      </div>

      <h5 className="font-medium text-[24px] leading-[100%] tracking-[0] text-right align-middle mt-8 text-titleText dark:text-titleText-dark">
        لیست کاربران
      </h5>

      <div className="mt-4">
        {Loading ? (
          <LoadingComponent />
        ) : (
          <ExpandableTable<Person>
            data={pagedData} // 👈 فقط داده‌های صفحه فعلی
            columns={columns}
            rowDetailsMode="row"
            rowDetailsClassName="rounded-xl p-3"
          />
        )}

        <Pagination
          rtl
          totalItems={filtered.length} // کل تعداد رکوردها
          pageSize={pageSize}
          currentPage={currentPage} // 👈 استیت واقعی صفحه
          onPageChange={(page) => setCurrentPage(page)} // 👈 صفحه عوض شد
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
              {"افزودن کاربر جدید"}
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
                  <label className="">نام</label>
                  <Input
                    className=" p-0 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark"
                    placeholder="نام"
                    value={form.firstName}
                    onChange={onFormInputChange("firstName")}
                  />
                </div>
                <div className="mt-4">
                  <label>نام خانوادگی</label>
                  <Input
                    className=" p-0 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark"
                    placeholder="نام‌خانوادگی"
                    value={form.lastName}
                    onChange={onFormInputChange("lastName")}
                  />
                </div>

                <div className="mt-4">
                  <label className="">نام کاربری</label>
                  <Input
                    className=" p-0 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark"
                    placeholder="نام کاربری"
                    value={form.username}
                    onChange={(e) => {
                      const val = e.target.value;
                      const allowed = val.replace(/[^A-Za-z0-9._-]/g, "");
                      setForm((prev) =>
                        prev ? { ...prev, username: allowed } : prev
                      );
                    }}
                  />
                </div>

                {/* ✅ نقش به صورت دستی ADMIN (بدون Dropdown) */}
                <div className="mt-4">
                  <label className="">نقش</label>
                  <Input
                    className=" p-0 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark"
                    value={"ADMIN"}
                    disabled
                  />
                </div>

                <div className="relative w-full mt-6">
                  <div className=" justify-between items-center w-full">
                    <div className="text-sm text-titleText dark:text-titleText-dark"></div>
                    <div className="text-sm text-titleText dark:text-titleText-dark w-full sm:w-auto">
                      <button
                        onClick={onEditSave}
                        className="w-full bg-primary h-[48px] rounded-lg text-white shadow-lg flex justify-center items-center"
                      >
                        {EditLoading ? (
                          <LoaderCircle size={8} color="border-white-500" />
                        ) : (
                          "ذخیره"
                        )}
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
              {`آیا از حذف ${target?.firstName ?? ""} ${
                target?.lastName ?? ""
              } مطمئن هستید؟`}
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
                {DeleteLoading ? "درحال حذف..." : "حذف"}
              </button>
            </div>
          </Modal.Panel>
        </div>
      </Modal>

      {/* -------- مودال افزودن کاربر -------- */}
      <Modal open={addOpen} onClose={onAddClose}>
        {/* بک‌دراپ، تمام صفحه، یک لایه پایین‌تر از پنل */}
        <Modal.Backdrop className="fixed inset-0 w-screen h-screen bg-black/50 z-[2147483646]" />

        {/* کانتینر مرکزی پنل، بالاتر از بک‌دراپ */}
        <div className="fixed inset-0 z-[2147483647] flex items-center justify-center">
          <Modal.Panel className="bg-boxColor dark:bg-bgColor-dark shadow-xl rounded-xl text-titleText dark:text-titleText-dark w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">افزودن کاربر جدید</h3>
            <div>
              <div>
                <label className="mt-2">نام</label>
                <Input
                  className=" p-0 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark"
                  placeholder="نام "
                  value={addForm.firstName}
                  onChange={onAddInputChange("firstName")}
                />
              </div>
              <div className="mt-4">
                <label className="mt-2">نام خانوادگی</label>
                <Input
                  className=" p-0 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark"
                  placeholder="نام‌خانوادگی"
                  value={addForm.lastName}
                  onChange={onAddInputChange("lastName")}
                />
              </div>
              <div className="mt-4">
                <label className="mt-2">نام کاربری</label>
                <Input
                  className=" p-0 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark"
                  placeholder="نام کاربری"
                  value={addForm.username}
                  onChange={(e) => {
                    const val = e.target.value;
                    const allowed = val.replace(/[^A-Za-z0-9._-]/g, "");
                    setAddForm((prev) => ({ ...prev, username: allowed }));
                  }}
                />{" "}
              </div>
              <div className="mt-4">
                <label className="mt-2">رمز عبور</label>
                <Input
                  type="password"
                  className=" p-0 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark"
                  placeholder="رمز عبور"
                  value={addForm.password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAddForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  autoComplete="new-password"
                  required
                />
                <p className="mt-1 text-xs text-titleText dark:text-titleText-dark">
                  حداقل ۸ کاراکتر.
                </p>
              </div>

              {/* ✅ نقش به صورت دستی ADMIN (بدون Dropdown) */}
              <div className="mt-4">
                <label className="">نقش</label>
                <Input
                  className=" p-0 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark"
                  value={"ADMIN"}
                  disabled
                />
              </div>

              <div className="relative w-full mt-6">
                <div className=" justify-between items-center w-full">
                  <div className="text-sm text-titleText dark:text-titleText-dark"></div>
                  <div className="text-sm text-titleText dark:text-titleText-dark w-full sm:w-auto">
                    <button
                      onClick={onAddSave}
                      className="w-full bg-primary h-[48px] rounded-lg text-white shadow-lg flex justify-center items-center"
                    >
                      {AddLoading ? (
                        <LoaderCircle size={8} color="border-white-500" />
                      ) : (
                        "افزودن"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Panel>
        </div>
      </Modal>

      {/* -------- مودال تغییر رمز -------- */}
      <Modal
        open={changePassword}
        onClose={() => {
          setChangePassword(false);
        }}
      >
        <Modal.Backdrop className="fixed inset-0 w-screen h-screen bg-black/50 z-[2147483646]" />
        <div className="fixed inset-0 z-[2147483647] flex items-center justify-center">
          <Modal.Panel className="bg-boxColor dark:bg-bgColor-dark shadow-xl rounded-xl text-titleText dark:text-titleText-dark w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">تغییر رمزعبور</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                changepasswordHandler();
              }}
            >
              <Input
                className="p-0 flex-col justify-center items-center gap-0 flex-shrink-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark shadow-sm pl-4 pr-4 border border-boxBorderColor dark:border-boxBorderColor-dark"
                placeholder="رمزعبور جدید"
                type="password"
                onChange={(e) => setnewPassword(e.target.value)}
                value={newPassword}
                autoComplete="new-password"
                required
              />

              <div className="flex justify-center gap-4 w-full mt-4">
                <button
                  type="button"
                  onClick={() => setChangePassword(false)}
                  className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  disabled={changePwdLoading}
                >
                  انصراف
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 shadow-lg transition"
                  disabled={changePwdLoading}
                >
                  {changePwdLoading ? (
                    <LoaderCircle size={8} color="border-white-500" />
                  ) : (
                    "تغییر"
                  )}
                </button>
              </div>
            </form>
          </Modal.Panel>
        </div>
      </Modal>
    </div>
  );
};

export default AdminPanel;
