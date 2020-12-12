const { MessageEmbed } = require('discord.js');

exports.run = async (client, message, args) => {
    const setting = await client.dbguilds.findOne({
        guildID: message.guild.id
    });
    const prefix = setting.prefix;
    const topics = [];
    message.client.topics.forEach(topic => {
      topics.push(`\`${topic}\``);
    });
    const embed = new MessageEmbed()
    .setColor('#DAF7A6')
    .setAuthor(client.user.username, client.user.displayAvatarURL())
    .setTitle('Trivia topics')
    .setDescription(`${topics.join(' ')}\n\nType \`${prefix}trivia [topic]\` to choose one 😄`)
    .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
    .setTimestamp()
    .setColor(message.guild.me.displayHexColor);
      
    message.channel.send(embed);
}



exports.help = {
	name: "triviatopics",
	description: "displays my list of all available trivia topics",
	usage: "triviatopics",
	example: "triviatopics"
};
  
exports.conf = {
	aliases: ["quiztopics"],
  cooldown: 5,
  guildOnly: true,
  userPerms: [],
	clientPerms: []
};