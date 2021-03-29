const Discord = require("discord.js")
const random = require("something-random-on-discord").Random;
const patSchema = require('../../model/pat')


exports.run = async (client, message, args) => {
    let data = await random.getAnimeImgURL("pat")

    const target = message.mentions.users.first()
    if (!target) {
      return message.reply("you can't just pat **air** :( please mention somebody to pat pls")
    }
    if (target === client.user) return message.reply('**pat pat pat pat pat**\nyes, you!')
    if (target.bot) return message.reply("this isn't an simulator so you can't pat that bot, sorry :(")

    const { guild } = message
    const guildId = guild.id
    const targetId = target.id
    const authorId = message.author.id
    const now = new Date()

    if (targetId === authorId) {
      message.reply('**pat pat pat pat pat**\nyes, you!')
      return
    }

    const result = await patSchema.findOneAndUpdate(
      {
        userId: targetId,
        guildId,
      },
      {
        userId: targetId,
        guildId,
        $inc: {
          received: 1,
        },
      },
      {
        upsert: true,
        new: true,
      }
    )

    const amount = result.received

    const embed = new Discord.MessageEmbed()
    .setColor("RANDOM") 
    .setAuthor(`${message.author.username} pat ${target.username}! They now have been pat ${amount} time(s)`, message.author.displayAvatarURL()) 
    .setImage(data)

    message.channel.send(embed)
}

exports.help = {
    name: "pat",
    description: "this is super duper self-explanatory",
    usage: "pat `<@mention>`",
    example: "pat `@somebody`"
};

exports.conf = {
    aliases: [],
    cooldown: 4,
    guildOnly: true,
    userPerms: [],
    clientPerms: ["EMBED_LINKS", "SEND_MESSAGES"]
}