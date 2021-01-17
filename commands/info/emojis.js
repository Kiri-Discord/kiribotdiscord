const { MessageEmbed } = require('discord.js');
exports.help = {
  name: "emojis",
  description: "Display all emojis avaliable on the server",
  usage: "emojis",
  example: ["emojis"]
}

exports.conf = {
  aliases: ["emoji", "guild-emojis"],
  cooldown: 5,
  guildOnly: true,
  userPerms: [],
  clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
}


exports.run = async (client, message, args) => {
    try {
        const icon = message.guild.iconURL({size: 4096, dynamic: true});
        let notAnimated = []
        let animated = []

        await message.guild.emojis.cache.forEach(async emoji => {
            if (emoji.animated) animated.push(emoji.toString())
            else notAnimated.push(emoji.toString())
        })

        if (!animated[0]) animated = ['None']
        if (!notAnimated[0]) notAnimated = ['None'];
        const embed = new MessageEmbed()
        .setColor('#ffe6cc')
        .setThumbnail(icon)
        .setAuthor(`${message.guild.name}'s emoji(s)`, client.user.displayAvatarURL())
        .addField('Animated:', animated.join(' '))
        .addField('Not animated:', notAnimated.join(' '))
        return message.channel.send(embed)
    } catch (err) {
        return message.reply('there was an error while sending you all the emojis on this server, sorry about that :(');
    }
}