import { getUserById } from "$src/lib/database/users.js";
import { redis } from "$src/lib/redis/redis.js";
import { includeOnlyProperties } from "$src/lib/utils.js";
import {
    locales,
    loadTranslations,
    translations,
    defaultLocale,
} from "$translations";

/** @type {import('@sveltejs/kit').ServerLoad} */
export const load = async ({ url, cookies, request }) => {
    const { pathname } = url;

    let locale = (cookies.get("lang") || "").toLowerCase();

    if (!locale) {
        locale =
            `${`${request.headers.get("accept-language")}`.match(/[a-zA-Z]+?(?=-|_|,|;)/)}`.toLowerCase();
    }

    const supportedLocales = locales.get().map((l) => l.toLowerCase());

    if (!supportedLocales.includes(locale)) {
        locale = defaultLocale;
    }
    const data = {
        i18n: { locale, route: pathname },
        translations: translations.get(),
    };
    await loadTranslations(locale, pathname);
    const sessionToken = cookies.get("SESSION");
    if (sessionToken == null) {
        cookies.delete("SESSION", { path: "/" });
        return data;
    }
    const userId = await redis.get(sessionToken);
    if (userId == null) {
        try {
            cookies.delete("SESSION", { path: "/" });
        } catch (error) {}
        return data;
    }
    let user: any = await getUserById(parseInt(userId));
    if (user == null) return data;
    user = includeOnlyProperties(user, [
        "id",
        "email",
        "first_name",
        "last_name",
        "middle_name",
    ]);
    return { ...data, user: user };
};
