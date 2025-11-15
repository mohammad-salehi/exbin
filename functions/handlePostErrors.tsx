import toast from "react-hot-toast";

// تبدیل اعداد فارسی → انگلیسی
const toEnDigits = (s: string) =>
  String(s || "").replace(/[۰-۹]/g, d =>
    String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))
  );

const DUP_RX =
  /Exchange\s*already\s*exists\s*with\s*identifier\s*:\s*([\w-]+)\s*:\s*([0-9۰-۹A-Za-z_-]+)\s*$/i;

const BOARD_DUP_RX =
  /BoardMember\s*already\s*exists\s*with\s*identifier\s*:\s*([\w-]+)\s*:\s*([0-9۰-۹A-Za-z_-]+)\s*for\s*exchange\s*:\s*([0-9۰-۹A-Za-z_-]+)/i;

const AGENT_DUP_RX =
  /ExchangeAgent\s*already\s*exists\s*with\s*identifier\s*:\s*([\w-]+)\s*:\s*([0-9۰-۹A-Za-z_-]+)\s*for\s*exchange\s*:\s*([0-9۰-۹A-Za-z_-]+)/i;

const EMPLOYEE_DUP_RX =
  /Employee\s*already\s*exists\s*with\s*identifier\s*:\s*([\w-]+)\s*:\s*([0-9۰-۹A-Za-z_-]+)\s*for\s*exchange\s*:\s*([0-9۰-۹A-Za-z_-]+)/i;

function parseExchangeExistsMessage(text?: string) {
  if (!text) return { found: false as const };
  const m = String(text).trim().match(DUP_RX);
  if (!m) return { found: false as const };

  return {
    found: true as const,
    key: m[1],
    value: toEnDigits(m[2]),
  };
}

function parseBoardMemberExistsMessage(text?: string) {
  if (!text) return { found: false as const };
  const m = String(text).trim().match(BOARD_DUP_RX);
  if (!m) return { found: false as const };

  return {
    found: true as const,
    key: m[1],
    value: toEnDigits(m[2]),
    exchangeId: toEnDigits(m[3]),
  };
}

function parseExchangeAgentExistsMessage(text?: string) {
  if (!text) return { found: false as const };
  const m = String(text).trim().match(AGENT_DUP_RX);
  if (!m) return { found: false as const };

  return {
    found: true as const,
    key: m[1],
    value: toEnDigits(m[2]),
    exchangeId: toEnDigits(m[3]),
  };
}

function parseEmployeeExistsMessage(text?: string) {
  if (!text) return { found: false as const };
  const m = String(text).trim().match(EMPLOYEE_DUP_RX);
  if (!m) return { found: false as const };

  return {
    found: true as const,
    key: m[1],
    value: toEnDigits(m[2]),
    exchangeId: toEnDigits(m[3]),
  };
}


export const handlePostErrors = (e: any) => {
  const status = e?.response?.status;
  const data = e?.response?.data as { result?: any; error?: string } | undefined;
  const msg = String(e?.message ?? "");

  // اگر message خودش JSON بود
  let parsedFromMessage: { result?: any; error?: string } | null = null;
  if (!data && typeof msg === "string" && msg.startsWith("{") && msg.endsWith("}")) {
    try { parsedFromMessage = JSON.parse(msg); } catch { }
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

  const sourcesToCheck = [
    errorObj?.error,
    typeof data === "string" ? data : null,
    msg,
  ].filter(Boolean) as string[];

  for (const src of sourcesToCheck) {
    // ۱) اول BoardMember
    const b = parseBoardMemberExistsMessage(src);
    if (b.found) {
      const fieldLabels: Record<string, string> = {
        nationalCode: "شناسه ملی",
        financialCode: "کد اقتصادی",
        phoneNumber: "شماره تماس",
        emergencyPhoneNumber: "شماره تماس اضطراری",
        zipCode: "کد پستی",
        legalName: "نام حقوقی",
        name: "نام",
        siteAddress: "آدرس سایت",
        email: "ایمیل",
      };
      const label = fieldLabels[b.key] || b.key;
      toast.error(
        `${label} ${b.value} قبلاً برای این سکو ثبت شده است.`,
        { position: "bottom-left" }
      );
      return true;
    }

    // ۲) ExchangeAgent
    const ag = parseExchangeAgentExistsMessage(src);
    if (ag.found) {
      const fieldLabels: Record<string, string> = {
        nationalCode: "شناسه ملی",
        financialCode: "کد اقتصادی",
        phoneNumber: "شماره تماس",
        emergencyPhoneNumber: "شماره تماس اضطراری",
        zipCode: "کد پستی",
        legalName: "نام حقوقی",
        name: "نام",
        siteAddress: "آدرس سایت",
        email: "ایمیل",
      };
      const label = fieldLabels[ag.key] || ag.key;

      toast.error(
        `${label} ${ag.value} قبلاً برای نماینده صرافی در این سکو ثبت شده است.`,
        { position: "bottom-left" }
      );
      return true;
    }

    // ۳) Employee
    const emp = parseEmployeeExistsMessage(src);
    if (emp.found) {
      const fieldLabels: Record<string, string> = {
        nationalCode: "شناسه ملی",
        financialCode: "کد اقتصادی",
        phoneNumber: "شماره تماس",
        emergencyPhoneNumber: "شماره تماس اضطراری",
        zipCode: "کد پستی",
        legalName: "نام حقوقی",
        name: "نام",
        siteAddress: "آدرس سایت",
        email: "ایمیل",
      };
      const label = fieldLabels[emp.key] || emp.key;

      toast.error(
        `${label} ${emp.value} قبلاً برای کارمند در این سکو ثبت شده است.`,
        { position: "bottom-left" }
      );
      return true;
    }

    // ۲) بعد Exchange
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
        email: "ایمیل",
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
