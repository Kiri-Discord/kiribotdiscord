const request = require('node-superfetch');
const { createCanvas, loadImage } = require('canvas');
const canvasFuncs = require('../../handler/canvas.js');
exports.run = async (client, message, args) => {
  let attachments = message.attachments.array();
  if (attachments.length === 0) return message.reply("please upload some images!");
  else if (attachments.length > 1) return message.reply("i only can process one image at one time!");
	try {

        message.channel.startTyping(true); 
        const { body } = await request.get(attachments[0].url);
        const data = await loadImage(body);
        const canvas = createCanvas(data.width, data.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(data, 0, 0);
        canvasFuncs.greyscale(ctx, 0, 0, data.width, data.height);
        const attachment = canvas.toBuffer();
        await message.channel.stopTyping(true);
        return message.channel.send({ files: [{ attachment, name: 'greyscale.png' }] });
    } catch (err) {
        return message.channel.send(`sorry :( i got an error. try again later!`);
    }
};

exports.help = {
  name: "greyscale",
  description: "is that blue? no, black.",
  usage: "greyscale",
  example: "greyscale"
};

exports.conf = {
  aliases: [],
  cooldown: 5
}
