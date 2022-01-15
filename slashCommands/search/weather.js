const { MessageEmbed } = require("discord.js");
const weather = require("weather-js");
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    let city = interaction.options.getString('city');
    let degreetype = "C";

    await interaction.deferReply();
    await weather.find({ search: city, degreeType: degreetype }, function(err, result) {
        if (err || result === undefined || result.length === 0) return interaction.editReply("seems like that city doesn't exist :pensive: try again please!");

        let current = result[0].current;
        let location = result[0].location;

        const embed = new MessageEmbed()
            .setAuthor({name: current.observationpoint})
            .setTitle(`${current.skytext}`)
            .setThumbnail(current.imageUrl)
            .setTimestamp()
            .setColor(interaction.guild.me.displayHexColor)
            .setFooter(interaction.member.displayName, interaction.user.displayAvatarURL({ dynamic: true }))

        embed.addField("Latitude", location.lat, true)
            .addField("Longitude", location.long, true)
            .addField("Feels Like", `${current.feelslike}° Degrees`, true)
            .addField("Degree Type", location.degreetype, true)
            .addField("Winds", current.winddisplay, true)
            .addField("Humidity", `${current.humidity}%`, true)
            .addField("Timezone", `GMT ${location.timezone}`, true)
            .addField("Temperature", `${current.temperature}° Degrees`, true)
            .addField("Observation Time", current.observationtime, true)

        return interaction.editReply({ embeds: [embed] });
    })
};

exports.help = {
    name: "weather",
    description: "responds with weather information for a specific location.",
    usage: ["weather `<city/zipcode>`"],
    example: ["weather `New York`"]
};

exports.conf = {
    cooldown: 4,
    guildOnly: true,
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addStringOption(option => option
            .setName('city')
            .setRequired(true)
            .setDescription('what city would you like to get the weather of?')
        ),
    channelPerms: ["EMBED_LINKS"]
}