const request = require('node-superfetch');
const { shorten } = require('../../util/util');
const validUrl = require('valid-url');


exports.run = async (client, message, args) => {
    let image;
    let attachments = message.attachments.array();
    if (args[0]) {
        if (validUrl.isUri(args[0])) {
            image = args[0];
        } else {
            return message.inlineReply("that isn't a correct URL!");
        }
    } else {
        if (attachments.length === 0) return message.inlineReply("can you paste any URL or upload any screenshot for me to analyze along with that command?");
        else if (attachments.length > 1) return message.inlineReply("i only can process one image at one time!");
        else image = attachments[0].url;
    };
    try {
        const { body } = await request
            .get('https://api.qrserver.com/v1/read-qr-code/')
            .query({ fileurl: image });
        const data = body[0].symbol[0];
        if (!data.data) return message.inlineReply(`i couldn't get a link from this qr code. are you sure that this is the right image?`);
        return message.channel.send(`here is your link: \n||${shorten(data.data, 2000 - (message.author.toString().length + 2))}||`);
    } catch (err) {
        return message.channel.send(`sorry :( i got an error. try again later! can you check the image files?`);
    }
}

exports.help = {
    name: "qr-reader",
    description: "get the link from a qr code right on Discord!",
    usage: "qr-reader `<image>`",
    example: "qr-reader `<image>`"
};
  
exports.conf = {
    aliases: ["qr-read", "readqr"],
    cooldown: 5,
    guildOnly: true,
}
