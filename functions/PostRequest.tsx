
// حذف تابع رفرش توکن
export async function PostRequest(url: string | URL | Request, params: Record<string, any> = {}) {
    const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1];

    const bodyFormData = new FormData();

    Object.keys(params).forEach(key => {
        bodyFormData.append(key, params[key]);
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: bodyFormData,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        return await response.json();
    } catch (err) {
        // اگر خطای 500 یا شبکه رخ دهد دیگر درخواست را دوباره ارسال نمی‌کنیم
        throw err;
    }
}
