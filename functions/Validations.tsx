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