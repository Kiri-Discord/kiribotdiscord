const { MessageEmbed } = require("discord.js");
const pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ23456789'.split('');
const ms = require("ms");

module.exports = async (client, member) => {

  if (member.user.bot) return;

  const setting = await client.dbguilds.findOne({
    guildID: member.guild.id
  });

  const roleExist = member.guild.roles.cache.get(setting.verifyRole);

  const alreadyHasRole = member._roles.includes(setting.verifyRole);
  const verifyChannel = member.guild.channels.cache.find(ch => ch.id === setting.verifyChannelID);

  if (roleExist && verifyChannel && !alreadyHasRole) {
    const timeMs = setting.verifyTimeout || ms('10m');
    const exists = await client.verifytimers.exists(member.guild.id, member.user.id);
    if (exists) {
      await client.verifytimers.deleteTimer(member.guild.id, member.user.id);
      await client.verifytimers.setTimer(member.guild.id, timeMs, member.user.id);
    } else {
      await client.verifytimers.setTimer(member.guild.id, timeMs, member.user.id);
    }
    let code = randomText(10);
    await client.dbverify.findOneAndUpdate({
      guildID: member.guild.id,
      userID: member.user.id,
    }, {
      guildID: member.guild.id,
      userID: member.user.id,
      valID: code
    }, {
        upsert: true,
        new: true
    })

    const dm = new MessageEmbed()
    .setTimestamp()
    .setFooter(client.user.username, client.user.displayAvatarURL())
    .setThumbnail(member.guild.iconURL({size: 4096, dynamic: true}))
    .setColor(member.guild.me.displayHexColor)
    .setTitle(`Welcome to ${member.guild.name}! Wait, beep beep, boop boop?`)
    .setDescription(`Hello! Before you join ${member.guild.name}, I just want you to verify yourself first. Enter the link below and solve the captcha to verify yourself. Hurry up, if you don't verify fast you will be kicked from the server in \`${ms(timeMs, {long: true})}\`\n\n*sorry, this is the only way to prevent bots from joining the server* :pensive:`)
    .addField(`Here is the link...`, `||${__baseURL}verify?valID=${code}||`)
    await member.send(dm).catch(() => {
      verifyChannel.send(`<@!${member.user.id}> uh, your DM is locked so i can't send you the verify code. can you unlock it first and type \`resend\` here?`)
      .then(i => i.delete({timeout: 10000}));
    })
  }
}

function randomText(len) {
  const result = [];
  for (let i = 0; i < len; i++) result.push(pool[Math.floor(Math.random() * pool.length)]);
  return result.join('');
}
