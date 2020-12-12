const Discord = require("discord.js");
const Pagination = require('discord-paginationembed');
exports.run = async (client, message, args) => {

  const setting = await client.dbguilds.findOne({
    guildID: message.guild.id
  });

  const prefix = setting.prefix;
  
  if (!args[0]) {
    let module = client.helps.array();

    if (!client.config.owners.includes(message.author.id)) module = client.helps.array().filter(x => !x.hide);

    const embeds = [];
    for (const mod of module) embeds.push(new Discord.MessageEmbed().addField(`${mod.name}`, mod.cmds.map(x => `\`${x}\``).join(" | ")));

    new Pagination.Embeds()
    .setArray(embeds)
    .setAuthorizedUsers([message.author.id])
    .setPageIndicator(true)
    .setChannel(message.channel)
    .setPage(1)
    .setThumbnail(client.user.displayAvatarURL())
    .setTitle('hey, how can i help?')
    .setDescription(`hi, i'm Sefy, Sefiria's exclusive assistant :D\nyou can use \`${prefix}help [command]\` to get more specific information about a command 😄\n\n*btw you can navigate thru my commands using the emojis below*`)
    .setAuthor(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
    .setFooter(client.user.username, client.user.displayAvatarURL())
    .setColor('#ffe6cc')
    .setTimestamp(new Date())
    .setDeleteOnTimeout(true)
    .setImage('https://i.ibb.co/h9jQkk0/christmas3.jpg')
    .build();

  } else {
    let cmd = args[0];
    
    // If the user type the [command], also with the aliases.
    if (client.commands.has(cmd) || client.commands.get(client.aliases.get(cmd))) {
      let command = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
      let name = command.help.name; // The command name.
      let desc = command.help.description; // The command description.
      let cooldown = command.conf.cooldown + " second(s)"; // The command cooldown.
      let aliases = command.conf.aliases.join(", ") ? command.conf.aliases.join(", ") : "no aliases provided.";
      let usage = command.help.usage ? command.help.usage : "no usage provided.";
      let example = command.help.example ? command.help.example : "no example provided.";
      
      let embed = new Discord.MessageEmbed()
      .setColor('#ffe6cc')
      .setAuthor(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
      .setFooter(client.user.username, client.user.displayAvatarURL())
      .setTitle(`${prefix}${name}`)
      .setDescription(desc)
      .setThumbnail(client.user.displayAvatarURL())
      .setFooter("[] optional, <> required. don't includes these things while typing a command :)")
      .addField("cooldown", cooldown)
      .addField("aliases", aliases, true)
      .addField("usage", usage, true)
      .addField("example", example, true)
      
      return message.channel.send(embed);
    } else {
      return message.channel.send({embed: {color: "RED", description: "unknown command :("}});
    }
  }
}

exports.help = {
  name: "help",
  description: "show my command list with its description and usage",
  usage: "help [command]",
  example: "help verify"
}

exports.conf = {
  aliases: ["?"],
  cooldown: 3,
  guildOnly: true,
  userPerms: [],
  clientPerms: []
}
