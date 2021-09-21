const request = require('node-superfetch');
const { MessageEmbed } = require('discord.js');
exports.run = async(client, message, args, prefix) => {
    const author = await client.love.findOne({
        userID: message.author.id,
        guildID: message.guild.id
    });
    if (author) {
        if (author.marriedID) {
            return message.reply('you are already married! *cheater*');
        };
    };
    if (!args[0]) return message.reply('who do you want to propose to?');
    const member = await getMemberfromMention(args[0], message.guild);
    if (!member) return message.reply("i couldn't find that user in this server :pensive:");
    if (member.user.id === message.author.id) return message.reply('WHY DO YOU WANT TO MARRY YOURSELF?');
    if (member.user.id === client.user.id) return message.reply('aww i apreciated that but.. i am just a bot :(');
    if (member.user.bot) return message.reply('that user is a bot :pensive:');
    let storage = await client.inventory.findOne({
        userId: message.author.id,
        guildId: message.guild.id
    });
    if (!storage) {
        const model = client.inventory;
        storage = new model({
            userId: message.author.id,
            guildId: message.guild.id,
        });
    };
    if (storage.rings < 1) return message.reply(`:x: you don't have enough 💍 **Wedding Ring** to make a proposal! buy one at \`${prefix}shop\`.`);
    const marry = await client.love.findOne({
        userID: member.user.id,
        guildID: message.guild.id
    });
    if (marry) {
        if (marry.marriedID) {
            return message.reply('that user is already married!');
        };
    }
    const msg = await message.channel.send({ embeds: [{ color: "a65959", description: `
    ${member}, it seems like ${message.author} is interested in taking you as their loved one...
    
    do you accept this proposal? please react with ✅ for yes, and ❌ for no.
    *this proposal will expire in a minute.*
    ` }] });
    await msg.react('✅');
    await msg.react('❌');
    let answered;
    const filter = (reaction, user) => {
        return ['✅', '❌'].includes(reaction.emoji.name) && user.id === member.user.id;
    };
    const collector = msg.createReactionCollector({ filter, time: 60000 });
    collector.on('collect', async(reaction, user) => {
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
            }, {
                upsert: true,
                new: true,
            });
            await client.love.findOneAndUpdate({
                userID: member.user.id,
                guildID: message.guild.id
            }, {
                userID: member.user.id,
                guildID: message.guild.id,
                marriedID: message.author.id
            }, {
                upsert: true,
                new: true,
            });

            const { body } = await request.get('https://nekos.best/api/v1/kiss');
            let image = body.url;
            const embed = new MessageEmbed()
                .setDescription(`:sparkling_heart: **${message.author.username}** and **${member.user.username}** are now married! :sparkling_heart:`)
                .setImage(image);
            await message.channel.send({ embeds: [embed] });
            await client.inventory.findOneAndUpdate({
                guildId: message.guild.id,
                userId: message.author.id
            }, {
                guildId: message.guild.id,
                userId: message.author.id,
                $inc: {
                    rings: -1,
                },
            }, {
                upsert: true,
                new: true,
            });
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
    usage: ["marry `<@mention>`"],
    example: ["marry `@somebody`"]
};

exports.conf = {
    aliases: ['propose'],
    cooldown: 4,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS", "ADD_REACTIONS"]
};
