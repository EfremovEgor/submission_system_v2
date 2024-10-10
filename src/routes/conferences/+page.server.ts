import { redirect, type ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async ({ url }) => {
    redirect(302, url.pathname.replace("/conferences", "/call_for_papers"));
};
