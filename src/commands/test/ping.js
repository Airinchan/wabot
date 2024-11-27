export default {
    name: "Ping",
    triggers: ["ping", "p"],
    info: {},
    development: false,
    code: async (ctx) => {
        ctx.reply("pong")
    }
}