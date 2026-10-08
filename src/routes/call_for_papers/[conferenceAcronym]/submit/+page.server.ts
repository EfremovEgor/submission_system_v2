import { DOMAIN, EMAIL } from "$env/static/private";
import { presentation_formats, PRIVILEGES, titles } from "$src/lib/aliases";
import { authorizedRoute } from "$src/lib/auth.sever";
import { getConferenceByAcronym } from "$src/lib/database/conferences";
import {
    createSubmission,
    parseSubmissionAuthors,
} from "$src/lib/database/submissions";
import { getUserProfile } from "$src/lib/database/users";
import { sendRCCCSubmissionAuthorCreated } from "$src/lib/email/priviliges.mailing";
import transporter from "$src/lib/email/setup.server";
import { renderCreateSubmissionTemplate } from "$src/lib/email/templating";
import {
    getConferenceTopic,
    isSubmissionClosed,
} from "$src/lib/managers/rights/submission/guards.server";
import { SubmissionReviewProcessQueueManager } from "$src/lib/queue/consumers/submissions";
import { redis } from "$src/lib/redis/redis";
import { Prisma } from "@prisma/client";
import { error, redirect, type Actions, type Load } from "@sveltejs/kit";

/** @type {import('@sveltejs/kit').Load} */
export const load: Load = async ({ parent, params }) => {
    const data = await parent();
    if (data.user == null) redirect(302, "/sign-in");
    const userProfile = await getUserProfile(data.user.id);
    const conference = await getConferenceByAcronym(params.conferenceAcronym, {
        short_name: true,
        acronym: true,
        name: true,
        start_date: true,
        submission_deadline: true,
        description: true,
        site_url: true,
        settings: {
            select: {
                presentation_formats: true,
            },
        },
        topics: {
            select: {
                hint: true,
                id: true,
                name: true,
            },
            orderBy: {
                position: "asc",
            },
        },
        symposiums: {
            select: {
                name: true,
                position: true,
                topics: {
                    select: {
                        hint: true,
                        id: true,
                        name: true,
                    },
                    orderBy: {
                        position: "asc",
                    },
                },
            },
            orderBy: {
                position: "asc",
            },
        },
    });

    if (conference == null) {
        error(404);
    }
    if (isSubmissionClosed(conference.submission_deadline))
        redirect(302, `/call_for_papers/${conference.acronym}`);
    return { conference, userProfile };
};

export const actions: Actions = {
    default: async ({ request, cookies, params }) => {
        const user = await authorizedRoute(cookies, redis);
        const conference = await getConferenceByAcronym(
            params.conferenceAcronym,
            {
                id: true,
                name: true,
                email: true,
                short_name: true,
                submission_deadline: true,
            },
        );
        if (conference == null) error(404);
        if (isSubmissionClosed(conference.submission_deadline))
            error(403, "The submission deadline has passed");
        const formData = Object.fromEntries(await request.formData());
        const topic = await getConferenceTopic(
            conference.id,
            parseInt(String(formData.topic)),
        );
        if (topic == null) error(400, "Unknown topic");
        const authors = parseSubmissionAuthors(formData.authors);
        const submission: Prisma.SubmissionCreateInput = {
            created_by: {
                connect: {
                    id: user.id,
                },
            },
            title: String(formData.title),
            abstract: String(formData.abstract),
            keywords: String(formData.keywords),
            funding:
                formData.funding == undefined
                    ? undefined
                    : String(formData.funding),
            topic: {
                connect: {
                    id: topic.id,
                },
            },
            conference: {
                connect: {
                    id: conference.id,
                },
            },
            presentation_format: String(formData.presentation_format),
            local_id: 0,
            authors: { createMany: { data: authors } },
        };

        const createdSubmission = await createSubmission(
            submission,
            conference.id,
        );
        // The submission is saved at this point: notification failures are logged,
        // never reported as a failed submission (users would resubmit and create duplicates).
        const notify = async (to: string, send: () => Promise<unknown>) => {
            try {
                await send();
            } catch (e) {
                console.error(
                    `Notice for new submission ${createdSubmission.id} to ${to} failed`,
                    e,
                );
            }
        };
        const emailAuthors = authors.map((author) => ({
            ...author,
            title: titles[author.title],
        }));
        const sendCreatedEmail = async (recipient: {
            email: string;
            title: string;
            first_name: string;
            last_name: string;
        }) => {
            const html = await renderCreateSubmissionTemplate({
                conference_email: conference.email,
                corresponding_title: recipient.title,
                first_name: recipient.first_name,
                last_name: recipient.last_name,
                title: createdSubmission.title,
                local_id: createdSubmission.local_id,
                submission_id: createdSubmission.id,
                presentation_format:
                    presentation_formats[createdSubmission.presentation_format],
                topic: topic.name,
                authors: emailAuthors,
                conference_short_name: conference.short_name,
                conference_name: conference.name,
            });
            await transporter.sendMail({
                from: `${EMAIL}`,
                to: `${recipient.email}`,
                subject: `Your paper #${createdSubmission.local_id} for the ${conference.short_name} has been created`,
                html: html,
            });
        };

        await notify(user.email, () =>
            sendCreatedEmail({ ...user, title: titles[user.title] }),
        );
        for (const author of emailAuthors)
            if (author.email != user.email && author.is_corresponding)
                await notify(author.email, () => sendCreatedEmail(author));
        await notify("review queue", () =>
            SubmissionReviewProcessQueueManager.timeoutSubmissionReviewProcess({
                id: createdSubmission.id,
            }),
        );
        // recipients.chairs.forEach(async (recipient) => {
        //     await sendRCCCSubmissionAuthorCreated(recipient.email, {
        //         recipient,
        //         submission: {
        //             ...createdSubmission,
        //             topic: {
        //                 name: topic.name,
        //             },
        //             link: `${DOMAIN}/call_for_papers/scitech2024/submissions/${createdSubmission.id}/${PRIVILEGES.chair}`,
        //         },
        //         conference: {
        //             name: conference.name,
        //             short_name: conference.short_name,
        //         },
        //         authors: rawAuthors,
        //     });
        // });

        await notify("submissions@confchair.org", () =>
            sendRCCCSubmissionAuthorCreated("submissions@confchair.org", {
                recipient: { title: "", first_name: "committee", last_name: "" },
                submission: {
                    ...createdSubmission,
                    topic: {
                        name: topic.name,
                    },
                    link: `${DOMAIN}/call_for_papers/${params.conferenceAcronym}/submissions/${createdSubmission.id}/${PRIVILEGES.chair}`,
                },
                conference: {
                    name: conference.name,
                    short_name: conference.short_name,
                },
                authors,
            }),
        );
        redirect(302, "/author");

        //     try {
        //         const results = await signInSchema.parseAsync(formData);
        //         const user: any = await getUserByEmail(results.email);
        //         await redis.set(sessionToken, user.id, {
        //             EX: SESSION_EXPIRATION_TIME,
        //         });
        //         cookies.set("SESSION", sessionToken, {
        //             path: "/",
        //             maxAge: SESSION_EXPIRATION_TIME,
        //         });
        //     } catch (error: any) {
        //         console.log(error);
        //         const { ...rest } = formData;
        //         const { fieldErrors: errors } = error.flatten();
        //         return {
        //             data: rest,
        //             errors,
        //         };
        //     }
        //     redirect(302, "/account");
        // },
    },
};
