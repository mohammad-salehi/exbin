import jalaali from "jalaali-js";

// 🔹 تبدیل اعداد فارسی/عربی به انگلیسی
function toEnglishDigits(str: string): string {
  return str.replace(/[\u06F0-\u06F9\u0660-\u0669]/g, ch => {
    if (ch >= "۰" && ch <= "۹") return String(ch.charCodeAt(0) - "۰".charCodeAt(0));
    return String(ch.charCodeAt(0) - "٠".charCodeAt(0));
  });
}

export function toJalaliDate(
  gregorianDate: string,
  usePersianDigits: boolean = true
): string | null {
  if (!gregorianDate) return null;

  // 🧹 پاک‌سازی ورودی
  const cleaned = toEnglishDigits(
    String(gregorianDate)
      .replace(/[\u200C\u200F\u200E]/g, "") // حذف کاراکترهای نامرئی
      .trim()
  );

  // 🧩 استخراج فقط بخش تاریخ (قبل از T)
  const datePart = cleaned.split("T")[0];
  const [year, month, day] = datePart.split(/[-/]/).map(Number);

  if (!year || !month || !day) return null;

  // 📅 تبدیل به شمسی
  const j = jalaali.toJalaali(year, month, day);
  if (!j) return null;

  let formatted = `${j.jy}/${String(j.jm).padStart(2, "0")}/${String(j.jd).padStart(2, "0")}`;

  // 🔢 تبدیل به اعداد فارسی (اختیاری)
  if (usePersianDigits) {
    formatted = formatted.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)]);
  }

  return formatted;
}
