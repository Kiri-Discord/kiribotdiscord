const Discord = require("discord.js");

exports.run = async (client, message, args) => {
        let pollChannel = message.mentions.channels.first();
        if (!pollChannel) return message.channel.send("Please mention a channel!");

        let pollDescription = args.slice(1).join(' ');

        let embedPoll = new Discord.MessageEmbed()
        .setTitle(`${message.user.tag} started a new poll!`)
        .setDescription(pollDescription)
        .setColor('YELLOW')
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
    aliases: [""],
    cooldown: 30
}
