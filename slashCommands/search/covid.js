const request = require('node-superfetch');
const { MessageEmbed } = require('discord.js');
const { formatNumber } = require('../../util/util');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    let query = interaction.options.getString('country') || 'all';
    let country = encodeURIComponent(query)
    try {
        await interaction.deferReply();
        const data = await fetchStats(country);
        const embed = new MessageEmbed()
            .setDescription(`You can use \`/covid <country>\` to get the information in a country, or just leave it blank to get global stats.`)
            .setColor("#7DBBEB")
            .setAuthor({name: 'COVID-19 stats', iconURL: 'https://s.rfi.fr/media/display/d306164a-8db0-11ea-a3c1-005056a98db9/w:1280/p:16x9/int0005b.200504100504.webp', url: 'https://www.worldometers.info/coronavirus/'})
            .setTitle(`Stats for ${country === 'all' ? 'global' : data.country}`)
            .setURL(country === 'all' ?
                'https://www.worldometers.info/coronavirus/' :
                `https://www.worldometers.info/coronavirus/country/${data.countryInfo.iso2}/`)
            .setThumbnail(country === 'all' ? null : data.countryInfo.flag || null)
            .setFooter('I updated this data in', client.user.displayAvatarURL())
            .setTimestamp(data.updated)
            .addField('🧍 Total cases', `${formatNumber(data.cases)} (${formatNumber(data.todayCases)} Today)`, true)
            .addField('💀 Total deaths', `${formatNumber(data.deaths)} (${formatNumber(data.todayDeaths)} Today)`, true)
            .addField('❤️‍🩹 Total recoveries',
                `${formatNumber(data.recovered)} (${formatNumber(data.todayRecovered)} Today)`, true)
            .addField('🤒 Active cases', formatNumber(data.active), true)
            .addField('🤢 Active critical cases', formatNumber(data.critical), true)
            .addField('💉 Tests', formatNumber(data.tests), true);
        return interaction.editReply({ embeds: [embed] });
    } catch (err) {
        const blessEmoji = client.customEmojis.get('bless') ? client.customEmojis.get('bless') : ':slight_smile:';
        const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:';
        if (err.status === 404) return interaction.editReply({
            embeds: [{
                color: '#7DBBEB',
                description: `you just gave me an invaild country or that country doesn\'t have any cases ${blessEmoji}`
            }]
        })
        return interaction.editReply({
            embeds: [{
                description: `sorry, i got no result. the server might be down tho ${sedEmoji}`,
                color: "#7DBBEB"
            }]
        })
    };
};

async function fetchStats(country) {
    const { body } = await request
        .get(`https://disease.sh/v3/covid-19/${country === 'all' ? 'all' : `countries/${country}`}`);
    return body;
};
exports.help = {
	name: "covid",
	description: "display COVID-19 data of a specific country or the whole world",
	usage: ["covid `[country]`"],
	example: ["covid `uk`", "covid `us`"]
};
  
exports.conf = {
	aliases: ["cov"],
    cooldown: 5,
    guildOnly: true,
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addStringOption(option => option
            .setName('country')
            .setRequired(false)
            .setDescription('what country would you like to get the stat of?')
        ),
    channelPerms: ["EMBED_LINKS"]
};