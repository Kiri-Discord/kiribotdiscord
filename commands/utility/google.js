const Discord = require("discord.js")
const request = require("node-superfetch")

exports.run = async (client, message, args) => {
    let googleKey = process.env.gg_key;

    let csx = process.env.csx_key; // Search engine ID.
    let query = message.content.slice(message.content.indexOf(args[0]), message.content.length);
    let result;

    if (!query) return message.channel.send("Enter something so i can search 👀");

    href = await search(query);
    if (!href) return message.channel.send("Unknown search.");

    const embed = new Discord.MessageEmbed()
    .setTimestamp(new Date())
    .setTitle(href.title)
    .setDescription(href.snippet)
    .setImage(href.pagemap ? href.pagemap.cse_thumbnail[0].src : null) // Sometimes, the thumbnail might be unavailable in variant site. Return it to null.
    .setURL(href.link)
    .setColor('#DAF7A6')
    .setAuthor('Google', 'https://i.pinimg.com/originals/74/65/f3/7465f30319191e2729668875e7a557f2.png')

    .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
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
	aliases: ["google", "gg"],
	cooldown: 7,
};