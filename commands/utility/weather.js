const Discord = require("discord.js");
const weather = require("weather-js");

exports.run = async (client, message, args) => {
    let city = args.join(" ");
    let degreetype = "C";

    await weather.find({search: city, degreeType: degreetype}, function(err, result) {
        if (!city) return message.channel.send("Please insert the city.");
        if (err || result === undefined || result.length === 0) return message.channel.send("Unknown city. Please try again.");

        let current = result[0].current;
        let location = result[0].location;

        const embed = new Discord.MessageEmbed()
        .setAuthor(current.observationpoint)
        .setTitle(`${current.skytext}`)
        .setThumbnail(current.imageUrl)
        .setTimestamp()
        .setColor(0x7289DA)
        .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))

        embed.addField("Latitude", location.lat, true)
        .addField("Longitude", location.long, true)
        .addField("Feels Like", `${current.feelslike}° Degrees`, true)
        .addField("Degree Type", location.degreetype, true)
        .addField("Winds", current.winddisplay, true)
        .addField("Humidity", `${current.humidity}%`, true)
        .addField("Timezone", `GMT ${location.timezone}`, true)
        .addField("Temperature", `${current.temperature}° Degrees`, true)
        .addField("Observation Time", current.observationtime, true)

        return message.channel.send(embed);
    })
};

exports.help = {
    name: "weather",
    description: "responds with weather information for a specific location.",
    usage: "weather <city/zipcode>",
    example: "weather Da Nang"
};

exports.conf = {
    aliases: [],
    cooldown: 7.5
}