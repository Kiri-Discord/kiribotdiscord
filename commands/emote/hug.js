const Discord = require("discord.js")
const { Random } = require("something-random-on-discord")
const random = new Random();
const hugSchema = require('../../model/hug')


exports.run = async (client, message, args) => {
    let data = await random.getAnimeImgURL("hug")

    const target = message.mentions.users.first()
    if (!target) {
      return message.reply("you can't just hug **air** :( please mention somebody to hug pls")
    }

    if (target.bot) return message.reply("this isn't plastic memories so you can't hug that bot, sorry :(")

    const { guild } = message
    const guildId = guild.id
    const targetId = target.id
    const authorId = message.author.id
    const now = new Date()

    if (targetId === authorId) {
      message.reply('you hug yourself :( here, take my hug instead 🤗')
      return
    }



    const result = await hugSchema.findOneAndUpdate(
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
    .setDescription(`<@${message.author.id}> hugged <@${targetId}>! They now have been hugged ${amount} time(s)`) 
    .setImage(data)

    message.channel.send(embed)
}

exports.help = {
    name: "hug",
    description: "why are you still seeing this page? just do it lmao",
    usage: "hug <@mention>",
    example: "hug @Somebody"
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    userPerms: [],
    clientPerms: []
}