import prisma from "./prisma";

import type { Prisma } from "@prisma/client";
export const getConferences = async (
    conditions: Prisma.ConferenceFindManyArgs = {},
) => {
    const conferences = await prisma.conference.findMany(conditions);
    return conferences;
};
export const getConferenceByAcronym = async (
    acronym: string,
    fields: Prisma.ConferenceSelect = {},
) => {
    const conference = await prisma.conference.findFirst({
        where: { acronym: acronym },
        select: fields,
    });
    return conference;
};
export const getConferenceById = async (
    id: string,
    fields: Prisma.ConferenceSelect,
) => {
    const conference = await prisma.conference.findFirst({
        where: { id: id },
        select: fields,
    });
    return conference;
};
