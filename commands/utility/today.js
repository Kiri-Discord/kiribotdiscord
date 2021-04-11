const { MessageEmbed } = require('discord.js');
const request = require('node-superfetch');
const { embedURL } = require('../../util/util');

exports.help = {
    name: "today",
    description: "Get you an event that occurred today or any day in history.",
    usage: "today `[<month> <day>]`",
    example: ["today `12 24`", "today"]
};
  
exports.conf = {
    aliases: ["history", "today-in-history", "on-this-day"],
    cooldown: 5,
    guildOnly: true,
    userPerms: [],
	clientPerms: ["EMBED_LINKS", "SEND_MESSAGES"]
}


exports.run = async (client, message, args) => {
    const month = args[0] || "";
    const day = args[1] || '';
    const date = month && day ? `/${month}/${day}` : '';

    try {
        const { text } = await request.get(`http://history.muffinlabs.com/date${date}`);
        const body = JSON.parse(text);
        const events = body.data.Events;
        const event = events[Math.floor(Math.random() * events.length)];
        const embed = new MessageEmbed()
        .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
        .setColor('RANDOM')
        .setURL(body.url)
        .setAuthor(`On this day (${body.date})...`, client.user.displayAvatarURL())
        .setTimestamp()
        .setDescription(`${event.year}: ${event.text}`)
        .addField(':arrow_right: More event:', event.links.map(link => embedURL(link.title, link.link)).join('\n'));
        return message.channel.send(embed);
    } catch (err) {
        if (err.status === 404 || err.status === 500) return message.inlineReply('you give me an invaild date :(');
        return message.inlineReply(`sorry :( i got an error. try again later! the server might be down tho.`);
    }
}