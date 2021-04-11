const Discord = require("discord.js")
const random = require("something-random-on-discord").Random;
const punchSchema = require('../../model/punch')


exports.run = async (client, message, args) => {
    let data = await random.getAnimeImgURL("punch")

    const target = message.mentions.users.first()
    if (!target) {
      message.inlineReply("you can't just punch *air* :( please mention somebody to punch pls")
      return
    }
    if (target === client.user) return message.inlineReply('you truly are the lowest scum in history.')
    if (target.bot) return message.inlineReply("you can't punch that bot, sorry :(")

    const { guild } = message
    const guildId = guild.id
    const targetId = target.id
    const authorId = message.author.id
    const now = new Date()

    if (targetId === message.author.id) {
      message.inlineReply('are you in pain?')
      return
    }



    const result = await punchSchema.findOneAndUpdate(
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
    .setAuthor(`${message.author.username} punch ${target.username}! They now have been punched ${amount} time(s)`, message.author.displayAvatarURL()) 
    .setImage(data)

    message.channel.send(embed)
}
exports.help = {
    name: "punch",
    description: "feeling triggered? do this.\ni won't judge you tho 😏",
    usage: "punch `<@mention>`",
    example: "punch `@Dyno`"
};

exports.conf = {
    aliases: [],
    cooldown: 4,
    guildOnly: true,
    userPerms: [],
    clientPerms: ["EMBED_LINKS", "SEND_MESSAGES"]
}