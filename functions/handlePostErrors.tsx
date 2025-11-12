import toast from "react-hot-toast";


export const handlePostErrors = (e: any) => {
    const msg = String(e?.message ?? "");
    const status = e?.response?.status;
    const data = e?.response?.data as { result?: any; error?: string } | undefined;

    // 👇 تلاش دوم: اگه response نبود ولی message خودش JSON بود
    let parsedFromMessage: { result?: any; error?: string } | null = null;
    if (!data && typeof msg === "string" && msg.startsWith("{") && msg.endsWith("}")) {
      try {
        parsedFromMessage = JSON.parse(msg);
      } catch {
        // ignore
      }
    }

    const errorObj = data || parsedFromMessage;

    // 403 جدا هندل میشه بیرون، ولی اگه اینجا رسیدیم و متنی داشتیم نشون میدیم
    if (status === 403 && errorObj?.error) {
      toast.error(errorObj.error, { position: "bottom-left" });
      return true;
    }

    // ✅ ولیدیشن‌های فیلدی
    if (errorObj?.result && typeof errorObj.result === "object") {
      Object.entries(errorObj.result).forEach(([field, message]) => {
        if (message) toast.error(`${field} : ${message as string}`, { position: "bottom-left" });
      });
      return true;
    }

    // ✅ ارور متنی مستقیم از بک‌اند
    if (typeof errorObj?.error === "string" && errorObj.error.trim() !== "") {
      toast.error(errorObj.error, { position: "bottom-left" });
      return true;
    }

    // ✅ الگوی identifier از روی data.error
    if ((status === 400 || status === 409) && data?.error) {
      const duplicateMatch = String(data.error).match(/identifier:\s*(\w+):\s*(.+)$/i);
      if (duplicateMatch) {
        const field = duplicateMatch[1];
        const value = duplicateMatch[2];
        const fieldLabels: Record<string, string> = {
          nationalCode: "شناسه ملی",
          financialCode: "کد اقتصادی",
          phoneNumber: "شماره تماس",
          emergencyPhoneNumber: "شماره تماس اضطراری",
          zipCode: "کد پستی",
          legalName: "نام حقوقی",
          name: "نام سکو",
          siteAddress: "آدرس سایت",
        };
        const label = fieldLabels[field] || field;
        toast.error(`${label} ${value} قبلاً ثبت شده است.`, { position: "bottom-left" });
        return true;
      }
    }

    // ✅ fallbackهای متنی قبلیت
    const financialCodeError = msg.match(/Exchange with financial code '(.*?)' already exists/i);
    if (financialCodeError) {
      toast.error(`سکو با کد اقتصادی ${financialCodeError[1]} قبلاً وجود دارد.`, { position: "bottom-left" });
      return true;
    }
    const nationalCodeError = msg.match(/Exchange with national code '(.*?)' already exists/i);
    if (nationalCodeError) {
      toast.error(`سکو با شناسه ملی ${nationalCodeError[1]} قبلاً وجود دارد.`, { position: "bottom-left" });
      return true;
    }

    // آخرش
    toast.error("خطا در ذخیره سکو", { position: "bottom-left" });
    console.error(e);
    return true;
  };