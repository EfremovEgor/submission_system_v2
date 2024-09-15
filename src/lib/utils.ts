import { createHash, randomBytes } from "crypto";

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
