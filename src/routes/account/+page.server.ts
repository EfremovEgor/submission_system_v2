import { getUserProfile, updateUserById } from "$src/lib/database/users.js";
import { redis } from "$src/lib/redis/redis";
import { getUserFromCookies } from "$src/lib/utils";
import type { Actions } from "@sveltejs/kit";
import { z } from "zod";

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
        .min(1)
        .max(64, { message: "Affiliation must be less than 64 characters" }),
    country: z
        .string()
        .trim()
        .max(64, { message: "country must be less than 64 characters" })
        .optional(),
    city: z
        .string()
        .trim()
        .max(64, { message: "City must be less than 64 characters" })
        .optional(),
    state: z
        .string()
        .trim()
        .max(64, { message: "State must be less than 64 characters" })
        .optional(),
    orcid_id: z
        .string()
        .trim()
        .max(64, { message: "Orcid ID must be less than 64 characters" })
        .optional(),
    web_page: z
        .string()
        .trim()
        .max(64, { message: "Web Page must be less than 64 characters" })
        .optional(),
});

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const formData = Object.fromEntries(await request.formData());

        try {
            const results = await profileChangeSchema.parseAsync(formData);
            const user = await getUserFromCookies(cookies, redis);
            updateUserById(user.id, results);
            return { message: "success" };
        } catch (error: any) {
            const { fieldErrors: errors } = error.flatten();
            return {
                data: formData,
                errors,
            };
        }
    },
};
