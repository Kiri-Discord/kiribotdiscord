const { MessageEmbed, Util } = require('discord.js');

exports.run = async(client, message, args) => {
    const icon = message.guild.iconURL({ size: 4096, dynamic: true });
    let notAnimated = []
    let animated = []

    await message.guild.emojis.cache.forEach(async emoji => {
        if (emoji.animated) animated.push(emoji.toString())
        else notAnimated.push(emoji.toString())
    })

    if (!animated[0]) animated = ['None']
    if (!notAnimated[0]) notAnimated = ['None'];
    const allEmojis = `
  **Animated:**
  ${(animated.join(' ') + ' ')}

  **Not animated:**
  ${(notAnimated.join(' ') + ' ')}
  `;
    const [first, ...rest] = Util.splitMessage(allEmojis, { maxLength: 2047, char: ' ' });
    const embedArray = [];
    const embed = new MessageEmbed()
        .setDescription(first)
        .setColor(message.guild.me.displayHexColor)
        .setThumbnail(icon)
        .setAuthor(`${message.guild.name}'s emoji(s)`, client.user.displayAvatarURL())
    if (rest.length) {
        embedArray.push(embed)
        const lastContent = rest.splice(rest.length - 1, 1);
        for (const text of rest) {
            const embed1 = new MessageEmbed()
                .setColor(message.guild.me.displayHexColor)
                .setDescription(text)
            embedArray.push(embed1)
        };
        const embed3 = new MessageEmbed()
            .setColor(message.guild.me.displayHexColor)
            .setDescription(lastContent)
        embedArray.push(embed3)
        embed3.setTimestamp()
        return message.channel.send({ embeds: embedArray });
    } else {
        embed.setTimestamp()
        return message.channel.send({ embeds: [embed] });
    }
}
exports.help = {
    name: "emojis",
    description: "display all emojis avaliable on the server, or mention an emoji to get more info about it!",
    usage: ["emojis"],
    example: ["emojis"]
};

exports.conf = {
    aliases: ["emoji", "guild-emojis"],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};