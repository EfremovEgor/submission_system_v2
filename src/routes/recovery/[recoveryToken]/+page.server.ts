import { error, redirect, type Actions } from "@sveltejs/kit";
import { z } from "zod";
import { redis } from "$lib/redis/redis";
import { updateUserById } from "$src/lib/database/users.js";

export const load = async ({ cookies, params }) => {
    if (!(await redis.get(params.recoveryToken))) error(404);
};

const passwordResetSchema = z
    .object({
        password: z
            .string({ required_error: "Password is required" })
            .min(8, { message: "Password must be at least 8 characters" })
            .max(32, { message: "Password must be less than 32 characters" })
            .trim(),
        password_confirm: z
            .string({ required_error: "Password is required" })
            .min(8, { message: "Password must be at least 8 characters" })
            .max(32, { message: "Password must be less than 32 characters" })
            .trim(),
    })
    .refine((data) => data.password === data.password_confirm, {
        message: "Passwords don't match",
        path: ["password_confirm"],
    });
export const actions: Actions = {
    default: async ({ request, cookies, params }) => {
        const formData = Object.fromEntries(await request.formData());
        try {
            const results = await passwordResetSchema.parseAsync(formData);
            let userId: string | number = await redis.get(params.recoveryToken);
            if (!userId) error(404);
            userId = parseInt(userId);
            await updateUserById(userId, { password: results.password });
        } catch (error: any) {
            const { ...rest } = formData;
            const { fieldErrors: errors } = error.flatten();
            return {
                data: rest,
                errors,
            };
        }
        redirect(302, "/sign-in");
    },
};
