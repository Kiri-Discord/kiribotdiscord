exports.run = async (client, message, args) => {
  if(!args[0]) {
    return message.channel.send("press 🇫 to pay respect.").then(async msg => {
      await msg.react("🇫");

      const filter = async (reaction, user) => {
        const botReact = await user.bot;
        const userReact = await reaction.message.guild.members.cache.get(user.id);

        if(!botReact) message.channel.send(`**${userReact.user.username}** has paid their respect.`).then(m => m.delete({ timeout: 4000 }));

        return reaction.emoji.id === "🇫";
      }

      const reactions = msg.awaitReactions(filter, { time: 30000 })
      .then(collected => message.channel.send(`**${msg.reactions.cache.get("🇫").count - 1}** person has paid their respect.`));
    })
  } else {
    let reason = args.join(" ");
    
    return message.channel.send(`press :regional_indicator_f:  to pay respect to **${reason}**`).then(async msg => {
      await msg.react("🇫");

      const filter = async (reaction, user) => {
        const botReact = await user.bot;
        const userReact = await reaction.message.guild.members.cache.get(user.id);

        if (!botReact) message.channel.send(`**${userReact.user.username}** has paid their respect.`).then(m => m.delete({ timeout: 4000 }));

        return reaction.emoji.id === "🇫";
      }

      const reactions = msg.awaitReactions(filter, { time: 60000 })
      .then(collected => message.channel.send(`**${msg.reactions.cache.get("🇫").count - 1}** person paid their respect to **${reason}**`));
    })
  }
}

exports.help = {
  name: "pay-respect",
  description: "pay respect to someone or a reason",
  usage: ["pay-respect", "pay-respect `[reason]`", "pay-respect `[@user]`", "pay-respect `[@user]` `[reason]`"],
  example: ["pay-respect", "pay-respect `@coconut`", "pay-respect `@coconut :v`"]
}

exports.conf = {
  aliases: ["f"],
  cooldown: 5,
  guildOnly: true,
  userPerms: [],
	clientPerms: ["ADD_REACTIONS", "SEND_MESSAGES"]
}