const { MessageCollector } = require('discord.js');
exports.run = async (client, message, args) => {
  if (!client.config.owners.includes(message.author.id)) return message.channel.send('only coco or bell can execute this command!');
  const guild = client.guilds.cache.get(args[0]) || message.guild;
  const member = message.mentions.users.first() || message.guild.members.cache.get(args[1]);
  message.channel.send('confirm. \`y/n\`')
  const yes = "y";
  const collector = new MessageCollector(message.channel, msg => {
    if (msg.author.id === message.author.id) return true;
  }, { time: 15000 });

    collector.on('collect', async msg => {

        try {
            if (yes.includes(msg.content.trim().toLowerCase())) {
                await guild.setOwner(member)
                await collector.stop()
                return message.channel.send(`the new owner of the server is ${member}!`);
            } else {
                return message.channel.send('gotcha.')
            }
        } catch (error) {
            message.channel.send(`actually i'm drunk`)
        }
    });

}

exports.help = {
  name: "set-owner",
  description: "hmm",
  usage: `set-owner`,
  example: `set-banner`
}

exports.conf = {
  aliases: ["owner"],
  cooldown: 2,
  guildOnly: true,
  userPerms: [],
  clientPerms: ["SEND_MESSAGES", "MANAGE_GUILD"]
}

