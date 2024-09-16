import { redirect, type Actions, type Load } from "@sveltejs/kit";
import { z } from "zod";
import { getUserByEmail } from "$lib/database/users";
import { createBase64UrlSafeString, hashString } from "$lib/utils";
import { redis } from "$lib/redis/redis";
import { SESSION_EXPIRATION_TIME } from "$src/config";

export const load = async ({ cookies }) => {
    const sessionToken = cookies.get("SESSION");
    if (sessionToken != null) {
        redirect(302, "/account");
    }
};

const signInSchema = z
    .object({
        email: z
            .string({ required_error: "Email name is required" })
            .max(64, { message: "Email must be less than 64 characters" })
            .email(),
        password: z
            .string({ required_error: "Password is required" })
            .min(8, { message: "Password must be at least 8 characters" })
            .max(32, { message: "Password must be less than 32 characters" })
            .trim(),
    })
    .superRefine(async (data, ctx) => {
        const user = await getUserByEmail(data.email);
        if (user == null) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "User doesn't exist",
                path: ["email"],
                fatal: true,
            });
            return z.NEVER;
        }
        if (!user.is_registered) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "User hasn't registered yet",
                path: ["email"],
                fatal: true,
            });
            return z.NEVER;
        }
        if (user.password != hashString(data.password)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Wrong password",
                path: ["password"],
                fatal: true,
            });
            return z.NEVER;
        }
    });
export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const formData = Object.fromEntries(await request.formData());
        const sessionToken = createBase64UrlSafeString();
        try {
            const results = await signInSchema.parseAsync(formData);
            const user: any = await getUserByEmail(results.email);
            await redis.set(sessionToken, user.id, {
                EX: SESSION_EXPIRATION_TIME,
            });
            cookies.set("SESSION", sessionToken, {
                path: "/",
                maxAge: SESSION_EXPIRATION_TIME,
            });
        } catch (error: any) {
            console.log(error);
            const { ...rest } = formData;
            const { fieldErrors: errors } = error.flatten();
            return {
                data: rest,
                errors,
            };
        }
        redirect(302, "/account");
    },
};
