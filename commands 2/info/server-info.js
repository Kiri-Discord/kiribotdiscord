const dateformat = require('dateformat');
const { MessageEmbed } = require('discord.js');
const { trimArray } = require('../../util/util');

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
    };
    let filterLevels = {
      DISABLED: 'Off',
      MEMBERS_WITHOUT_ROLES: 'No role',
      ALL_MEMBERS: 'Everyone'
    };
    let verificationLevels = {
      NONE: 'None',
      LOW: 'Low',
      MEDIUM: 'Medium',
      HIGH: 'High',
      VERY_HIGH: 'Highest'
    };
    let roles = message.guild.roles.cache
    .sort((a, b) => b.position - a.position)
    .map(role => role.toString());
    let nitroEmoji = client.customEmojis.get('nitro_badge');
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
        totalchan = text + vc;
    let location = region[message.guild.region];
    let x = Date.now() - message.guild.createdAt;
    let h = Math.floor(x / 86400000) 
    let created = dateformat(message.guild.createdAt);
    let dots;
    if (roles.length) {
      if (roles.length > 5) dots = '...';
      else dots = ''
    } else dots = '';
    const embed = new MessageEmbed()
    .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
    .setColor(message.member.displayHexColor)
    .setTimestamp(new Date())
    .setThumbnail(icon)
    .setAuthor(`Information for ${message.guild.name}:`, client.user.displayAvatarURL())
    .setDescription(`**ID:** \`${message.guild.id}\``)
    .addField("\`🌐\` Region", location, true)
    .addField("\`📅\` Date created", `${created} \n**${h}** day(s) ago`, true)
    .addField("\`👑\` Owner", `**${message.guild.owner.user.toString()}** \n\`${message.guild.owner.user.id}\``, true)
    .addField(`\`👤\` Members [${total}]`, `Online: ${online} \nIdle: ${idle} \nDND: ${dnd} \nOffline: ${offline} \nBots: ${robot}`, true)
    .addField(`\`💬\` Channels [${totalchan}]`, `Text: ${text} \nVoice: ${vc} \nCategory: ${category}`, true)
    .addField('\`🔞\` Explicit filter', filterLevels[message.guild.explicitContentFilter], true)
    .addField('\`🔑\` Verification (Discord Server Setting)', verificationLevels[message.guild.verificationLevel], true)
    .addField(`${nitroEmoji} Boosting`, `Boost count: \`${message.guild.premiumSubscriptionCount || 0}\`${message.guild.premiumTier ? ` (Tier ${message.guild.premiumTier})` : ''}`, true)
    .addField(`\`🔥\` Roles [${roles.length}]`, roles.length ? trimArray(roles, 5).join(', ') + dots : 'None')
    message.channel.send(embed); 
}
exports.help = {
  name: "server-info",
  description: "fetch the guild's information",
  usage: "server-info",
  example: "server-info"
}

exports.conf = {
  aliases: ["serverinfo", "guildinfo", 'server'],
  cooldown: 5,
  guildOnly: true,
	channelPerms: ["EMBED_LINKS"]
}
