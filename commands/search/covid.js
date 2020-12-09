const request = require('node-superfetch');
const { MessageEmbed } = require('discord.js');
const { formatNumber } = require('../../util/util');

exports.run = async (client, message, args) => {
    const setting = await client.dbguilds.findOne({
        guildID: message.guild.id
    });
    
    const prefix = setting.prefix;
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
        .addField(':arrow_right: Total Cases', `${formatNumber(data.cases)} (${formatNumber(data.todayCases)} Today)`, true)
        .addField(':arrow_right: Total Deaths', `${formatNumber(data.deaths)} (${formatNumber(data.todayDeaths)} Today)`, true)
        .addField(':arrow_right: Total Recoveries',
            `${formatNumber(data.recovered)} (${formatNumber(data.todayRecovered)} Today)`, true)
        .addField(':arrow_right: Active Cases', formatNumber(data.active), true)
        .addField(':arrow_right: Active Critical Cases', formatNumber(data.critical), true)
        .addField(':arrow_right: Tests', formatNumber(data.tests), true);
    return message.channel.send(embed);
    } catch (err) {
        if (err.status === 404) return message.channel.send('you gave me an invaild country or that country doesn\'t have any cases :)')
        return message.channel.send('sorry :( i got no result. the server might be down tho.')
    }
}

async function fetchStats(country) {
    const { body } = await request
        .get(`https://disease.sh/v3/covid-19/${country === 'all' ? 'all' : `countries/${country}`}`);
    return body;
}




exports.help = {
	name: "covid",
	description: "track a country or worldwide COVID-19 cases",
	usage: "covid `[country]`",
	example: ["covid `uk`", "covid `us`"]
};
  
exports.conf = {
	aliases: ["cov"],
    cooldown: 5,
    guildOnly: true
};
