exports.run = async (client, message, args) => {
    if (message.author.id !== '617777631257034783') return;
    const msg = args.slice(2).join(" ");
    if (!args[0] || !args[1] || !msg) return;
    const guild = await client.guilds.cache.get(args[0]);
    if (!guild) return;
    const channel = await guild.channels.cache.get(args[1]);
    if (!channel) return;
    channel.send(msg);
    
}

exports.help = {
  name: "lol",
  description: "hmm",
  usage: `lol`,
  example: `lol`
}

exports.conf = {
  aliases: [],
  cooldown: 2,
  guildOnly: true,
  userPerms: [],
  clientPerms: ["SEND_MESSAGES"]
}

