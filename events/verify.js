const { MessageEmbed } = require('discord.js');
const { embedURL, deleteIfAble } = require('../util/util');
const ms = require('ms');

module.exports = async(client, message) => {
        if (message.channel.type !== 'GUILD_TEXT') return;
        const verifydb = await client.dbverify.findOne({
            guildID: message.guild.id,
            userID: message.author.id,
        });
        if (message.content.trim().toLowerCase().startsWith('resend')) {
            if (!verifydb) return deleteIfAble(message);
            let valID = verifydb.valID;
            await message.delete();
            const dm = new MessageEmbed()
                .setFooter(`you will be kicked from the server in ${ms(new Date(verifydb.endTimestamp) - new Date(), {long: true})} to prevent bots and spams`)
                .setThumbnail(message.guild.iconURL({ size: 4096, dynamic: true }))
                .setTitle(`welcome to ${message.guild.name}! wait, beep beep, boop boop?`)
                .setDescription(`please solve the CAPTCHA at this link below to make sure you're human before you join ${message.guild.name}. enter the link below and solve the captcha to verify yourself :slight_smile:\n${embedURL('click me to start the verify process', `${__baseURL}verify?valID=${valID}`)}`)
        try {
            await message.author.send(dm);
            return message.channel.send('check your DM :grin:').then(i => {
                setTimeout(() => {
                    i.delete();
                }, 10000);
            });
        } catch {
            return message.channel.send('your DM is still locked. unlock your DM first then type \`resend\` here :D')
                .then(i => {
                    setTimeout(() => {
                        i.delete();
                    }, 20000);
                });
        };
    } else {
        if (message.channel.permissionsFor(message.guild.me).has('MANAGE_MESSAGES')) return message.delete();
    }
};