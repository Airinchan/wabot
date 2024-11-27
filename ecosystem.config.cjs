module.exports = {
    apps: [{
        // Umum
        name: "wa-bot",
        script: "./main.js",

        // Fitur-fitur canggih
        watch: true,
        ignore_watch: ["node_modules", "state", "database.json"],

        // Aliran kontrol
        cron_restart: "*/30 * * * *"
    }]
};