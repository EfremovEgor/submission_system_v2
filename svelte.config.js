import adapter from "@sveltejs/adapter-auto";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://kit.svelte.dev/docs/integrations#preprocessors
    // for more information about preprocessors
    preprocess: vitePreprocess(),

    kit: {
        alias: {
            $components: "./src/lib/components",
            $images: "./src/lib/images",
            $translations: "./src/lib/translations",
            $src: "./src",
            $email: "./src/lib/email",
        },

        adapter: adapter(),
    },
    preprocess: vitePreprocess(),
};

export default config;
