import { error } from "@sveltejs/kit";

/** @type {import('@sveltejs/kit').ServerLoad} */
export const load = async ({ url, cookies, request, parent }) => {
    const data = await parent();
    if (!data.user.is_chair) error(403);
};
