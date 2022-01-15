const { MessageEmbed } = require("discord.js")
const request = require('node-superfetch');
const slapSchema = require('../../../model/slap')


exports.run = async(client, interaction) => {
    const member = interaction.options.getMember('target');

    const target = member.user;

    if (target.id === client.user.id) return interaction.reply('what did you say?');
    if (target.bot) return interaction.reply("you can't slap that bot, sorry :(")

    const { guild } = interaction;
    const guildId = guild.id;
    const targetId = target.id;

    if (targetId === interaction.user.id) return interaction.reply(`${interaction.user.toString()}, are you in pain?`);

    await interaction.deferReply();
    const result = await slapSchema.findOneAndUpdate({
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
    })

    const amount = result.received;

    const { body } = await request.get('https://nekos.best/api/v1/slap');
    let image = body.url;
    const addS = amount === 1 ? '' : 's';
    const embed = new MessageEmbed()
        .setColor("#7DBBEB")
        .setAuthor({name: `${interaction.user.username} slap ${target.username} 😔 they was slapped ${amount} time${addS}!`, iconURL: interaction.user.displayAvatarURL()})
        .setImage(image)

    return interaction.editReply({ embeds: [embed] })
};