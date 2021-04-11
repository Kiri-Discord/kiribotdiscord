const Discord = require("discord.js")
const random = require("something-random-on-discord").Random;
const slapSchema = require('../../model/slap')


exports.run = async (client, message, args) => {
    let data = await random.getAnimeImgURL("slap")

    const target = message.mentions.users.first()
    if (!target) {
      message.inlineReply("you can't just slap *air* :( please mention somebody to slap pls")
      return
    }
    if (target === client.user) return message.inlineReply('what did you say?')
    if (target.bot) return message.inlineReply("you can't slap that bot, sorry :(")

    const { guild } = message
    const guildId = guild.id
    const targetId = target.id
    const authorId = message.author.id
    const now = new Date()

    if (targetId === message.author.id) {
      message.inlineReply('are you in pain?')
      return
    }
    const result = await slapSchema.findOneAndUpdate(
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
    .setAuthor(`${message.author.username} slap ${target.username} They now have been slapped ${amount} time(s)`, message.author.displayAvatarURL()) 
    .setImage(data)

    message.channel.send(embed)
}
exports.help = {
    name: "slap",
    description: "slap someone with your best",
    usage: "slap `<@mention>`",
    example: "slap `@bell`"
};

exports.conf = {
    aliases: [],
    cooldown: 4,
    guildOnly: true,
    userPerms: [],
    clientPerms: ["EMBED_LINKS", "SEND_MESSAGES"]
}