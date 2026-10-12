import { signInUrl } from "$src/lib/redirects";
import { error, redirect } from "@sveltejs/kit";

/** @type {import('@sveltejs/kit').ServerLoad} */
export const load = async ({ url, cookies, request, parent }) => {
    const data = await parent();
    if (data.user == null) redirect(302, signInUrl(url));
    if (!data.user.is_loc) error(403);
};
