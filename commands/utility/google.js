const Discord = require("discord.js")
const request = require("node-superfetch")

exports.run = async (client, message, args) => {
    let googleKey = "AIzaSyBRAcAxx2LCIk3lO8316D_cltPxsoOvH_g";

    let csx = "9c68a713c9b721c86"; // Search engine ID.

    let query = args.join(" ");

    let result;



    if (!query) return message.channel.send("Please enter the query.");



    result = await search(query);

    if (!result) return message.channel.send("Unknown search.");



    const embed = new Discord.MessageEmbed()

    .setTitle(result.title)

    .setDescription(result.snippet)

    .setImage(result.pagemap ? result.pagemap.cse_thumbnail[0].src : null) // Sometimes, the thumbnail might be unavailable in variant site. Return it to null.

    .setURL(result.link)

    .setColor(0x7289DA)

    .setFooter("Powered by Google")



    return message.channel.send(embed);



    async function search(query) {

        const { body } = await request.get("https://www.googleapis.com/customsearch/v1").query({

            key: googleKey, cx: csx, safe: "off", q: query

        });



        if (!body.items) return null;

        return body.items[0];

    }
};

exports.help = {
	name: "google",
	description: "Google sth for ya",
	usage: "google <query>",
	example: "google discord"
};
  
exports.conf = {
	aliases: [],
	cooldown: 2
};