const canvacord = require('canvacord');
const { MessageAttachment } = require('discord.js')

exports.run = async (client, message, args) => {
    let rank;

    let user = message.mentions.users.first() || message.guild.members.cache.get(args[0]) || message.author;

    let mention = message.guild.members.cache.get(user.id);

    let target = await client.dbleveling.findOne({
        guildId: message.guild.id,
        userId: mention.user.id
    });

    if (!target) return message.reply("you or that user doesn't have any leveling data yet. chat more to show yours :)");

    const res = client.leveling.getLevelBounds(target.level + 1)

    let neededXP = res.lowerBound

    const result = await client.dbleveling.find({
      guildId: message.guild.id,
    }).sort({
      xp: -1
    })

    for (let counter = 0; counter < result.length; ++counter) {

      let member = message.guild.members.cache.get(result[counter].userId)

      if (!member) {
        client.dbleveling.findOneAndDelete({
            userId: result[counter].userId,
            guildId: message.guild.id,
        }, (err) => {
            if (err) console.error(err)
        });

      } else if (member.user.id === mention.user.id) {
        rank = counter + 1
      }
    }
    message.channel.startTyping(true);

    const rankboard = new canvacord.Rank()
    .setAvatar(mention.user.displayAvatarURL({size: 1024, dynamic: false, format: 'png'}))
    .setCurrentXP(target.xp)
    .setRequiredXP(neededXP)
    .setStatus(mention.user.presence.status)
    .setLevel(target.level)
    .setRank(rank)
    .setDiscriminator(mention.user.discriminator)
    .setUsername(mention.user.username)
    .setProgressBar("#e6e6ff", "COLOR")
    .setBackground("IMAGE", "https://i.ibb.co/yV1PRjr/shinjuku-tokyo-mimimal-4k-o8.jpg")
    
    rankboard.build().then(data => {
      message.channel.stopTyping(true);
      message.channel.send(`*behold, the rank card for* **${mention.user.username}**!`, {files: [{ attachment: data, name: "rank.png"}]})
    })
}

exports.help = {
	name: "levelrank",
	description: "show the current leveling rank",
	usage: "levelrank [@member]",
	example: "levelrank @bell"
};
  
exports.conf = {
	aliases: ["rank"],
	cooldown: 5
};
