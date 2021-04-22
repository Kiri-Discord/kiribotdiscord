const { MessageEmbed } = require("discord.js");
const Pagination = require('discord-paginationembed');

exports.run = async (client, message, args, prefix) => {  
  if (!args[0]) {
    let module = client.helps.array();
    if (!client.config.owners.includes(message.author.id)) module = await module.filter(x => !x.hide);
    if (!message.channel.nsfw) module = module.filter(x => !x.adult);

    const embeds = [];
    for (const mod of module) embeds.push(new MessageEmbed().addField(`${mod.name}`, mod.cmds.map(x => `\`${x}\``).join(" | ")));

    new Pagination.Embeds()
    .setArray(embeds)
    .setAuthorizedUsers([message.author.id])
    .setPageIndicator(true, (page, pages) => `page ${page} of ${pages}.${message.channel.nsfw ? '' : `\n*nsfw command was hidden cuz you are in a normal channel* ${client.customEmojis.get('duh') ? client.customEmojis.get('duh') : ':blush:'}`}`)
    .setChannel(message.channel)
    .setPage(1)
    .setClientAssets({ prompt: 'uh {{user}} to what page would you like to jump? type 0 or \'cancel\' to cancel jumping.' })
    .setThumbnail(client.user.displayAvatarURL())
    .setTitle('hey, how can i help?')
    .setDescription(`
    hi, i'm Sefy, formerly [Sefiria](https://discord.gg/D6rWrvS) secret custom assistant ${client.customEmojis.get('sip') ? client.customEmojis.get('sip') : ':blush:'}, now goes public!
    you can use \`${prefix}help [command]\` to get more specific information about a command 😄
    
    *btw you can navigate thru my commands using the emojis below*
    `)
    .setAuthor(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
    .setFooter(`all of our command is community based, so consider joining our server with ${prefix}invite!`)
    .setColor(message.member.displayHexColor)
    .setTimeout(25000)
    .setImage('https://blackmirrorland.files.wordpress.com/2014/09/gloomy-anime-future-wallpaper-1920x1080.jpg')
    .build();

  } else {
    let cmd = args[0];
    
    if (client.commands.has(cmd) || client.commands.get(client.aliases.get(cmd))) {
      let command = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
      let name = command.help.name; 
      let desc = command.help.description;
      let cooldown = command.conf.cooldown + " second(s)";
      let aliases = command.conf.aliases.join(", ") ? command.conf.aliases.join(", ") : "no aliases provided.";
      let usage = command.help.usage ? command.help.usage : "no usage provided.";
      let example = command.help.example ? command.help.example : "no example provided.";
      let userperms = command.conf.userPerms.map(x => `\`${x}\``).join(", ") ? command.conf.userPerms.map(x => `\`${x}\``).join(", ") : "no perms required.";
      let botperms = command.conf.clientPerms.map(x => `\`${x}\``).join(", ") ? command.conf.clientPerms.map(x => `\`${x}\``).join(", ") : "no perms required.";
      let adult = command.conf.adult ? 'true' : 'false';
      
      let embed = new MessageEmbed()
      .setColor(message.guild ? message.guild.me.displayHexColor : '#ffe6cc')
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
      .addField("user permission(s)", userperms, true)
      .addField("bot permission(s)", botperms, true)
      .addField('nsfw?', adult)
      
      return message.channel.send(embed);
    } else {
      return message.channel.send({embed: {color: "RED", description: "unknown command :("}});
    }
  }
}

exports.help = {
  name: "help",
  description: "show my command list with its description and usage",
  usage: "help `[command]`",
  example: "help `ping`"
}

exports.conf = {
  aliases: ["?", "about"],
  cooldown: 3,
  guildOnly: true,
  userPerms: [],
  clientPerms: ["EMBED_LINKS", "SEND_MESSAGES", "ADD_REACTIONS"]
}
