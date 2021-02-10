const Discord = require("discord.js")
const request = require("node-superfetch")

exports.run = async (client, message, args) => {
    let googleKey = process.env.gg_key;
    let csx = process.env.csx_key;
    let safesearch;
    let query = args.join(" ");
    if (!query) return message.reply("pls enter something so i can search 👀");

    if (message.channel.nsfw) {
        safesearch = "off"
    } else {
        safesearch = "active"
    }
    const href = await search(googleKey, csx, query, safesearch);
    if (!href) {
        if (safesearch === "active") {
            return message.reply("i can't find any result for that :pensive: try searching it again it a NSFW channel if you are looking for more darker result.\n*or Google is probably high*")
        } else {
            return message.reply("i can't find any result for that :pensive:\n*Google is probably high*")
        }
    };

    const embed = new Discord.MessageEmbed()
    .setTimestamp(new Date())
    .setTitle(href.title)
    .setDescription(href.snippet)
    .setURL(href.link)
    .setColor('RANDOM')
    .setAuthor('Google', 'https://i.pinimg.com/originals/74/65/f3/7465f30319191e2729668875e7a557f2.png', 'https://google.com')
    .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
    if (href.pagemap.cse_image) {
        embed.setImage(href.pagemap.cse_image[0].src)
    }
    return message.channel.send(embed).catch(err => message.channel.send("i can't seem to be able to grab you a result for that :( here is a hug for now 🤗"));

}


async function search(googleKey, csx, query, safesearch) {
    const { body } = await request.get("https://www.googleapis.com/customsearch/v1").query({
        key: googleKey, cx: csx, safe: safesearch, q: query
    });
    if (!body.items) {
        return null;
    } else if (Array.isArray(body.items)) {
        return body.items[0];
    } else {
        return body.items;
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
