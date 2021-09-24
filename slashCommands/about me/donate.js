const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    const embed = new MessageEmbed()
        .setTitle('wow, such generous...')
        .setDescription(stripIndents `
        thank you for being interested in donating to me!
        this is not required, but donating will keep me alive and performing well, as well as earning some exclusive perks.

        you can either choose a Patreon plan or donate your own amount at **[@kiridiscord](https://patreon.com/kiridiscord)**

        **what will you get for supporting:**

        ● cool donator role on both our [community server](https://discord.gg/D6rWrvS) and [our support server](https://discord.gg/kJRAjMyEkY)
        ● get more token on your daily rewards! (+50% and more your normal dailies)
        ● access to patron-only content
        ● less cooldown for most commands (1-2 seconds faster)
        ● get a glimpse of new features!

        *note: benefits will take place starting my 1.6 update*
        `)
        .setColor('#ff4d55');
    return interaction.reply({ embeds: [embed] });
};
exports.help = {
    name: "donate",
    description: "display my donation info for generous people",
    usage: ["donate"],
    example: ["donate"]
};

exports.conf = {
    cooldown: 3,
    channelPerms: ["EMBED_LINKS"],
    data: new SlashCommandBuilder()
        .setName(exports.help.name).setDescription(exports.help.description),
    guild: true
};