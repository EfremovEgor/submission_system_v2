import { redirect, type Actions } from "@sveltejs/kit";
import { z } from "zod";
import { getUserByEmail, updateUserById } from "$lib/database/users";
import {
    createBase64UrlSafeString,
    isLegacyPasswordHash,
    verifyPassword,
} from "$lib/utils";
import { redis } from "$lib/redis/redis";
import { SESSION_EXPIRATION_TIME } from "$src/config";
import { createSession, getSessionUserId } from "$src/lib/auth.sever";

export const load = async ({ cookies }) => {
    if ((await getSessionUserId(redis, cookies.get("SESSION"))) != null) {
        redirect(302, "/author");
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
            .trim()
            .min(8, { message: "Password must be at least 8 characters" })
            .max(32, { message: "Password must be less than 32 characters" }),
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
        if (!(await verifyPassword(data.password, user.password))) {
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
            const user = await getUserByEmail(results.email);
            if (isLegacyPasswordHash(user.password))
                await updateUserById(user.id, { password: results.password });
            await createSession(redis, sessionToken, user.id);
            cookies.set("SESSION", sessionToken, {
                path: "/",
                maxAge: SESSION_EXPIRATION_TIME,
            });
        } catch (error: any) {
            if (!(error instanceof z.ZodError)) throw error;
            const { ...rest } = formData;
            const { fieldErrors: errors } = error.flatten();
            return {
                data: rest,
                errors,
            };
        }
        redirect(302, "/author");
    },
};
