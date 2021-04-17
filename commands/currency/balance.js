const { MessageEmbed } = require("discord.js");
const humanizeDuration = require("humanize-duration");
exports.run = async (client, message, args) => {
    const member = await getMemberfromMention(args[0], message.guild) || message.member;
    const user = member.user;
    if (user.id === client.user.id) return message.inlineReply("that's me :( you think i have any money :pensive:");
    if (user.bot) return message.inlineReply("duh you can't ask money out of a bot. we are broke enough :pensive:");
    let cooldown = 8.64e+7;
    let storage = await client.money.findOne({
        userId: user.id,
        guildId: message.guild.id
    });
    let lastDaily;
    if (!storage) {
        const model = client.money
        const newUser = new model({
            userId: user.id,
            guildId: message.guild.id
        });
        await newUser.save();
        storage = newUser;
    };
    let msLastDaily = storage.lastDaily;
    let balance = storage.balance;
    if (msLastDaily && cooldown - (Date.now() - msLastDaily) > 0) {
        lastDaily = `\`${humanizeDuration(cooldown - (Date.now() - msLastDaily))}\` left`
    } else {
        lastDaily = 'ready to collect';
    }
    const embed = new MessageEmbed()
    .setThumbnail(user.displayAvatarURL({size: 1024, dynamic: true}))
    .setTitle(`${user.username}'s balance`)
    .setDescription(`
    💵 **balance**: ⏣ **${balance}** token(s)

    ⏲️ **time until next daily collect:**
    ${lastDaily}
    `)
    .setTimestamp()
    return message.channel.send(embed);
}

exports.help = {
    name: "balance",
    description: "check yours, or other members money.",
    usage: ["balance \`[@user]\`", "balance \`[user id]\`", "balance"],
    example: ["balance `@eftw`", "balance `484988949488494`", "balance"]
};
  
exports.conf = {
    aliases: ["bal", "coin", "money", "credit"],
    cooldown: 3,
    guildOnly: true,
    userPerms: [],
    clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
};