const Discord = require('discord.js');
const ms = require("ms");
module.exports = class VerifyTimer {
	constructor(client) {
		Object.defineProperty(this, 'client', { value: client });

		this.timeouts = new Map();
	}

	async fetchAll() {
		const timers = await this.client.redis.hgetall('verifytimer');
		for (let data of Object.values(timers)) {
			data = JSON.parse(data);
			await this.setTimer(data.guildID, new Date(data.time) - new Date(), data.userID, data.title, false);
		}
		return this;
	}

	async setTimer(guildID, time, userID, updateRedis = true) {
		const data = { time: new Date(Date.now() + time).toISOString(), guildID, userID };
		const timeout = setTimeout(async () => {
            let reason = 'Sefy verification timeout'
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
            const logembed = new Discord.MessageEmbed()
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
            .setTitle('User kicked')
            .setColor("RANDOM")
            .setThumbnail(member.user.avatarURL())
            .addField('Username', member.user.username)
            .addField('User ID', member.id)
            .addField('Kicked by', this.client.user)
            .addField('Reason', reason);
            const logerror = new Discord.MessageEmbed()
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
            .setDescription(`Failed while kicking ${member} for not verifying in **${ms(time, {long: true})}**.\nPossible problem: \`MISSING_PERMISSION\` You can manually kick them instead :)`)
            .setColor('RANDOM')
            .setThumbnail(member.user.avatarURL())
            if (!member.kickable) {
                if (!logChannel) {
                    return;
                } else {
                    return logChannel.send(logerror);
                };
            }

			try {
                if (!logChannel) {
                    void(0)
                } else {
                    await logChannel.send(logembed);
                };

                await member.send(`I have kicked you from **${guild.name}** for not verifying in in **${ms(time, {long: true})}** :(`).catch(() => {
                    void(0)
                });
                await member.kick({reason});
            } finally {
                await this.client.dbverify.findOneAndDelete({
                    guildID: guild.id,
                    userID: member.user.id,
                });
				await this.client.redis.hdel('verifytimer', `${guildID}-${userID}`);
			}
		}, time);
		if (updateRedis) await this.client.redis.hset('verifytimer', { [`${guildID}-${userID}`]: JSON.stringify(data) });
		this.timeouts.set(`${guildID}-${userID}`, timeout);
		return timeout;
	}

	deleteTimer(guildID, userID) {
		clearTimeout(this.timeouts.get(`${guildID}-${userID}`));
		this.timeouts.delete(`${guildID}-${userID}`);
		return this.client.redis.hdel('verifytimer', `${guildID}-${userID}`);
	}

	exists(guildID, userID) {
		return this.client.redis.hexists('verifytimer', `${guildID}-${userID}`);
	}
};