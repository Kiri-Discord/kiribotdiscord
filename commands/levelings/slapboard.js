const { MessageEmbed } = require('discord.js')
const slapSchema = require('../../model/slap')

exports.run = async (client, message, args) => {

    await slapSchema.find({
        guildId: message.guild.id,
    }).sort([["received", "descending"]]).exec((err, res) => {
        if (err) {
            console.log(err)
            return message.inlineReply("sorry, there was an error while executing this command :(");
        }
        let embed = new MessageEmbed()
        .setThumbnail(message.guild.iconURL())
        .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
        .setAuthor(`slap leaderboard for ${message.guild.name}:`, client.user.displayAvatarURL())
        .setDescription(`these are users with that received the most slap in this server.\ni will only show 5 people received the most slap :pensive:`)
        .setColor('RANDOM')
        .setTimestamp(new Date())

        if (res.length === 0) {
            return message.channel.send({embed: {color: "f3f3f3", description: `❌ sorry, i can't find any slap data for this guild :(`}});
        } else if (res.length < 5) {
            for (i = 0; i < res.length; i++) {
                let member = message.guild.members.cache.get(res[i].userId) || "Left user"
                if (member === "Left user")  {
                        slapSchema.findOneAndDelete({
                            userId: res[i].userId,
                            guildId: message.guild.id,
                        }, (err) => {
                            if (err) console.error(err)
                        });
                } else {
                    embed.addField(`✨ \`${i + 1}\` ${member.user.username}`, `Received ${res[i].received} slap(s)`);
                }
            }
        } else {
            for (i = 0; i < 5; i++) {
                let member = message.guild.members.cache.get(res[i].userId) || "Left user"
                if (member === "Left user") {
                        slapSchema.findOneAndDelete({
                            userId: res[i].userId,
                            guildId: message.guild.id,
                        }, (err) => {
                            if (err) console.error(err)
                        });
                } else {
                    embed.addField(`✨ \`${i + 1}\` ${member.user.username}`, `Received ${res[i].received} slap(s)`);
                }
            }
        }
        message.channel.send(embed)
    })
};
exports.help = {
	name: "slapboard",
	description: "display the guild's slap leaderboard",
	usage: "slapboard",
	example: "slapboard"
};
  
exports.conf = {
	aliases: ["sb"],
    cooldown: 2,
    guildOnly: true,
    userPerms: [],
	clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
};
