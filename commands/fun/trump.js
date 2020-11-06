const jimp = require("jimp")

exports.run = async (client, message, args) => {

        let img = jimp.read("https://i.imgur.com/sLaJt9q.png")
        if (!args[0]) return message.reply("Indicate that Trump should speak pls :D")
        img.then(image => {
            jimp.loadFont(jimp.FONT_SANS_32_BLACK).then(font => {
                image.resize(1000,500)
                image.print(font, 22, 120, args.join(" "), 600)
                image.getBuffer(jimp.MIME_PNG, (err, i) => {
                    message.channel.send({files: [{ attachment: i, name: "trump.png"}]})
                })
            })
        })
    }

exports.help = {
	name: "trump",
	description: "Make Trump say something",
	usage: "trump <message>",
	example: "trump hi"
};
  
exports.conf = {
	aliases: ["trump"],
	cooldown: 2
};
