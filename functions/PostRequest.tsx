function postDataToUrl(url: string, data: Record<string, string | number | boolean | File | Blob>) {
    const token = document.cookie.replace(
        /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, 
        "$1"
    );
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        const value = data[key];
        if (value instanceof File || value instanceof Blob) {
            formData.append(key, value);
        } else {
            formData.append(key, String(value));
        }
    });
    return fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData, 
    })
    .then(response => {
        if (!response.ok) {
            return Promise.reject('Request failed with status ' + response.status);
        }
        return response.json(); 
    })
    .catch(error => {
        console.error('Error posting data:', error);
        throw error;  
    });
}
