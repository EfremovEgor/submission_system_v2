import { getUserProfile } from "$src/lib/database/users";
import { error } from "@sveltejs/kit";

/** @type {import('@sveltejs/kit').Load} */
export const load = async ({ parent }: { parent: any }) => {
    const data = await parent();

    if (data.user == null) error(403);
    const userProfile = await getUserProfile(data.user.id);

    return { userProfile };
};
