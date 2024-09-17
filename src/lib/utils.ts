import type { User } from "@prisma/client";
import type { Cookies } from "@sveltejs/kit";
import { createHash, randomBytes } from "crypto";
import type { RedisClientType } from "redis";
import { getUserById } from "./database/users";

export const createBase64UrlSafeString = (size: number = 32): string => {
    return randomBytes(size).toString("base64url");
};
export const hashString = (inputString: string) => {
    return createHash("md5").update(inputString).digest("hex").toString();
};
export const excludeProperties = (obj: object, keys: string[]) => {
    return Object.fromEntries(
        Object.entries(obj).filter(([key]) => !keys.includes(key)),
    );
};
export const includeOnlyProperties = (obj: object, keys: string[]) => {
    return Object.fromEntries(
        Object.entries(obj).filter(([key]) => keys.includes(key)),
    );
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
