const neko = require('nekos.life');
const { sfw } = new neko();

exports.run = async(client, message, args) => {
    let query = args.join(' ');
    if (!query) {
        const cache = message.channel.messages.cache.filter(msg => !msg.author.bot && !msg.content.startsWith(prefix)).last();
        if (!cache) {
            const messages = await message.channel.messages.fetch({ limit: 10 });
            const msg = messages.filter(msg => !msg.author.bot && !msg.content.startsWith(prefix)).last();
            query = msg.cleanContent;
        } else {
            query = cache.cleanContent;
        };
    };
    message.channel.sendTyping();
    let text = await sfw.spoiler({ text: query });
    return message.channel.send(text.owo);
};

exports.help = {
    name: "spoiler",
    description: "deep spoiler your long text :upside_down:",
    usage: ["spoiler `[text]`"],
    example: ["spoiler `this should be in spoiler`"]
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
};