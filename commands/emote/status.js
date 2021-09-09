exports.run = async(client, message, args) => {
    const member = await getMemberfromMention(args[0], message.guild) || message.member;
    if (!member) return message.reply("i couldn't find that user in this server :pensive:");
    const user = member.user;
    if (user.id === client.user.id) return message.reply('i am just a bot :(');
    if (user.bot) return message.reply('that user is a bot :(');
    if (user.id === message.author.id) {
        const author = await client.love.findOne({
            userID: message.author.id,
            guildID: message.guild.id
        });
        if (!author) {
            return message.channel.send('you are single');
        } else {
            const target = await client.love.findOne({
                userID: user.id,
                guildID: message.guild.id
            });
            if (target) {
                if (target.marriedID) {
                    const married = message.guild.members.cache.get(target.marriedID);
                    if (!married) {
                        await client.love.findOneAndDelete({
                            guildID: message.guild.id,
                            userID: user.id,
                        });
                        return message.channel.send(`you are single!`);
                    } else {
                        return message.channel.send(`you are married to **${married.user.username}** :sparkling_heart:`);
                    }
                } else {
                    return message.channel.send(`you are single!`);
                }
            } else {
                return message.channel.send(`you are single!`);
            };
        };
    };
    const target = await client.love.findOne({
        userID: user.id,
        guildID: message.guild.id
    });
    if (target) {
        if (target.marriedID) {
            const married = message.guild.members.cache.get(target.marriedID);
            if (!married) {
                await client.love.findOneAndDelete({
                    guildID: message.guild.id,
                    userID: user.id,
                });
                return message.channel.send(`**${user.username}** is single!`);
            } else {
                return message.channel.send(`**${user.username}** is married to **${married.user.username}** :sparkling_heart:`);
            }
        } else {
            return message.channel.send(`**${user.username}** is single!`);
        }
    } else {
        return message.channel.send(`**${user.username}** is single!`);
    }
}

exports.help = {
    name: "status",
    description: "check a person's relationship status",
    usage: ["status `<@mention>`", "status `<ID>`"],
    example: ["status `@someone`", "status `4475447457745`"]
};

exports.conf = {
    aliases: ["check-relationship", "relationship"],
    cooldown: 3,
    guildOnly: true,
};