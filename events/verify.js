const Discord = require('discord.js');
const { createCanvas, registerFont } = require('canvas');
const path = require('path');
registerFont(path.join(__dirname, '..', 'assets', 'fonts', 'Captcha.ttf'), { family: 'Captcha' });

module.exports = async (client, message) => {
	if (message.author.bot || message.author === client.user) return;

	if (message.channel.type === 'dm') return;


	const setting = await client.dbguilds.findOne({
		guildID: message.guild.id,
	});
	const verifydb = await client.dbverify.findOne({
		guildID: message.guild.id,
		userID: message.author.id,
	});


	const alreadyHasRole = message.member._roles.includes(setting.verifyRole);

	try {
		if (message.channel.id === setting.verifyChannelID) {
			if (message.content.startsWith('resend')) {
				if (!verifydb) return;
				let code = verifydb.code;
				await message.delete();
				const canvas = createCanvas(125, 32);
				const ctx = canvas.getContext('2d');
				const text = code;
				ctx.fillStyle = 'white';
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.beginPath();
				ctx.strokeStyle = '#0088cc';
				ctx.font = '26px Captcha';
				ctx.rotate(-0.05);
				ctx.strokeText(text, 15, 26);
				let verifyChannel = message.guild.channels.cache.find(ch => ch.id === setting.verifyChannelID);
				const dm = new Discord.MessageEmbed()
				.setThumbnail(message.guild.iconURL({size: 4096, dynamic: true}))
				.attachFiles({ attachment: canvas.toBuffer(), name: 'captcha.png' })
				.setImage(`attachment://captcha.png`)
				.setColor('RANDOM')
				.setTitle(`Welcome to ${message.guild.name}! Wait, beep beep, boop boop?`)
				.addField(`Hello! Before you get started, I just want you to verify yourself first.`, `Enter what you see in the captcha into the channel ${verifyChannel} to verify yourself.`)
				await message.author.send(dm).catch(() => {
					return message.reply('your DM is still locked. unlock your DM first :D')
						.then(i => i.delete({ timeout: 10000 }));
				});

				return message.reply('check your DM.').then(i => i.delete({ timeout: 10000 }));
			}
			if (!alreadyHasRole) {
				if (!verifydb) return;
				if (!message.author.bot) {
					let code = verifydb.code;
					if (message.content !== `${code}`) {
						await message.delete();
						message.reply('are you sure that it is the right code?').then(i => i.delete({ timeout: 10000 }));
					}
					if (message.content === `${code}`) {
						await message.delete();
						await client.dbverify.findOneAndDelete({
							guildID: message.guild.id,
							userID: message.author.id,
						});
						await message.member.roles.add(setting.verifyRole).catch(() => {
							message.reply('oof, so this guild\'s mod forgot to give me the role \`MANAGE_ROLES\` :( can you ask them to verify you instead?').then(i => i.delete({ timeout: 7500 }));
						})
						await client.verifytimers.deleteTimer(message.guild.id, message.author.id);
						return message.author.send(`${message.author}, you have passed my verification! Welcome to ${message.guild.name}!`).catch(() => {
							return;
						})
					}
				}
			}
		}
	}
	catch (error) {
		return;
	}
};

