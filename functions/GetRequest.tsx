// utils/http.ts (بخش GetRequest جدید)
export const GetRequest = async (
    url: string,
    {
      tokenCookieName = "token",
      refreshCookieName = "refreshToken",
      redirectOn403 = "/",
      baseURL,
    }: {
      tokenCookieName?: string;
      refreshCookieName?: string;
      redirectOn403?: string | false;
      baseURL?: string;
    } = {},
    _retried = false // برای کنترل فقط یک‌بار رفرش
  ): Promise<any> => {
    // --- helper ---
    const getCookie = (name: string) =>
      document.cookie.split("; ").find(r => r.startsWith(name + "="))?.split("=")[1];
  
    const setCookie = (name: string, value: string, days = 365) => {
      const d = new Date();
      d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
      document.cookie = `${name}=${value}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
    };
  
    const clearCookie = (name: string) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    };
  
    // --- تابع رفرش ---
    const refreshAuth = async () => {
      const refreshToken = getCookie(refreshCookieName);
      if (!refreshToken) throw new Error("Refresh token not found");
  
      const base =
        baseURL ||
        (typeof process !== "undefined" && (process as any).env?.NEXT_PUBLIC_API_URL) ||
        "";
  
      const res = await fetch(`${base}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
  
      if (!res.ok) {
        clearCookie(tokenCookieName);
        throw new Error(`Refresh failed: HTTP ${res.status}`);
      }
  
      const data = await res.json();
  
      if (data.token) setCookie("token", data.token);
      if (data.refreshToken) setCookie("refreshToken", data.refreshToken);
      if (data.username) setCookie("username", data.username);
      if (data.firstName) setCookie("firstName", data.firstName);
      if (data.lastName) setCookie("lastName", data.lastName);
      if (data.role) setCookie("role", data.role);
  
      return data.token;
    };
  
    // --- اجرای درخواست ---
    const token = getCookie(tokenCookieName);
    if (!token) throw new Error("Token not found");
  
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  
    // اگر توکن منقضی شده بود: یک‌بار رفرش و تکرار
    if (!response.ok) {
      if ((response.status === 401 || response.status === 403) && !_retried) {
        try {
          const newToken = await refreshAuth();
          // تکرار با توکن جدید
          const retryRes = await fetch(url, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${newToken}`,
              "Content-Type": "application/json",
            },
          });
  
          if (!retryRes.ok) {
            if (retryRes.status === 401 || retryRes.status === 403) {
              clearCookie(tokenCookieName);
              if (redirectOn403) window.location.assign(redirectOn403);
            }
            throw new Error(`HTTP ${retryRes.status}`);
          }
  
          return await retryRes.json();
        } catch (err) {
          clearCookie(tokenCookieName);
          if (redirectOn403) window.location.assign(redirectOn403);
          throw err;
        }
      }
  
      // اگر از قبل رفرش شده یا خطای دیگر
      if (response.status === 401 || response.status === 403) {
        clearCookie(tokenCookieName);
        if (redirectOn403) window.location.assign(redirectOn403);
      }
  
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}`);
    }
  
    // ✅ موفق
    const data = await response.json();
    return data;
  };
  