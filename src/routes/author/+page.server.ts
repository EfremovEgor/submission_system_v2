import { signInUrl } from "$src/lib/redirects";
import { updateUserById } from "$src/lib/database/users.js";
import { redis } from "$src/lib/redis/redis";
import { authorizedRoute } from "$src/lib/auth.sever";
import type { Actions } from "@sveltejs/kit";
import { z } from "zod";
import { getUserProfile } from "$src/lib/database/users";
import { error, redirect } from "@sveltejs/kit";
import prisma from "$src/lib/database/prisma";
import { englishOnlyMessage, isEnglishOnly } from "$src/lib/english";

// Profile fields must be in English.
const english = (schema: z.ZodTypeAny, label: string) =>
    schema.refine((value) => typeof value != "string" || isEnglishOnly(value), {
        message: englishOnlyMessage(label),
    });

/** @type {import('@sveltejs/kit').Load} */
export const load = async ({ parent, url }: { parent: any; url: URL }) => {
    const data = await parent();

    if (data.user == null) redirect(302, signInUrl(url));
    const userProfile = await getUserProfile(data.user.id);
    const submissions = await prisma.submission.findMany({
        where: {
            OR: [
                {
                    created_by_id: data.user.id,
                },
                {
                    authors: {
                        some: {
                            email: data.user.email,
                        },
                    },
                },
            ],
        },
        orderBy: {
            created_at: "desc",
        },
        select: {
            id: true,
            local_id: true,
            presentation_format: true,
            particiaption_confirmed: true,
            withdrawn: true,
            status: true,
            created_at: true,
            title: true,
            authors: {
                select: {
                    first_name: true,
                    last_name: true,
                },
            },
            topic: {
                select: {
                    name: true,
                },
            },
            conference: {
                select: {
                    short_name: true,
                    acronym: true,
                },
            },
        },
    });

    return { userProfile, submissions };
};

const profileChangeSchema = z.object({
    title: english(z.string().trim(), "Title"),
    first_name: english(
        z
            .string({ required_error: "First name is required" })
            .trim()
            .min(1, { message: "First name must be at least 1 character" })
            .max(64, { message: "First name must be less than 64 characters" }),
        "First name",
    ),
    last_name: english(
        z
            .string({ required_error: "Last name is required" })
            .trim()
            .min(1, { message: "Last name must be at least 1 character" })
            .max(64, { message: "Last name must be less than 64 characters" }),
        "Last name",
    ),
    middle_name: english(
        z
            .string()
            .trim()
            .max(64, { message: "Middle name must be less than 64 characters" }),
        "Middle name",
    ).optional(),
    affiliation: english(
        z
            .string()
            .trim()
            .min(1)
            .max(64, { message: "Affiliation must be less than 64 characters" }),
        "Affiliation",
    ),
    country: english(
        z
            .string()
            .trim()
            .max(64, { message: "country must be less than 64 characters" }),
        "Country",
    ).optional(),
    city: english(
        z
            .string()
            .trim()
            .max(64, { message: "City must be less than 64 characters" }),
        "City",
    ).optional(),
    state: english(
        z
            .string()
            .trim()
            .max(64, { message: "State must be less than 64 characters" }),
        "State",
    ).optional(),
    orcid_id: english(
        z
            .string()
            .trim()
            .max(64, { message: "Orcid ID must be less than 64 characters" }),
        "ORCID ID",
    ).optional(),
    web_page: english(
        z
            .string()
            .trim()
            .max(64, { message: "Web Page must be less than 64 characters" }),
        "Web page",
    ).optional(),
});

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const user = await authorizedRoute(cookies, redis);
        const formData = Object.fromEntries(await request.formData());

        try {
            const results = await profileChangeSchema.parseAsync(formData);
            await updateUserById(user.id, results);
            return { message: "success" };
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
