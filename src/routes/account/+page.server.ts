import { getUserProfile } from "$src/lib/database/users.js";

/** @type {import('@sveltejs/kit').Load} */
export const load = async ({ parent }) => {
    const {
        user: { id },
    } = await parent();
    const userProfile = await getUserProfile(id);

    return { userProfile };
};
