const Discord = require("discord.js")
const { Random } = require("something-random-on-discord")
const random = new Random();
const slapSchema = require('../../model/slap')


exports.run = async (client, message, args) => {
    let data = await random.getAnimeImgURL("slap")

    const target = message.mentions.users.first()
    if (!target) {
      message.reply("you can't just slap *air* :( please mention somebody to slap pls")
      return
    }

    if (target.bot) return message.reply("you can't slap that bot, sorry :(")

    const { guild } = message
    const guildId = guild.id
    const targetId = target.id
    const authorId = message.author.id
    const now = new Date()

    if (targetId === client.user.id) {
      message.reply('what did you say?')
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
    .setDescription(`<@${message.author.id}> slap <@${targetId}>! They now have been slapped ${amount} time(s)`) 
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
    clientPerms: []
}