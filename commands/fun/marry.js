const random = require("something-random-on-discord").Random;
const { MessageEmbed } = require('discord.js');
exports.run = async (client, message, args) => {
    const author = await client.love.findOne({
        userID: message.author.id,
        guildID: message.guild.id
    });
    if (author) {
        if (author.marriedID) {
            return message.inlineReply('you are already married!\n*cheater*');
        }
    }
    if (!args[0]) return message.inlineReply('who do you want to propose to?');
    const mention = message.guild.members.cache.get(args[0]) || message.mentions.members.first();
    const member = message.guild.members.cache.get(mention.id);
    if (!member) return message.inlineReply("i couldn't find that user in this server :pensive:");
    if (member.user.id === message.author.id) return message.inlineReply('WHY DO YOU WANT TO MARRY YOURSELF?');
    if (member.user.id === client.user.id) return message.inlineReply('aww i apreciated that but.. i am just a bot :(');
    if (member.user.bot) return message.inlineReply('that user is a bot :(\n*we are emotionless. why do you want to marry?*');
    const marry = await client.love.findOne({
        userID: member.user.id,
        guildID: message.guild.id
    });
    if (marry) {
        if (marry.marriedID) {
            return message.inlineReply('that user is already married!');
        }
    }
    if (!author) {
        const model = client.love
        const newUser = new model({
            userID: message.author.id,
            guildID: message.guild.id
        });
        await newUser.save();
    };
    if (!marry) {
        const model = client.love
        const newUser = new model({
            userID: member.user.id,
            guildID: message.guild.id
        });
        await newUser.save();
    };
    const msg = await message.channel.send({embed: {color: "a65959", description: `
    ${member}, it seems like ${message.author} is interested in taking you as their loved one...
    
    do you accept this proposal? please react with ✅ for yes, and ❌ for no.

    *i will be going in a minute.*
    `}});
    await msg.react('✅');
    await msg.react('❌');
    let answered;
    const filter = (reaction, user) => {
        return ['✅', '❌'].includes(reaction.emoji.name) && user.id === member.user.id;
    };
    const collector = msg.createReactionCollector(filter, {time: 60000});
    collector.on('collect', async (reaction, user) => {
        if (reaction.emoji.name === '❌') {
            answered = true;
            message.channel.send(`**${member.user.username}** declined your proposal :(`);
            return collector.stop();
        } else if (reaction.emoji.name === '✅') {
            answered = true;
            await client.love.findOneAndUpdate({
                guildID: message.guild.id,
                userID: message.author.id
            }, {
                guildID: message.guild.id,
                userID: message.author.id,
                marriedID: member.user.id
            });
            await client.love.findOneAndUpdate({
                userID: member.user.id,
                guildID: message.guild.id
            }, {
                userID: member.user.id,
                guildID: message.guild.id,
                marriedID: message.author.id
            });
            let image = await random.getAnimeImgURL("kiss")
            const embed = new MessageEmbed()
            .setDescription(`:sparkling_heart: **${message.author.username}** and **${member.user.username}** are now married! :sparkling_heart:`)
            .setImage(image);
            message.channel.send(embed);
            return collector.stop();
        }
    });
    collector.on('end', () => {
        if (!answered) return message.channel.send('you two didn\'t say anything!');
    });
}
exports.help = {
    name: "marry",
    description: "propose somebody and marry them *(if they ever accept)*",
    usage: "marry `<@mention>`",
    example: "marry `@somebody`"
};

exports.conf = {
    aliases: ['propose'],
    cooldown: 4,
    guildOnly: true,
    userPerms: [],
    clientPerms: ["EMBED_LINKS", "SEND_MESSAGES", "ADD_REACTIONS"]
};