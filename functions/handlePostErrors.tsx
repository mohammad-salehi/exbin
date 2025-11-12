import toast from "react-hot-toast";

// regex منعطف‌تر + تبدیل اعداد فارسی
const DUP_RX = /Exchange\s*already\s*exists\s*with\s*identifier\s*:\s*([\w-]+)\s*:\s*([0-9۰-۹A-Za-z_-]+)\s*$/i;
const toEnDigits = (s: string) => s.replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));

function parseExchangeExistsMessage(text?: string) {
  if (!text) return { found: false as const };
  const m = String(text).trim().match(DUP_RX);
  if (!m) return { found: false as const };
  return { found: true as const, key: m[1], value: toEnDigits(m[2]) };
}

export const handlePostErrors = (e: any) => {
  const status = e?.response?.status;
  const data = e?.response?.data as { result?: any; error?: string } | undefined;
  const msg = String(e?.message ?? "");

  // اگر message خودش JSON بود
  let parsedFromMessage: { result?: any; error?: string } | null = null;
  if (!data && typeof msg === "string" && msg.startsWith("{") && msg.endsWith("}")) {
    try { parsedFromMessage = JSON.parse(msg); } catch {}
  }
  const errorObj = data || parsedFromMessage;

  // 403
  if (status === 403 && errorObj?.error) {
    toast.error(errorObj.error, { position: "bottom-left" });
    return true;
  }

  // ولیدیشن‌های فیلدی
  if (errorObj?.result && typeof errorObj.result === "object") {
    Object.entries(errorObj.result).forEach(([field, message]) => {
      const text = Array.isArray(message) ? message.join("، ") : String(message || "");
      if (text) toast.error(`${field} : ${text}`, { position: "bottom-left" });
    });
    return true;
  }

  // 🔎 ابتدا تلاش ویژه برای الگوی duplicate (روی data.error و message)
  const sourcesToCheck = [
    errorObj?.error,               // پیام اصلی بک‌اند
    typeof data === "string" ? data : null,
    msg,                           // پیام خطای کلی
  ].filter(Boolean) as string[];

  for (const src of sourcesToCheck) {
    const r = parseExchangeExistsMessage(src);
    if (r.found) {
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
      const label = fieldLabels[r.key] || r.key;
      toast.error(`${label} ${r.value} قبلاً ثبت شده است.`, { position: "bottom-left" });
      return true;
    }
  }

  // ✅ اگر duplicate نبود، ارور متنی مستقیم از بک‌اند
  if (typeof errorObj?.error === "string" && errorObj.error.trim() !== "") {
    toast.error(errorObj.error, { position: "bottom-left" });
    return true;
  }

  // fallbackهای قبلی (اختیاری)
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
  toast.error("خطا در پردازش", { position: "bottom-left" });
  console.error(e);
  return true;
};
