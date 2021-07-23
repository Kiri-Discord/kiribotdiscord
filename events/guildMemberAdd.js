const { MessageEmbed } = require("discord.js");
const pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ23456789'.split('');
const ms = require("ms");
const { embedURL } = require('../util/util')

module.exports = async(client, member) => {

        if (member.user.bot) return;

        const setting = await client.dbguilds.findOne({
            guildID: member.guild.id
        });

        const roleExist = member.guild.roles.cache.get(setting.verifyRole);
        const verifyChannel = member.guild.channels.cache.get(setting.verifyChannelID);

        const alreadyHasRole = member._roles.includes(setting.verifyRole);

        if (roleExist && verifyChannel && !alreadyHasRole) {
            const startVerify = async() => {
                    const lookingEmoji = client.customEmojis.get('looking') ? client.customEmojis.get('looking') : ':eyes:';
                    const timeMs = setting.verifyTimeout || ms('10m');
                    const exists = await client.verifytimers.exists(member.guild.id, member.user.id);
                    if (exists) {
                        await client.verifytimers.deleteTimer(member.guild.id, member.user.id);
                        await client.verifytimers.setTimer(member.guild.id, timeMs, member.user.id);
                    } else {
                        await client.verifytimers.setTimer(member.guild.id, timeMs, member.user.id);
                    };
                    let code = randomText(10);
                    await client.dbverify.findOneAndUpdate({
                        guildID: member.guild.id,
                        userID: member.user.id,
                    }, {
                        guildID: member.guild.id,
                        userID: member.user.id,
                        valID: code,
                        endTimestamp: new Date(Date.now() + timeMs)
                    }, {
                        upsert: true,
                        new: true
                    });
                    const dm = new MessageEmbed()
                        .setFooter(`you will be kicked from the server in \`${ms(timeMs, {long: true})}\` to prevent bots and spams`)
                        .setThumbnail(member.guild.iconURL({ size: 4096, dynamic: true }))
                        .setTitle(`welcome to ${member.guild.name}! wait, beep beep, boop boop?`)
                        .setDescription(`please solve the CAPTCHA at this link below to make sure you're human before you join ${member.guild.name}. enter the link below and solve the captcha to verify yourself :slight_smile:\n${embedURL('click me to start the verify process', `||${__baseURL}verify?valID=${code}||`)}`)
            try {
                await member.send(dm);
                return verifyChannel.send(`:tada: well done ${member}! now check your DM for a verify link ${lookingEmoji}`).then(i => i.delete({ timeout: 5000 }));
            } catch {
                verifyChannel.send(`<@!${member.user.id}> uh, your DM is locked so i can't send you the verify link. can you unlock it first and type \`resend\` here?`)
                    .then(i => i.delete({ timeout: 10000 }));
            };
        }
        const waveEmoji = client.customEmojis.get('wave') ? client.customEmojis.get('wave') : ':wave:';
        const filter = (reaction, user) => {
            return reaction.emoji.name === '👋' && user.id === member.user.id;
        };
        const verifyMessage = await verifyChannel.send(`hey ${member} ${waveEmoji}, welcome to ${member.guild.name}! in order to start the verification, react to the below reaction first!\nyou will be kicked for not reacting in \`4 minutes\``);
        await verifyMessage.react('👋');
        const collected = await verifyMessage.awaitReactions(filter, { max: 1, time: 240000 });
        if (!collected.size) {
            await verifyMessage.delete();
            if (member._roles.includes(setting.verifyRole)) return;
            let reason = 'Kiri verification timeout (Step 1)';
            const logChannel = member.guild.channels.cache.get(setting.logChannelID);
            const logembed = new MessageEmbed()
                .setAuthor(`Verification`, client.user.displayAvatarURL())
                .setTitle(`${member.user.tag} was kicked`)
                .addField(`Progress`, `Step 1`)
                .setColor("#ff0000")
                .setThumbnail(member.user.displayAvatarURL({ size: 4096, dynamic: true }))
                .addField('Username', member.user.tag)
                .addField('User ID', member.id)
                .addField('Kicked by', client.user.toString())
                .addField('Reason', reason)
                .setTimestamp()
            const logerror = new MessageEmbed()
                .setAuthor(`Verification`, client.user.displayAvatarURL())
                .setTitle(`Failed while kicking ${member.user.tag}`)
                .addField(`Progress`, `Step 2`)
                .setDescription(`i can't kick that unverified member because critical permission was not met :pensive:`)
                .setColor('#ff0000')
                .setTimestamp()
                .setThumbnail(member.user.displayAvatarURL())
            if (!member.kickable) {
                if (logChannel) return logChannel.send(logerror);
                else return;
            } else {
                if (logChannel) await logChannel.send(logembed);
                await member.send(`i have kicked you from **${member.guild.name}** for failing the verification (at step 1) :pensive:`).catch(() => {
                    null
                });
                return member.kick(reason);
            }
        } else {
            await verifyMessage.delete();
            return startVerify();
        }
    };
}

function randomText(len) {
    const result = [];
    for (let i = 0; i < len; i++) result.push(pool[Math.floor(Math.random() * pool.length)]);
    return result.join('');
}