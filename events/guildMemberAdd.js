const Discord = require("discord.js");

module.exports = async (client, member) => {

  if (member.user.bot) return;

  const setting = await client.dbguilds.findOne({
    guildID: member.guild.id
  });

  const alreadyHasRole = member._roles.includes(setting.verifyRole);
  let verifyChannel = member.guild.channels.cache.find(ch => ch.id === setting.verifyChannelID);

  let number = randomInteger(100000, 1000000);

  if (!alreadyHasRole && verifyChannel) {
    await client.dbverify.findOneAndUpdate({
      guildID: member.guild.id,
      userID: member.user.id,
    }, {
      guildID: member.guild.id,
      userID: member.user.id,
      code: number
    }, {
        upsert: true,
        new: true
    })
    const dm = new Discord.MessageEmbed()
    .setColor('RANDOM')
    .setTitle(`Welcome to ${member.guild.name}!`)
    .setDescription(`Hello! Before you get started, I just want you to verify yourself first.\nPut the below code into the channel ${verifyChannel} to verify yourself.`)
    .addField(`This is your code:`, `||${number}||`)
    await member.send(dm).catch(() => {
      verifyChannel.send(`<@!${member.user.id}> Hey, I guess your DM is locked so i can't send you the verify code. How about you unlock it first and type \`resend\` here.`)
      .then(i => i.delete({timeout: 10000}));
    })
  }
}

function randomInteger(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}