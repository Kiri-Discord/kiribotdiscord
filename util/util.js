const { decode: decodeHTML } = require('html-entities');
const yes = ['yes', 'y', 'ye', 'yeah', 'yup', 'yea', 'ya', 'hai', 'si', 'sí', 'oui', 'はい', 'correct'];
const no = ['no', 'n', 'nah', 'nope', 'nop', 'iie', 'いいえ', 'non', 'fuck off'];
const ISO6391 = require('iso-639-1');
const ms = require('ms');

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
		const today = Util.today(timeZone);
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
			`you will need at least ${min - 1} more player${addS} (at max ${max - 1}). to join, type \`join game\`.`
		);
		const joined = [];
		joined.push(message.author.id);
		const filter = res => {
			if (res.author.bot) return false;
			if (joined.includes(res.author.id)) return false;
			if (res.content.toLowerCase() !== 'join game') return false;
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
	}
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
				text: 'your heart',
				type: 'LISTENING'
			},
			{
				text: '@Sefy help',
				type: 'LISTENING'
			},
			{
				text: `life in ${client.ws.ping}ms`,
				type: 'WATCHING'
			}
		];
		const activity = activities[Math.floor(Math.random() * activities.length)];
		return { text: activity.text, type: activity.type }
	}
};

const inGame = [];
module.exports.inGame = inGame;
