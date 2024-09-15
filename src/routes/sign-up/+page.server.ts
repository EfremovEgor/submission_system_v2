import { redirect, type Actions } from "@sveltejs/kit";
import { z } from "zod";
import transporter from "$components/email/setup.server";
import { EMAIL } from "$env/static/private";
import {
    createNewUser,
    getUserByEmail,
    updateUserById,
} from "$lib/database/users";
import { createBase64UrlSafeString } from "$lib/utils";

export const load = async ({ cookies }) => {
    const sessionToken = cookies.get("SESSION");
    if (sessionToken != null) {
        redirect(302, "/profile");
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
        middle_name: z
            .string()
            .trim()

            .max(64, { message: "Middle name must be less than 64 characters" })
            .optional(),
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
            transporter.sendMail({
                from: `${EMAIL}`,
                to: `${results.email}`,
                subject: "Registration",
                text: `${results}`,
                html: `<b>${results}</b>`,
            });
            const { password_confirm, ...data } = results;
            const user = await getUserByEmail(data.email);
            if (user == null)
                await createNewUser({
                    ...data,
                    registration_token: createBase64UrlSafeString(),
                });
            else
                updateUserById(user.id, {
                    registration_token: createBase64UrlSafeString(),
                });

            return { emailIsSent: true };
        } catch (error: any) {
            console.log(error);
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
