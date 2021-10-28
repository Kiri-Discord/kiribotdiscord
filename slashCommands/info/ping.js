const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    const pingMessage = await interaction.reply({ content: `almost there...`, fetchReply: true });
    const ping = pingMessage.createdTimestamp - interaction.createdTimestamp;
    return interaction.editReply(`:ping_pong: pong! took me ${ping}ms, and Discord ${Math.round(client.ws.ping)}ms`);
};
exports.help = {
    name: "ping",
    description: "ping me and check if i'm actually alive or not",
    usage: ["ping"],
    example: ["ping"]
};

exports.conf = {
    cooldown: 2,
    data: new SlashCommandBuilder()
        .setName(exports.help.name).setDescription(exports.help.description),
};