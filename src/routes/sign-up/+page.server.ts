import type { Actions } from "@sveltejs/kit";
import { z } from "zod";
const registerSchema = z
    .object({
        email: z.string().max(64).email(),
        password: z.string().min(8).max(32).trim(),
        passwordConfirm: z.string().min(8).max(32).trim(),
    })
    .refine((data) => data.password === data.passwordConfirm, {
        message: "Passwords don't match",
        path: ["passwordConfirm"],
    });
export const actions: Actions = {
    default: async ({ request }) => {
        const formData = Object.fromEntries(await request.formData());
        try {
            const results = registerSchema.parse(formData);
        } catch (error: any) {
            const { errors } = error.flatten();
            const { ...rest } = formData;
            return {
                data: rest,
                errors,
            };
        }
    },
};
