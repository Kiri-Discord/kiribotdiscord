const fetch = require('node-fetch');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    let tag;
    const user = interaction.options.getUser('user');
    await interaction.deferReply();
    if (user) {
        tag = user.toString();
    } else {
        tag = '';
    };
    fetch('https://evilinsult.com/generate_insult.php?lang=en&type=json')
        .then(res => res.json())
        .then(json => interaction.editReply(`${tag} :fire: ${json.insult}`))
        .catch(err => {
            interaction.editReply("sorry! i got an error. can you try again later? :pensive:");
            return logger.log('error', err);
        });
};

exports.help = {
    name: "insult",
    description: "gives an evil insult or insults someone",
    usage: ["insult `[@user]`", "insult"],
    example: ["insult `@Bell`", "insult"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addUserOption(option => option
            .setName('user')
            .setRequired(false)
            .setDescription('who would you like to insult directly?')
        ),
    guild: true,
    cooldown: 3,
    guildOnly: true,
};