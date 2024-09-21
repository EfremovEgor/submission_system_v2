module.exports = {
    apps: [
        {
            name: "confchair",
            script: "build/index.js",
            autorestart: true,
            watch: false,
            env_production: {
                NODE_ENV: "production",
                PORT: 3000,
            },
        },
    ],
};
