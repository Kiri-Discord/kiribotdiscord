const varReplace = require('../../util/variableReplace');
const { MessageEmbed } = require('discord.js');
const { askString } = require('../../util/util');

exports.run = async(client, message, args, prefix) => {
        const db = client.guildsStorage.get(message.guild.id);
        if (args[0] === "on") {
            db.enableLevelings = true;
            await client.dbguilds.findOneAndUpdate({
                guildID: message.guild.id,
            }, {
                enableLevelings: true
            });
            return message.channel.send({ embeds: [{ color: "#bee7f7", description: `☑️ levelings has been enabled` }] });
        } else if (args[0] === "off") {
            db.enableLevelings = false;
            await client.dbguilds.findOneAndUpdate({
                guildID: message.guild.id,
            }, {
                enableLevelings: false
            })
            return message.channel.send({ embeds: [{ color: "#bee7f7", description: `❌ levelings has been disabled` }] });
        } else if (args[0] === "announce") {
            if (!args[1]) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `you haven't specified a destination for your leveling message yet!\nyou should choose one by using \`${prefix}leveling announce <there / #channel>\`!` }] });
            if (args[1] === 'there') {
                const setting = await client.dbguilds.findOne({
                    guildID: message.guild.id
                });
                db.levelings.destination = null;
                setting.levelings.destination = null;
                await setting.save();
                return message.channel.send({ embeds: [{ color: "#bee7f7", description: `☑️ levelings announcement will now be send in the same channel that the user is active!` }] })
            } else {
                const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
                if (!channel) return message.channel.send({ embeds: [{ color: "#bee7f7", description: 'i can\'t find that channel. pls mention a channel within this guild 😔' }] });
                if (!channel.permissionsFor(message.guild.me).has(['EMBED_LINKS', 'SEND_MESSAGES'])) return message.reply({ embeds: [{ color: "#bee7f7", description: `i don't have the perms to send leveling announcement to ${channel}!\nplease allow the permission \`EMBED_LINKS\` **and** \`SEND_MESSAGES\` for me there before trying again please :pensive:` }] });
                const setting = await client.dbguilds.findOne({
                    guildID: message.guild.id
                });
                db.levelings.destination = channel.id;
                setting.levelings.destination = channel.id;
                await setting.save();
                return message.channel.send({ embeds: [{ color: "#bee7f7", description: `☑️ levelings announcement will now be send in ${channel}!` }] })
            };
        } else if (args[0] === "content") {
            let contentObject;
            const types = ['plain', 'embed'];
            const embed = new MessageEmbed()
                .setFooter('this message will be timed out in 20 seconds')
                .setDescription(`what type of message do you want to set as the goodbye message? type either ${types.map(x => `\`${x}\``).join(' or ')} to choose :slight_smile:`)
        await message.channel.send({embeds: [embed]});
        const filter = res => {
            if (res.author.id !== message.author.id) return false; 
            if (!types.includes(res.content)) {
                res.reply({ embeds: [{ color: "#bee7f7", description: `\`${res.content}\` is not a valid type for the goodbye message :pensive: you should choose again with either ${types.map(x => `\`${x}\``).join(" or ")}` }] });
                return false;
            };
            return true;
        };
        const type = await askString(message.channel, filter);
        if (type === 0) return message.channel.send(`the setup is cancelled :pensive:`);
        if (!type) return message.channel.send("you didn't say anything :pensive:");
        if (type.content.toLowerCase() === 'plain') {
            const embed2 = new MessageEmbed()
                .setDescription(`plain it is! so what content do you want to put in the goodbye message?\ntips: variable is supported! feel free to check out at \`${prefix}variables\`.`)
                .setFooter('this message will be timed out in 2 minutes. you can also cancel this setup by "cancel"');
            await message.channel.send({embeds: [embed2]})
            const content = await askString(message.channel, res => res.author.id === message.author.id, { time: 120000 });
            if (!content) return message.channel.send(`the setup is cancelled :pensive:`);
            if (content === 0) return message.channel.send("you didn't say anything :pensive:");
            contentObject = {
                type: 'plain',
                content: content.content
            };
        } else if (type.content.toLowerCase() === 'embed') {
            let embedsStorage = client.dbembeds;
            let storage = await embedsStorage.findOne({
                guildID: message.guild.id
            });
            if (!storage) storage = new embedsStorage({
                guildID: message.guild.id
            });;
            if (!storage.embeds.toObject().length) return message.reply({ embeds: [{ color: "#bee7f7", description: `there aren't any embed created on this server yet :pensive: to create a new embed, do \`${prefix}embeds new\`!` }] });
            const embed2 = new MessageEmbed()
                .setDescription(`what is the embed ID that you want to apply? :slight_smile:`)
                .setFooter('this message will be timed out in 20 seconds. you can also cancel this setup by "cancel"');
            await message.channel.send({embeds: [embed2]});
            const content = await askString(message.channel, res => res.author.id === message.author.id);
            if (content === 0) return message.channel.send(`the setup is cancelled :pensive:`);
            if (!content) return message.channel.send("you didn't say anything :pensive:");
            const targetEmbed = storage.embeds.toObject().find(x => x._id === content.content);
            if (!targetEmbed) return content.reply({ embeds: [{ color: "#bee7f7", description: `there aren't any embed created on this server name \`${content.content}\` :pensive: to create a new embed, do \`${prefix}embeds new\`!` }] });
            contentObject = {
                type: 'embed',
                content: targetEmbed
            };
        };
        const setting = await client.dbguilds.findOne({
            guildID: message.guild.id
        });
        setting.levelings.content = contentObject;
        db.levelings.content = contentObject;
        setting.markModified('levelings');
        await setting.save();
        return message.channel.send({ embeds: [{ 
            color: "#bee7f7", 
            description: `☑️ your leveling announcement message has been set up!`, 
            footer: 
            { 
                text: `you can test it out using ${prefix}${exports.help.name} test!` 
            }  
        }]});
    } else if (args[0] === 'test') {
        let channel;
        const setting = await client.dbguilds.findOne({
            guildID: message.guild.id
        });
        if (!setting.levelings.destination) channel = message.channel;
        else channel = message.guild.channels.cache.get(setting.levelings.destination);
        if (!channel || !channel.permissionsFor(message.guild.me).has(['EMBED_LINKS', 'SEND_MESSAGES'])) {
            setting.levelings.destination = null;
            await setting.save();
            return message.reply({ embeds: [{ color: "#bee7f7", description: "i don't have the perms to send leveling announcement message to that channel! :pensive:\nplease allow the permission \`EMBED_LINKS\` **and** \`SEND_MESSAGES\` for me there before trying again.", footer: { text: `the channel for leveling message was also resetted. please set a new one using ${prefix}leveling channel!` } }] });
        };
        if (setting.levelings.content.type === 'plain') return channel.send(varReplace.replaceText(setting.levelings.content.content, message.member, message.guild, { event: 'level', type: setting.responseType }, { level: 50, xp: 50 }));
        else return channel.send({ embeds:[ varReplace.replaceEmbed(setting.levelings.content.content.embed, message.member, message.guild, { event: 'level', type: setting.responseType }, { level: 50, xp: 50 })] });
    } else {
        return message.channel.send({ embeds: [{ color: "#bee7f7", description: `ℹ️ levelings is currently ${db.enableLevelings ? 'enabled' : 'disabled'} for our server. to setup the leveling system, use one of the following avaliable sub-command: \`off, on, content, announce, test\`!` }] })
    };
};

exports.help = {
    name: "leveling",
    description: "toggle message leveling for your server",
    usage: ["leveling \`<on | off>\`", "leveling `announce <there | #channel>`", "leveling `content`", "leveling `test`"],
    example: ["leveling \`on\`", "leveling \`off\`", "leveling `announce there`", "leveling `announce <#channel>`", "leveling `content`", "leveling `test`"]
};

exports.conf = {
    aliases: ["levelings", "toggleleveling"],
    cooldown: 3,
    guildOnly: true,
    userPerms: ["MANAGE_GUILD"],
    channelPerms: ["EMBED_LINKS"]
};