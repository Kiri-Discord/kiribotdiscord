const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    const pingMessage = await interaction.reply({ content: `almost there...`, fetchReply: true });
    const ping = pingMessage.createdTimestamp - interaction.createdTimestamp;
    return interaction.editReply(`:ping_pong: pong! took me ${ping}ms, and discord ${Math.round(client.ws.ping)}ms`);
};
exports.help = {
    name: "ping",
    description: "very self-explanatory",
    usage: ["ping"],
    example: ["ping"]
};

exports.conf = {
    aliases: [],
    cooldown: 2,
    guild: true,
    data: new SlashCommandBuilder()
        .setName('ping').setDescription('very self-explanatory')
};