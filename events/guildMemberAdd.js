const Discord = require("discord.js");
const { createCanvas, registerFont } = require('canvas');
const path = require('path');
const pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ23456789'.split('');
registerFont(path.join(__dirname, '..', 'assets', 'fonts', 'Captcha.ttf'), { family: 'Captcha' });

module.exports = async (client, member) => {

  if (member.user.bot) return;

  const setting = await client.dbguilds.findOne({
    guildID: member.guild.id
  });

  const alreadyHasRole = member._roles.includes(setting.verifyRole);
  let verifyChannel = member.guild.channels.cache.find(ch => ch.id === setting.verifyChannelID);

  if (!alreadyHasRole && verifyChannel) {
    const canvas = createCanvas(125, 32);
		const ctx = canvas.getContext('2d');
		const text = randomText(5);
		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.beginPath();
		ctx.strokeStyle = '#0088cc';
		ctx.font = '26px Captcha';
		ctx.rotate(-0.05);
		ctx.strokeText(text, 15, 26);
    
    await client.dbverify.findOneAndUpdate({
      guildID: member.guild.id,
      userID: member.user.id,
    }, {
      guildID: member.guild.id,
      userID: member.user.id,
      code: text
    }, {
        upsert: true,
        new: true
    })
    const dm = new Discord.MessageEmbed()
    .setThumbnail(member.guild.iconURL({size: 4096, dynamic: true}))
    .attachFiles({ attachment: canvas.toBuffer(), name: 'captcha.png' })
    .setImage(`attachment://captcha.png`)
    .setColor('RANDOM')
    .setTitle(`Welcome to ${member.guild.name}! Wait, beep beep, boop boop?`)
    .addField(`Hello! Before you get started, I just want you to verify yourself first.`, `Enter what you see in the captcha into the channel ${verifyChannel} to verify yourself.`)
    await member.send(dm).catch(() => {
      verifyChannel.send(`<@!${member.user.id}> Hey, I guess your DM is locked so i can't send you the verify code. How about you unlock it first and type \`resend\` here.`)
      .then(i => i.delete({timeout: 10000}));
    })
  }
}

function randomText(len) {
  const result = [];
  for (let i = 0; i < len; i++) result.push(pool[Math.floor(Math.random() * pool.length)]);
  return result.join('');
}