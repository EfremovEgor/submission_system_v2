import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import inject from "@rollup/plugin-inject";

export default defineConfig({
    plugins: [
        sveltekit(),

        inject({
            Buffer: ["buffer", "Buffer"],
        }),
    ],
    build: {
        rollupOptions: {
            plugins: [
                inject({
                    Buffer: ["buffer", "Buffer"],
                }),
            ],
        },
    },
});
