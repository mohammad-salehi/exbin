import React, { useEffect, useState } from "react";
import { Input } from "@heathmont/moon-base-tw";
import { Label } from "@heathmont/moon-core-tw";
import { DeleteRequest, GetRequest } from "../../../../functions/GetRequest";
import { useParams } from "next/navigation";
import { PostRequest } from "../../../../functions/PostRequest";
import toast from "react-hot-toast";

type ExchangeInfoProps = {
  SetLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

type FormState = {
  domain: string;
  username: string;
  password: string;
};

const ExchangeSetting = ({ SetLoading }: ExchangeInfoProps) => {

  const params = useParams<{ id: string }>();
  const id = params.id

  const [form, setForm] = useState<FormState>({
    domain: "",
    username: "",
    password: "",
  });

  // ✅ NEW: toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [AddLoading, setAddLoading] = useState(false);
  const [DeleteLoading, setDeleteLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    SetLoading(true);
    try {
      // TODO: submit form.domain, form.username, form.password
    } finally {
      SetLoading(false);
    }
  };

  const inputClass =
    "w-full p-0 rounded-md bg-boxColor dark:bg-boxColor-dark text-titleText dark:text-titleText-dark " +
    "shadow-sm px-4 border border-boxBorderColor dark:border-boxBorderColor-dark " +
    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition";

  const labelClass =
    "pb-0 text-sm font-medium text-titleText dark:text-titleText-dark";

  const getData = () => {
    SetLoading(true)
    GetRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${id}/credentials`)
      .then((response) => {
        setForm(
          {
            domain: response.result.domain !== null ? response.result.domain : '',
            username: response.result.username !== null ? response.result.username : '',
            password: response.result.password !== null ? response.result.password : '',
          }
        )
        SetLoading(false)
      })
      .catch((err) => {
        console.log(err)
        SetLoading(false)
        setForm(
          {
            domain: '',
            username: '',
            password: '',
          }
        )
      })
  }
  useEffect(() => {
    getData()
  }, [])

  const AddData = () => {
    if (form.password.length < 6) {
      return toast.error("رمزعبور باید حداقل 6 رقم باشد", { position: "bottom-left" })
    }
    setAddLoading(true)
    PostRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${id}/credentials`,
      {
        domain: form.domain,
        username: form.username,
        password: form.password,
      }
    )
      .then((response) => {
        toast.success("اطلاعات موردنظر ثبت شد", { position: "bottom-left" })
        setAddLoading(false)
      })
      .catch((err) => {
        toast.error("خطا در ثبت اطلاعات", { position: "bottom-left" })
        setAddLoading(false)
      })
  }
  const deleteData = () => {
    setDeleteLoading(true)
    DeleteRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/exchanges/${id}/credentials`)
      .then((response) => {
        toast.success("اطلاعات با موفقیت حذف شدند", { position: "bottom-left" })
        setDeleteLoading(false)
        getData()
      })
      .catch((err) => {
        toast.error("خطا در حذف اطلاعات", { position: "bottom-left" })
        setDeleteLoading(false)
      })
  }

  return (
    <form
      onSubmit={handleSubmit}
      autoComplete="off"
      className="
        w-full max-w-[620px]
        rounded-xl sm:border sm:border-boxBorderColor sm:dark:border-boxBorderColor-dark
        sm:bg-boxColor/40 sm:dark:bg-boxColor-dark/30
         sm:p-5
        shadow-sm
      "
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-base font-semibold text-titleText dark:text-titleText-dark">
            تنظیمات اتصال کارگزاری
          </div>
          <div className="mt-1 text-xs text-titleText dark:text-titleText-dark">
            اطلاعات دامنه و دسترسی را وارد کنید
          </div>
        </div>
      </div>

      {/* Domain (single line) */}
      <div className="space-y-2">
        <Label className={labelClass}>Domain</Label>
        <Input
          className={inputClass}
          type="text"
          name="domain"
          value={form.domain}
          onChange={(e) => setForm((p) => ({ ...p, domain: e.target.value }))}
          placeholder="example.com"
          autoComplete="off"
          spellCheck={false}
          inputMode="url"
        />
      </div>

      {/* Username + Password (same row) */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className={labelClass}>نام کاربری</Label>
          <Input
            className={inputClass}
            type="text"
            name="username"
            value={form.username}
            onChange={(e) =>
              setForm((p) => ({ ...p, username: e.target.value }))
            }
            placeholder="نام کاربری"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className="space-y-2">
          <Label className={labelClass}>رمزعبور</Label>

          {/* ✅ NEW: wrapper to place icon inside password input */}
          <div className="relative">
            <Input
              className={inputClass}
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={(e) =>
                setForm((p) => ({ ...p, password: e.target.value }))
              }
              placeholder="رمزعبور"
              autoComplete="new-password"
            />

            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute inset-y-0 left-3 flex items-center"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                // eye-off
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-titleText dark:text-titleText-dark">
                  <path
                    d="M3 3L21 21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M10.58 10.58A3 3 0 0013.42 13.42"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M9.88 5.08A10.94 10.94 0 0112 4c7 0 10 8 10 8a18.5 18.5 0 01-3.27 4.48"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6.23 6.23A18.5 18.5 0 002 12s3 8 10 8a10.9 10.9 0 004.15-.8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14.12 14.12A3 3 0 019.88 9.88"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                // eye
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-titleText dark:text-titleText-dark">
                  <path
                    d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
        <button
          type="button"
          onClick={deleteData}
          className="
            w-full sm:w-auto
            h-10 px-4 rounded-lg
            border border-gray-300 dark:border-gray-500
            
            text-gray-700 dark:text-gray-300
            
            transition
          "

        >
          {
            DeleteLoading ?
              'درحال حذف...'
              :
              'حذف'
          }
        </button>

        <button
          type="submit"
          className="
            w-full sm:w-auto
            h-10 px-5 rounded-lg
            bg-primary text-white
            hover:opacity-90
            active:opacity-80
            shadow-sm
            transition
          "
          onClick={() => {
            AddData()
          }}
        >
          {
            AddLoading ?
              'درحال ثبت...'
              :
              'ثبت'
          }
        </button>
      </div>
    </form>
  );
};

export default ExchangeSetting;
