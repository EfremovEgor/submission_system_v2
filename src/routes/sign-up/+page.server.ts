import { redirect, type Actions } from "@sveltejs/kit";
import { z } from "zod";
import { DOMAIN } from "$env/static/private";
import {
    createNewUser,
    getUserByEmail,
    updateUserById,
} from "$lib/database/users";
import { createBase64UrlSafeString } from "$lib/utils";
import { sendRegistrationEmail } from "$src/lib/email/mailing.js";
import { getSessionUserId } from "$src/lib/auth.sever";
import { redis } from "$lib/redis/redis";
export const load = async ({ cookies }) => {
    if ((await getSessionUserId(redis, cookies.get("SESSION"))) != null) {
        redirect(302, "/author");
    }
};

const registerSchema = z
    .object({
        email: z
            .string({ required_error: "Email name is required" })
            .max(64, { message: "Email must be less than 64 characters" })
            .email(),
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
    })
    .refine(
        async (data) => {
            const user = await getUserByEmail(data.email);
            if (user == null) return true;
            return !user.is_registered;
        },
        {
            message: "User with this email already exists",
            path: ["email"],
        },
    );
export const actions: Actions = {
    default: async ({ request }) => {
        const formData = Object.fromEntries(await request.formData());
        try {
            const results = await registerSchema.parseAsync(formData);
            const registrationToken = createBase64UrlSafeString();
            const link = `${DOMAIN}/email_confirmation?token=${registrationToken}`;
            const { password_confirm, ...data } = results;
            const user = await getUserByEmail(data.email);
            if (user == null)
                await createNewUser({
                    ...data,
                    registration_token: registrationToken,
                });
            // An unconfirmed account belongs to whoever confirms the email: take the new
            // password and names, or an earlier sign-up could keep a password of its own.
            else
                await updateUserById(user.id, {
                    ...data,
                    registration_token: registrationToken,
                });
            try {
                await sendRegistrationEmail(results.email, {
                    link,
                    name: results.first_name,
                });
            } catch (e) {
                console.error(`Registration email to ${results.email} failed`, e);
                const { ...rest } = formData;
                return {
                    data: rest,
                    errors: {
                        email: [
                            "Could not send the confirmation email, please try again later",
                        ],
                    },
                    emailIsSent: false,
                };
            }

            return { emailIsSent: true };
        } catch (error: any) {
            if (!(error instanceof z.ZodError)) throw error;
            const { ...rest } = formData;
            const { fieldErrors: errors } = error.flatten();
            return {
                data: rest,
                errors,
                emailIsSent: false,
            };
        }
    },
};
