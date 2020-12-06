const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js')

exports.run = async (client, message, args) => {

    const setting = await client.dbguilds.findOne({
        guildID: message.guild.id
    });
    
    const prefix = setting.prefix;
    let countries = args.join(" ");

    if(!args[0]) return message.reply(`you have to provide me a country to search for :( or you can use \`${prefix}covid all\` to get the information in all country.`);

    if(args[0] === "all"){
        fetch(`https://covid19.mathdro.id/api`)
        .then(response => response.json())
        .then(data => {
            let confirmed = data.confirmed.value.toLocaleString()
            let recovered = data.recovered.value.toLocaleString()
            let deaths = data.deaths.value.toLocaleString()

            const embed = new MessageEmbed()
            .setThumbnail('https://s.rfi.fr/media/display/d306164a-8db0-11ea-a3c1-005056a98db9/w:1280/p:16x9/int0005b.200504100504.webp')
            .setColor('RANDOM')
            .setTitle(`Worldwide COVID-19 stats 🌎`)
            .addField('Confirmed cases', confirmed)
            .addField('Recovered', recovered)
            .addField('Deaths', deaths)
            .setAuthor(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
            .setTimestamp(new Date())
            .setFooter(client.user.username, client.user.displayAvatarURL())

            return message.channel.send(embed)
        })
    } else {
        fetch(`https://covid19.mathdro.id/api/countries/${countries}`)
        .then(response => response.json())
        .then(data => {
            let confirmed = data.confirmed.value.toLocaleString()
            let recovered = data.recovered.value.toLocaleString()
            let deaths = data.deaths.value.toLocaleString()

            const embed = new MessageEmbed()
            .setThumbnail('https://s.rfi.fr/media/display/d306164a-8db0-11ea-a3c1-005056a98db9/w:1280/p:16x9/int0005b.200504100504.webp')
            .setColor('RANDOM')
            .setTitle(`COVID-19 stats for **${countries}**`)
            .addField('Confirmed cases', confirmed)
            .addField('Recovered', recovered)
            .addField('Deaths', deaths)
            .setAuthor(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
            .setTimestamp(new Date())
            .setFooter(client.user.username, client.user.displayAvatarURL())

            return message.channel.send(embed)
        }).catch(e => {
            return message.channel.send('you gave me an invaild country :(')
        })
    }
}


exports.help = {
	name: "covid",
	description: "track a country or worldwide COVID-19 cases",
	usage: "covid `<country | all>`",
	example: ["covid `uk`", "covid `all`"]
};
  
exports.conf = {
	aliases: ["cov"],
    cooldown: 5,
    guildOnly: true
};