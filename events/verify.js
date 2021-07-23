const { MessageEmbed } = require('discord.js');
const { MessageButton } = require('discord-buttons');
const ms = require('ms');

module.exports = async(client, message) => {
    if (message.channel.type !== 'dm') {
        const verifydb = await client.dbverify.findOne({
            guildID: message.guild.id,
            userID: message.author.id,
        });
        if (message.content.trim().toLowerCase().startsWith('resend')) {
            if (!verifydb && message.channel.permissionsFor(message.guild.me).has('MANAGE_MESSAGES')) return message.delete();
            let valID = verifydb.valID;
            await message.delete();
            const button = new MessageButton()
                .setStyle('url')
                .setURL(`||${__baseURL}verify?valID=${valID}||`)
                .setLabel('click me to start the verify process');
            const dm = new MessageEmbed()
                .setFooter(`you will be kicked from the server in \`${ms(new Date(verifydb.endTimestamp) - new Date(), {long: true})}\` to prevent bots and spams`)
                .setThumbnail(member.guild.iconURL({ size: 4096, dynamic: true }))
                .setTitle(`welcome to ${member.guild.name}! wait, beep beep, boop boop?`)
                .setDescription(`please solve the CAPTCHA at this link below to make sure you're human before you join ${member.guild.name}. enter the link below and solve the captcha to verify yourself :slight_smile:`)
            await member.send(dm, button).catch(() => {
                return message.channel.send('your DM is still locked. unlock your DM first then type \`resend\` here :D')
                    .then(i => i.delete({ timeout: 10000 }));
            });
            return message.channel.send('check your DM :grin:').then(i => i.delete({ timeout: 10000 }));
        } else {
            if (message.channel.permissionsFor(message.guild.me).has('MANAGE_MESSAGES')) return message.delete();
        }
    }
};