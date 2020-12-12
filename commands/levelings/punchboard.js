const { MessageEmbed } = require('discord.js')
const punchSchema = require('../../model/punch')

exports.run = async (client, message, args) => {

    await punchSchema.find({
        guildId: message.guild.id,
    }).sort([["received", "descending"]]).exec((err, res) => {
        if (err) {
            console.log(err)
            return message.reply("sorry, there was an error while executing this command :(");
        }
        let embed = new MessageEmbed()
        .setThumbnail(message.guild.iconURL())
        .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
        .setAuthor(`punch leaderboard for ${message.guild.name}:`, client.user.displayAvatarURL())
        .setDescription(`these are users with that received the most punch in this server.\ni will only show 5 people received the most punch :pensive:`)
        .setColor('RANDOM')
        .setTimestamp(new Date())

        if (res.length === 0) {
            return message.channel.send({embed: {color: "f3f3f3", description: `❌ sorry, i can't find any punch data for this guild :(`}});
        } else if (res.length < 5) {
            for (i = 0; i < res.length; i++) {
                let member = message.guild.members.cache.get(res[i].userId) || "Left user"
                if (member === "Left user")  {
                        punchSchema.findOneAndDelete({
                            userId: res[i].userId,
                            guildId: message.guild.id,
                        }, (err) => {
                            if (err) console.error(err)
                        });
                } else {
                    embed.addField(`✨ \`${i + 1}\` ${member.user.username}`, `Received ${res[i].received} punch(s)`);
                }
            }
        } else {
            for (i = 0; i < 5; i++) {
                let member = message.guild.members.cache.get(res[i].userId) || "Left user"
                if (member === "Left user") {
                        punchSchema.findOneAndDelete({
                            userId: res[i].userId,
                            guildId: message.guild.id,
                        }, (err) => {
                            if (err) console.error(err)
                        });
                } else {
                    embed.addField(`✨ \`${i + 1}\` ${member.user.username}`, `Received ${res[i].received} punch(s)`);
                }
            }
        }
        message.channel.send(embed)
    })
};
exports.help = {
	name: "punchboard",
	description: "display the guild's punch leaderboard",
	usage: "punchboard",
	example: "punchboard"
};
  
exports.conf = {
	aliases: ["pb"],
    cooldown: 2,
    guildOnly: true,
    userPerms: [],
	clientPerms: []
};
