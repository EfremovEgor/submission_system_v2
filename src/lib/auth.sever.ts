import { error, type Cookies } from "@sveltejs/kit";
import { type User } from "@prisma/client";
import type { RedisClientType } from "redis";
import { getUserById } from "./database/users";
import { SESSION_EXPIRATION_TIME } from "$src/config";

// Session and recovery tokens are 32 random bytes in base64url. Checking the format and
// namespacing the Redis keys keeps a crafted cookie or URL from addressing any other key.
const TOKEN_FORMAT = /^[A-Za-z0-9_-]{43}$/;
export const isValidToken = (token: string | null | undefined): token is string =>
    token != null && TOKEN_FORMAT.test(token);
const sessionKey = (token: string) => `session:${token}`;
const userSessionsKey = (userId: number) => `user_sessions:${userId}`;
export const recoveryKey = (token: string) => `recovery:${token}`;

export const createSession = async (
    redis: RedisClientType<any, any, any>,
    token: string,
    userId: number,
) => {
    await redis.set(sessionKey(token), userId, {
        EX: SESSION_EXPIRATION_TIME,
    });
    await redis.sAdd(userSessionsKey(userId), token);
    await redis.expire(userSessionsKey(userId), SESSION_EXPIRATION_TIME);
};

export const getSessionUserId = async (
    redis: RedisClientType<any, any, any>,
    token: string | undefined,
): Promise<number | null> => {
    if (!isValidToken(token)) return null;
    const userId = await redis.get(sessionKey(token));
    return userId == null ? null : parseInt(userId);
};

export const deleteSession = async (
    redis: RedisClientType<any, any, any>,
    token: string | undefined,
) => {
    if (!isValidToken(token)) return;
    const userId = await getSessionUserId(redis, token);
    await redis.del(sessionKey(token));
    if (userId != null) await redis.sRem(userSessionsKey(userId), token);
};

// Called after a password change so that sessions opened with the old password end.
export const deleteUserSessions = async (
    redis: RedisClientType<any, any, any>,
    userId: number,
) => {
    const tokens = await redis.sMembers(userSessionsKey(userId));
    await redis.del([...tokens.map(sessionKey), userSessionsKey(userId)]);
};

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
    const userId = await getSessionUserId(redis, sessionToken);
    if (userId == null) {
        try {
            cookies.delete("SESSION", { path: "/" });
        } catch (error) {}
        return null;
    }
    let user: any = await getUserById(userId);
    if (user == null) {
        cookies.delete("SESSION", { path: "/" });
        return null;
    }
    return user;
};
