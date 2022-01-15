const { MessageEmbed } = require('discord.js');
const ms = require("ms");
const sendHook = require('../../features/webhook.js');
module.exports = class VerifyTimer {
    constructor(client) {
        Object.defineProperty(this, 'client', { value: client });
        this.timeouts = new Map();
    }

    async fetchAll() {
        const timers = await this.client.dbverify.find({});
        if (!timers || !timers.length) return;
        for (let data of timers) await this.setTimer(data.guildID, new Date(data.time) - new Date(), data.userID, data.valID, false, data.noKick);
        return this;
    }

    async setTimer(guildID, time, userID, code, update = true, noKick) {
        const timeout = setTimeout(async() => {
            try {
                if (!noKick) {
                    let reason = 'Kiri verification timeout';
                    const setting = await this.client.dbguilds.findOne({
                        guildID: guildID
                    });
                    const guild = await this.client.guilds.cache.get(guildID);
                    if (!guild) return;
                    const member = await guild.members.cache.get(userID);
                    if (!member) return;
                    const roleExist = guild.roles.cache.get(setting.verifyRole);
                    const verifyChannel = guild.channels.cache.find(ch => ch.id === setting.verifyChannelID);
                    const verifyRole = member._roles.includes(setting.verifyRole);
                    if (verifyRole || !verifyChannel || !roleExist) return;
                    const logChannel = await guild.channels.cache.get(setting.logChannelID);
                    const logembed = new MessageEmbed()
                        .setAuthor({name: `Verification`, iconURL: this.client.user.displayAvatarURL()})
                        .setTitle(`${member.user.tag} was kicked`)
                        .setColor("#ff0000")
                        .setThumbnail(member.user.displayAvatarURL({ size: 4096, dynamic: true }))
                        .addField('Username', member.user.tag)
                        .addField('User ID', member.id)
                        .addField('Kicked by', this.client.user.toString())
                        .addField('Reason', reason)
                        .setTimestamp()
                    const logerror = new MessageEmbed()
                        .setAuthor({name: `Verification`, iconURL: this.client.user.displayAvatarURL()})
                        .setTitle(`Failed while kicking ${member.user.tag}`)
                        .setDescription(`i can't kick that unverified member because critical permission was not met :pensive:`)
                        .setColor('#ff0000')
                        .setTimestamp()
                        .setThumbnail(member.user.displayAvatarURL({ size: 4096, dynamic: true }))
                    if (!member.kickable) {
                        if (logChannel) {
                            const instance = new sendHook(this.client, logChannel, {
                                username: member.guild.me.displayName,
                                avatarURL: this.client.user.displayAvatarURL(),
                                embeds: [logerror],
                            });
                            return instance.send();
                        } else return;
                    }
                    if (logChannel) {
                        const instance = new sendHook(this.client, logChannel, {
                            username: member.guild.me.displayName,
                            avatarURL: this.client.user.displayAvatarURL(),
                            embeds: [logembed],
                        })
                        return instance.send();
                    }
                    await member.send(`i have kicked you from **${guild.name}** for not verifying in **${ms(time, {long: true})}** :pensive:`).catch(() => null);
                    await member.kick(reason);
                };
            } finally {
                await this.client.dbverify.findOneAndDelete({
                    guildID: guildID,
                    userID: userID,
                });
            }
        }, time);
        if (update) {
            await this.client.dbverify.findOneAndUpdate({
                guildID,
                userID,
            }, {
                guildID,
                userID,
                valID: code,
                endTimestamp: new Date(Date.now() + time),
                time: new Date(Date.now() + time).toISOString(),
                noKick
            }, {
                upsert: true,
                new: true
            });
        }
        this.timeouts.set(`${guildID}-${userID}`, timeout);
        return timeout;
    }

    async deleteTimer(guildID, userID) {
        clearTimeout(this.timeouts.get(`${guildID}-${userID}`));
        this.timeouts.delete(`${guildID}-${userID}`);
        await this.client.dbverify.findOneAndDelete({
            guildID: guildID,
            userID: userID,
        });
    }

    async exists(guildID, userID) {
        const exist = await this.client.dbverify.findOne({
            guildID: guildID,
            userID: userID,
        });
        return exist ? true : false;
    }
};