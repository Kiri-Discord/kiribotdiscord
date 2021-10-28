const { MessageEmbed, Util } = require('discord.js');
const { stripIndents } = require('common-tags');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    const string = interaction.options.getString('emoji');
    if (!string) {
        await interaction.deferReply();
        const icon = interaction.guild.iconURL({ size: 4096, dynamic: true });
        let notAnimated = []
        let animated = []
        await interaction.guild.emojis.cache.forEach(async emoji => {
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
            .setColor(interaction.guild.me.displayHexColor)
            .setThumbnail(icon)
            .setAuthor(`${interaction.guild.name}'s emoji(s)`, client.user.displayAvatarURL());
        if (rest.length) {
            const lastContent = rest.pop();
            if (rest.length) {
                for (const text of rest) {
                    const embed1 = new MessageEmbed()
                        .setColor(message.guild.me.displayHexColor)
                        .setDescription(text)
                    await interaction.channel.send({ embeds: [embed1] })
                };
            };
            const embed3 = new MessageEmbed()
                .setColor(message.guild.me.displayHexColor)
                .setDescription(lastContent)
                .setTimestamp()
            return interaction.channel.send({ embeds: [embed3] });
        } else {
            embed.setTimestamp()
            return interaction.editReply({ embeds: [embed] });
        };
    } else {
        const emoji = Util.resolvePartialEmoji(string);
        if (!emoji.id) return interaction.reply({ content: `sorry, but that doesn't seem to be an valid custom emoji :pensive:`, ephemeral: true })
        const embed = new MessageEmbed()
            .setTitle(emoji.name)
            .setColor('#FFE6CC')
            .setDescription(stripIndents `
            ID: \`${emoji.id}\`
            [**Emoji URL**](https://cdn.discordapp.com/emojis/${emoji.id}.png)
            `)
            .setColor(interaction.member.displayHexColor)
            .setImage(`https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}`)
        return interaction.reply({ embeds: [embed] });
    };
};
exports.help = {
    name: "emojis",
    description: "display all emojis avaliable on the server, or mention an emoji to get more info about it!",
    usage: ["emojis"],
    example: ["emojis"]
};

exports.conf = {
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"],
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addStringOption(option => option
            .setName('emoji')
            .setDescription('that certain emoji that you want to get more info about')
            .setRequired(false)
        ),

};