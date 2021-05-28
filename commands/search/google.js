const { MessageEmbed } = require("discord.js")
const request = require("node-superfetch")

exports.run = async (client, message, args) => {
    let googleKey = process.env.gg_key;
    let csx = process.env.csx_key;
    let query = args.join(" ");
    if (!query) return message.inlineReply("pls enter something so i can search 👀");
    let safesearch;
    if (message.channel.nsfw) {
        safesearch = "off"
    } else {
        safesearch = "active"
    }
    const href = await search(googleKey, csx, query, safesearch);

    if (href.error) {
        return message.channel.send(`http://lmgtfy.com/?iie=1&q=${encodeURIComponent(query)}`)
    }
    if (!href) {
        if (safesearch === "active") {
            return message.inlineReply("i can't find any result for that :pensive: try searching it again it a NSFW channel if you are looking for more darker result.\n*or Google is probably high*")
        } else {
            return message.inlineReply("i can't find any result for that :pensive:\n*Google is probably high*")
        }
    };
    const embed = new MessageEmbed()
    .setTitle(href.title)
    .setDescription(href.snippet)
    .setURL(href.link)
    .setColor(message.guild.me.displayHexColor)
    .setAuthor('Google', 'https://i.pinimg.com/originals/74/65/f3/7465f30319191e2729668875e7a557f2.png', 'https://google.com')
    if (href.pagemap.cse_image) {
        embed.setImage(href.pagemap.cse_image[0].src)
    }
    return message.channel.send(embed);
}


async function search(googleKey, csx, query, safesearch) {
    try {
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
    } catch (error) {
        if (error.status) return { error: error.status };
        else return null;
    }
}

exports.help = {
	name: "google",
	description: "search something for you on Google 👀",
	usage: "google `<query>`",
	example: "google `discord`"
};
  
exports.conf = {
	aliases: ["gg"],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};
