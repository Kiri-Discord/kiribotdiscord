const { MessageEmbed } = require("discord.js")
const request = require('node-superfetch');
const cuddleSchema = require('../../../model/cuddle');


exports.run = async(client, interaction) => {
    const member = interaction.options.getMember('target');
    const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed').toString() : ':pensive:'
    const target = member.user;

    if (target.id === client.user.id) return interaction.reply('surely, I am being rewarded because i have you :hugging:')
    if (target.bot) return interaction.reply("you can't cuddle that bot, sorry :(")

    const { guild } = interaction;
    const guildId = guild.id
    const targetId = target.id
    const authorId = interaction.user.id
    if (targetId === authorId) {
        return interaction.reply(`is the world too harsh for you? ${sedEmoji}`);
    };
    await interaction.deferReply();
    const result = await cuddleSchema.findOneAndUpdate({
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
    const { body } = await request.get('https://nekos.best/api/v1/cuddle');
    let data = body.url;
    const amount = result.received;
    const addS = amount === 1 ? '' : 's';
    const embed = new MessageEmbed()
        .setColor("#7DBBEB")
        .setAuthor({name: `${interaction.user.username} cuddled ${target.username} ❤️ they was cuddled ${amount} time${addS}!`, iconURL: interaction.user.displayAvatarURL()})
        .setImage(data)
    return interaction.editReply({ embeds: [embed] })
};