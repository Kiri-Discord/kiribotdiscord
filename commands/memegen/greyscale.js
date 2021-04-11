const request = require('node-superfetch');
const { createCanvas, loadImage } = require('canvas');
const canvasFuncs = require('../../util/canvas.js');
exports.run = async (client, message, args) => {
  let attachments = message.attachments.array();
  if (attachments.length === 0) return message.inlineReply("can you upload image along with that command?").then(m => m.delete({ timeout: 5000 }));
  else if (attachments.length > 1) return message.inlineReply("i only can process one image at one time!").then(m => m.delete({ timeout: 5000 }));
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
        await message.channel.stopTyping(true);
        return message.channel.send(`sorry :( i got an error. try again later! can you check the image files?`)
    }
};

exports.help = {
  name: "greyscale",
  description: "is that blue? no, black.",
  usage: "greyscale `<image>`",
  example: "greyscale `you upload it yourself`"
};

exports.conf = {
  aliases: [],
  cooldown: 5,
  guildOnly: true,
  userPerms: [],
	clientPerms: ["ATTACH_FILES", "SEND_MESSAGES"]
}
