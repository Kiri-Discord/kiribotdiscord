const { MessageEmbed, Util } = require('discord.js');
const { stripIndents } = require('common-tags');

exports.run = async(client, message, args) => {
    if (!args[0]) {
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
        const [first, ...rest] = Util.splitMessage(allEmojis, { maxLength: 3900, char: ' ' });
        const embed = new MessageEmbed()
            .setDescription(first)
            .setColor(message.guild.me.displayHexColor)
            .setThumbnail(icon)
            .setAuthor(`${message.guild.name}'s emoji(s)`, client.user.displayAvatarURL());
        if (rest.length) {
            const lastContent = rest.pop();
            if (rest.length) {
                for (const text of rest) {
                    const embed1 = new MessageEmbed()
                        .setColor(message.guild.me.displayHexColor)
                        .setDescription(text)
                    await message.channel.send({ embeds: [embed1] })
                };
            };
            const embed3 = new MessageEmbed()
                .setColor(message.guild.me.displayHexColor)
                .setDescription(lastContent)
                .setTimestamp()
            return message.channel.send({ embeds: [embed3] });
        } else {
            embed.setTimestamp()
            return message.channel.send({ embeds: [embed] });
        };
    } else {
        const emoji = Util.resolvePartialEmoji(args[0]);
        if (!emoji.id) return message.channel.send(`sorry, but that doesn't seem to be an valid custom emoji :pensive:`)
        const embed = new MessageEmbed()
            .setTitle(emoji.name)
            .setColor('#FFE6CC')
            .setDescription(stripIndents `
            ID: \`${emoji.id}\`
            [**Emoji URL**](https://cdn.discordapp.com/emojis/${emoji.id}.png)
            `)
            .setColor(message.member.displayHexColor)
            .setImage(`https://cdn.discordapp.com/emojis/${emoji.id}.png`)
        return message.channel.send({ embeds: [embed] });
    };
};
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