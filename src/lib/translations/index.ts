import i18n from "sveltekit-i18n";
import { dev } from "$app/environment";
import lang from "./lang.json";

export const defaultLocale = "en";

/** @type {import('sveltekit-i18n').Config} */
export const config = {
    translations: {
        en: { lang },
        ru: { lang },
    },
    loaders: [
        {
            locale: "en",
            key: "menu",
            loader: async () => (await import("./en/menu.json")).default,
        },
        {
            locale: "ru",
            key: "menu",
            loader: async () => (await import("./ru/menu.json")).default,
        },
        {
            locale: "en",
            key: "errors",
            loader: async () => (await import("./en/errors.json")).default,
        },
        {
            locale: "ru",
            key: "errors",
            loader: async () => (await import("./ru/errors.json")).default,
        },
    ],
};

export const {
    t,
    loading,
    locales,
    locale,
    translations,
    loadTranslations,
    addTranslations,
    setLocale,
    setRoute,
} = new i18n(config);

loading.subscribe(
    ($loading) => $loading && console.log("Loading translations..."),
);
