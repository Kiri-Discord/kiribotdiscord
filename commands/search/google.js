const Discord = require("discord.js")
const request = require("node-superfetch")

exports.run = async (client, message, args) => {
    let googleKey = process.env.gg_key;

    let csx = process.env.csx_key; 
    let query = args.join(" ");
    let result;

    if (!query) return message.reply("pls enter something so i can search 👀");

    href = await search(query);
    if (!href) return message.channel.send("unknown search :(");

    const embed = new Discord.MessageEmbed()
    .setTimestamp(new Date())
    .setTitle(href.title)
    .setDescription(href.snippet)
    .setImage(href.pagemap ? href.pagemap.cse_thumbnail[0].src : null) // Sometimes, the thumbnail might be unavailable in variant site. Return it to null.
    .setURL(href.link)
    .setColor('RANDOM')
    .setAuthor('Google', 'https://i.pinimg.com/originals/74/65/f3/7465f30319191e2729668875e7a557f2.png')
    .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
    return message.channel.send(embed).catch(err => message.channel.send("i can't seem to be able to grab you a result for that :( here is a hug for now 🤗"));

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
	aliases: ["gg"],
    cooldown: 5,
    guildOnly: true,
    userPerms: [],
	clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
};
