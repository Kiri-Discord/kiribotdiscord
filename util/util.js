const { decode: decodeHTML } = require('html-entities');
const yes = ['yes', 'y', 'ye', 'yeah', 'yup', 'yea', 'ya', 'hai', 'si', 'sí', 'oui', 'はい', 'correct'];
const no = ['no', 'n', 'nah', 'nope', 'nop', 'iie', 'いいえ', 'non', 'fuck off'];
const ISO6391 = require('iso-639-1');
const { MessageActionRow, MessageSelectMenu, MessageButton } = require('discord.js');
const inviteRegex = /(https?:\/\/)?(www\.|canary\.|ptb\.)?discord(\.gg|(app)?\.com\/invite|\.me)\/([^ ]+)\/?/gi;
const botInvRegex = /(https?:\/\/)?(www\.|canary\.|ptb\.)?discord(app)?\.com\/(api\/)?oauth2\/authorize\?([^ ]+)\/?/gi;
const hugSchema = require('../model/hug');
const punchSchema = require('../model/punch');
const slapSchema = require('../model/slap');
const patSchema = require('../model/pat');
const cuddleSchema = require('../model/cuddle');
const kissSchema = require('../model/kiss');
const musicSchema = require('../model/music');

module.exports = class util {
        static stripInvites(str, { guild = true, bot = true, text = '[redacted invite]' } = {}) {
            if (guild) str = str.replace(inviteRegex, text);
            if (bot) str = str.replace(botInvRegex, text);
            return str;
        };
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
        };
        static async deleteIfAble(message) {
            if (message.channel.permissionsFor(message.guild.me).has('MANAGE_MESSAGES')) {
                await message.delete();
            } else return null;
        };
        static async awaitPlayers(initialId, message, max, min = 1) {
            if (max === 1) return [initialId];
            const addS = min - 1 === 1 ? '' : 's';
            await message.channel.send(
                `at least ${min - 1} more player${addS} needed for the game to start (at max ${max - 1}). to join, type \`join\``
            );
            const joined = [];
            joined.push(initialId);
            const filter = res => {
                if (res.author.bot) return false;
                if (joined.includes(res.author.id)) return false;
                if (res.content.toLowerCase() !== 'join') return false;
                joined.push(res.author.id);
                res.react('✅').catch(() => null);
                return true;
            };
            const verify = await message.channel.awaitMessages({ filter, max: max - 1, time: 60000 });
            if (verify.size < min - 1) return false;
            const players = [...verify.values()];
            return players.map(player => player.author.id);
        };

        static delay(ms, arg) {
            return new Promise(resolve => setTimeout(resolve, ms, arg));
        };
        static list(arr, conj = 'and') {
                const len = arr.length;
                if (len === 0) return '';
                if (len === 1) return arr[0];
                return `${arr.slice(0, -1).join(', ')}${len > 1 ? `${len > 2 ? ',' : ''} ${conj} ` : ''}${arr.slice(-1)}`;
	};

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
		const verify = await channel.awaitMessages({
			filter,
			max: 1,
			time
		});
		if (!verify.size) return 0;
		const choice = verify.first().content.toLowerCase();
		if (yes.includes(choice) || extraYes.includes(choice)) return true;
		if (no.includes(choice) || extraNo.includes(choice)) return false;
		return false;
	};
	static async buttonVerify(channel, user, content, { time = 30000 } = {}) {
		const row = new MessageActionRow()
		.addComponents(
			new MessageButton()
			.setCustomId('yes')
			.setLabel('yes')
			.setStyle('PRIMARY'),
			new MessageButton()
			.setCustomId('no')
			.setLabel('no')
			.setStyle('SECONDARY')
		);
		const msg = await channel.send({
			content,
			components: [row]
		})
		const filter = async res => {
            if (res.user.id !== user.id) {
                await res.reply({
					content: `those buttons are for ${user.toString()}!`,
                    ephemeral: true
                });
                return false;
            };
			await res.deferUpdate();
            row.components.forEach(button => button.setDisabled(true));
            await res.editReply({
				content,
                components: [row]
            });
            return true;
        };
		try {
			const res = await msg.awaitMessageComponent({
				filter,
				componentType: 'BUTTON',
				time
			});
			row.components.forEach(button => button.setDisabled(true));
			await msg.edit({
				components: [row]
			});
			return res.customId === 'yes';
		} catch {
			row.components.forEach(button => button.setDisabled(true));
			await msg.edit({
				components: [row]
			});
			return false;
		};
	};
	static async askString(channel, filter, { time = 20000 } = {}) {
		const verify = await channel.awaitMessages({
			filter: filter,
			max: 1,
			time
		});
		if (!verify.size) return 0;
		const choice = verify.first().content.toLowerCase();
		if (choice === 'cancel') return false;
		return verify.first();
	};

	static async paginateEmbed(array, msg, row, filter, initialMsg, { time = 60000 } = {}) {
		let currentPage = 0;
		const collector = msg.createMessageComponentCollector({
			componentType: 'BUTTON',
			filter,
			time
		});
		collector.on('end', async() => {
			row.components.forEach(button => button.setDisabled(true));
			if (msg.editable) return msg.edit({
				content: `page ${currentPage + 1} of ${array.length}`,
				components: [row],
				embeds: [array[currentPage]]
			});
		})
		collector.on('collect', async(res) => {
			switch (res.customId) {
				case 'previousbtn':
					if (currentPage !== 0) {
						--currentPage;
						await res.editReply({
							content: `page ${currentPage + 1} of ${array.length}`,
							// components: [row],
							embeds: [array[currentPage]]
						});
					};
					break;
				case 'nextbtn':
					if (currentPage < array.length - 1) {
						currentPage++;
						await res.editReply({
							content: `page ${currentPage + 1} of ${array.length}`,
							// components: [row],
							embeds: [array[currentPage]]
						})
					};
					break;
				case 'jumpbtn':
					const prompt = await res.followUp({
						embeds: [{
							description: `to what page would you like to jump? (1 - ${array.length}) :slight_smile:`,
							footer: {
								text: "type 'cancel' to cancel the jumping"
							}
						}],
						fetchReply: true
					});
					const filter = async res => {
						if (res.author.id === initialMsg.author.id) {
							const number = res.content;
							await util.deleteIfAble(res);
							if (isNaN(number) || number > array.length || number < 1) {
								return false;
							}
							else return true;
						} else return false;
					};
					const number = await util.askString(initialMsg.channel, filter, { time: 15000 });
					if (number === 0 || !number) return prompt.delete();
					else {
                        await prompt.delete();
						currentPage = parseInt(number) - 1;
						await res.editReply({
							content: `page ${number} of ${array.length}`,
							// components: [row],
							embeds: [array[currentPage]]
						});
				    };

					break;
				case 'clearbtn':
					collector.stop();
					break;
			};
		});
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
		const verify = await channel.awaitMessages({
			filter,
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
	};
	static sec(string) {
		const parts = string.split(':');
		let seconds = 0;
		let minutes = 1;
	
		while (parts.length > 0) {
			seconds += minutes * Number.parseInt(parts.pop(), 10);
			minutes *= 60;
		};
		return seconds;
	};
	static async pickWhenMany(message, arr, defalt, arrListFunc, { time = 30000 } = {}) {
		const resultsList = arr.map(arrListFunc);
		const menu = new MessageSelectMenu()
        .setCustomId('search')
        .setMaxValues(1)
        .addOptions(resultsList)
        .setPlaceholder('choose a result');
        const row = new MessageActionRow()
        .addComponents(menu)
		if (!message.isCommand()) {
			const msg = await message.channel.send({
				embeds: [{ 
					color: '#bee7f7', 
					description: `**${arr.length} results was found, which would you like to get more information?**`,
					footer: {
						text: `this will timeout in 30 seconds`
					}
				}],
				components: [row]
			});
			const filter = async (res) => {
				if (res.user.id !== message.author.id) {
					await res.deferReply({
						ephemeral: true
					});
					await res.reply({
						embeds: [{
							description: `this menu doesn't belong to you :pensive:`
						}],
						ephemeral: true
					});
					return false;
				} else {
					await res.deferUpdate();
					row.components.forEach(component => component.setDisabled(true));
					await res.editReply({ 
						embeds: [{ 
							color: '#bee7f7', 
							description: `this command is now inactive :pensive:` 
						}],
						components: [row]
					});
					return true;
				};
			};
			try {
				const response = await msg.awaitMessageComponent({
					componentType: 'SELECT_MENU',
					filter, 
					time
				});
				return arr[parseInt(response.values[0])];
			} catch (error) {
				return defalt;
			};
		} else {
			const msg = await message.editReply({
				embeds: [{ 
					color: '#bee7f7', 
					description: `**${arr.length} results was found, which would you like to get more information?**`,
					footer: {
						text: `this will timeout in 30 seconds`
					}
				}],
				components: [row],
				fetchReply: true
			});
			const filter = async (res) => {
				if (res.user.id !== message.user.id) {
					await res.deferReply({
						ephemeral: true
					});
					await res.reply({
						embeds: [{
							description: `this menu doesn't belong to you :pensive:`
						}],
						ephemeral: true
					});
					return false;
				} else {
					await res.deferUpdate();
					row.components.forEach(component => component.setDisabled(true));
					await res.editReply({ 
						embeds: [{ 
							color: '#bee7f7', 
							description: `this command is now inactive :pensive:` 
						}],
						components: [row]
					});
					return true;
				};
			};
			try {
				const response = await msg.awaitMessageComponent({
					componentType: 'SELECT_MENU',
					filter, 
					time
				});
				return arr[parseInt(response.values[0])];
			} catch (error) {
				return defalt;
			};
		};
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
	static async purgeDbGuild(client, id) {
		client.guildsStorage.delete(id);
	
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