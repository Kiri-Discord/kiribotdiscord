const moment = require('moment');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    const today = new Date();
    if (today.getUTCMonth() + 1 > 11) {
        const date = new Date(today.getFullYear() + 1, 10, 1);
        const start = moment(today);
        const end = moment(date);
        const days = end.diff(start, "days");
        return interaction.reply(`it's **${days}** days left until No Nut November next year!`);
    } else if (today.getUTCMonth() + 1 < 11) {
        const date = new Date(today.getFullYear(), 10, 1);
        const start = moment(today);
        const end = moment(date);
        const days = end.diff(start, "days");
        return interaction.reply(`it's **${days}** days left until No Nut November this year!`);
    } else {
        const date = new Date(today.getFullYear(), 11, 1);
        const start = moment(today);
        const end = moment(date);
        const days = end.diff(start, "days");
        const troll = client.customEmojis.get('troll');
        return interaction.reply(`you are in No Nut November ${troll} may the force be with you within the next **${days}** days`);
    };
};
exports.help = {
    name: "nnn",
    description: "check how many days left until No Nut November and the remaining days until the end of it",
    usage: ["nnn"],
    example: ["nnn"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description),
    cooldown: 2,
    guildOnly: true,
};