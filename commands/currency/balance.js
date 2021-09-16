const { MessageEmbed } = require("discord.js");
const humanizeDuration = require("humanize-duration");
const { stripIndents } = require('common-tags');

exports.run = async(client, message, args) => {
    const member = await getMemberfromMention(args[0], message.guild) || message.member;
    const user = member.user;
    if (user.id === client.user.id) return message.reply("that's me :( you think i have any money? :pensive:");
    if (user.bot) return message.reply("duh you can't ask money out of a bot. we are broke enough :pensive:");
    let cooldown = 8.64e+7;
    let storage = await client.money.findOne({
        userId: user.id,
        guildId: message.guild.id
    });
    if (!storage) {
        const model = client.money
        storage = new model({
            userId: user.id,
            guildId: message.guild.id
        });
        await storage.save();
    };
    let cooldownStorage = await client.cooldowns.findOne({
        userId: user.id,
        guildId: message.guild.id
    });
    if (!cooldownStorage) {
        const model = client.cooldowns
        cooldownStorage = new model({
            userId: user.id,
            guildId: message.guild.id
        });
        await cooldownStorage.save();
    };
    let lastDaily;
    let msLastDaily = cooldownStorage.lastDaily;
    let balance = storage.balance;
    if (msLastDaily && cooldown - (Date.now() - msLastDaily) > 0) {
        lastDaily = `<t:${Math.floor(Date.now() + (cooldown - (Date.now() - msLastDaily)) / 1000)}:R>`
    } else {
        lastDaily = 'ready to collect';
    }
    const embed = new MessageEmbed()
        .setColor("#bee7f7")
        .setTitle(`${user.username}'s balance`)
        .setDescription(stripIndents `
        wallet: ⏣ __${balance}__ token(s)
        time until next daily collect: **${lastDaily}**
        `)
        .setTimestamp()
    return message.channel.send({ embeds: [embed] });
};

exports.help = {
    name: "balance",
    description: "check yours, or other members money.",
    usage: ["balance \`[@user]\`", "balance \`[user ID]\`", "balance"],
    example: ["balance `@eftw`", "balance `484988949488494`", "balance"]
};

exports.conf = {
    aliases: ["bal", "coin", "money", "credit"],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};