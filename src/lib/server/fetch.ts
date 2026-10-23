import { env } from "$env/dynamic/private";

// Read at runtime from the environment (.env), not baked into the build.
const { PDF_API_URL } = env;

export const fetchPdfApi = async (
    fetch: CallableFunction,
    url: string,
    init: RequestInit,
) => {
    return fetch(`${PDF_API_URL}${url}`, init);
};
