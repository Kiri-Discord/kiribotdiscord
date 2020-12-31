const { js_beautify: beautify } = require('js-beautify');
const { stripIndents } = require('common-tags');
const { MessageCollector } = require('discord.js');

exports.help = {
    name: "beautify",
    description: "i beautifies code. *that's it!*",
    usage: "beautify `[code]`",
    example: "qr-gen `hello world`"
};
  
exports.conf = {
    aliases: ["beautify-code"],
    cooldown: 5,
    guildOnly: true,
    userPerms: [],
	clientPerms: ["SEND_MESSAGES"]
}


exports.run = async (client, message, args) => {
    let query = args.join(" ");
    let code;
    if (!query) {
        await message.reply('what code do you want to beautify? you have 15 second!');
        const collector = new MessageCollector(message.channel, msg => {
            if (!msg.author.bot && msg.author == message.author) return true;
        }, { time: 15000 });
        collector.on('collect', msg => {
            code = msg.content;
            return collector.stop();
        });
        collector.on('end', async () => {
            if (code) {
                return message.reply("here is your code!\n" + stripIndents`
                \`\`\`${beautify(code)}\`\`\`
            `);
            }
            else {
                message.reply(`you didn't say anything :(`)
            }
        });
    } else {
        code = query;
        return message.reply("here is your code!\n" + stripIndents`
        \`\`\`${beautify(code)}\`\`\`
    `);
    }
}