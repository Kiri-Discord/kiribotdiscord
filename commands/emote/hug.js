const Discord = require("discord.js")
const random = require("something-random-on-discord").Random;
const hugSchema = require('../../model/hug')


exports.run = async (client, message, args) => {
    let data = await random.getAnimeImgURL("hug")
    const member = await getMemberfromMention(args[0], message.guild);

    if (!member) {
      const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:'
      return message.inlineReply(`you can't just hug at the air ${sedEmoji} please mention somebody to hug pls`)
    };
    const target = member.user;

    if (target.id === client.user.id) return message.inlineReply('you need a hug? :hugging:')
    if (target.bot) return message.inlineReply("you can't hug that bot, sorry :(")

    const { guild } = message
    const guildId = guild.id
    const targetId = target.id
    const authorId = message.author.id
    const now = new Date()

    if (targetId === authorId) {
      message.inlineReply('you hug yourself :( here, take my hug instead 🤗')
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
    .setAuthor(`${message.author.username} hugged ${target.username}! They now have been hugged ${amount} time(s)`, message.author.displayAvatarURL()) 
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
    clientPerms: ["EMBED_LINKS", "SEND_MESSAGES"]
}