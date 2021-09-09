const { MessageEmbed } = require('discord.js');
const { askString } = require('../../util/util');
const varReplace = require('../../util/variableReplace');

exports.run = async(client, message, args, prefix) => {
        if (!args.length) return message.channel.send({ embeds: [{ color: "RED", description: `you haven't provided a sub command \`${prefix}${exports.help.name} <subcommand>\` :pensive:\nall avaliable sub-command for setting up goodbye message are: \`-off, channel, content, test\`!` }] })
        const db = client.guildsStorage.get(message.guild.id);
        if (message.flags[0] === "off") {
            db.byeChannelID = undefined;
            await client.dbguilds.findOneAndUpdate({
                guildID: message.guild.id,
            }, {
                byeChannelID: null
            });
            const embed = new MessageEmbed()
                .setColor("f3f3f3")
                .setDescription(`❌ goodbye feature has been disabled`);
            return message.channel.send({ embeds: [embed] });
        };
        if (args[0].toLowerCase() === 'channel') {
            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);

            if (!channel) return message.reply({ embeds: [{ color: "f3f3f3", description: 'i can\'t find that channel. pls mention a channel within this guild 😔' }] });
            if (!channel.permissionsFor(message.guild.me).has(['EMBED_LINKS', 'SEND_MESSAGES'])) return message.reply({ embeds: [{ color: "f3f3f3", description: "i don't have the perms to send goodbye message to that channel! :pensive:\nplease allow the permission \`EMBED_LINKS\` **and** \`SEND_MESSAGES\` for me there before trying again." }] });
            db.byeChannelID = channel.id;

            const storageAfter = await client.dbguilds.findOneAndUpdate({
                guildID: message.guild.id,
            }, {
                byeChannelID: channel.id
            })
            const embed = new MessageEmbed()
                .setColor("f3f3f3")
                .setDescription(`☑️ the goodbye feature has been set to ${channel}!\n${storageAfter.byeContent.content ? `a default welcome message has been set because you haven't set a custom welcome message yet. to create use own your custom welcome message, do \`${prefix}setgreeting content\`!` : ''}`)
            .setFooter(`the "${storageAfter.responseType}" response type has been set for all default upcoming greeting message.`) 
            return message.channel.send({embeds: [embed]});
    };
    if (args[0].toLowerCase() === 'content') {
        let contentObject;
        const types = ['plain', 'embed'];
        const embed = new MessageEmbed()
            .setFooter('this message will be timed out in 20 seconds')
            .setDescription(`what type of message do you want to set as the goodbye message? type either ${types.map(x => `\`${x}\``).join(' or ')} to choose :slight_smile:`)
        await message.channel.send({embeds: [embed]});
        const filter = res => {
            if (res.author.id !== message.author.id) return false; 
            if (!types.includes(res.content)) {
                res.reply({ embeds: [{ color: "f3f3f3", description: `\`${res.content}\` is not a valid type for the goodbye message :pensive: you should choose again with either ${types.map(x => `\`${x}\``).join(" or ")}` }] });
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
                .setFooter('this message will be timed out in 20 seconds. you can also cancel this setup by "cancel"');
            await message.channel.send({embeds: [embed2]})
            const content = await askString(message.channel, res => res.author.id === message.author.id);
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
            if (!storage.embeds.toObject().length) return message.reply({ embeds: [{ color: "f3f3f3", description: `there aren't any embed created on this server yet :pensive: to create a new embed, do \`${prefix}embeds new\`!` }] });
            const embed2 = new MessageEmbed()
                .setDescription(`what is the embed ID that you want to apply? :slight_smile:`)
                .setFooter('this message will be timed out in 20 seconds. you can also cancel this setup by "cancel"');
            await message.channel.send({embed: [embed2]});
            const content = await askString(message.channel, res => res.author.id === message.author.id);
            if (content === 0) return message.channel.send(`the setup is cancelled :pensive:`);
            if (!content) return message.channel.send("you didn't say anything :pensive:");
            const targetEmbed = storage.embeds.toObject().find(x => x._id === content.content);
            if (!targetEmbed) return content.reply({ embeds: [{ color: "f3f3f3", description: `there aren't any embed created on this server name \`${content.content}\` :pensive: to create a new embed, do \`${prefix}embeds new\`!` }] });
            contentObject = {
                type: 'embed',
                content: targetEmbed
            };
        };
        db.byeContent = contentObject;
        await client.dbguilds.findOneAndUpdate({
            guildID: message.guild.id,
        }, {
            byeContent: contentObject
        });
        return message.channel.send({ embeds: [{ color: "f3f3f3", description: `☑️ your goodbye message has been set up!`, footer: { text: `you can test it out using ${prefix}${exports.help.name} test!` } }] });
    };
    if (args[0].toLowerCase() === 'test') {
        const setting = await client.dbguilds.findOne({
            guildID: message.guild.id
        });
        if (!setting.byeChannelID) {
            const embed = new MessageEmbed()
                .setColor("f3f3f3")
                .setDescription(`❌ the goodbye feature wasn't setup yet!`);
            return message.channel.send({embeds: [embed]});
        };
        const channel = message.guild.channels.cache.get(setting.byeChannelID);
        if (!channel || !channel.permissionsFor(message.guild.me).has(['EMBED_LINKS', 'SEND_MESSAGES'])) {
            await client.dbguilds.findOneAndUpdate({
                guildID: message.guild.id,
            }, {
                byeChannelID: null
            });
            db.byeChannelID = null;
            return message.reply({ embeds: [{ color: "f3f3f3", description: "i don't have the perms to send goodbye message to that channel! :pensive:\nplease allow the permission \`EMBED_LINKS\` **and** \`SEND_MESSAGES\` for me there before trying again.", footer: { text: `the channel for greeting message was also resetted. please set a new one using ${prefix}setgreeting channel!` } }] });
        };
        if (setting.byeContent.type === 'plain') return channel.send(varReplace.replaceText(setting.byeContent.content, message.member, message.guild, { event: 'leave', type: setting.responseType }));
        else return channel.send({ embeds: [varReplace.replaceEmbed(setting.byeContent.content.embed, message.member, message.guild, { event: 'leave', type: setting.responseType })] });
    };
    return message.channel.send({ embeds: [{ color: "RED", description: `\`${args[0]}\` isn't a valid subcommand :pensive:\nall avaliable sub-command for setting up goodbye message are: \`-off, channel, content, test\`!` }] })
}


exports.help = {
    name: "setgoodbye",
    description: "setup the goodbye feature for leaving members",
    usage: ["setgoodbye `channel <#channel>`", "setgoodbye `test`", "setgoodbye `content`", "setgoodbye -off"],
    example: ["setgoodbye `channel #logs`", "setgoodbye `test`", "setgoodbye `content`", "setgoodbye -off"]
};

exports.conf = {
    aliases: ["goodbye", "farewell"],
    cooldown: 5,
    guildOnly: true,
    userPerms: ["MANAGE_GUILD"],
    channelPerms: ["EMBED_LINKS"]
};