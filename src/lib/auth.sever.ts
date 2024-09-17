import { error, type Cookies } from "@sveltejs/kit";
import { type User } from "@prisma/client";
import type { RedisClientType } from "redis";
import { getUserFromCookies } from "./utils";

export const authorizedRoute = async (
    cookies: Cookies,
    redis: RedisClientType<any, any, any>,
): Promise<User> => {
    const user = await getUserFromCookies(cookies, redis);
    if (user == null) error(401);
    return user;
};
