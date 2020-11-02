const Discord = require("discord.js")
const request = require("node-superfetch")

exports.run = async (client, message, args) => {
    let googleKey = process.env.gg_key;

    let csx = process.env.csx_key; // Search engine ID.
    let query = args.join(" ");
    let result;

    if (!query) return message.channel.send("Please enter the query.");

    href = await search(query);
    if (!href) return message.channel.send("Unknown search.");

    const embed = new Discord.MessageEmbed()
    .setTitle(href.title)
    .setDescription(href.snippet)
    .setImage(href.pagemap ? href.pagemap.cse_thumbnail[0].src : null) // Sometimes, the thumbnail might be unavailable in variant site. Return it to null.
    .setURL(href.link)
    .setColor('#DAF7A6')

    .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL())
    return message.channel.send(embed);

    async function search(query) {
        const { body } = await request.get("https://www.googleapis.com/customsearch/v1").query({
            key: googleKey, cx: csx, safe: "off", q: query
        });

        if (!body.items) return null;
        return body.items[0];
    }
}

exports.help = {
	name: "google",
	description: "Google sth for ya",
	usage: "google <query>",
	example: "google discord"
};
  
exports.conf = {
	aliases: [],
	cooldown: 5,
};