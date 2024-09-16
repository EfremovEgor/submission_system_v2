import { addTranslations, setLocale, setRoute } from "$lib/translations";

/** @type {import('@sveltejs/kit').Load} */
export const load = async ({ data }) => {
    let { i18n, translations, user } = data;
    const { locale, route } = i18n;

    addTranslations(translations);

    await setRoute(route);
    await setLocale(locale);

    return { i18n, user };
};
