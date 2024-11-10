import { DOMAIN, EMAIL } from "$env/static/private";
import { presentation_formats, PRIVILEGES, titles } from "$src/lib/aliases";
import { getUserFromCookies } from "$src/lib/auth.sever";
import { getConferenceByAcronym } from "$src/lib/database/conferences";
import prisma from "$src/lib/database/prisma";
import { getUsersWithPrivileges } from "$src/lib/database/privileges";
import { getSubmissionById } from "$src/lib/database/submissions";
import { getUserProfile } from "$src/lib/database/users";
import { sendRCCCSubmissionAuthorUpdated } from "$src/lib/email/priviliges.mailing";
import transporter from "$src/lib/email/setup.server";
import { renderUpdateSubmissionTemplate } from "$src/lib/email/templating";
import { redis } from "$src/lib/redis/redis";
import { Prisma } from "@prisma/client";
import { error, redirect, type Actions, type Load } from "@sveltejs/kit";
import { z } from "zod";

/** @type {import('@sveltejs/kit').Load} */
export const load: Load = async ({ parent, params }) => {
    const data = await parent();
    if (!data.rights.canEdit) error(403);
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
    let authors = data.submission.authors;

    return { conference, userProfile, authors };
};

export const actions: Actions = {
    default: async ({ request, cookies, params }) => {
        const user = await getUserFromCookies(cookies, redis);

        if (user == null) error(403);

        const formData = Object.fromEntries(await request.formData());
        const updatedSubmissionData: Prisma.SubmissionUpdateInput = {
            title: formData.title,
            abstract: formData.abstract,
            keywords: formData.keywords,
            topic: {
                connect: {
                    id: parseInt(formData.topic),
                },
            },
            presentation_format: formData.presentation_format,
        };
        let submission = await getSubmissionById(parseInt(params.submissionId));
        const conference = await getConferenceByAcronym(
            params.conferenceAcronym,
            { id: true, name: true, email: true, short_name: true },
        );
        let authors: Prisma.AuthorUpdateInput[] = [];
        let authorEmails = [];
        const rawAuthors = JSON.parse(formData.authors);
        console.log(rawAuthors);
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
                authorEmails.push(author.email);
            },
        );
        await prisma.author.deleteMany({
            where: {
                AND: [
                    { submission_id: submission.id },
                    { email: { notIn: authorEmails } },
                ],
            },
        });
        authors.forEach(async (updatedAuthor) => {
            const author = await prisma.author.findFirst({
                where: {
                    submission_id: submission.id,
                    email: updatedAuthor.email,
                },
            });
            if (author != null) {
                await prisma.author.update({
                    where: {
                        id: author.id,
                    },
                    data: updatedAuthor,
                });
                console.log(updatedAuthor);
            } else {
                await prisma.author.create({
                    data: {
                        ...updatedAuthor,
                        submission_id: submission.id,
                    },
                });
            }
        });
        submission = await prisma.submission.update({
            where: {
                id: parseInt(params.submissionId),
            },
            data: updatedSubmissionData,
        });
        const topic = await prisma.topic.findFirst({
            where: { id: updatedSubmissionData.topic_id },
            select: { name: true },
        });
        authors.forEach((author) => {
            author.title = titles[author.title];
        });
        const html = await renderUpdateSubmissionTemplate({
            conference_email: conference.email,
            corresponding_title: titles[user.title],
            first_name: user.first_name,
            last_name: user.last_name,
            title: submission.title,
            local_id: submission.local_id,
            submission_id: submission.id,
            presentation_format: submission.presentation_format,
            topic: topic.name,
            authors: authors,
            conference_short_name: conference.short_name,
            conference_name: conference.name,
        });
        transporter.sendMail({
            from: `${EMAIL}`,
            to: `${user.email}`,
            subject: `Your paper #${submission.local_id} for the ${conference.short_name} has been updated`,
            html: html,
        });

        authors.forEach(async (author) => {
            if (author.email != user.email && author.is_corresponding) {
                const html = await renderUpdateSubmissionTemplate({
                    conference_email: conference.email,
                    corresponding_title: author.title,
                    first_name: author.first_name,
                    last_name: author.last_name,
                    title: submission.title,
                    local_id: submission.local_id,
                    submission_id: submission.id,
                    presentation_format:
                        presentation_formats[submission.presentation_format],
                    topic: topic.name,
                    authors: authors,
                    conference_short_name: conference.short_name,
                    conference_name: conference.name,
                });
                transporter.sendMail({
                    from: `${EMAIL}`,
                    to: `${author.email}`,
                    subject: `Your paper #${submission.local_id} for the ${conference.short_name} has been updated`,
                    html: html,
                });
            }
        });
        const recipients = await getUsersWithPrivileges(
            conference.id,
            { chairs: true },
            { title: true, first_name: true, last_name: true, email: true },
        );
        recipients.chairs.forEach(async (recipient) => {
            await sendRCCCSubmissionAuthorUpdated(recipient.email, {
                recipient,
                submission: {
                    ...submission,
                    link: `${DOMAIN}/call_for_papers/scitech2024/submissions/${submission.id}/${PRIVILEGES.chair}`,
                },
                conference: {
                    name: conference.name,
                    short_name: conference.short_name,
                },
                authors: rawAuthors,
            });
        });
        redirect(
            302,
            `/call_for_papers/${params.conferenceAcronym}/submissions/${submission.id}/author`,
        );
    },
};
