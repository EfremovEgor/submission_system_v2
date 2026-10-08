import { error, redirect, type Actions } from "@sveltejs/kit";
import { z } from "zod";
import { redis } from "$lib/redis/redis";
import { updateUserById } from "$src/lib/database/users.js";
import {
    deleteUserSessions,
    isValidToken,
    recoveryKey,
} from "$src/lib/auth.sever";

export const load = async ({ params }) => {
    if (
        !isValidToken(params.recoveryToken) ||
        !(await redis.get(recoveryKey(params.recoveryToken)))
    )
        error(404);
};

const passwordResetSchema = z
    .object({
        password: z
            .string({ required_error: "Password is required" })
            .trim()
            .min(8, { message: "Password must be at least 8 characters" })
            .max(32, { message: "Password must be less than 32 characters" }),
        password_confirm: z
            .string({ required_error: "Password is required" })
            .trim()
            .min(8, { message: "Password must be at least 8 characters" })
            .max(32, { message: "Password must be less than 32 characters" }),
    })
    .refine((data) => data.password === data.password_confirm, {
        message: "Passwords don't match",
        path: ["password_confirm"],
    });
export const actions: Actions = {
    default: async ({ request, params }) => {
        if (!isValidToken(params.recoveryToken)) error(404);
        const formData = Object.fromEntries(await request.formData());
        let results: z.infer<typeof passwordResetSchema>;
        try {
            results = await passwordResetSchema.parseAsync(formData);
        } catch (error: any) {
            if (!(error instanceof z.ZodError)) throw error;
            const { ...rest } = formData;
            const { fieldErrors: errors } = error.flatten();
            return {
                data: rest,
                errors,
            };
        }
        // getDel makes the link single-use.
        const userId = await redis.getDel(recoveryKey(params.recoveryToken));
        if (!userId) error(404);
        await updateUserById(parseInt(userId), { password: results.password });
        await deleteUserSessions(redis, parseInt(userId));
        redirect(302, "/sign-in");
    },
};
