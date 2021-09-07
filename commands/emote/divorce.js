exports.run = async(client, message, args) => {
    const author = await client.love.findOne({
        userID: message.author.id,
        guildID: message.guild.id
    });
    if (!author) {
        return message.inlineReply('you are not married!');
    } else {
        if (!author.marriedID) return message.inlineReply('you are not married!');
        const marry = await client.love.findOne({
            userID: author.marriedID,
            guildID: message.guild.id
        });
        if (!marry) {
            await client.love.findOneAndDelete({
                guildID: message.guild.id,
                userID: message.author.id
            });
            return message.channel.send("it seems like you did married, but i don't know who though. you are single now.")
        } else {
            if (marry.marriedID) {
                if (marry.marriedID !== message.author.id) {
                    await client.love.findOneAndDelete({
                        guildID: message.guild.id,
                        userID: message.author.id
                    });
                    return message.channel.send("that user isn't married to you! :pensive:")
                } else {
                    const member = message.guild.members.cache.get(author.marriedID);
                    if (!member) {
                        await client.love.findOneAndDelete({
                            guildID: message.guild.id,
                            userID: message.author.id
                        });
                        return message.channel.send("can't find your partner in this server! i will just change you to single instead...")
                    } else {
                        return divorce(client, message, member);
                    }
                }
            } else {
                await client.love.findOneAndDelete({
                    guildID: message.guild.id,
                    userID: message.author.id
                });
                return message.channel.send("your partner isn't married to you in my database! i will just change you to single instead...")
            }
        }

    }
}
async function divorce(client, message, member) {
    const msg = await message.channel.send({ embed: { color: "a65959", description: `
    ${member}, it seems like ${message.author} is asking for a divorce...
    
    do you accept this request? please react with ✅ for yes, and ❌ for no.

    *i will be going in a minute.*
    ` } });
    await msg.react('✅');
    await msg.react('❌');
    let answered;
    const filter = (reaction, user) => {
        return ['✅', '❌'].includes(reaction.emoji.name) && user.id === member.user.id;
    };
    const collector = msg.createReactionCollector(filter, { time: 60000 });
    collector.on('collect', async(reaction, user) => {
        if (reaction.emoji.name === '❌') {
            answered = true;
            message.channel.send(`**${member.user.username}** declined your request :(`);
            return collector.stop();
        } else if (reaction.emoji.name === '✅') {
            answered = true;
            await client.love.findOneAndDelete({
                guildID: message.guild.id,
                userID: message.author.id
            });
            await client.love.findOneAndDelete({
                userID: member.user.id,
                guildID: message.guild.id
            });
            message.channel.send(`**${message.author.username}**, you have divorced with **${member.user.username}** :pensive:`);
            return collector.stop();
        }
    });
    collector.on('end', () => {
        if (!answered) return message.channel.send('you two didn\'t say anything!');
    });
}
exports.help = {
    name: "divorce",
    description: "divorce with somebody after marry them :pensive:",
    usage: "divorce `<@mention>`",
    example: "divorce `@somebody`"
};

exports.conf = {
    aliases: ['breakup'],
    cooldown: 4,
    guildOnly: true,

    channelPerms: ["EMBED_LINKS", "ADD_REACTIONS"]
};