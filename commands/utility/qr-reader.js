const request = require('node-superfetch');
const { shorten } = require('../../util/util');


exports.run = async (client, message, args) => {

    let attachments = message.attachments.array();
    if (attachments.length === 0) return message.reply("can you upload image along with that command?");
    else if (attachments.length > 1) return message.reply("i only can process one image at one time!");
    try {
        const { body } = await request
            .get('https://api.qrserver.com/v1/read-qr-code/')
            .query({ fileurl: attachments[0].url });
        const data = body[0].symbol[0];
        if (!data.data) return message.reply(`i couldn't get a link from this qr code. are you sure that this is the right image?`);
        return message.reply(`here is your link: \n||${shorten(data.data, 2000 - (message.author.toString().length + 2))}||`);
    } catch (err) {
        return message.channel.send(`sorry :( i got an error. try again later! can you check the image files?`);
    }
}

exports.help = {
    name: "qr-reader",
    description: "get the link from a qr code right on Discord!",
    usage: "qr-reader <image>",
    example: "qr-reader <image>"
};
  
exports.conf = {
    aliases: ["qr-read", "readqr"],
    cooldown: 5,
    guildOnly: true
}
