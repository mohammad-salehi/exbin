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
  _retried = false
): Promise<any> => {
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

  const refreshAuth = async () => {
    const refreshToken = getCookie(refreshCookieName);
    if (!refreshToken) throw new Error("Refresh token not found");

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
      throw new Error(`Refresh failed: HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data.result.token) setCookie("token", data.result.token);
    if (data.result.refreshToken) setCookie("refreshToken", data.result.refreshToken);
    if (data.result.username) setCookie("username", data.result.username);
    if (data.result.firstName) setCookie("firstName", data.result.firstName);
    if (data.result.lastName) setCookie("lastName", data.result.lastName);
    if (data.result.role) setCookie("role", data.result.role);

    return data.result.token;
  };

  const token = getCookie(tokenCookieName);
  if (!token) throw new Error("Token not found");

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if ((response.status === 401 || response.status === 403) && !_retried) {
      try {
        const newToken = await refreshAuth();
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
            if (redirectOn403)
              window.location.assign(redirectOn403);

          }
          throw new Error(`HTTP ${retryRes.status}`);
        }

        return await retryRes.json();
      } catch (err) {
        clearCookie(tokenCookieName);
        if (redirectOn403)
          window.location.assign(redirectOn403);

        throw err;
      }
    }

    if (response.status === 401 || response.status === 403) {
      clearCookie(tokenCookieName);
      if (redirectOn403)
        window.location.assign(redirectOn403);

    }

    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data;
};

export const GetRequestRaw = async (
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
  _retried = false
): Promise<Response> => {
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

  const refreshAuth = async () => {
    const refreshToken = getCookie(refreshCookieName);
    if (!refreshToken) throw new Error("Refresh token not found");

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
      throw new Error(`Refresh failed: HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data.result.token) setCookie("token", data.result.token);
    if (data.result.refreshToken) setCookie("refreshToken", data.result.refreshToken);
    if (data.result.username) setCookie("username", data.result.username);
    if (data.result.firstName) setCookie("firstName", data.result.firstName);
    if (data.result.lastName) setCookie("lastName", data.result.lastName);
    if (data.result.role) setCookie("role", data.result.role);

    return data.result.token;
  };

  const token = getCookie(tokenCookieName);
  if (!token) throw new Error("Token not found");

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      // برای فایل لزوماً JSON نمی‌خوای، پس Content-Type لازم نیست
      Accept: "*/*",
    },
  });

  if (!response.ok) {
    if ((response.status === 401 || response.status === 403) && !_retried) {
      try {
        const newToken = await refreshAuth();
        const retryRes = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${newToken}`,
            Accept: "*/*",
          },
        });

        if (!retryRes.ok) {
          if (retryRes.status === 401 || retryRes.status === 403) {
            clearCookie(tokenCookieName);
            if (redirectOn403) {
              window.location.assign(redirectOn403);
            }
          }
          throw new Error(`HTTP ${retryRes.status}`);
        }

        // ❗ این‌جا دیگه JSON نمی‌خونیم؛ خود Response رو برمی‌گردونیم
        return retryRes;
      } catch (err) {
        clearCookie(tokenCookieName);
        if (redirectOn403) {
          window.location.assign(redirectOn403);
        }
        throw err;
      }
    }

    if (response.status === 401 || response.status === 403) {
      clearCookie(tokenCookieName);
      if (redirectOn403) {
        window.location.assign(redirectOn403);
      }
    }

    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }

  // ✅ این‌جا هم دیگه json() نمی‌خونیم
  return response;
};

export const DeleteRequest = async (
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
  _retried = false
): Promise<any> => {
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

  const refreshAuth = async () => {
    const refreshToken = getCookie(refreshCookieName);
    if (!refreshToken) throw new Error("Refresh token not found");

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
      throw new Error(`Refresh failed: HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data.result.token) setCookie("token", data.result.token);
    if (data.result.refreshToken) setCookie("refreshToken", data.result.refreshToken);
    if (data.result.username) setCookie("username", data.result.username);
    if (data.result.firstName) setCookie("firstName", data.result.firstName);
    if (data.result.lastName) setCookie("lastName", data.result.lastName);
    if (data.result.role) setCookie("role", data.result.role);

    return data.result.token;
  };

  const token = getCookie(tokenCookieName);
  if (!token) throw new Error("Token not found");

  const doDelete = async (authToken: string) => {
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || `HTTP ${res.status}`);
    }

    // ممکنه 204 یا بدنه خالی باشه
    const txt = await res.text();
    if (!txt) return null;

    try {
      return JSON.parse(txt);
    } catch {
      return txt;
    }
  };

  try {
    return await doDelete(token);
  } catch (err: any) {
    // اگر 401/403 بود و هنوز رفرش نکردیم
    if (
      typeof err.message === "string" &&
      err.message.startsWith("HTTP ") &&
      !_retried
    ) {
      const status = Number(err.message.replace("HTTP ", ""));
      if (status === 401 || status === 403) {
        try {
          const newToken = await refreshAuth();
          return await DeleteRequest(
            url,
            { tokenCookieName, refreshCookieName, redirectOn403, baseURL },
            true
          );
        } catch (e) {
          clearCookie(tokenCookieName);
          if (redirectOn403) window.location.assign(redirectOn403);
          throw e;
        }
      }
    }
    // بقیه خطاها
    throw err;
  }
};

