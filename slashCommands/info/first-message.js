const { MessageEmbed } = require('discord.js');

exports.run = async(client, message, args) => {
    const messages = await message.channel.messages.fetch({ after: 1, limit: 1 });
    const msg = messages.first();
    const embed = new MessageEmbed()
        .setColor(msg.member ? msg.member.displayHexColor : 0x00AE86)
        .setThumbnail(msg.author.displayAvatarURL({ format: 'png', dynamic: true }))
        .setAuthor(msg.author.tag)
        .setDescription(msg.content)
        .setTimestamp(msg.createdAt)
        .setFooter(`ID: ${msg.id}`)
        .addField('Jump to message', `[Click me to jump](${msg.url})`);
    return message.channel.send({ embeds: [embed] });
};


exports.help = {
    name: "first-message",
    description: "find the first ever sent message in a channel",
    usage: ["first-message"],
    example: ["first-message"]
};

exports.conf = {
    cooldown: 5,
    guildOnly: true,
        data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addUserOption(option => option
            .setName('channel')
            .setRequired(false)
            .setDescription('where do you want to find the first message at')
        ),
    guild: true,
    channelPerms: ["EMBED_LINKS", "READ_MESSAGE_HISTORY"]
};