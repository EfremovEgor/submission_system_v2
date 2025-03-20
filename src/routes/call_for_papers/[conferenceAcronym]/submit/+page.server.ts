import { DOMAIN, EMAIL } from "$env/static/private";
import { presentation_formats, PRIVILEGES, titles } from "$src/lib/aliases";
import { getUserFromCookies } from "$src/lib/auth.sever";
import { getConferenceByAcronym } from "$src/lib/database/conferences";
import prisma from "$src/lib/database/prisma";
import { getUsersWithPrivileges } from "$src/lib/database/privileges";
import { createSubmission } from "$src/lib/database/submissions";
import { getUserProfile } from "$src/lib/database/users";
import {
    sendRCCCSubmissionAuthorCreated,
    sendRCCCSubmissionAuthorUpdated,
} from "$src/lib/email/priviliges.mailing";
import transporter from "$src/lib/email/setup.server";
import { renderCreateSubmissionTemplate } from "$src/lib/email/templating";
import {
    SubmissionReviewProcessQueueManager,
    submissionReviewProcessWorker,
} from "$src/lib/queue/consumers/submissions";
import { redis } from "$src/lib/redis/redis";
import { Prisma } from "@prisma/client";
import { error, redirect, type Actions, type Load } from "@sveltejs/kit";
import { z } from "zod";

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
    if (
        new Date() >
        new Date(
            conference.submission_deadline.getTime() + 60 * 60 * 21 * 1000 - 1,
        )
    )
        redirect(302, `/call_for_papers/${conference.acronym}`);
    return { conference, userProfile };
};

const englishSubmissionFormSchema = z.object({});
export const actions: Actions = {
    default: async ({ request, cookies, params }) => {
        const user = await getUserFromCookies(cookies, redis);
        if (user == null) error(403);
        const formData = Object.fromEntries(await request.formData());
        let authors: Prisma.AuthorCreateWithoutSubmissionInput[] = [];
        const rawAuthors = JSON.parse(formData.authors);
        rawAuthors.forEach(
            (author: {
                title: any;
                email: any;
                first_name: any;
                last_name: any;
                affiliation: any;
                country: any;
                is_presenter: any;
                is_corresponding: any;
                web_page: any;
            }) => {
                authors.push({
                    title: author.title,
                    email: author.email,
                    first_name: author.first_name,
                    last_name: author.last_name,
                    affiliation: author.affiliation,
                    country: author.country,
                    is_presenter: author.is_presenter,
                    is_corresponding: author.is_corresponding,
                    web_page: author.web_page,
                });
            },
        );
        const conference = await getConferenceByAcronym(
            params.conferenceAcronym,
            { id: true, name: true, email: true, short_name: true },
        );
        const submission: Prisma.SubmissionCreateInput = {
            created_by: {
                connect: {
                    id: user.id,
                },
            },
            title: formData.title,
            abstract: formData.abstract,
            keywords: formData.keywords,
            topic: {
                connect: {
                    id: parseInt(formData.topic),
                },
            },
            conference: {
                connect: {
                    id: conference.id,
                },
            },
            presentation_format: formData.presentation_format,
            local_id: 0,
            authors: { createMany: { data: authors } },
        };

        const createdSubmission = await createSubmission(
            submission,
            conference.id,
        );
        const topic = await prisma.topic.findFirst({
            where: { id: createdSubmission.topic_id },
            select: { name: true },
        });
        authors.forEach((author) => {
            author.title = titles[author.title];
        });

        const html = await renderCreateSubmissionTemplate({
            conference_email: conference.email,
            corresponding_title: titles[user.title],
            first_name: user.first_name,
            last_name: user.last_name,
            title: createdSubmission.title,
            local_id: createdSubmission.local_id,
            submission_id: createdSubmission.id,
            presentation_format: createdSubmission.presentation_format,
            topic: topic.name,
            authors: authors,
            conference_short_name: conference.short_name,
            conference_name: conference.name,
        });
        transporter.sendMail({
            from: `${EMAIL}`,
            to: `${user.email}`,
            subject: `Your paper #${createdSubmission.local_id} for the ${conference.short_name} has been created`,
            html: html,
        });
        authors.forEach(async (author) => {
            if (author.email != user.email && author.is_corresponding) {
                // await sendCoAuthorSubmissionCreatedEmail(author.email, {
                //     authors: authors,
                //     submittingAuthor: author,
                //     correspondingAuthor: user,
                //     submissionDetails: {
                //         title: createdSubmission.title,
                //         local_id: createdSubmission.local_id,
                //         id: createdSubmission.id,
                //         topic: (
                //             await prisma.topic.findFirst({
                //                 where: { id: createdSubmission.topic_id },
                //             })
                //         ).name,
                //         presentation_format: "",
                //     },
                //     conferenceDetails: conference,
                // });
                const html = await renderCreateSubmissionTemplate({
                    conference_email: conference.email,
                    corresponding_title: author.title,
                    first_name: author.first_name,
                    last_name: author.last_name,
                    title: createdSubmission.title,
                    local_id: createdSubmission.local_id,
                    submission_id: createdSubmission.id,
                    presentation_format:
                        presentation_formats[
                            createdSubmission.presentation_format
                        ],
                    topic: topic.name,
                    authors: authors,
                    conference_short_name: conference.short_name,
                    conference_name: conference.name,
                });
                transporter.sendMail({
                    from: `${EMAIL}`,
                    to: `${author.email}`,
                    subject: `Your paper #${createdSubmission.local_id} for the ${conference.short_name} has been created`,
                    html: html,
                });
            }
        });
        SubmissionReviewProcessQueueManager.timeoutSubmissionReviewProcess({
            id: createdSubmission.id,
        });
        const recipients = await getUsersWithPrivileges(
            conference.id,
            { chairs: true },
            { title: true, first_name: true, last_name: true, email: true },
        );
        recipients.chairs.forEach(async (recipient) => {
            await sendRCCCSubmissionAuthorCreated(recipient.email, {
                recipient,
                submission: {
                    ...createdSubmission,
                    topic: {
                        name: topic.name,
                    },
                    link: `${DOMAIN}/call_for_papers/scitech2024/submissions/${createdSubmission.id}/${PRIVILEGES.chair}`,
                },
                conference: {
                    name: conference.name,
                    short_name: conference.short_name,
                },
                authors: rawAuthors,
            });
        });
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
