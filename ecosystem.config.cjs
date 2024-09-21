module.exports = {
    apps: [
        {
            name: "confchair",
            script: "build/output/server/index.js",
            autorestart: true,
            watch: false,
            env_production: {
                NODE_ENV: "production",
                PORT: 5173,
            },
        },
    ],
};
