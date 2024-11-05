import type { Prisma } from "@prisma/client";
import prisma from "./prisma";
import { hashString } from "$lib/utils";
import type { layoutUser } from "../types/interfaces";

export const getUserByEmail = async (email: string) => {
    const user = await prisma.user.findFirst({ where: { email: email } });
    return user;
};
export const getLayoutUser = async (id: number) => {
    const rawUser: Array<layoutUser> = await prisma.$queryRaw`
        SELECT id,
        email,
        first_name,
        last_name,
        middle_name,
        CASE WHEN EXISTS 
        (SELECT * from chairs WHERE user_id=${id}) 
        THEN 1 ELSE 0 
        END AS is_chair,
        CASE WHEN EXISTS 
        (SELECT * from locs WHERE user_id=${id}) 
        THEN 1 ELSE 0 
        END AS is_loc
        FROM users WHERE users.id = ${id}
        `;
    if (!rawUser.length) return null;

    const user = rawUser[0];
    return user;
};
export const getUserById = async (id: number) => {
    const user = await prisma.user.findFirst({
        where: { id: id },
    });
    return user;
};
export const getUserProfile = async (id: number) => {
    const user = await prisma.user.findFirst({
        where: { id: id },
        select: {
            first_name: true,
            last_name: true,
            middle_name: true,
            address_line_1: true,
            address_line_2: true,
            affiliation: true,
            country: true,
            city: true,
            email: true,
            state: true,
            web_page: true,
            title: true,
            orcid_id: true,
            plan: true,
        },
    });
    return user;
};
export const getUserByRegistrationCode = async (token: string) => {
    const user = await prisma.user.findFirst({
        where: { registration_token: token },
    });
    return user;
};

export const createNewUser = async (userCreate: Prisma.UserCreateInput) => {
    userCreate.password = hashString(userCreate.password);

    const user = await prisma.user.create({ data: userCreate });
    return user;
};

export const updateUserById = async (
    userId: number,
    userUpdate: Prisma.UserUpdateInput,
) => {
    if (userUpdate.password != null) {
        userUpdate.password = hashString(userUpdate.password.toString());
    }
    await prisma.user.update({
        where: {
            id: userId,
        },
        data: userUpdate,
    });
};

export const updateUserByEmail = async (
    userEmail: string,
    userUpdate: Prisma.UserUpdateInput,
) => {
    if (userUpdate.password != null) {
        userUpdate.password = hashString(userUpdate.password.toString());
    }
    await prisma.user.update({
        where: {
            email: userEmail,
        },
        data: userUpdate,
    });
};
