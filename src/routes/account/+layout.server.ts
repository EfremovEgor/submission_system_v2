import { getUserProfile } from "$src/lib/database/users";
import { error, redirect } from "@sveltejs/kit";

/** @type {import('@sveltejs/kit').Load} */
export const load = async ({ parent }: { parent: any }) => {
    const data = await parent();

    if (data.user == null) redirect(300, "/sign-in");
    const userProfile = await getUserProfile(data.user.id);

    return { userProfile };
};
