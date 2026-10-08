import { redirect, type Actions, type Load } from "@sveltejs/kit";
import { z } from "zod";
import { getUserByEmail } from "$lib/database/users";
import { constructSiteLink, createBase64UrlSafeString } from "$lib/utils";
import { redis } from "$lib/redis/redis";
import { PASSWORD_RESET_EXPIRATION_TIME } from "$src/config";
import transporter from "$src/lib/email/setup.server";
import { renderRecoverPasswordTemplate } from "$src/lib/email/templating.js";
import { titles } from "$src/lib/aliases.js";
import { EMAIL } from "$env/static/private";
import { getSessionUserId, recoveryKey } from "$src/lib/auth.sever";

export const load = async ({ cookies }) => {
    if ((await getSessionUserId(redis, cookies.get("SESSION"))) != null) {
        redirect(302, "/author");
    }
};

const passwordRecoverySchema = z
    .object({
        email: z
            .string({ required_error: "Email is required" })
            .max(64, { message: "Email must be less than 64 characters" })
            .email(),
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
    });
export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const formData = Object.fromEntries(await request.formData());
        const recoveryToken = createBase64UrlSafeString();
        try {
            const results = await passwordRecoverySchema.parseAsync(formData);
            const user: any = await getUserByEmail(results.email);
            await redis.set(recoveryKey(recoveryToken), user.id, {
                EX: PASSWORD_RESET_EXPIRATION_TIME,
            });
            const html = await renderRecoverPasswordTemplate({
                title: titles[user.title],
                first_name: user.first_name,
                last_name: user.last_name,
                link: constructSiteLink(`/recovery/${recoveryToken}`),
            });
            try {
                await transporter.sendMail({
                    from: `${EMAIL}`,
                    to: `${results.email}`,
                    subject: "Password recovery",
                    html: html,
                });
            } catch (e) {
                console.error(`Recovery email to ${results.email} failed`, e);
                const { ...rest } = formData;
                return {
                    data: rest,
                    errors: {
                        email: [
                            "Could not send the recovery email, please try again later",
                        ],
                    },
                };
            }
        } catch (error: any) {
            if (!(error instanceof z.ZodError)) throw error;
            const { ...rest } = formData;
            const { fieldErrors: errors } = error.flatten();
            return {
                data: rest,
                errors,
            };
        }
    },
};
