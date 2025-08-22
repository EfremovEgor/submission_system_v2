import { redirect, type Load } from "@sveltejs/kit";

export const load: Load = async ({ cookies }) => {
    redirect(302, "/author");
};
