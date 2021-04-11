const request = require('node-superfetch');
const { createCanvas, loadImage } = require('canvas');
const canvasFuncs = require('../../util/canvas.js');

exports.run = async (client, message, args) => {

  const setting = await client.dbguilds.findOne({
    guildID: message.guild.id
  }); 

  const prefix = setting.prefix;

  let attachments = message.attachments.array();
  if (attachments.length === 0) return message.inlineReply("can you upload image along with that command?").then(m => m.delete({ timeout: 5000 }));
  else if (attachments.length > 1) return message.inlineReply("i only can process one image at one time!").then(m => m.delete({ timeout: 5000 }));
  
	try {
        message.channel.startTyping(true); 
        let distort_level = args[0];
        if (isNaN(distort_level)) return message.inlineReply(`the distort amount must to be a valid number! upload your sauce then \`${prefix}distort <distortion amount in number like 3>\``).then(() => message.channel.stopTyping(true)).then(m => m.delete({ timeout: 5000 }));
        const { body } = await request.get(attachments[0].url);
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
  description: "make an image *high*",
  usage: "distort `<amount>`",
  example: "distort 2"
};

exports.conf = {
  aliases: [],
  cooldown: 4,
  guildOnly: true,
  userPerms: [],
	clientPerms: ["ATTACH_FILES", "SEND_MESSAGES"]
}
