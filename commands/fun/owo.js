const neko = require('nekos.life');
const { sfw } = new neko();

exports.run = async(client, message, args, prefix) => {
    try {
        message.channel.sendTyping();
        let query = args.join(' ');
        let author = message.author;
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
        }
        let text = await sfw.OwOify({ text: query });;
        return message.channel.send(`**${author.username}** was saying: ${text.owo.toLowerCase()}`)
    } catch (error) {;
        return message.channel.send('hmm, something happened when i was trying to talk like a cat lmao. maybe Discord hate it :(')
    }
};


exports.help = {
    name: "owo",
    description: "owo your text or the message above yours? :thinking:",
    usage: ["owo `[text]`"],
    example: ["owo `hmmm`"]
};

exports.conf = {
    aliases: ['owoify', 'uwu'],
    cooldown: 3,
    guildOnly: true,
};