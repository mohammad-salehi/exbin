export function toEnglishDigits(str: string): string {
    if (!str) return "";

    // نگاشت اعداد فارسی و عربی به انگلیسی
    const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

    return str
        .split("")
        .map((ch) => {
            const pIndex = persianNumbers.indexOf(ch);
            if (pIndex > -1) return String(pIndex);

            const aIndex = arabicNumbers.indexOf(ch);
            if (aIndex > -1) return String(aIndex);

            return ch;
        })
        .join("");
}