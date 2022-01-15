const { MessageEmbed } = require("discord.js")
const request = require('node-superfetch');

exports.run = async(client, interaction, args) => {
    const member = interaction.options.getMember('target');
    const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:';
    const deadEmoji = client.customEmojis.get('dead') ? client.customEmojis.get('dead') : ':pensive:'

    const target = member.user;

    if (target.id === client.user.id) return interaction.reply(`thanks, but i'm already full, sorry ${sedEmoji}`)
    if (target.bot) return interaction.reply("you can't feed that bot, sorry :(")
    const targetId = target.id;
    const authorId = interaction.user.id;
    if (targetId === authorId) return interaction.reply(`have you lost your mind ${deadEmoji}`);

    await interaction.deferReply();
    const { body } = await request.get('https://nekos.best/api/v1/feed');
    let data = body.url;
    const embed = new MessageEmbed()
        .setColor("#7DBBEB")
        .setAuthor({name: `${interaction.user.username} fed ${target.username}!`, iconURL: interaction.user.displayAvatarURL()})
        .setImage(data)
    return interaction.editReply({ embeds: [embed] })
}

exports.help = {
    name: "feed",
    description: "feed someone full ❤️",
    usage: ["feed <@mention>"],
    example: ["feed @somebody"]
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
}