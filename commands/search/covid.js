const request = require('node-superfetch');
const { MessageEmbed } = require('discord.js');
const { formatNumber } = require('../../util/util');

exports.run = async (client, message, args, prefix) => {
    let query = args.join(" ") || 'all'
    let country = encodeURIComponent(query)
    try {
        const data = await fetchStats(country);
        const embed = new MessageEmbed()
        .setDescription(`You can use \`${prefix}covid <country>\` to get the information in a country, or just leave it blank to get global stats.`)
        .setColor('RANDOM')
        .setAuthor('COVID-19 stats', 'https://s.rfi.fr/media/display/d306164a-8db0-11ea-a3c1-005056a98db9/w:1280/p:16x9/int0005b.200504100504.webp', 'https://www.worldometers.info/coronavirus/')
        .setTitle(`Stats for ${country === 'all' ? 'global' : data.country}`)
        .setURL(country === 'all'
            ? 'https://www.worldometers.info/coronavirus/'
            : `https://www.worldometers.info/coronavirus/country/${data.countryInfo.iso2}/`)
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
    return message.channel.send(embed);
    } catch (err) {
        const blessEmoji = client.customEmojis.get('bless') ? client.customEmojis.get('bless') : ':slight_smile:' ;
        const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:' ;
        if (err.status === 404) return message.inlineReply(`you just gave me an invaild country or that country doesn\'t have any cases ${blessEmoji}`)
        return message.inlineReply(`sorry, i got no result. the server might be down tho ${sedEmoji}`)
    }
}

async function fetchStats(country) {
    const { body } = await request
        .get(`https://disease.sh/v3/covid-19/${country === 'all' ? 'all' : `countries/${country}`}`);
    return body;
}




exports.help = {
	name: "covid",
	description: "Display COVID-19 data of a specific country or the whole world",
	usage: "covid `[country]`",
	example: ["covid `uk`", "covid `us`"]
};
  
exports.conf = {
	aliases: ["cov"],
    cooldown: 5,
    guildOnly: true,
    
    channelPerms: ["EMBED_LINKS"]
};
