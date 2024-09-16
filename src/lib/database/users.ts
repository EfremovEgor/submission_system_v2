import type { Prisma } from "@prisma/client";
import prisma from "./prisma";
import { hashString } from "$lib/utils";

export const getUserByEmail = async (email: string) => {
    const user = await prisma.user.findFirst({ where: { email: email } });
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
