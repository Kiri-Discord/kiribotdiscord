const { MessageEmbed } = require('discord.js')
const moment = require('moment');

exports.run = async (client, message, args) => {
    let mention = await getMemberfromMention(args[0], message.guild) || message.member;
    
    if (mention.user.presence.status === "dnd") mention.user.presence.status = "Do not disturb";
    if (mention.user.presence.status === "idle") mention.user.presence.status = "Idle";
    if (mention.user.presence.status === "offline") mention.user.presence.status = "Offline";
    if (mention.user.presence.status === "online") mention.user.presence.status = "Online";
    
    function game() {
      let game;
      if (mention.user.presence.activities.length >= 1) {
          if (mention.user.presence.activities[0].type === "CUSTOM_STATUS") {
              game = "That user is displaying a custom status!"
          } else {
            game = `${mention.user.presence.activities[0].type} ${mention.user.presence.activities[0].name}`
          }
      } else if (mention.user.presence.activities.length < 1) {
        game = "None"
      }
      return game; 
    }
    
    let x = Date.now() - mention.user.createdAt;
    let y = Date.now() - mention.joinedAt; 
    let created = Math.floor(x / 86400000);
    let joined = Math.floor(y / 86400000);
    
    const member = message.guild.member(mention);
    let highestrole = member.roles.highest !== undefined && member.roles.highest !== null ? member.roles.highest : "None";
    let nickname = member.nickname !== undefined && member.nickname !== null ? member.nickname : "None";
    let createdate = moment.utc(mention.user.createdAt).format("dddd, MMMM Do YYYY, HH:mm:ss"); 
    let joindate = moment.utc(member.joinedAt).format("dddd, MMMM Do YYYY, HH:mm:ss"); 
    let status = mention.user.presence.status;
    let avatar = mention.user.displayAvatarURL({size: 4096, dynamic: true}); 
    
    const embed = new MessageEmbed()
    .setAuthor(mention.user.tag, avatar)
    .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
    .setThumbnail(avatar)
    .setTimestamp()
    .setColor(mention.displayHexColor)
    .addField("Highest role", highestrole, true)
    .addField("ID", `\`${mention.user.id}\``, true)
    .addField("Nickname", nickname, true)
    .addField("Account creation date", `${createdate} \nsince ${created} day(s) ago`, true)
    .addField("Guild join date", `${joindate} \nsince ${joined} day(s) ago`, true)
    .addField("Status", status, true)
    .addField("Activity", game(), true)
    
    message.channel.send(embed); 
}

exports.help = {
  name: "user-info",
  description: "fetch an user's information on the guild. if no user is given, your own information will be displayed.",
  usage: "user-info `[@user]`",
  example: "user-info `@Bell`"
}

exports.conf = {
  aliases: ["userinfo", "whois"],
  cooldown: 3,
  guildOnly: true,
  userPerms: [],
	channelPerms: ["EMBED_LINKS"]
}
