const { MessageEmbed } = require('discord.js');
const request = require('node-superfetch');
const { embedURL } = require('../../util/util');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    await interaction.deferReply();
    const month = interaction.options.getString('month') || '';
    const day = interaction.options.getInteger('day') || '';
    const date = month && day ? `/${month}/${day}` : '';
    try {
        const { text } = await request.get(`http://history.muffinlabs.com/date${date}`);
        const body = JSON.parse(text);
        const events = body.data.Events;
        const event = events[Math.floor(Math.random() * events.length)];
        const embed = new MessageEmbed()
            .setTitle(body.date)
            .setAuthor({name: `On this day...`})
            .setColor(interaction.guild.me.displayHexColor)
            .setURL(body.url)
            .setTimestamp()
            .setDescription(`${event.year}: ${event.text}`)
            .addField(':arrow_right: More events:', event.links.map(link => embedURL(link.title, link.link)).join(', '));
        return interaction.editReply({ embeds: [embed] });
    } catch (err) {
        if (err.status === 404 || err.status === 500) return interaction.editReply('you give me an invaild date :(');
        return interaction.editReply(`sorry! i got an error. try again later! the server might be down tho.`);
    }
};
exports.help = {
    name: "today",
    description: "get you an event that occurred today or any day in history.",
    usage: ["today `[<month> <day>]`"],
    example: ["today `12 24`", "today"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addStringOption(option => option
            .setName('month')
            .setDescription('what month would you like to get an event for?')
            .setRequired(false)
            .addChoice('January', '1')
            .addChoice('Febuary', '2')
            .addChoice('March', '3')
            .addChoice('April', '4')
            .addChoice('May', '5')
            .addChoice('June', '6')
            .addChoice('July', '7')
            .addChoice('August', '8')
            .addChoice('September', '9')
            .addChoice('October', '10')
            .addChoice('November', '11')
            .addChoice('December', '12')
        )
        .addIntegerOption(option => option
            .setName('day')
            .setDescription('what date would you like to get an event for?')
            .setRequired(false)
        ),
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
}