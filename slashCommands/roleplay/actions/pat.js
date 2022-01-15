const { MessageEmbed } = require("discord.js")
const request = require('node-superfetch');
const patSchema = require('../../../model/pat');

exports.run = async(client, interaction) => {
    const member = interaction.options.getMember('target');
    const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed').toString() : ':pensive:';

    const target = member.user;

    if (target.id === client.user.id) return interaction.reply('**pat pat pat pat pat**\nyes, you!')
    if (target.bot) return interaction.reply(`this isn't an simulator so you can't pat that bot, sorry ${sedEmoji}`)

    const { guild } = interaction;
    const guildId = guild.id
    const targetId = target.id
    const authorId = interaction.user.id;

    if (targetId === authorId) {
        return interaction.reply('**pat pat pat pat pat**\nyes, you!');
    };
    await interaction.deferReply();
    const result = await patSchema.findOneAndUpdate({
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
    const { body } = await request.get('https://nekos.best/api/v1/pat');
    let image = body.url;
    const amount = result.received;
    const addS = amount === 1 ? '' : 's';
    const embed = new MessageEmbed()
        .setColor("#7DBBEB")
        .setAuthor({name: `${interaction.user.username} pat ${target.username} ❤️ they was pat ${amount} time${addS}!`, iconURL: interaction.user.displayAvatarURL()})
        .setImage(image)

    return interaction.editReply({ embeds: [embed] });
};