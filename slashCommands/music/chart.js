const { MessageEmbed } = require('discord.js');
const { millify } = require('millify');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    await interaction.deferReply();
    const chart = await client.charts.find().sort([
        ['timesPlayed', 'descending']
    ]);
    const sedEmoji = client.customEmojis.get('sed');
    if (!chart.length) return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `there is no music chart data avaliable for this month yet ${sedEmoji}` }] });
    const months = {
        "0": "January",
        "1": "February",
        "2": "March",
        "3": "April",
        "4": "May",
        "5": "June",
        "6": "July",
        "7": "August",
        "8": "September",
        "9": "October",
        "10": "November",
        "11": "December"
    };
    const embed = new MessageEmbed()
        .setFooter(`reset on the first day of every month (UTC + 0)`);
    const array = chart.splice(0, 9);
    const top = array.shift();
    embed.setTitle(`#1 - ${top.songName}`).setURL(top.songID).setDescription(`by **${top.songAuthor}** (${millify(top.timesPlayed)} play${top.timesPlayed === 1 ? '' : 's'})`);
    if (array.length) {
        const list = array.map((res, index) => {
            return `\`#${index + 2}\` **[${res.songName}](${res.songID})** - ${res.songAuthor} (${millify(res.timesPlayed)} play${res.timesPlayed === 1 ? '' : 's'})`
        });
        embed.addField('2 through 10:', list.join('\n'));
    };

    return interaction.editReply({ embeds: [embed], content: `top 10 most played songs in **${months[new Date(Date.now()).getUTCMonth()]}** (globally):` });
};

exports.help = {
    name: "chart",
    description: "display most played song chart for this month",
    usage: ["chart"],
    example: ["chart"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description),
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};