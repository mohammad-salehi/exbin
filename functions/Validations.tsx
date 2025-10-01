export function validateNumbers(input: string) {
    const regex = /^[0-9]*$/;
    return regex.test(input);
}
export function validateEmail(email: string) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}
export function validateWebsite(url: string) {
    const regex = /^https:\/\/(?!www\.)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(url);
}

export function removeProtocolAndWWW(url: string) {
    return url.replace(/^https?:\/\/(www\.)?/, '');
}

export function addHttps(url: string) {
    if (!/^https:\/\//i.test(url)) {
        return 'https://' + url;
    }
    return url;
}

export function validateDomainExtension(url: string) {
    const regex = /\.[a-zA-Z]{2,6}$/;
    return regex.test(url);
}

export function dateValidation(value: string): boolean {
    if (!/^[0-9/]*$/.test(value)) return false;
    if (value.length > 10) return false;
  
    const patterns: { [len: number]: RegExp } = {
      0: /^$/,
      1: /^\d{1}$/,
      2: /^\d{2}$/,
      3: /^\d{3}$/,
      4: /^\d{4}$/,
      5: /^\d{4}\/$/,
      6: /^\d{4}\/\d{1}$/,
      7: /^\d{4}\/\d{2}$/,
      8: /^\d{4}\/\d{2}\/$/,
      9: /^\d{4}\/\d{2}\/\d{1}$/,
      10: /^\d{4}\/\d{2}\/\d{2}$/,
    };
  
    const pattern = patterns[value.length];
    if (!pattern?.test(value)) return false;
  
    // چک اضافه: اگر کامل پر شده، صحت ماه/روز رو بررسی کن
    if (value.length === 10) {
      const [year, month, day] = value.split("/").map(Number);
      if (month < 1 || month > 12) return false;
      if (day < 1 || day > 31) return false;
    }
  
    return true;
  }
  