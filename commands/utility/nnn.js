const moment = require('moment');

exports.run = async(client, message, args) => {
    const today = new Date();
    if (today.getUTCMonth() + 1 > 11) {
        const date = new Date(today.getFullYear() + 1, 10, 1);
        const start = moment(today);
        const end = moment(date);
        const days = end.diff(start, "days");
        return message.channel.send(`it's **${days}** days left until No Nut November next year!`);
    } else if (today.getUTCMonth() + 1 < 11) {
        const date = new Date(today.getFullYear(), 10, 1);
        const start = moment(today);
        const end = moment(date);
        const days = end.diff(start, "days");
        return message.channel.send(`it's **${days}** days left until No Nut November this year!`);
    } else {
        const date = new Date(today.getFullYear(), 11, 1);
        const start = moment(today);
        const end = moment(date);
        const days = end.diff(start, "days");
        const troll = client.customEmojis.get('troll');
        return message.channel.send(`you are in No Nut November ${troll} may the force be with you within the next **${days}** days`);
    };
};
exports.help = {
    name: "nnn",
    description: "check how many days left until No Nut November and if it's already November, track the remaining days",
    usage: ["nnn"],
    example: ["nnn"]
};

exports.conf = {
    aliases: [],
    cooldown: 2,
    guildOnly: true,
};