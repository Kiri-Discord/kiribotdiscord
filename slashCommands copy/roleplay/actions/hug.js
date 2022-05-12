const { MessageEmbed } = require("discord.js")
const request = require('node-superfetch');
const hugSchema = require('../../../model/hug');

exports.run = async(client, interaction, args) => {
    const member = interaction.options.getMember('target');
    const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:';
    const target = member.user;

    if (target.id === client.user.id) return interaction.reply(`**${interaction.user.username}**, do you need a hug? :hugging:`)
    if (target.bot) return interaction.reply(`you can't hug that bot, sorry ${sedEmoji}`)

    const { guild } = interaction;
    const guildId = guild.id;
    const targetId = target.id;
    const authorId = interaction.user.id;

    if (targetId === authorId) {
        interaction.reply(`you hug yourself ${sedEmoji} here, take my hug instead 🤗`);
        return;
    };
    await interaction.deferReply();
    const result = await hugSchema.findOneAndUpdate({
        userId: targetId,
        guildId,
    }, {
        userId: targetId,
        guildId,
        $inc: {
            received: 1,
        },
    }, {
        upsert: true,
        new: true,
    });
    const { body } = await request.get('https://nekos.best/api/v1/hug');
    let data = body.url;
    const amount = result.received;
    const addS = amount === 1 ? '' : 's';
    const embed = new MessageEmbed()
        .setColor("#7DBBEB")
        .setAuthor({name: `${interaction.user.username} hugged ${target.username} ❤️ they was hugged ${amount} time${addS}!`, iconURL: interaction.user.displayAvatarURL()})
        .setImage(data)
    return interaction.editReply({ embeds: [embed] })
};