const request = require('node-superfetch');
const { createCanvas, loadImage } = require('canvas');
const canvasFuncs = require('../../util/canvas.js');
const srod = require("something-random-on-discord").ServerAssistant;

exports.run = async (client, message, args, prefix) => {
  let distort_level;
  let image;
  let attachments = message.attachments.array();
  if (args[0]) {
      if (srod.isURL(args[0])) {
          image = args[0];
          distort_level = args[1];
      } else {
        if (attachments.length === 0) image = message.author.displayAvatarURL({size: 4096, dynamic: true, format: 'png'});
        else if (attachments.length > 1) return message.inlineReply("i only can process one image at one time!");
        else image = attachments[0].url;
        distort_level = args[0];
      }
  } else {
      if (attachments.length === 0) image = message.author.displayAvatarURL({size: 4096, dynamic: true, format: 'png'});
      else if (attachments.length > 1) return message.inlineReply("i only can process one image at one time!");
      else image = attachments[0].url;
      distort_level = args[0];
  };
  
	try {
        message.channel.startTyping(true); 
        if (isNaN(distort_level)) return message.inlineReply(`the distort amount must to be a valid number! upload your sauce then \`${prefix}distort <distortion amount in number like 3>\``);
        const { body } = await request.get(image);
        const data = await loadImage(body);
        const canvas = createCanvas(data.width, data.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(data, 0, 0);
        canvasFuncs.distort(ctx, distort_level, 0, 0, data.width, data.height);
        const attachment = canvas.toBuffer();
        await message.channel.stopTyping(true);
        return message.channel.send({ files: [{ attachment, name: 'greyscale.png' }] });
    } catch (err) {
        await message.channel.stopTyping(true);
        return message.inlineReply(`sorry :( i got an error. try again later! can you check the image files?`);
    }
};

exports.help = {
  name: "distort",
  description: "distort an image?",
  usage: ["distort `[URL] <amount>`", "distort `[image attachment] <amount>`"],
  example: ["distort `image attachment 2`", "distort `https://example.com/girl.jpg 2`", "distort"]
};

exports.conf = {
  aliases: [],
  cooldown: 5,
  guildOnly: true,
  userPerms: [],
	clientPerms: ["ATTACH_FILES", "SEND_MESSAGES"]
}
