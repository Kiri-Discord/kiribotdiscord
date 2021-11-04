const { Collection } = require("discord.js");
const cooldowns = new Collection();
const { deleteIfAble, reactIfAble } = require('../util/util');
const { MessageEmbed } = require('discord.js');

module.exports = async(client, message) => {
        if (!client.finished) return;
        if (message.author.bot) return;

        let prefix;
        let setting;

        if (message.channel.type === "DM") {
            prefix = client.config.prefix
        } else {
            setting = client.guildsStorage.get(message.guild.id);
            if (!setting) {
                const dbguilds = client.dbguilds;
                setting = new dbguilds({
                    guildID: message.guild.id
                });
                client.guildsStorage.set(message.guild.id, setting);
                await setting.save();
                prefix = setting.prefix;
            } else {
                prefix = setting.prefix;
            }
            if (!message.channel.permissionsFor(message.guild.me).has('SEND_MESSAGES')) return;
            const alreadyHasVerifyRole = message.member._roles.includes(setting.verifyRole);
            if (message.channel.id === setting.verifyChannelID) {
                if (alreadyHasVerifyRole) {
                    await deleteIfAble(message);
                    return message.channel.send(`you just messaged in a verification channel! to change or remove it, do \`${prefix}set-verify -off\` or see \`${prefix}help set-verify\``).then(m => {
                        setTimeout(() => {
                            m.delete();
                        }, 4000);
                    });
                } else {
                    return client.emit('verify', message);
                };
            };
            if (setting.enableLevelings && message.channel.type === "GUILD_TEXT") {
                client.emit('experience', message, setting);
            };
        };
        const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);


        if (!prefixRegex.test(message.content)) return;
        const [, matchedPrefix] = message.content.match(prefixRegex);

        const sed = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:';
        const duh = client.customEmojis.get('duh') ? client.customEmojis.get('duh') : ':blush:';

        let execute = message.content.slice(matchedPrefix.length).trim();
        if (!execute) {
            const prefixMention = new RegExp(`^<@!?${client.user.id}>( |)$`);
            if (prefixMention.test(matchedPrefix)) {
                return message.channel.send(`you just summon me! to use some command, either ping me or use \`${prefix}\` as a prefix! to get help, use \`${prefix}help\`! cya ${duh}`).then(m => {
                    setTimeout(() => {
                        m.delete()
                    }, 5000);
                });
            } else {
                return;
            };
        };
        let args = execute.split(/ +/g);
        let cmd = args.shift().toLowerCase();
        let sender = message.author;

        message.flags = []
        while (args[0] && args[0][0] === "-") {
            message.flags.push(args.shift().slice(1));
        };


        let commandFile = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
        if (!commandFile) return;
        if (commandFile.conf.maintenance && !client.config.owners.includes(message.author.id)) return message.reply(`\`${prefix}${cmd}\` is being maintained. try again later ${sed}`);
        if (message.channel.type === "DM" && commandFile.conf.guildOnly) return message.reply(`i can't execute that command inside DMs! ${client.customEmojis.get('duh') ? client.customEmojis.get('duh') : ':thinking:'}`);

        if (!client.config.owners.includes(message.author.id) && commandFile.conf.owner) return;

        if (!message.channel.nsfw && commandFile.conf.adult) {
            if (!message.channel.permissionsFor(message.guild.me).has('EMBED_LINKS')) {
                return message.channel.send('seriously, turn to a nsfw channel pls');
            } else {
                const embed2 = new MessageEmbed()
                    .setColor(0x7289DA)
                    .setDescription(`you met the void that belongs to people that run my NSFW commands at normal channel..\nplease consider running it in a proper NSFW channel to escape this place ${sed}`)
                    .setTitle('where is this place?')
                    .setImage('https://i.redd.it/bo81jbsoqnw41.png')
                return message.channel.send({ embeds: [embed2] }).catch(() => null)
            };
        };

        if (commandFile.conf.userPerms && message.channel.type !== "DM" && commandFile.conf.userPerms.length) {
            if (!message.member.permissions.has(commandFile.conf.userPerms)) {
                return message.channel.send(`are you a mod? you don't seems to have the ${commandFile.conf.userPerms.map(x => `\`${x}\``).join(" and ")} permission for this dear :pensive:`);
        };
    };
    if (commandFile.conf.channelPerms && message.channel.type !== 'DM' && commandFile.conf.channelPerms.length) {
        if (!message.channel.permissionsFor(message.guild.me).has(commandFile.conf.channelPerms)) {
            return message.channel.send(`ouch! it seems like i don't have the ${commandFile.conf.channelPerms.map(x => `\`${x}\``).join(" and ")} permission in this channel to properly do that for you :pensive:`);
        };
    }
    if (commandFile.conf.clientPerms && message.channel.type !== "DM" && commandFile.conf.clientPerms.length) {
        if (!message.guild.me.permissions.has(commandFile.conf.clientPerms)) {
            return message.channel.send(`sorry, i don't have the ${commandFile.conf.clientPerms.map(x => `\`${x}\``).join(" and ")} permission across the server to do that ${sed}`)
        };
    };
    if (!cooldowns.has(commandFile.help.name)) cooldowns.set(commandFile.help.name, new Collection());

    const cooldownID = message.channel.type === "DM" ? message.author.id : message.author.id + message.guild.id;

    const now = Date.now();
    const timestamps = cooldowns.get(commandFile.help.name);
    const cooldownAmount = (commandFile.conf.cooldown || 3) * 1000;

    if (!timestamps.has(cooldownID)) {
        if (!client.config.owners.includes(message.author.id)) {

            timestamps.set(cooldownID, now);
        }
    } else {
        const expirationTime = timestamps.get(cooldownID) + cooldownAmount;

        if (now < expirationTime) {
            return reactIfAble(message, client.user, '🐌');
        };
        timestamps.set(cooldownID, now);
        setTimeout(() => timestamps.delete(cooldownID), cooldownAmount);
    };

    try {
        commandFile.run(client, message, args, prefix, cmd);
        logger.log('info', `${sender.tag} (${sender.id}) from ${message.channel.type === 'DM' ? 'DM' : `${message.guild.name} (${message.guild.id})`} ran a command: ${prefix}${cmd}`);
    } catch (error) {
        message.channel.send(`sorry, i got an error while executing that command for you. please seek some support if this happen frequently ${duh}`)
        logger.log('error', error);
    };
};