const { MessageEmbed } = require('discord.js');
const request = require('node-superfetch');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    await interaction.deferReply();
    try {
        const { body } = await request.get('https://nekos.best/api/v1/nekos');
        const embed = new MessageEmbed()
            .setColor("#7DBBEB")
            .setAuthor({name: body.artist_name, url: body.artist_href})
            .setImage(body.url);
        return interaction.editReply({ embeds: [embed] })
    } catch (error) {
        interaction.editReply("i can't seem to be able to do that at this time! here is a hug for now 🤗");
        return logger.log('error', err);
    };
};

exports.help = {
    name: "neko",
    description: "get a random neko from bell's homework folder",
    usage: ["neko"],
    example: ["neko"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description),
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};