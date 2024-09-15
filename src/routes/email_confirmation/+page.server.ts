import {
    getUserByRegistrationCode,
    updateUserById,
} from "$lib/database/users.js";
import { error } from "@sveltejs/kit";

export const load = async ({ params, url }) => {
    const code = url.searchParams.get("code");
    console.log(1);
    if (code == null) {
        error(404, { message: "No such confirmation code" });
    }
    const user = await getUserByRegistrationCode(code);
    if (user == null) {
        error(404, { message: "No such confirmation code" });
    }
    updateUserById(user.id, {
        registration_token: null,
        is_registered: true,
    });
};
