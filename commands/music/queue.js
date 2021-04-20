const { MessageEmbed } = require("discord.js");
const Pagination = require('discord-paginationembed');

exports.run = async (client, message, args) => {
    const queue = client.queue.get(message.guild.id);
    if (!queue) return message.channel.send('there is nothing to display since i\'m not playing anything :grimacing:');
    let queueFields = [];
    queue.songs.map((track, index) => {
      queueFields.push(`\`${index}\` - [${track.title}](${track.url}) - [${track.author}](${track.authorurl}) [${track.requestedby}]`)
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

    // let currentPage = 0;
    // const embeds = generateQueueEmbed(message, queue.songs, client);

    // const queueEmbed = await message.channel.send(
    //   `*page ${currentPage + 1} of ${embeds.length}*`,
    //   embeds[currentPage]
    // );

    // try {
    //   await queueEmbed.react("⬅️");
    //   await queueEmbed.react("⏹");
    //   await queueEmbed.react("➡️");
    // } catch (error) {
    //   console.error(error);
    //   message.inlineReply('there was an error while sending you the queue, sorry :pensive:').catch(console.error);
    // }

    // const filter = (reaction, user) =>
    //   ["⬅️", "⏹", "➡️"].includes(reaction.emoji.name) && message.author.id === user.id;
    // const collector = queueEmbed.createReactionCollector(filter, { time: 60000 });

    // collector.on("collect", async (reaction, user) => {
    //   try {
    //     if (reaction.emoji.name === "➡️") {
    //       if (currentPage < embeds.length - 1) {
    //         currentPage++;
    //         queueEmbed.edit(
    //             `*page ${currentPage + 1} of ${embeds.length}*`,
    //           embeds[currentPage]
    //         );
    //       }
    //     } else if (reaction.emoji.name === "⬅️") {
    //       if (currentPage !== 0) {
    //         --currentPage;
    //         queueEmbed.edit(
    //          `*page ${currentPage + 1} of ${embeds.length}*`,
    //           embeds[currentPage]
    //         );
    //       }
    //     } else {
    //       collector.stop();
    //       reaction.message.reactions.removeAll();
    //     }
    //     await reaction.users.remove(message.author.id);
    //   } catch (error) {
    //     console.error(error);
    //     return message.inlineReply('there was an error while showing you the queue, sorry :pensive:').then(m => m.delete({ timeout: 4000 })).catch(console.error);
    //   }
    // });


}

// function generateQueueEmbed(message, queue, client) {
//     let embeds = [];
//     let k = 10;

//     for (let i = 0; i < queue.length; i += 10) {
//         const current = queue.slice(i, k);
//         let j = i;
//         k += 10;

//         const info = current.map((track) => `\`${++j}\` **[${track.title}](${track.url})**`).join("\n");

//         const embed = new MessageEmbed()
//         .setTitle(`Now playing - ${queue[0].title}`)
//         .setDescription(info)
//         embeds.push(embed);
//     }

//     return embeds;
// }

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
  userPerms: [],
  clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
}
