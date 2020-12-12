const dateformat = require('dateformat')
const { MessageEmbed } = require('discord.js')

exports.run = async (client, message, args) => {
    let icon = message.guild.iconURL({size: 4096, dynamic: true});
    let region = {
      "brazil": "Brazil",
      "eu-central": "Central Europe",
      "singapore": "Singapore",
      "london": "London",
      "russia": "Russia",
      "japan": "Japan",
      "hongkong": "Hongkong",
      "sydney": "Sydney",
      "us-central": "U.S. Central",
      "us-east": "U.S. East",
      "us-south": "U.S. South",
      "us-west": "U.S. West",
      "eu-west": "Western Europe"
    }
    let member = message.guild.members;
    let offline = member.cache.filter(m => m.user.presence.status === "offline").size,
        online = member.cache.filter(m => m.user.presence.status === "online").size,
        idle = member.cache.filter(m => m.user.presence.status === "idle").size,
        dnd = member.cache.filter(m => m.user.presence.status === "dnd").size,
        robot = member.cache.filter(m => m.user.bot).size,
        total = message.guild.memberCount;
    let channels = message.guild.channels;
    let text = channels.cache.filter(r => r.type === "text").size,
        vc = channels.cache.filter(r => r.type === "voice").size,
        category = channels.cache.filter(r => r.type === "category").size,
        totalchan = channels.cache.size;
    let location = region[message.guild.region];
    let x = Date.now() - message.guild.createdAt;
    let h = Math.floor(x / 86400000) 
    let created = dateformat(message.guild.createdAt); 
    
    const embed = new MessageEmbed()
    .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
    .setColor('#ffe6cc')
    .setTimestamp(new Date())
    .setThumbnail(icon)
    .setAuthor(`Information for ${message.guild.name}:`, client.user.displayAvatarURL())
    .setDescription(`**ID:** \`${message.guild.id}\``)
    .addField("Region", location, true)
    .addField("Date created", `${created} \n**${h}** day(s) ago`, true)
    .addField("Owner", `**${message.guild.owner.user.tag}** \n\`${message.guild.owner.user.id}\``, true)
    .addField(`Members [${total}]`, `Online: ${online} \nIdle: ${idle} \nDND: ${dnd} \nOffline: ${offline} \nBots: ${robot}`, true)
    .addField(`Channels [${totalchan}]`, `Text: ${text} \nVoice: ${vc} \nCategory: ${category}`, true)
    message.channel.send(embed); 
}
exports.help = {
  name: "server-info",
  description: "fetch the guild's information",
  usage: "server-info",
  example: "server-info"
}

exports.conf = {
  aliases: ["serverinfo", "guildinfo"],
  cooldown: 5,
  guildOnly: true,
  userPerms: [],
	clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
}
