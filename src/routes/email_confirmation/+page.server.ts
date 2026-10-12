import {
    getUserByRegistrationCode,
    updateUserById,
} from "$lib/database/users.js";
import { error } from "@sveltejs/kit";
import {
    getRedirectParam,
    safeRedirectPath,
    withRedirect,
} from "$src/lib/redirects";

export const load = async ({ params, url }) => {
    const code = url.searchParams.get("token");
    if (code == null) {
        error(404, { message: "No such confirmation code" });
    }
    const user = await getUserByRegistrationCode(code);
    if (user == null) {
        error(404, { message: "No such confirmation code" });
    }
    await updateUserById(user.id, {
        registration_token: null,
        is_registered: true,
    });
    return {
        signInLink: withRedirect(
            "/sign-in",
            safeRedirectPath(getRedirectParam(url), "") || null,
        ),
    };
};
