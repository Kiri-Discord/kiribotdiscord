const { decode: decodeHTML } = require('html-entities');
const yes = ['yes', 'y', 'ye', 'yeah', 'yup', 'yea', 'ya', 'hai', 'si', 'sí', 'oui', 'はい', 'correct'];
const no = ['no', 'n', 'nah', 'nope', 'nop', 'iie', 'いいえ', 'non', 'fuck off'];
const ISO6391 = require('iso-639-1');
const ms = require('ms');
const fetch = require('node-fetch');
// const { URLSearchParams } = require('url');
const { stripIndents } = require('common-tags');
const hugSchema = require('../model/hug');
const punchSchema = require('../model/punch');
const slapSchema = require('../model/slap');
const patSchema = require('../model/pat');
const cuddleSchema = require('../model/cuddle');
const kissSchema = require('../model/kiss');
const musicSchema = require('../model/music');

module.exports = class util {
        static shortenText(text, maxLength) {
            let shorten = false;
            while (text.length > maxLength) {
                if (!shorten) shorten = true;
                text = text.substr(0, text.length - 1);
            }
            return shorten ? `${text}...` : text;
        }
        static randomRange(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };
        static streamToArray(stream) {
            if (!stream.readable) return Promise.resolve([]);
            return new Promise((resolve, reject) => {
                const array = [];

                function onData(data) {
                    array.push(data);
                }

                function onEnd(error) {
                    if (error) reject(error);
                    else resolve(array);
                    cleanup();
                }

                function onClose() {
                    resolve(array);
                    cleanup();
                }

                function cleanup() {
                    stream.removeListener('data', onData);
                    stream.removeListener('end', onEnd);
                    stream.removeListener('error', onEnd);
                    stream.removeListener('close', onClose);
                }
                stream.on('data', onData);
                stream.on('end', onEnd);
                stream.on('error', onEnd);
                stream.on('close', onClose);
            });
        }
        static today(timeZone) {
            const now = new Date();
            now.setHours(0);
            now.setMinutes(0);
            now.setSeconds(0);
            now.setMilliseconds(0);
            if (timeZone) now.setUTCHours(now.getUTCHours() + timeZone);
            return now;
        }
        static tomorrow(timeZone) {
            const today = util.today(timeZone);
            today.setDate(today.getDate() + 1);
            return today;
        }

        static removeDuplicates(arr) {
            if (arr.length === 0 || arr.length === 1) return arr;
            const newArr = [];
            for (let i = 0; i < arr.length; i++) {
                if (newArr.includes(arr[i])) continue;
                newArr.push(arr[i]);
            }
            return newArr;
        }
        static async reactIfAble(message, user, emoji, fallbackEmoji) {
            const dm = !message.guild;
            if (fallbackEmoji && (!dm && !message.channel.permissionsFor(user).has('USE_EXTERNAL_EMOJIS'))) {
                emoji = fallbackEmoji;
            }
            if (dm || message.channel.permissionsFor(user).has(['ADD_REACTIONS', 'READ_MESSAGE_HISTORY'])) {
                try {
                    await message.react(emoji);
                } catch {
                    return null;
                }
            }
            return null;
        }
        static async awaitPlayers(message, max, min = 1) {
            if (max === 1) return [message.author.id];
            const addS = min - 1 === 1 ? '' : 's';
            await message.channel.send(
                `at least ${min - 1} more player${addS} needed for the game to start (at max ${max - 1}). to join, type \`join\``
            );
            const joined = [];
            joined.push(message.author.id);
            const filter = res => {
                if (res.author.bot) return false;
                if (joined.includes(res.author.id)) return false;
                if (res.content.toLowerCase() !== 'join') return false;
                joined.push(res.author.id);
                res.react('✅').catch(() => null);
                return true;
            };
            const verify = await message.channel.awaitMessages(filter, { max: max - 1, time: 60000 });
            verify.set(message.id, message);
            if (verify.size < min) return false;
            return verify.map(player => player.author.id);
        }

        static delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        static list(arr, conj = 'and') {
                const len = arr.length;
                if (len === 0) return '';
                if (len === 1) return arr[0];
                return `${arr.slice(0, -1).join(', ')}${len > 1 ? `${len > 2 ? ',' : ''} ${conj} ` : ''}${arr.slice(-1)}`;
	}

	static firstUpperCase(text, split = ' ') {
		return text.split(split).map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(' ');
	}

	static shorten(text, maxLen = 2000) {
		return text.length > maxLen ? `${text.substr(0, maxLen - 3)}...` : text;
	}

	static base64(text, mode = 'encode') {
		if (mode === 'encode') return Buffer.from(text).toString('base64');
		if (mode === 'decode') return Buffer.from(text, 'base64').toString('utf8') || null;
		throw new TypeError(`${mode} is not a supported base64 mode.`);
	};
	static trimArray(arr, maxLen = 10) {
		if (arr.length > maxLen) {
			const len = arr.length - maxLen;
			arr = arr.slice(0, maxLen);
			arr.push(`${len} more...`);
		}
		return arr;
	}
	static embedURL(title, url, display) {
		return `[${title}](${url.split(')').join('%29')}${display ? ` "${display}"` : ''})`;
	}
	static cleanAnilistHTML(html, removeLineBreaks = true) {
		let clean = html;
		if (removeLineBreaks) clean = clean.replace(/\r|\n|\f/g, '');
		clean = decodeHTML(clean);
		clean = clean
		.split('<br>').join('\n')
		.replace(/<\/?(i|em)>/g, '*')
		.replace(/<\/?b>/g, '**')
		.replace(/~!|!~/g, '||');
		if (clean.length > 2000) clean = `${clean.substr(0, 1995)}...`;
		const spoilers = (clean.match(/\|\|/g) || []).length;
		if (spoilers !== 0 && (spoilers && (spoilers % 2))) clean += '||';
		return clean;
	}
	static formatNumber(number, minimumFractionDigits = 0) {
		return Number.parseFloat(number).toLocaleString(undefined, {
			minimumFractionDigits,
			maximumFractionDigits: 2
		});
	}
	static async verify(channel, user, { time = 30000, extraYes = [], extraNo = [] } = {}) {
		const filter = res => {
			const value = res.content.toLowerCase();
			return (user ? res.author.id === user.id : true)
				&& (yes.includes(value) || no.includes(value) || extraYes.includes(value) || extraNo.includes(value));
		};
		const verify = await channel.awaitMessages(filter, {
			max: 1,
			time
		});
		if (!verify.size) return 0;
		const choice = verify.first().content.toLowerCase();
		if (yes.includes(choice) || extraYes.includes(choice)) return true;
		if (no.includes(choice) || extraNo.includes(choice)) return false;
		return false;
	}
	static async askString(channel, filter, { time = 20000 } = {}) {
		const verify = await channel.awaitMessages(filter, {
			max: 1,
			time
		});
		if (!verify.size) return 0;
		const choice = verify.first().content.toLowerCase();
		if (choice === 'cancel') return false;
		return verify.first();
	};
	static async magikToBuffer(magik) {
		return new Promise((res, rej) => {
			magik.toBuffer((err, buffer) => {
				if (err) return rej(err);
				return res(buffer);
			});
		});
	};
	static async verifyLanguage(channel, user, { time = 30000 } = {}) {
		const filter = res => {
			const value = res.content.toLowerCase();
			const code = ISO6391.getCode(value);
			if (res.author.id === user.id && ISO6391.validate(code)) return true;
		};
		const verify = await channel.awaitMessages(filter, {
			max: 1,
			time
		});
		if (!verify.size) return { isVerify: false };
		const choice = verify.first().content.toLowerCase();
		if (choice === 'cancel') return { isVerify: false };
		const code = ISO6391.getCode(choice)
		return { isVerify: true, choice: code };
	}
	static shuffle(array) {
		const arr = array.slice(0);
		for (let i = arr.length - 1; i >= 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			const temp = arr[i];
			arr[i] = arr[j];
			arr[j] = temp;
		}
		return arr;
	}
	static randomStatus(client) {
		const activities = [
			{
				text: `awake for ${ms(client.uptime)}`,
				type: 'PLAYING'
			},
			{
				text: 'ping me for help <3',
				type: 'PLAYING'
			},
			{
				text: `life in ${client.ws.ping}ms`,
				type: 'WATCHING'
			},
			{
				text: 'kiribot.xyz',
				type: 'WATCHING'
			}
		];
		const activity = activities[Math.floor(Math.random() * activities.length)];
		return { text: activity.text, type: activity.type }
	}
	static async botSitePost(client) {
		if (!process.env.dblToken) return;
		// const header = {
		// 	Authorization: process.env.dblToken
		// }
		// const body = new URLSearchParams()
		// body.append("guilds", client.guilds.cache.size);
		// body.append("users", client.users.cache.size);
		// fetch(`https://discordbotlist.com/api/v1/bots/sefy/stats`, {
		// 	method: "POST",
		// 	body,
		// 	headers: header
		// });

	}
	static async pickWhenMany(message, arr, defalt, arrListFunc, { time = 30000 } = {}) {
		const resultsList = arr.map(arrListFunc);
		await message.channel.send(stripIndents`
			**${arr.length} results was found, which would you like to get more information?**
			${resultsList.join('\n')}
			*this will timeout in 30 seconds*
		`);
		const filter = res => {
			if (res.author.id !== message.author.id) return false;
			const num = Number.parseInt(res.content, 10);
			if (!num) return false;
			return num > 0 && num <= arr.length;
		};
		const messages = await message.channel.awaitMessages(filter, { max: 1, time });
		if (!messages.size) return defalt;
		return arr[Number.parseInt(messages.first().content, 10) - 1];
	};
	static msToHMS(duration) {
        var seconds = parseInt((duration / 1000) % 60)
        var minutes = parseInt((duration / (1000 * 60)) % 60)
        var hours = parseInt((duration / (1000 * 60 * 60)));

        hours = (hours < 10) ? '0' + hours : hours;
        minutes = (minutes < 10) ? '0' + minutes : minutes;
        seconds = (seconds < 10) ? '0' + seconds : seconds;
        return hours + ':' + minutes + ':' + seconds;
	}
	};
	static async purgeDbGuild(client, id) {
		client.guildsStorage.delete(id);
		client.queue.delete(id);
	
		await client.dbguilds.findOneAndDelete({
			guildID: id
		});
	
		await client.dbverify.deleteMany({
			guildID: id,
		});
			
		await client.dbembeds.deleteMany({
			guildID: id,
		});
		
		await client.dbleveling.deleteMany({
			guildId: id,
		});
		await client.cooldowns.deleteMany({
			guildId: id
		});
	
		await client.garden.deleteMany({
			guildId: id
		});

		await client.inventory.deleteMany({
			guildId: id
		});

		await client.money.deleteMany({
			guildId: id
		});
	
	
		await client.love.deleteMany({
			guildID: id
		});
	
		await client.gameStorage.deleteMany({
			guildId: id
		});
	
		await hugSchema.deleteMany({
			guildId: id,
		});
	
		await punchSchema.deleteMany({
			guildId: id,
		});
	
		await musicSchema.deleteMany({
			guildId: id,
		});
	
		await slapSchema.deleteMany({
			guildId: id,
		});
	
		await cuddleSchema.deleteMany({
			guildId: id,
		});
	
		await kissSchema.deleteMany({
			guildId: id,
		});
	
		await patSchema.deleteMany({
			guildId: id,
		});
		return true;
	};
	static async purgeDbUser(client, guildId, userId) {
		await client.dbleveling.findOneAndDelete({
			guildId: guildId,
			userId: userId,
		});
	
		await client.dbverify.findOneAndDelete({
			guildID: guildId,
			userID: userId,
		});
		await client.cooldowns.findOneAndDelete({
			guildId: guildId,
			userId: userId,
		});
		await client.garden.findOneAndDelete({
			guildId: guildId,
			userId: userId,
		});
		await client.gameStorage.findOneAndDelete({
			guildId: guildId,
			userId: userId,
		});
		await client.money.findOneAndDelete({
			guildId: guildId,
			userId: userId,
		});
		await client.inventory.findOneAndDelete({
			guildId: guildId,
			userId: userId,
		});

		await client.love.findOneAndDelete({
			guildID: guildId,
		    userID: userId,
		});
		await hugSchema.findOneAndDelete({
			userId: userId,
			guildId: guildId,
		});
		await punchSchema.findOneAndDelete({
			userId: userId,
			guildId: guildId,
		});
		await slapSchema.findOneAndDelete({
			userId: userId,
			guildId: guildId,
		});
		await cuddleSchema.findOneAndDelete({
			userId: userId,
			guildId: guildId,
		});
		await kissSchema.findOneAndDelete({
			userId: userId,
			guildId: guildId,
		});
		await patSchema.findOneAndDelete({
			userId: userId,
			guildId: guildId,
		});
		return true;
	};
};

const inGame = [];
module.exports.inGame = inGame;