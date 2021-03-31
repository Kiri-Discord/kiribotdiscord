exports.run = async (client, message, args) => {
    const mention = message.guild.members.cache.get(args[0]) || message.mentions.members.first() || message.author;
    const member = message.guild.members.cache.get(mention.id);
    if (!member) return message.inlineReply("i couldn't find that user in this server :pensive:");
    if (member.user.id === client.user.id) return message.inlineReply('i am just a bot :(');
    if (member.user.bot) return message.inlineReply('that user is a bot :(');
    if (member.user.id === message.author.id) {
        const author = await client.love.findOne({
            userID: message.author.id,
            guildID: message.guild.id
        });
        if (!author) {
            const model = client.love
            const newUser = new model({
                userID: message.author.id,
                guildID: message.guild.id
            });
            await newUser.save();
            return message.channel.send('you are single');
        } else {
            const target = await client.love.findOne({
                userID: member.user.id,
                guildID: message.guild.id
            });
            if (target) {
                if (target.marriedID) {
                    const married = message.guild.members.cache.get(target.marriedID);
                    if (!married) {
                        await client.love.findOneAndUpdate({
                            guildID: message.guild.id,
                            userID: member.user.id,
                        }, {
                            guildID: message.guild.id,
                            userID: member.user.id,
                            marriedID: null
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
            }
        }
    }
    const target = await client.love.findOne({
        userID: member.user.id,
        guildID: message.guild.id
    });
    if (target) {
        if (target.marriedID) {
            const married = message.guild.members.cache.get(target.marriedID);
            if (!married) {
                await client.love.findOneAndUpdate({
                    guildID: message.guild.id,
                    userID: member.user.id,
                }, {
                    guildID: message.guild.id,
                    userID: member.user.id,
                    marriedID: null
                });
                return message.channel.send(`**${member.user.username}** is single!`);
            } else {
                return message.channel.send(`**${member.user.username}** is married to **${married.user.username}** :sparkling_heart:`);
            }
        } else {
            return message.channel.send(`**${member.user.username}** is single!`);
        }
    } else {
        return message.channel.send(`**${member.user.username}** is single!`);
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
    userPerms: [],
	clientPerms: ["SEND_MESSAGES"]
};