const { MessageEmbed } = require("discord.js");
const { oneLine } = require('common-tags');
const humanizeDuration = require("humanize-duration");
exports.run = async (client, message, args) => {
    let user = message.mentions.users.first() || message.guild.members.cache.get(args[0]) || message.author;
    let mention = message.guild.members.cache.get(user.id);
    if (mention.user.id === client.user.id) return message.channel.send("that's me :( you think i have any money :pensive:");
    if (mention.user.bot) return message.channel.send("duh you can't ask money out of a bot. we are broke enough :pensive:");
    let balance;
    let cooldown = 8.64e+7;
    let storage = await client.money.findOne({
        userId: mention.user.id,
        guildId: message.guild.id
    });
    let msLastDaily;
    let lastDaily;
    if (!storage) {
        const model = client.money
        const newUser = new model({
            userId: mention.user.id,
            guildId: message.guild.id
        });
        await newUser.save();
        balance = newUser.balance;
    } else {
        msLastDaily = storage.lastDaily;
        balance = storage.balance;
    } 
    if (msLastDaily && cooldown - (Date.now() - msLastDaily) > 0) {
        lastDaily = humanizeDuration(cooldown - (Date.now() - msLastDaily))
    } else {
        lastDaily = 'ready to collect';
    }
    const embed = new MessageEmbed()
    .setAuthor(`${mention.user.username}'s balance`, mention.user.displayAvatarURL({size: 1024, dynamic: true}))
    .setDescription(`
    💵 **balance**: ⏣ **${balance}** token(s)

    ⏲️ **time until next daily collect:**
    \`${lastDaily}\` left
    `)
    .setTimestamp()
    return message.channel.send(embed);
}

exports.help = {
    name: "balance",
    description: "check yours, or other members money.",
    usage: ["balance \`[@user]\`", "balance \`[user id]\`", "balance"],
    example: ["balance `@eftw`", "balance `484988949488494`", "balance"]
}
  
exports.conf = {
    aliases: ["bal", "coin", "money", "credit"],
    cooldown: 5,
    guildOnly: true,
    userPerms: [],
    clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
}