import jalaali from 'jalaali-js';

/**
 * @param persianDate - مثل "۱۴۰۴/۰۸/۰۱" یا "1404-08-01"
 * @returns رشته‌ای در قالب "YYYY-MM-DD" یا null اگر ورودی معتبر نباشد
 */
export function toLocalDate(persianDate: string): string | null {
  if (!persianDate) return null;

  // ۱️⃣ تبدیل اعداد فارسی به انگلیسی
  const english = persianDate.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());

  // ۲️⃣ جدا کردن اجزای تاریخ (پشتیبانی از "/" یا "-")
  const [y, m, d] = english.split(/[-/]/).map(Number);

  if (!y || !m || !d) return null; // اگر فرمت نادرست بود

  // ۳️⃣ تبدیل به میلادی
  const g = jalaali.toGregorian(y, m, d);

  // ۴️⃣ ساخت فرمت YYYY-MM-DD
  const yyyy = g.gy.toString().padStart(4, '0');
  const mm = g.gm.toString().padStart(2, '0');
  const dd = g.gd.toString().padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
}
