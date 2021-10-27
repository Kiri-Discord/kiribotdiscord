const { MessageEmbed } = require("discord.js");
const weather = require("weather-js");

exports.run = async(client, message, args) => {
    let city = args.join(" ");
    let degreetype = "C";

    await weather.find({ search: city, degreeType: degreetype }, function(err, result) {
        if (!city) return message.channel.send("what city do you want to get the weather for?");
        if (err || result === undefined || result.length === 0) return message.channel.send("seems like that city doesn't exist :pensive: try again please!");

        let current = result[0].current;
        let location = result[0].location;

        const embed = new MessageEmbed()
            .setAuthor(current.observationpoint)
            .setTitle(`${current.skytext}`)
            .setThumbnail(current.imageUrl)
            .setTimestamp()
            .setColor(message.guild.me.displayHexColor)
            .setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))

        embed.addField("Latitude", location.lat, true)
            .addField("Longitude", location.long, true)
            .addField("Feels Like", `${current.feelslike}° Degrees`, true)
            .addField("Degree Type", location.degreetype, true)
            .addField("Winds", current.winddisplay, true)
            .addField("Humidity", `${current.humidity}%`, true)
            .addField("Timezone", `GMT ${location.timezone}`, true)
            .addField("Temperature", `${current.temperature}° Degrees`, true)
            .addField("Observation Time", current.observationtime, true)

        return message.channel.send({ embeds: [embed] });
    })
};

exports.help = {
    name: "weather",
    description: "responds with weather information for a specific location.",
    usage: ["weather `<city/zipcode>`"],
    example: ["weather `New York`"]
};

exports.conf = {
    aliases: [],
    cooldown: 4,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
}