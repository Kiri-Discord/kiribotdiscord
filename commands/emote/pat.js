const Discord = require("discord.js")
const { Random } = require("something-random-on-discord")
const random = new Random();
const patSchema = require('../../model/pat')


exports.run = async (client, message, args) => {
    let data = await random.getAnimeImgURL("pat")

    const target = message.mentions.users.first()
    if (!target) {
      message.reply("you can't just pat **air** :( please mention somebody to pat pls")
      return
    }

    const { guild } = message
    const guildId = guild.id
    const targetId = target.id
    const authorId = message.author.id
    const now = new Date()

    if (targetId === authorId) {
      message.reply('**pat pat pat pat pat**')
      return
    }

    const authorData = await patSchema.findOne({
      userId: authorId,
      guildId,
    })




    await patSchema.findOneAndUpdate(
      {
        userId: authorId,
        guildId,
      },
      {
        userId: authorId,
        guildId,
        lastGave: now,
      },
      {
        upsert: true,
      }
    )


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
    .setColor("#ff9900") 
    .setDescription(`<@${message.author.id}> pat <@${targetId}>! They now have been pat ${amount} time(s)`) 
    .setImage(data)
    .setTimestamp(new Date())
    .setFooter(client.user.tag, client.user.displayAvatarURL())
    .setAuthor(message.author.tag,  message.author.displayAvatarURL({ dynamic: true }))


    message.channel.send(embed)
}

exports.help = {
    name: "pat",
    description: "this is super duper self-explanatory",
    usage: "pat <@mention>",
    example: "pat @Somebody"
};

exports.conf = {
    aliases: [],
    cooldown: 4
}