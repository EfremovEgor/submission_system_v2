import { error, type Cookies } from "@sveltejs/kit";
import { type User } from "@prisma/client";
import type { RedisClientType } from "redis";
import { getUserById } from "./database/users";

export const authorizedRoute = async (
    cookies: Cookies,
    redis: RedisClientType<any, any, any>,
): Promise<User> => {
    const user = await getUserFromCookies(cookies, redis);
    if (user == null) error(401);
    return user;
};
export const getUserFromCookies = async (
    cookies: Cookies,
    redis: RedisClientType<any, any, any>,
): Promise<User | null> => {
    const sessionToken = cookies.get("SESSION");
    if (sessionToken == null) {
        cookies.delete("SESSION", { path: "/" });
        return null;
    }
    const userId = await redis.get(sessionToken);
    if (userId == null) {
        try {
            cookies.delete("SESSION", { path: "/" });
        } catch (error) {}
        return null;
    }
    let user: any = await getUserById(parseInt(userId));
    if (user == null) {
        cookies.delete("SESSION", { path: "/" });
        return null;
    }
    return user;
};
