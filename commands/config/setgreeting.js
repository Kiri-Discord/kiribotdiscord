const { MessageEmbed } = require('discord.js');
const { askString } = require('../../util/util');
const varReplace = require('../../util/variableReplace');

exports.run = async(client, message, args, prefix) => {
        if (message.flags[0] === "off") {
            await client.dbFuncs.changeHiDestination(message.guild.id, null);
            const embed = new MessageEmbed()
                .setColor("#bee7f7")
                .setDescription(`❌ greetings feature has been disabled`);
            return message.channel.send({ embeds: [embed] });
        };
        if (!args.length) return message.channel.send({ embeds: [{ color: "RED", description: `you haven't provided a sub command \`${prefix}${exports.help.name} <subcommand>\` :pensive:\nall avaliable sub-command for setting up greetings message are: \`-off, channel, content, test\`!` }] })
        if (args[0].toLowerCase() === 'channel') {
            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);

            if (!channel) return message.reply({ embeds: [{ color: "#bee7f7", description: 'i can\'t find that channel. pls mention a channel within this guild 😔' }] });
            if (!channel.viewable || !channel.permissionsFor(message.guild.me).has(['EMBED_LINKS', 'SEND_MESSAGES'])) return message.reply({ embeds: [{ color: "#bee7f7", description: `i don't have the perms to send greeting message to ${channel}!\nplease allow the permission \`EMBED_LINKS\` **and** \`SEND_MESSAGES\` for me there before trying again.` }] });
            await client.dbFuncs.changeHiDestination(message.guild.id, channel.id);
            const note = message.setting.greetContent.content === '{auto}' ? `a default welcome message has been set because you haven't set a custom welcome message yet. to use your own your custom welcome message, do \`${prefix}setgreeting content\`!` : '';
            const embed = new MessageEmbed()
                .setColor("#bee7f7")
                .setDescription(`☑️ the greeting feature has been set to ${channel}!\n${note}`)
                .setFooter({text: `the "${message.setting.responseType}" response type has been set for all default upcoming greeting message.`})
            return message.channel.send({ embeds: [embed] });
        };
        if (args[0].toLowerCase() === 'content') {
            let contentObject;
            const types = ['plain', 'embed'];
            const embed = new MessageEmbed()
                .setFooter({text: 'this message will be timed out in 20 seconds'})
                .setDescription(`what type of message do you want to set as the greeting message? type either ${types.map(x => `\`${x}\``).join(' or ')} to choose :slight_smile:`)
        await message.channel.send({ embeds: [embed] });
        const filter = res => {
            if (res.author.id !== message.author.id) return false; 
            if (!types.includes(res.content)) {
                res.reply({ embeds: [{ color: "#bee7f7", description: `\`${res.content}\` is not a valid type for the greeting message :pensive: you should choose again with either ${types.map(x => `\`${x}\``).join(" or ")}` }] });
                return false;
            };
            return true;
        };
        const type = await askString(message.channel, filter);
        if (type === 0) return message.channel.send(`the setup is cancelled :pensive:`);
        if (!type) return message.channel.send("you didn't say anything :pensive:");
        if (type.content.toLowerCase() === 'plain') {
            const embed2 = new MessageEmbed()
                .setDescription(`plain it is! so what content do you want to put in the welcome message?\ntips: variable is supported! feel free to check out at \`${prefix}variables\`.`)
                .setFooter({text: 'this message will be timed out in 20 seconds. you can also cancel this setup by typing "cancel"'});
            await message.channel.send({ embeds: [embed2] })
            const content = await askString(message.channel, res => res.author.id === message.author.id, { time: 120000 });
            if (content === 0) return message.channel.send(`the setup is cancelled :pensive:`);
            if (!content) return message.channel.send("you didn't say anything :pensive:");
            contentObject = {
                type: 'plain',
                content: content.content
            };
        } else if (type.content.toLowerCase() === 'embed') {
            let storage = await client.dbFuncs.fetchEmbeds(message.guild.id);
            if (!storage.embeds.length) return message.reply({ embeds: [{ color: "#bee7f7", description: `there aren't any embed created on this server yet :pensive: to create a new embed, do \`${prefix}embeds new\`!` }] });
            const embed2 = new MessageEmbed()
                .setDescription(`what is the embed ID that you want to apply? :slight_smile:`)
                .setFooter({text: 'this message will be timed out in 20 seconds. you can also cancel this setup by typing "cancel"'});
            await message.channel.send({ embeds: [embed2] });
            const content = await askString(message.channel, res => {
                if (res.author.id !== message.author.id) return false;
                const targetEmbed = storage.embeds.find(x => x._id.toLowerCase() === res.content.trim().toLowerCase());
                if (!targetEmbed) {
                    res.reply({ embeds: [{ color: "#bee7f7", description: `there aren't any embed created on this server name \`${res.content}\`! you can try another name.`, footer: { text: `to create a new embed, do ${prefix}embeds new!` } }] });
                    return false;
                }
                else return true;
            });
            if (content === 0) return message.channel.send(`the setup is cancelled :pensive:`);
            if (!content) return message.channel.send("you didn't say anything :pensive:");
            const targetEmbed = storage.embeds.find(x => x._id === content.content.trim().toLowerCase());
            // if (!targetEmbed) return content.reply({ embeds: [{ color: "#bee7f7", description: `there aren't any embed created on this server name \`${content.content}\` :pensive: to create a new embed, do \`${prefix}embeds new\`!` }] });
            contentObject = {
                type: 'embed',
                content: targetEmbed
            };
        };
        await client.dbFuncs.changeHiContent(message.guild.id, contentObject);
        return message.channel.send({ embeds: [{ color: "#bee7f7", description: `☑️ your greeting message has been set up!`, footer: { text: `you can test it out using ${prefix}${exports.help.name} test!` } }] });
    };
    if (args[0].toLowerCase() === 'test') {
        if (!message.setting.greetChannelID) {
            const embed = new MessageEmbed()
                .setColor("#bee7f7")
                .setDescription(`❌ the greeting channel wasn't setup yet!`);
            return message.channel.send({embeds: [embed]});
        };
        const channel = message.guild.channels.cache.get(message.setting.greetChannelID);
        if (!channel || !channel.viewable || !channel.permissionsFor(message.guild.me).has(['EMBED_LINKS', 'SEND_MESSAGES'])) {
            await client.dbFuncs.changeHiDestination(message.guild.id, null);
            await client.dbFuncs.changeHiContent(message.guild.id, null);
            return message.reply({ embeds: [{ color: "#bee7f7", description: "i don't have the perms to send greeting message to that channel! :pensive:\nplease allow the permission \`EMBED_LINKS\` **and** \`SEND_MESSAGES\` for me there before trying again.", footer: { text: `the channel for greeting message was also resetted. please set a new one using ${prefix}setgreeting channel!` } }] });
        };
        if (message.setting.greetContent.type === 'plain') return channel.send(varReplace.replaceText(message.setting.greetContent.content, message.member, message.guild, { event: 'join', type: message.setting.responseType }));
        else return channel.send({ embeds: [varReplace.replaceEmbed(message.setting.greetContent.content.embed, message.member, message.guild, { event: 'join', type: message.setting.responseType })]});
    };
    return message.channel.send({ embeds: [{ color: "RED", description: `\`${args[0]}\` isn't a valid subcommand :pensive:` }] })
}

exports.help = {
    name: "setgreeting",
    description: "setup the greeting feature for new members",
    usage: ["setgreeting `channel <#channel>`", "setgreeting `test`", "setgreeting `content`", "setgreeting -off"],
    example: ["setgreeting `channel #logs`", "setgreeting `4545455454644`", "setgreeting -off"]
};

exports.conf = {
    aliases: ["greetings", "welcome", "setgreetings"],
    cooldown: 5,
    guildOnly: true,
    userPerms: ["MANAGE_GUILD"],
    channelPerms: ["EMBED_LINKS"]
};