const { findBestMatch } = require("string-similarity");
const { Collection } = require("discord.js");
const cooldowns = new Collection();
const { deleteIfAble } = require('../util/util');
// const agreed = new Collection();
const { MessageEmbed } = require('discord.js');
// const { embedURL } = require('../util/util');
// const { stripIndents } = require('common-tags');

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
            const alreadyHasVerifyRole = message.member.roles.cache.has(setting.verifyRole);
            if (message.channel.id === setting.verifyChannelID) {
                if (alreadyHasVerifyRole) {
                    await deleteIfAble(message);
                    return message.channel.send(`you just messaged in a verification channel! to change or remove it, do \`${prefix}setverify [-off]\` or see \`${prefix}help setverify\``).then(m => {
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
        const stare = client.customEmojis.get('staring') ? client.customEmojis.get('staring') : ':thinking:';

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
        if (!commandFile) {
            const matches = findBestMatch(cmd, client.allNameCmds).bestMatch.target;
            return message.channel.send(`:grey_question: maybe you mean \`${prefix}${matches}\` ?`)
                .then(m => setTimeout(() => {
                    m.delete();
                }, 5000));
        };

        if (commandFile.conf.maintenance && !client.config.owners.includes(message.author.id)) return message.reply(`\`${prefix}${cmd}\` is being maintained. try again later ${sed}`)
        if (message.channel.type === "DM" && commandFile.conf.guildOnly) return message.reply(`i can't execute that command inside DMs! ${client.customEmojis.get('duh') ? client.customEmojis.get('duh') : ':thinking:'}`);

        if (!client.config.owners.includes(message.author.id) && commandFile.conf.owner) return;

        if (!message.channel.nsfw && commandFile.conf.adult) {
            if (!message.channel.permissionsFor(message.guild.me).has('EMBED_LINKS')) {
                const msg = await message.channel.send('https://www.youtube.com/watch?v=rTgj1HxmUbg');
                setTimeout(() => {
                    return msg.edit(`https://www.youtube.com/watch?v=rTgj1HxmUbg\n*seriously, turn to a nsfw channel pls*`);
                }, 5000);
            } else {
                const embed2 = new MessageEmbed()
                    .setColor(0x7289DA)
                    .setDescription(`he will shoot anybody who is trying to do this illegal stuff in normal channel\ndo this in a nsfw channel to make him feel happier`)
                    .setTitle('say hi to my uncle')
                    .setImage('https://i.pinimg.com/originals/65/96/27/6596276817293850804c8d07162792d5.jpg')
                return message.channel.send(embed2).catch(() => null)
            };
        };

        if (commandFile.conf.userPerms && message.channel.type !== "dm" && commandFile.conf.userPerms.length) {
            if (!message.member.permissions.has(commandFile.conf.userPerms)) {
                return message.channel.send(`are you a mod? you don't seems to have the ${commandFile.conf.userPerms.map(x => `\`${x}\``).join(" and ")} permission for this ${stare}`);
            }
        };
        if (commandFile.conf.channelPerms && message.channel.type !== 'dm' && commandFile.conf.channelPerms.length) {
            if (!message.channel.permissionsFor(message.guild.me).has(commandFile.conf.channelPerms)) {
                return message.channel.send(`ouch! bruh it seems like i don't have the ${commandFile.conf.channelPerms.map(x => `\`${x}\``).join(" and ")} permission in this channel to properly do that for you ${stare}`);
            };
        }
        if (commandFile.conf.clientPerms && message.channel.type !== "dm" && commandFile.conf.clientPerms.length) {
            if (!message.guild.me.permissions.has(commandFile.conf.clientPerms)) {
                return message.channel.send(`sorry, i don't have the ${commandFile.conf.clientPerms.map(x => `\`${x}\``).join(" and ")} permission across the server to do that ${sed}`)
            };
        };

    //     let globalStorage = client.globalStorage;
    //     let storage = await globalStorage.findOne();
    //     if (!storage) storage = new globalStorage();

    //     const alreadyAgreed = storage.acceptedRules.includes(message.author.id);

    //     if (!alreadyAgreed && !client.config.owners.includes(message.author.id)) {
    //         if (message.channel.type === 'GUILD_TEXT') {
    //             if (!message.channel.permissionsFor(message.guild.me).has('EMBED_LINKS')) return message.channel.send(`uh ${message.author.username}, it seems like you haven't agreed to the rules when using me yet.\nnormally the rules will show up here when you call me for the first time, but this channel has blocked me from showing embed ${sed}\ncan you try it again in an another channel?`);
    //         };
    //         const agreedCount = storage.acceptedRules.toObject();
    //         let key;

    //         if (message.channel.type === 'dm') key = message.author.id;
    //         else key = `${message.author.id}-${message.guild.id}`;

    //         const verifyEmbed = new MessageEmbed()
    //             .setColor('#81c42f')
    //             .addField(`if you have any questions come ask us in:`, `${embedURL('Sefiria (community server)', 'https://discord.gg/kJRAjMyEkY')}\n${embedURL('kiri support (support server)', 'https://discord.gg/D6rWrvS')}`)
    //             .setDescription(stripIndents `
    //             • any actions performed to give other users a bad experience are explicitly against the rules ${sed}
    //             this includes but not limited to:
    //             > using macros/scripts for commands (make me slower in serving other users)
    //             > use any of my features for actions that is against the ${embedURL('Discord Terms of Service', 'https://discord.com/terms')}
    //             • do not use any exploits and report any found in the bot in our server!
    //             • you can not sell/trade token or any bot goods for real money
    // `)
    //             .setFooter(`${agreedCount.length} user have agreed to those rules :)`);

    //         const existingCollector = agreed.get(key);

    //         if (existingCollector) {
    //             await existingCollector.stop();
    //         };
    //         const filter = (reaction, user) => {
    //             return reaction.emoji.name === '👍' && user.id === message.author.id;
    //         };
    //         const verifyMessage = await message.reply(`:warning: you must accept these rules below before using me by reacting with the hands up emojis ${duh}`, verifyEmbed);
    //         await verifyMessage.react('👍');
    //         const collectedEmojis = verifyMessage.createReactionCollector(filter, { max: 1, time: 20000, errors: ['time'] });
    //         agreed.set(key, collectedEmojis);
    //         return agreeCollector(storage, collectedEmojis, message, key);
    //     };
        if (!cooldowns.has(commandFile.help.name)) cooldowns.set(commandFile.help.name, new Collection());

        const cooldownID = message.channel.type === "DM" ? message.author.id : message.author.id + message.guild.id

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
                const timeLeft = (expirationTime - now) / 1000;
                return message.channel.send(`calm down, you are in cooldown :( can you wait **${timeLeft.toFixed(1)}** seconds? ${stare}`)
                    .then(m => setTimeout(() => {
                        m.delete();
                    }, 5000));
            };
            timestamps.set(cooldownID, now);
            setTimeout(() => timestamps.delete(cooldownID), cooldownAmount);
        }

        try {
            if (!commandFile) return;
            commandFile.run(client, message, args, prefix, cmd);
            logger.log('info', `${sender.tag} (${sender.id}) from ${message.channel.type === 'dm' ? 'DM' : `${message.guild.name} (${message.guild.id})`} ran a command: ${prefix}${cmd}`);
  } catch (error) {
    logger.log('error', error);
  }
};

// async function agreeCollector(storage, collector, message, key) {
//   collector.on('collect', async () => {
//     await collector.stop();
//     storage.acceptedRules.push(message.author.id);
//     await storage.save();
//   });
  
//   collector.on('end', () => {
//     agreed.delete(key);
//   });
// }