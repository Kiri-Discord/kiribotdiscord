const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { embedURL, deleteIfAble } = require('../util/util');
const ms = require('ms');

module.exports = async(client, message, setting) => {
        const verifydb = await client.dbverify.findOne({
            guildID: message.guild.id,
            userID: message.author.id,
        });
        if (message.content.trim().toLowerCase().startsWith('resend')) {
            if (!verifydb) {
                deleteIfAble(message);
                const timeMs = setting.verifyTimeout;
                const exists = await client.verifytimers.exists(message.guild.id, message.author.id);
                let code = randomText(10);
                if (exists) {
                    await client.verifytimers.deleteTimer(message.guild.id, message.author.id);
                    await client.verifytimers.setTimer(message.guild.id, !timeMs ? 900000 : timeMs, message.author.id, code, true, !timeMs ? true : false);
                } else {
                    await client.verifytimers.setTimer(message.guild.id, !timeMs ? 900000 : timeMs, message.author.id, code, true, !timeMs ? true : false);
                };
                const footer = timeMs ? `you will be kicked from the server in ${ms(timeMs, {long: true})} to prevent bots and spams` : `this link is expiring in ${ms(900000, {long: true})}`;
                const row = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                        .setStyle('LINK')
                        .setURL(`${client.config.baseURL}verify?valID=${code}`)
                        .setLabel('verify link <3')
                    );
                const dm = new MessageEmbed()
                    .setFooter({text: footer})
                    .setThumbnail(message.guild.iconURL({ size: 4096, dynamic: true }))
                    .setTitle(`welcome to ${message.guild.name}! wait, beep beep, boop boop?`)
                    .setDescription(`please solve the CAPTCHA at this link below to make sure you're human before you join ${message.guild.name}. enter the link below and solve the captcha to verify yourself :slight_smile:\n${embedURL('click me to start the verify process', `${client.config.baseURL}verify?valID=${code}`)}`)
                try { 
                    await message.author.send({content: `if your link was expired, type \`resend\` in ${message.channel.toString()} to get a new one!`, embeds: [dm], components: [row]});
                    return message.channel.send(`<@!${message.author.id}>, please verify yourself using the link i sent you via DM to gain access to the server :)`)
                    .then(i => {
                        setTimeout(() => {
                            i.delete()
                        }, 600000);
                    });
                } catch {
                    return message.channel.send(`<@!${message.author.id}> uh, your DM is locked so i can't send you the verify link. can you unlock it first and type \`resend\` here?`)
                        .then(i => setTimeout(() => {
                            i.delete()
                        }, 600000));
                };
            };
            let valID = verifydb.valID;
            await deleteIfAble(message);
            const dm = new MessageEmbed()
                .setFooter({text: `you will be kicked from the server in ${ms(new Date(verifydb.endTimestamp) - new Date(), {long: true})} to prevent bots and spams`})
                .setThumbnail(message.guild.iconURL({ size: 4096, dynamic: true }))
                .setTitle(`welcome to ${message.guild.name}! wait, beep beep, boop boop?`)
                .setDescription(`please solve the CAPTCHA at this link below to make sure you're human before you join ${message.guild.name}. enter the link below and solve the captcha to verify yourself :slight_smile:\n${embedURL('click me to start the verify process', `${client.config.baseURL}verify?valID=${valID}`)}`)
            try {
                await message.author.send({content: `if your link was expired, type \`resend\` in ${message.channel.toString()} to get a new one!`, embeds: [dm]});
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
        return deleteIfAble(message);
    };
};

function randomText(len) {
    const pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ23456789'.split('');
    const result = [];
    for (let i = 0; i < len; i++) result.push(pool[Math.floor(Math.random() * pool.length)]);
    return result.join('');
};