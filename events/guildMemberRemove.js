const hugSchema = require('../model/hug');
const punchSchema = require('../model/punch');
const slapSchema = require('../model/slap');
const patSchema = require('../model/pat');
const cuddleSchema = require('../model/cuddle');
const kissSchema = require('../model/kiss');
const naturalMessages = require('../assets/messages/normal/leave.json');
const weebMessages = require('../assets/messages/anime-ish/leave.json');
const request = require('node-superfetch');
const sendHook = require('../features/webhook');
const { MessageEmbed } = require("discord.js");

module.exports = async(client, member) => {
    await client.dbleveling.findOneAndDelete({
        guildId: member.guild.id,
        userId: member.user.id,
    });

    await client.dbverify.findOneAndDelete({
        guildID: member.guild.id,
        userID: member.user.id,
    });
    await client.cooldowns.findOneAndDelete({
        guildId: member.guild.id,
        userId: member.user.id,
    });
    await client.inventory.findOneAndDelete({
        guildId: member.guild.id,
        userId: member.user.id,
    });
    await hugSchema.findOneAndDelete({
        userId: member.user.id,
        guildId: member.guild.id,
    });
    await punchSchema.findOneAndDelete({
        userId: member.user.id,
        guildId: member.guild.id,
    });
    await slapSchema.findOneAndDelete({
        userId: member.user.id,
        guildId: member.guild.id,
    });
    await cuddleSchema.findOneAndDelete({
        userId: member.user.id,
        guildId: member.guild.id,
    });
    await kissSchema.findOneAndDelete({
        userId: member.user.id,
        guildId: member.guild.id,
    });
    await patSchema.findOneAndDelete({
        userId: member.user.id,
        guildId: member.guild.id,
    });
    await client.verifytimers.deleteTimer(member.guild.id, member.user.id);
    const setting = await client.dbguilds.findOne({
        guildID: member.guild.id
    });
    if (setting.byeChannelID) {
        const channel = member.guild.channels.cache.get(setting.byeChannelID);
        if (!channel || !channel.permissionsFor(member.guild.me).has('MANAGE_WEBHOOKS')) return;
        if (setting.responseType === 'natural') {
            const message = naturalMessages[Math.floor(Math.random() * naturalMessages.length)]
                // .toLowerCase()
                .split('{username}').join(`**${member.user.username}**`)
                .split('{amount}').join(member.guild.memberCount)
                .split('{guild}').join(member.guild.name);
            const embed = new MessageEmbed()
                .setColor('#bee7f7')
                .setDescription(`:wave: ${message}`)
                // .setThumbnail(member.user.displayAvatarURL({ size: 4096, dynamic: true, format: 'png' }))
            const instance = new sendHook(client, channel, {
                username: member.guild.me.displayName,
                avatarURL: client.user.displayAvatarURL(),
                embeds: [embed],
                // content: message
            })
            return instance.send();
        };
        if (setting.responseType === 'weeb') {
            const message = weebMessages[Math.floor(Math.random() * weebMessages.length)]
                // .toLowerCase()
                .split('{username}').join(`**${member.user.username}**`)
                .split('{amount}').join(member.guild.memberCount)
                .split('{guild}').join(member.guild.name);
            const embed = new MessageEmbed()
                .setColor('#bee7f7')
                .setDescription(`:wave: ${message}`)
                // .setThumbnail(member.user.displayAvatarURL({ size: 4096, dynamic: true, format: 'png' }))
            const { body } = await request.get('https://waifu-generator.vercel.app/api/v1');
            const user = body[Math.floor(Math.random() * body.length)]
            const instance = new sendHook(client, channel, {
                username: user.name,
                avatarURL: user.image,
                embeds: [embed],
                // content: message
            })
            return instance.send();
        };
    };
}