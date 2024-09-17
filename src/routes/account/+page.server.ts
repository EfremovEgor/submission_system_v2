import { getUserProfile, updateUserById } from "$src/lib/database/users.js";
import { redis } from "$src/lib/redis/redis";
import { getUserFromCookies } from "$src/lib/utils";
import type { Actions } from "@sveltejs/kit";
import { z } from "zod";

/** @type {import('@sveltejs/kit').Load} */
export const load = async ({ parent }: { parent: any }) => {
    const {
        user: { id },
    } = await parent();
    const userProfile = await getUserProfile(id);

    return { userProfile };
};
const profileChangeSchema = z.object({
    title: z
        .string()
        .trim()
        .max(64, { message: "Middle name must be less than 64 characters" }),
    first_name: z
        .string({ required_error: "First name is required" })
        .trim()
        .min(1, { message: "First name must be at least 1 character" })
        .max(64, { message: "First name must be less than 64 characters" }),
    last_name: z
        .string({ required_error: "Last name is required" })
        .trim()
        .min(1, { message: "Last name must be at least 1 character" })
        .max(64, { message: "Last name must be less than 64 characters" }),
    middle_name: z
        .string()
        .trim()
        .max(64, { message: "Middle name must be less than 64 characters" })
        .optional(),
    affiliation: z
        .string()
        .trim()
        .max(64, { message: "Affiliation must be less than 64 characters" }),
    country: z
        .string()
        .trim()
        .max(64, { message: "country must be less than 64 characters" }),
    city: z
        .string()
        .trim()
        .max(64, { message: "City must be less than 64 characters" }),
    state: z
        .string()
        .trim()
        .max(64, { message: "State must be less than 64 characters" }),
    orcid_id: z
        .string()
        .trim()
        .max(64, { message: "Orcid ID must be less than 64 characters" }),
    web_page: z
        .string()
        .trim()
        .max(64, { message: "Web Page must be less than 64 characters" }),
});

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const formData = await request.formData();

        try {
            const results = await profileChangeSchema.parseAsync(formData);
            const user = await getUserFromCookies(cookies, redis);
            updateUserById(user.id, results);

            return { message: "success" };
        } catch (error: any) {
            const { ...rest } = formData;
            const { fieldErrors: errors } = error.flatten();
            return {
                data: rest,
                errors,
            };
        }
    },
};
