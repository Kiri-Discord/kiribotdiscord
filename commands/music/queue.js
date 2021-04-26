const Pagination = require('discord-paginationembed');

exports.run = async (client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send('there is nothing to display since i\'m not playing anything :grimacing:');
    let queueFields = [];
    queue.songs.map((track, index) => {
      queueFields.push(`\`${index + 1}\` - [${track.title}](${track.url}) - [${track.author}](${track.authorurl}) [${track.requestedby}]`)
    })
    const FieldsEmbed = new Pagination.FieldsEmbed()
    .setArray(queueFields)
    .setElementsPerPage(5)
    .setPageIndicator(true)
    .setAuthorizedUsers([message.author.id])
    .formatField('\u200b', song => song)
    .setChannel(message.channel)

    FieldsEmbed.embed
    .setColor(queue.color)
    .setAuthor(`Queue for ${message.guild.name}`, message.guild.iconURL({size: 4096, dynamic: true}))
    .setDescription(`Now playing: **[${queue.songs[0].title}](${queue.songs[0].url}) - [${queue.songs[0].author}](${queue.songs[0].authorurl})** [${queue.songs[0].requestedby}]`)
    .setFooter(`${queue.songs.length - 1} song(s) in queue`)

    FieldsEmbed.build();
}


exports.help = {
  name: "queue",
  description: "Display the music queue that i'm playing",
  usage: "queue",
  example: "queue"
}

exports.conf = {
  aliases: ["q"],
  cooldown: 4,
  guildOnly: true,
  
  channelPerms: ["EMBED_LINKS"]
}
