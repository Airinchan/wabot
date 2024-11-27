export default {
    name: "Bot",
    triggers: ["bot"],
    info: {},
    development: false,
    code: async (ctx) => {
        ctx.reply("Dalam pengembangan")
    }
}