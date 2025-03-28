import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import inject from "@rollup/plugin-inject";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";

export default defineConfig({
    plugins: [sveltekit()],
    optimizeDeps: {
        esbuildOptions: {
            define: {
                global: "globalThis",
            },
            plugins: [
                NodeGlobalsPolyfillPlugin({
                    buffer: true,
                }),
            ],
        },
        exclude: [
            "svelte-codemirror-editor",
            "codemirror",
            "@codemirror/language-javascript",
        ],
    },
});
