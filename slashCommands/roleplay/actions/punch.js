const { MessageEmbed } = require("discord.js");
const punchSchema = require('../../../model/punch');
const request = require('node-superfetch');


exports.run = async(client, interaction) => {
    const member = interaction.options.getMember('target');

    const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed').toString() : ':pensive:';

    const target = member.user;

    if (target.id === client.user.id) return interaction.reply('you truly are the lowest scum in history.');
    if (target.bot) return interaction.reply(`you can't punch that bot, sorry ${sedEmoji}`);

    const { guild } = interaction;
    const guildId = guild.id
    const targetId = target.id;

    if (targetId === interaction.user.id) {
        return interaction.reply(`${interaction.user.toString()}, are you in pain?`);
    };
    await interaction.deferReply();
    const result = await punchSchema.findOneAndUpdate({
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
    const { body } = await request.get('https://neko-love.xyz/api/v1/punch');
    const amount = result.received;
    const addS = amount === 1 ? '' : 's';
    const embed = new MessageEmbed()
        .setColor("#7DBBEB")
        .setAuthor(`${interaction.user.username} punch ${target.username} 😔 they was punched ${amount} time${addS}!`, interaction.user.displayAvatarURL())
        .setImage(body.url)
    return interaction.editReply({ embeds: [embed] })
};