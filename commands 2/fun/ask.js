const neko = require('nekos.life');
const { sfw } = new neko();

exports.run = async(client, message, args) => {
    try {
        message.channel.startTyping(true);
        let query = args.join(' ');
        if (!query) return message.reply('uh.. what do you want to ask?')
        let text = await sfw.why({ text: query });
        await message.channel.stopTyping(true);
        return message.channel.send(text.why.toLowerCase())
    } catch (error) {
        await message.channel.stopTyping(true);
        return message.channel.send('hmm, something happened when i was trying to ask you back :pensive:')
    }

};

exports.help = {
    name: "ask",
    description: "ask me anything! i will reply with an another question? :thinking:",
    usage: "ask `<text>`",
    example: "ask `hmmm`"
};

exports.conf = {
    aliases: ['askme', 'question', 'why'],
    cooldown: 3,
    guildOnly: true,
};