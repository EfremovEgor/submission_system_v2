import { PDF_API_URL } from "$env/static/private";

export const fetchPdfApi = async (
    fetch: CallableFunction,
    url: string,
    init: RequestInit,
) => {
    return fetch(`${PDF_API_URL}${url}`, init);
};
