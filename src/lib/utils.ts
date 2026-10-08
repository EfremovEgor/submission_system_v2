import type { User } from "@prisma/client";
import type { Cookies } from "@sveltejs/kit";
import { createHash, randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import type { RedisClientType } from "redis";
import { getUserById } from "./database/users";
import { DOMAIN } from "$env/static/private";

export const createBase64UrlSafeString = (size: number = 32): string => {
    return randomBytes(size).toString("base64url");
};
export const hashString = (inputString: string) => {
    return createHash("md5").update(inputString).digest("hex").toString();
};

const scryptAsync = promisify(scrypt) as (
    password: string,
    salt: Buffer,
    keylen: number,
) => Promise<Buffer>;
const PASSWORD_HASH_PREFIX = "scrypt$";

// Passwords are stored as "scrypt$<salt>$<hash>" (base64url). Older accounts still hold
// unsalted MD5 hex digests: they are verified as such and rehashed on the next sign-in.
export const hashPassword = async (password: string) => {
    const salt = randomBytes(16);
    const hash = await scryptAsync(password, salt, 64);
    return `${PASSWORD_HASH_PREFIX}${salt.toString("base64url")}$${hash.toString("base64url")}`;
};
export const isLegacyPasswordHash = (storedHash: string) =>
    !storedHash.startsWith(PASSWORD_HASH_PREFIX);
export const verifyPassword = async (password: string, storedHash: string) => {
    let expected: Buffer, actual: Buffer;
    if (isLegacyPasswordHash(storedHash)) {
        expected = Buffer.from(storedHash);
        actual = Buffer.from(hashString(password));
    } else {
        const [salt, hash] = storedHash
            .slice(PASSWORD_HASH_PREFIX.length)
            .split("$");
        expected = Buffer.from(hash, "base64url");
        actual = await scryptAsync(
            password,
            Buffer.from(salt, "base64url"),
            expected.length,
        );
    }
    return actual.length == expected.length && timingSafeEqual(actual, expected);
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
