export const refreshTokenOnly = async (
    {
      tokenCookieName = "token",
      refreshCookieName = "refreshToken",
      redirectOnFail = "/",
      baseURL,
    }: {
      tokenCookieName?: string;
      refreshCookieName?: string;
      redirectOnFail?: string | false;
      baseURL?: string;
    } = {}
  ): Promise<string> => {
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
  
    const refreshToken = getCookie(refreshCookieName);
    if (!refreshToken) {
      clearCookie(tokenCookieName);
      if (redirectOnFail) {
        // window.location.assign(redirectOnFail);
        console.log("redirect because refresh token not found");
      }
      throw new Error("Refresh token not found");
    }
  
    const base =
      baseURL ||
      (typeof process !== "undefined" && (process as any).env?.NEXT_PUBLIC_API_URL) ||
      "";
  
    const res = await fetch(`${base}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  
    if (!res.ok) {
      clearCookie(tokenCookieName);
      clearCookie(refreshCookieName);
      if (redirectOnFail) {
        // window.location.assign(redirectOnFail);
        console.log("redirect because refresh failed");
      }
      throw new Error(`Refresh failed: HTTP ${res.status}`);
    }
  
    const data = await res.json();
  
    // ذخیره‌ی کوکی‌های جدید
    if (data.result?.token) setCookie(tokenCookieName, data.result.token);
    if (data.result?.refreshToken) setCookie(refreshCookieName, data.result.refreshToken);
    if (data.result?.username) setCookie("username", data.result.username);
    if (data.result?.firstName) setCookie("firstName", data.result.firstName);
    if (data.result?.lastName) setCookie("lastName", data.result.lastName);
    if (data.result?.role) setCookie("role", data.result.role);
  
    return data.result.token;
  };
  