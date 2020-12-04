const Discord = require("discord.js");

exports.run = async (client, message, args) => {
    if (!message.member.hasPermission(["MANAGE_MESSAGES", "ADMINISTRATOR"])) {
        return message.channel.send(`you do not have \`MANAGE_MESSAGES\` or \`ADMINISTRATOR\` permission to use this command 😔`).then(m => m.delete({ timeout: 5000 }));
    }
    let pollChannel = message.mentions.channels.first();
    if (!pollChannel) return message.channel.send("Please mention a channel!");

    let pollDescription = args.slice(1).join(' ');

    let embedPoll = new Discord.MessageEmbed()
    .setTitle(`${message.member.displayName} started a new poll!`)
    .setDescription(pollDescription)
    .setColor('YELLOW')
    .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
    .setTimestamp(new Date())

    let msgEmbed = await pollChannel.send(embedPoll);
    await msgEmbed.react('👍')
    await msgEmbed.react('👎')
}

exports.help = {
    name: "poll",
    description: "Create a poll in an defined channel",
    usage: "poll <#channel> <topic>",
    example: "poll #test yes or no"
}

exports.conf = {
    aliases: [],
    cooldown: 30,
    guildOnly: true
}
