const ms = require("ms");
const Discord = require("discord.js");

exports.run = async(client, message, args) => {
    const guildDB = client.guildsStorage.get(message.guild.id);

    const logChannel = message.guild.channels.cache.get(guildDB.logChannelID);

    let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0])
    time = args.slice(1).join(" ");

    if (!channel) time = args.join(" "), channel = message.channel;

    if (message.flags[0] === "off") {
        channel.setRateLimitPerUser(0);
        return message.channel.send(`<#${channel.id}> slowmode has been deactivated.`);
    }

    if (!time) return message.inlineReply("please includes the time format. all valid time format are \`s, m, hrs\` <3");

    let convert = ms(time);
    let toSecond = Math.floor(convert / 1000);

    if (!toSecond || toSecond == undefined) return message.inlineReply("please insert the valid time format! all valid time format are \`s, m, hrs\`!");

    if (toSecond > 21600) return message.inlineReply("the timer should be more than or equal to 1 second or less than 6 hours!");
    const rolelog = new Discord.MessageEmbed()
        .setAuthor(client.user.username, client.user.displayAvatarURL())
        .setDescription(`Slowmode is set on <#${channel.id}> for **${ms(ms(time), {long: true})}**.`)
        .addField('Moderator', message.author)
        .setTimestamp()

    await channel.setRateLimitPerUser(toSecond).then(() => {
        message.channel.send({ embed: { color: "f3f3f3", description: `☑️ this channel: <#${channel.id}> will have slowmode turn on for **${ms(ms(time), {long: true})}**.` } });
    }).then(() => {
        if (!logChannel) {
            return
        } else {
            return logChannel.send(rolelog);
        }
    }).catch(err => {
        return message.inlineReply("ouch, i bumped by an error :( can you check my perms?");
    });
}

exports.help = {
    name: "slowmode",
    description: "slow down the channel.",
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