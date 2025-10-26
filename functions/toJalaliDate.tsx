import jalaali from "jalaali-js";

/**
 * تبدیل تاریخ میلادی (LocalDate یا ISO string) به تاریخ شمسی
 * @param gregorianDate - مثل "2025-10-23" یا "2025-10-23T00:00:00Z"
 * @param usePersianDigits - آیا خروجی با اعداد فارسی برگردد؟ (پیش‌فرض: true)
 * @returns مثل "۱۴۰۴/۰۸/۰۱"
 */
export function toJalaliDate(
  gregorianDate: string,
  usePersianDigits: boolean = true
): string | null {
  if (!gregorianDate) return null;

  // ۱️⃣ جدا کردن سال، ماه، روز از رشته‌ی ISO
  const [year, month, day] = gregorianDate.split("T")[0].split("-").map(Number);
  if (!year || !month || !day) return null;

  // ۲️⃣ تبدیل به تاریخ شمسی
  const j = jalaali.toJalaali(year, month, day);

  let formatted = `${j.jy}/${String(j.jm).padStart(2, "0")}/${String(j.jd).padStart(2, "0")}`;

  // ۳️⃣ در صورت نیاز تبدیل اعداد انگلیسی به فارسی
  if (usePersianDigits) {
    formatted = formatted.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
  }

  return formatted;
}
