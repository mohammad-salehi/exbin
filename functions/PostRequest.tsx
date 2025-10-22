// utils/http.ts
export type PostOptions = {
    headers?: HeadersInit;
    asFormData?: boolean;
    tokenCookieName?: string;        // 'token'
    refreshCookieName?: string;      // 'refreshToken'
    redirectOn403?: string | false;  // '/', یا false برای عدم ریدایرکت
    signal?: AbortSignal;
    baseURL?: string;                // برای refresh؛ پیش‌فرض از ENV
  };
  
  // --------------- helpers ---------------
  const getCookie = (name: string) =>
    document.cookie.split('; ').find(r => r.startsWith(name + '='))?.split('=')[1];
  
  const setCookie = (name: string, value: string, days = 365) => {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
  };
  
  const clearCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };
  
  const isFormData = (v: any): v is FormData =>
    typeof FormData !== 'undefined' && v instanceof FormData;
  
  function toFormData(obj: Record<string, any>): FormData {
    const fd = new FormData();
    const append = (key: string, value: any) => {
      if (value === undefined || value === null) return;
      if (value instanceof Blob || value instanceof File) fd.append(key, value);
      else if (Array.isArray(value)) value.forEach((v, i) => append(`${key}[${i}]`, v));
      else if (typeof value === 'object') Object.keys(value).forEach(k => append(`${key}[${k}]`, value[k]));
      else fd.append(key, String(value));
    };
    Object.keys(obj).forEach(k => append(k, obj[k]));
    return fd;
  }
  
  // رفرش توکن (یک‌بار)
  async function refreshAuth(opts: {
    baseURL?: string;
    refreshCookieName: string;
  }) {
    const refreshToken = getCookie(opts.refreshCookieName);
    if (!refreshToken) throw new Error('Refresh token not found');
  
    const baseURL =
      opts.baseURL ||
      (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_API_URL) ||
      '';
  
    const res = await fetch(`${baseURL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
  
    if (!res.ok) {
      // اگر رفرش شکست خورد، کوکی‌های حساس را پاک کن
      clearCookie('token');
      // refreshToken را هم پاک کن اگر لازم داری:
      // clearCookie(opts.refreshCookieName);
      const t = await res.text();
      throw new Error(t || `HTTP ${res.status}`);
    }
  
    type RefreshResponse = {
      token: string;
      username?: string;
      firstName?: string;
      lastName?: string;
      role?: string;
      refreshToken?: string;
    };
    const data = (await res.json()) as RefreshResponse;
  
    // ست‌کردن کوکی‌ها طبق قرارداد فعلی
    if (data.token) setCookie('token', data.token);
    if (data.refreshToken) setCookie('refreshToken', data.refreshToken);
    if (data.username) setCookie('username', data.username);
    if (data.firstName) setCookie('firstName', data.firstName);
    if (data.lastName) setCookie('lastName', data.lastName);
    if (data.role) setCookie('role', data.role);
  
    return data.token;
  }
  
  // --------------- POST ---------------
  export async function PostRequest<T = any>(
    url: string,
    data: Record<string, any> | FormData,
    {
      headers = {},
      asFormData = false,
      tokenCookieName = 'token',
      refreshCookieName = 'refreshToken',
      redirectOn403 = '/',
      signal,
      baseURL,
    }: PostOptions = {},
    _retried = false // داخلی: فقط یک‌بار رفرش
  ): Promise<T> {
    const token = getCookie(tokenCookieName);
    if (!token) throw new Error('Token not found');
  
    const finalHeaders: HeadersInit = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...headers,
    };
  
    const useForm = asFormData || isFormData(data);
    const body = useForm ? (isFormData(data) ? data : toFormData(data)) : JSON.stringify(data);
  
    if (!useForm) (finalHeaders as any)['Content-Type'] = 'application/json';
  
    const res = await fetch(url, {
      method: 'POST',
      headers: finalHeaders,
      body,
      signal,
    });
  
    if (!res.ok) {
      // اگر توکن منقضی شده بود، یک‌بار رفرش و تکرار کن
      if ((res.status === 401 || res.status === 403) && !_retried) {
        try {
          const newToken = await refreshAuth({ baseURL, refreshCookieName });
          // با توکن جدید دوباره امتحان کن
          const retryHeaders: HeadersInit = {
            ...finalHeaders,
            Authorization: `Bearer ${newToken}`,
          };
          const retryRes = await fetch(url, {
            method: 'POST',
            headers: retryHeaders,
            body,
            signal,
          });
          if (!retryRes.ok) {
            if (retryRes.status === 403 || retryRes.status === 401) {
              clearCookie(tokenCookieName);
              if (redirectOn403) window.location.assign(redirectOn403);
            }
            const txt = await retryRes.text();
            throw new Error(txt || `HTTP ${retryRes.status}`);
          }
          const ct = retryRes.headers.get('content-type')?.toLowerCase() ?? '';
          return ct.includes('application/json')
            ? ((await retryRes.json()) as T)
            : ((await retryRes.text()) as unknown as T);
        } catch (refreshErr) {
          // رفرش شکست خورد
          clearCookie(tokenCookieName);
          if (redirectOn403) window.location.assign(redirectOn403);
          throw refreshErr;
        }
      }
  
      // سایر خطاها یا رفرش قبلاً انجام شده
      if (res.status === 403 || res.status === 401) {
        clearCookie(tokenCookieName);
        if (redirectOn403) window.location.assign(redirectOn403);
      }
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }
  
    const ct = res.headers.get('content-type')?.toLowerCase() ?? '';
    if (ct.includes('application/json')) {
      return res.json() as Promise<T>;
    } else {
      const text = await res.text();
      return text as T;
    }
  }
  