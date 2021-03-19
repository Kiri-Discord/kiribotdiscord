const Discord = require('discord.js');

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
	if (alreadyHasRole) return;

	try {
		if (message.channel.id === setting.verifyChannelID) {
			if (message.content.startsWith('resend')) {
				if (!verifydb) return;
				let valID = verifydb.valID;
				await message.delete();
				const dm = new Discord.MessageEmbed()
				.setThumbnail(message.guild.iconURL({size: 4096, dynamic: true}))
				.setColor('RANDOM')
				.setTitle(`Welcome to ${message.guild.name}! Wait, beep beep, boop boop?`)
				.setDescription(`Hello! Before you get started, I just want you to verify yourself first. Enter the link below and solve the captcha to verify yourself. Hurry up, if you don't verify fast you will be kicked from the server.\n*sorry, this is the only way to prevent bots from joining the server :pensive:*`)
				.addField(`\u200b`, `||${__baseURL}verify?valID=${valID}||`)
				await message.author.send(dm).catch(() => {
					return message.reply('your DM is still locked. unlock your DM first :D')
						.then(i => i.delete({ timeout: 10000 }));
				});

				return message.reply('check your DM.').then(i => i.delete({ timeout: 10000 }));
			}
		}
	}
	catch (error) {
		return;
	}
};
