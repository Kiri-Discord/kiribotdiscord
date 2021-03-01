const { MessageCollector } = require('discord.js');
exports.run = async (client, message, args) => {
  if (!client.config.owners.includes(message.author.id)) return message.channel.send('only coco or bell can execute this command!');
  const guild = client.guilds.cache.get(args[0]) || message.guild;
  let attachments = message.attachments.array()
  if (attachments.length === 0) return message.reply("please upload some images!");
  message.channel.send('confirm. \`y/n\`')
  const yes = "y";
  const collector = new MessageCollector(message.channel, msg => {
    if (msg.author.id === message.author.id) return true;
  }, { time: 15000 });

    collector.on('collect', async msg => {

        try {
            if (yes.includes(msg.content.trim().toLowerCase())) {
                await guild.setBanner(attachments[0].url)
                await collector.stop()
                return message.channel.send(`the server's banner has been changed to ${attachments[0].url}!`);
            } else {
                return message.channel.send('gotcha.')
            }
        } catch (error) {
            message.channel.send('i couldn\'t set the banner. can you check the image format?')
        }
    });

}

exports.help = {
  name: "set-banner",
  description: "hmm",
  usage: `set-banner`,
  example: `set-banner`
}

exports.conf = {
  aliases: ["banner"],
  cooldown: 2,
  guildOnly: true,
  userPerms: [],
  clientPerms: ["SEND_MESSAGES", "MANAGE_GUILD"]
}

