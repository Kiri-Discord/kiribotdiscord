const { MessageEmbed } = require("discord.js");
const ms = require("ms");
const { embedURL } = require('../util/util');
const naturalMessages = require('../assets/messages/normal/welcome.json');
const weebMessages = require('../assets/messages/anime-ish/welcome.json');
const request = require('node-superfetch');
const sendHook = require('../features/webhook');

module.exports = async(client, member) => {
        if (member.user.bot) return;

        const setting = await client.dbguilds.findOne({
            guildID: member.guild.id
        });


        if (setting.verifyRole && setting.verifyChannelID) {
            const roleExist = member.guild.roles.cache.get(setting.verifyRole);
            const verifyChannel = member.guild.channels.cache.get(setting.verifyChannelID);

            const alreadyHasRole = member._roles.includes(setting.verifyRole);
            if (roleExist && verifyChannel && !alreadyHasRole) {
                const timeMs = setting.verifyTimeout || ms('10m');
                const exists = await client.verifytimers.exists(member.guild.id, member.user.id);
                let code = randomText(10);
                if (exists) {
                    await client.verifytimers.deleteTimer(member.guild.id, member.user.id);
                    await client.verifytimers.setTimer(member.guild.id, timeMs, member.user.id, code);
                } else {
                    await client.verifytimers.setTimer(member.guild.id, timeMs, member.user.id, code);
                };
                const dm = new MessageEmbed()
                    .setFooter(`you will be kicked from the server in ${ms(timeMs, {long: true})} to prevent bots and spams`)
                    .setThumbnail(member.guild.iconURL({ size: 4096, dynamic: true }))
                    .setTitle(`welcome to ${member.guild.name}! wait, beep beep, boop boop?`)
                    .setDescription(`please solve the CAPTCHA at this link below to make sure you're human before you join ${member.guild.name}. enter the link below and solve the captcha to verify yourself :slight_smile:\n${embedURL('click me to start the verify process', `${__baseURL}verify?valID=${code}`)}`)
            try {
                await member.send(dm);
                verifyChannel.send(`<@!${member.user.id}>, please verify yourself using the link i sent you via DM to gain access to the server :)`).then(i => i.delete({ timeout: 60000 }));
            } catch {
                verifyChannel.send(`<@!${member.user.id}> uh, your DM is locked so i can't send you the verify link. can you unlock it first and type \`resend\` here?`)
                    .then(i => i.delete({ timeout: 10000 }));
            };
        };
    };
    if (setting.greetChannelID) {
        const channel = member.guild.channels.cache.get(setting.greetChannelID);
        if (!channel || !channel.permissionsFor(member.guild.me).has('MANAGE_WEBHOOKS')) return;
        if (setting.responseType === 'natural') {
            const message = naturalMessages[Math.floor(Math.random() * naturalMessages.length)]
                // .toLowerCase()
                .split('{username}').join(`**${member.user.username}**`)
                .split('{amount}').join(member.guild.memberCount)
                .split('{guild}').join(member.guild.name);
            const embed = new MessageEmbed()
                .setColor('#bee7f7')
                .setDescription(`\\➕ ${message}`)
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
                .setDescription(`\\➕ ${message}`)
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
};

function randomText(len) {
    const pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ23456789'.split('');
    const result = [];
    for (let i = 0; i < len; i++) result.push(pool[Math.floor(Math.random() * pool.length)]);
    return result.join('');
};