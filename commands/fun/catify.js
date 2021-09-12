const neko = require('nekos.life');
const { sfw } = new neko();

exports.run = async(client, message, args, prefix) => {
    try {
        let query = args.join(' ');
        let author = message.author;
        message.channel.sendTyping();
        if (!query) {
            const cache = message.channel.messages.cache.filter(msg => !msg.author.bot && !msg.content.startsWith(prefix)).last();
            if (!cache) {
                const messages = await message.channel.messages.fetch({ limit: 5 });
                const msg = messages.filter(msg => !msg.author.bot && !msg.content.startsWith(prefix)).last();
                query = msg.cleanContent;
                author = msg.author;
            } else {
                query = cache.cleanContent;
                author = cache.author;
            }
        };
        let text = await sfw.catText({ text: query });;
        return message.channel.send(`**${author.username}** was saying: ${text.cat.toLowerCase()}`)
    } catch (error) {;
        return message.channel.send('hmm, something happened when i was trying to talk like a cat lmao. maybe Discord hate it :(')
    }
};
exports.help = {
    name: "catify",
    description: "make your text or the message above yours sounds like a cat :thinking:",
    usage: ["catify `[text]`"],
    example: ["catify `wut`"]
};

exports.conf = {
    aliases: ['cattext'],
    cooldown: 3,
    guildOnly: true,
};