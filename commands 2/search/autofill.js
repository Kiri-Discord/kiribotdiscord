const { MessageEmbed } = require("discord.js")
const request = require("node-superfetch")

exports.run = async (client, message, args) => {
    let query = args.join(" ");
    const { text } = await request
    .get('https://suggestqueries.google.com/complete/search')
    .query({
        client: 'firefox',
        q: query
    });
    const data = JSON.parse(text)[1];
    if (!data.length) return message.channel.send('no autofill result was found for that keyword :thinking:');
    const datas = data.map(x => `· ${x}`).join('\n');
    const embed = new MessageEmbed()
    .setTitle(query + '_____________________________________________?')
    .setColor(message.guild.me.displayHexColor)
    .setDescription(datas)
    return message.channel.send(embed);
};


exports.help = {
	name: "autofill",
	description: "show a list of suggestions from Google for a keyword you choose",
	usage: "autofill `<query>`",
	example: "autofill `discord`"
};
  
exports.conf = {
	aliases: ["gg-autofill", "google-autofill"],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};