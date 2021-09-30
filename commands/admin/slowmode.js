const ms = require("ms");
const { MessageEmbed } = require("discord.js");
const sendHook = require('../../features/webhook.js');

exports.run = async(client, message, args) => {
    const guildDB = client.guildsStorage.get(message.guild.id);

    const logChannel = message.guild.channels.cache.get(guildDB.logChannelID);

    let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0])
    time = args.slice(1).join(" ");

    if (!channel) time = args.join(" "), channel = message.channel;

    if (message.flags[0] === "off") {
        channel.setRateLimitPerUser(0);
        return message.channel.send({ embeds: [{ color: "RED", description: `<#${channel.id}> slowmode has been deactivated.` }] });
    };

    if (!time) return message.reply({ embeds: [{ color: "RED", description: "please includes the time format. all valid time format are \`s, m, hrs\` <3" }] });

    let convert = ms(time);
    let toSecond = Math.floor(convert / 1000);

    if (!toSecond) return message.reply({ embeds: [{ color: "RED", description: "please includes the **valid** time format. all valid time format are \`s, m, hrs\` <3" }] });

    if (toSecond > 21600) return message.reply({ embeds: [{ color: "RED", description: "the cooldown duration must not be equal to or more than 6 hours!" }] });
    const rolelog = new MessageEmbed()
        .setAuthor(client.user.username, client.user.displayAvatarURL())
        .setDescription(`Slowmode is set on <#${channel.id}> for **${ms(ms(time), {long: true})}**.`)
        .addField('Moderator', message.author.toString())
        .setTimestamp();
    try {
        await channel.setRateLimitPerUser(toSecond);
        await message.channel.send({ embeds: [{ color: "#bee7f7", description: `☑️ this channel: <#${channel.id}> will have slowmode turn on for **${ms(ms(time), {long: true})}**.` }] });
        if (!logChannel) {
            return
        } else {
            const instance = new sendHook(client, logChannel, {
                username: message.guild.me.displayName,
                avatarURL: client.user.displayAvatarURL(),
                embeds: [rolelog],
            })
            return instance.send();
        }
    } catch (error) {
        return message.reply({ embeds: [{ color: 'RED', description: "ouch, i bumped by an error! can you recheck my perms? :pensive:" }] });
    };
}

exports.help = {
    name: "slowmode",
    description: "set slowmode for a certain channel",
    usage: ["slowmode `<time>`", "slowmode `[channel] <time>`", "slowmode `[-off]`"],
    example: ["slowmode `#general 5s`", "slowmode `5.25 hrs`"]
}

exports.conf = {
    aliases: ["slowdown"],
    cooldown: 3,
    guildOnly: true,
    userPerms: ["MANAGE_CHANNELS"],
    clientPerms: ['MANAGE_CHANNELS'],
    channelPerms: ["EMBED_LINKS"]
}