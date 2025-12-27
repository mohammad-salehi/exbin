import React, { useState } from "react";
import { Input } from "@heathmont/moon-base-tw";
import { Label } from "@heathmont/moon-core-tw";

type ExchangeInfoProps = {
  SetLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

type FormState = {
  domain: string;
  username: string;
  password: string;
};

const ExchangeSetting = ({ SetLoading }: ExchangeInfoProps) => {
  const [form, setForm] = useState<FormState>({
    domain: "",
    username: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    SetLoading(true);
    try {
      // TODO: submit form.domain, form.username, form.password
    } finally {
      SetLoading(false);
    }
  };

  const handleDelete = async () => {
    SetLoading(true);
    try {
      // TODO: delete action
      setForm({ domain: "", username: "", password: "" });
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

  return (
    <form
      onSubmit={handleSubmit}
      autoComplete="off"
      className="
        w-full max-w-[520px]
        rounded-xl border border-boxBorderColor dark:border-boxBorderColor-dark
        bg-boxColor/40 dark:bg-boxColor-dark/30
        p-4 sm:p-5
        shadow-sm
      "
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-base font-semibold text-titleText dark:text-titleText-dark">
            تنظیمات اتصال
          </div>
          <div className="mt-1 text-xs text-secondaryText dark:text-secondaryText-dark">
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
          <Input
            className={inputClass}
            type="password"
            name="password"
            value={form.password}
            onChange={(e) =>
              setForm((p) => ({ ...p, password: e.target.value }))
            }
            placeholder="رمزعبور"
            autoComplete="new-password"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
        <button
          type="button"
          onClick={handleDelete}
          className="
            w-full sm:w-auto
            h-10 px-4 rounded-lg
            border border-red-300 dark:border-red-700
            bg-red-50 dark:bg-red-950/30
            text-red-700 dark:text-red-300
            hover:bg-red-100 dark:hover:bg-red-950/45
            transition
          "
        >
          حذف
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
        >
          ثبت
        </button>
      </div>
    </form>
  );
};

export default ExchangeSetting;
