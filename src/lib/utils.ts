import type { User } from "@prisma/client";
import type { Cookies } from "@sveltejs/kit";
import { createHash, randomBytes } from "crypto";
import type { RedisClientType } from "redis";
import { getUserById } from "./database/users";
import { DOMAIN } from "$env/static/private";

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
export const constructSiteLink = (path: string) => {
    if (!path.startsWith("/")) path = "/" + path;
    return `${DOMAIN}${path}`;
};
