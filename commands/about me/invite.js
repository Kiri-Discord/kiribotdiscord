const { MessageEmbed } = require('discord.js');

exports.run = async (client, message, args) => {
  const embed = new MessageEmbed()
  .setThumbnail(client.user.displayAvatarURL({size: 4096, dynamic: true}))
  .setColor('#ffe6cc')
  .addField(`**want to add me to your server?**`, 'add me [here](https://discordbotlist.com/bots/sefy)')
  .addField(`**don't forget to join those server as well to make friends or just want to get support for me:**`, '[Sefiria](https://discord.gg/D6rWrvS), where everything started, all of my commands were built from this server\'s community. *(join now if you play AstolfoBot)*\n\n[my support server](https://discord.gg/kJRAjMyEkY), if you want to get some support or contribute!')
  return message.channel.send(embed);
};
exports.help = {
  name: "invite",
  description: "more info about how to invite me.",
  usage: "invite",
  example: "invite"
}

exports.conf = {
  aliases: ['inviteme'],
  cooldown: 2,
  channelPerms: ["EMBED_LINKS"]
};
