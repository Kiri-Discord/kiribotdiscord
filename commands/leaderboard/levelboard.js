const { MessageEmbed } = require('discord.js')

exports.run = async (client, message, args) => {

    await client.dbleveling.find({
        guildId: message.guild.id,
    }).sort([["xp", "descending"]]).exec((err, res) => {
        if (err) {
            console.log(err)
            return message.channel.send("There was an error while executing this command!");
        }
        let embed = new MessageEmbed()
        .setTitle(`My leveling leaderboard for ${message.guild.name}:`)
        .setThumbnail(message.guild.iconURL())
        .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
        .setAuthor(client.user.tag, client.user.displayAvatarURL())
        .setDescription(`the higher level you get, the harder it will take for you to level up 😏\ni will only show the top 10 users with the highest rank.`)
        .setColor('#DAF7A6')
        .setTimestamp(new Date())

        if (res.length === 0) {
            embed.setColor("RED")
            embed.setTitle("No leveling data found :(")
            embed.setDescription("please type in chat to level up :D")
        } else if (res.length < 10) {
            for (i = 0; i < res.length; i++) {
                let member = message.guild.members.cache.get(res[i].userId) || "Left user"
                if (member === "Left user")  {
                        client.dbleveling.findOneAndDelete({
                            userId: res[i].userId,
                            guildId: message.guild.id,
                        }, (err) => {
                            if (err) console.error(err)
                        });
                } else {
                    embed.addField(`${i + 1}. ${member.user.username}`, `Level: ${res[i].level}, XP: ${res[i].xp}`);
                }
            }
        } else {
            for (i = 0; i < 10; i++) {
                let member = message.guild.members.cache.get(res[i].userId) || "Left user"
                if (member === "Left user") {
                        client.dbleveling.findOneAndDelete({
                            userId: res[i].userId,
                            guildId: message.guild.id,
                        }, (err) => {
                            if (err) console.error(err)
                        });
                } else {
                    embed.addField(`${i + 1}. ${member.user.username}`, `Level: ${res[i].level}, XP: ${res[i].xp}`);
                }
            }
        }
        message.channel.send(embed)
    })
};
exports.help = {
	name: "levelboard",
	description: "i will show the guild's leveling leaderboard when you use this. easy to understand, right?",
	usage: "levelboard",
	example: "levelboard"
};
  
exports.conf = {
	aliases: ["lvb"],
	cooldown: 2
};