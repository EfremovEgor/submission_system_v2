module.exports = {
    apps: [
        {
            name: "confchair",
            script: "build/index.js",
            env_production: {
                NODE_ENV: "production",
                PORT: 5173,
            },
        },
    ],
};
