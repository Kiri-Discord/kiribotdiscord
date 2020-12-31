module.exports = class VerifyTimer {
	constructor(client) {
		Object.defineProperty(this, 'client', { value: client });
	}

	async fetchAll() {
		const timers = await this.client.redis.hgetall('verifytimer');
		for (let data of Object.values(timers)) {
			data = JSON.parse(data);
			await this.setTimer(data.guildID, new Date(data.time) - new Date(), data.userID, data.title, false);
		}
		return this;
	}

	async setTimer(guildID, time, userID, title, updateRedis = true) {
		const data = { time: new Date(Date.now() + time).toISOString(), guildID, userID, title };
		const timeout = setTimeout(async () => {
			try {
				const user = await this.client.channels.fetch(guildID);
				await channel.send(`🕰️ <@${userID}>, you wanted me to remind you of: **"${title}"**.`);
			} finally {
				await this.client.redis.hdel('verifytimer', `${guildID}-${userID}`);
			}
		}, time);
		if (updateRedis) await this.client.redis.hset('verifytimer', { [`${guildID}-${userID}`]: JSON.stringify(data) });
		return timeout;
	}
	exists(guildID, userID) {
		return this.client.redis.hexists('verifytimer', `${guildID}-${userID}`);
	}
};