const { MessageEmbed } = require('discord.js');

module.exports = async (client, message) => {
	if (message.channel.type !== 'dm') {
		const verifydb = await client.dbverify.findOne({
			guildID: message.guild.id,
			userID: message.author.id,
		});
		if (message.content.trim().toLowerCase().startsWith('resend')) {
			if (!verifydb) {
				return message.delete();
			};
			let valID = verifydb.valID;
			await message.delete();
			const dm = new MessageEmbed()
			.setTimestamp()
			.setFooter(client.user.username, client.user.displayAvatarURL())
			.setThumbnail(message.guild.iconURL({size: 4096, dynamic: true}))
			.setTitle(`Welcome to ${message.guild.name}! Wait, beep beep, boop boop?`)
			.setDescription(`Hello! Before you join ${message.guild.name}, I just want you to verify yourself first. Enter the link below and solve the captcha to verify yourself. Hurry up, if you don't verify fast you will be kicked from the server to prevent bots and spams :pensive:*`)
			.addField(`Verification link for ${message.author.username}`, `||${__baseURL}verify?valID=${valID}||`)
			await message.author.send(dm).catch(() => {
				return message.inlineReply('your DM is still locked. unlock your DM first then type \`resend\` here :D')
					.then(i => i.delete({ timeout: 10000 }));
			});

			return message.inlineReply('check your DM :grin:').then(i => i.delete({ timeout: 10000 }));
		} else {
			return message.delete();
		}
	}
};
