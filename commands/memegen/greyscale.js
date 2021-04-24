const request = require('node-superfetch');
const { createCanvas, loadImage } = require('canvas');
const canvasFuncs = require('../../util/canvas.js');
const srod = require("something-random-on-discord").ServerAssistant;

exports.run = async (client, message, args) => {
  let image;
  let attachments = message.attachments.array();
  if (args[0]) {
      if (srod.isURL(args[0])) {
          image = args[0];
      } else {
          return message.inlineReply("that isn't a correct URL!").then(m => m.delete({ timeout: 5000 }));
      }
  } else {
      if (attachments.length === 0) image = message.author.displayAvatarURL({size: 4096, dynamic: true, format: 'png'});
      else if (attachments.length > 1) return message.inlineReply("i only can process one image at one time!").then(m => m.delete({ timeout: 5000 }));
      else image = attachments[0].url;
  };
	try {

        message.channel.startTyping(true); 
        const { body } = await request.get(image);
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
  usage: ["greyscale `[image attachment]`", "greyscale `[URL]`"],
  example: ["greyscale `image attachment`", "greyscale `https://example.com/girl.jpg`", "greyscale"]
};

exports.conf = {
  aliases: ["grayscale"],
  cooldown: 5,
  guildOnly: true,
  userPerms: [],
	channelPerms: ["ATTACH_FILES"]
}
