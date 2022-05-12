//credit to my friend Crocodile#6300 for this command
const { MessageEmbed } = require('discord.js');
const request = require('node-superfetch');
const { SlashCommandBuilder } = require("@discordjs/builders");

exports.run = async(client, interaction) => {
    const query = interaction.options.getString('tag') || '';
    await interaction.deferReply();
    try {
        const { text } = await request
            .get('https://safebooru.org/index.php')
            .query({
                page: 'dapi',
                s: 'post',
                q: 'index',
                json: 1,
                tags: query,
                limit: 200
            });
        const body = JSON.parse(text);
        const data = body[Math.floor(Math.random() * body.length)];
        const embed = new MessageEmbed()
            .setColor("#7DBBEB")
            .setAuthor({name: `${data.id} (${data.owner})`})
            .setImage(`https://safebooru.org/images/${data.directory}/${data.image}`);
        return interaction.editReply({ embeds: [embed] })
    } catch (error) {
        interaction.editReply("i can't fetch a post for you at this time! here is a hug for now 🤗");
        return logger.log('error', error);
    };
};


exports.help = {
    name: "safebooru",
    description: "finds a random picture on Safebooru",
    usage: ["safebooru `[tag]`"],
    example: ["safebooru `hug`"]
};

exports.conf = {
    data: new SlashCommandBuilder()
    .setName(exports.help.name)
    .setDescription(exports.help.description)
    .addStringOption(option => option
        .setName('tag')
        .setDescription('what tag would you like to search for?')
        .setRequired(false)),
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"],
};