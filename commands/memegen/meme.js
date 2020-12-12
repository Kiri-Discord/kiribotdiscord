const Discord = require('discord.js');
const fetch = require("node-fetch");

exports.run = async (client, message, args) => {
    let loadingEmbed = new Discord.MessageEmbed()
    .setColor("RANDOM")
    .setDescription(`getting a meme... hang tight!`)
    let msg = await message.channel
      .send(loadingEmbed)
      .then(m => m.delete({ timeout: 2000 }));

      let random = ["Memes", "Meme", "Davie504", "Dankmemer", "funny", "wholesomememes", "dankmemes", "raimimemes", "historymemes", "lastimages", "okbuddyretard", "comedyheaven", "pewdiepiesubmissions"]
      let memes = random[Math.floor(Math.random() * random.length)]
      fetch(`https://www.reddit.com/r/${memes}.json?sort=top&t=daily`)
      .then(res => res.json())
      .then(body => {
        if (!body) return message.reply("ouch. i fell, try again please.");

      const allowed = message.channel.nsfw ? body.data.children : body.data.children.filter(post => !post.data.over_18);
      if (!allowed.length) return message.channel.send('Hmm looks like an error to me...');
        const randomnumber = Math.floor(Math.random() * allowed.length)
       
    let url = `https://www.reddit.com${allowed[randomnumber].data.permalink}`
    let embed = new Discord.MessageEmbed()
      .setTitle(allowed[randomnumber].data.title)
      .setURL(url)
      .setImage(allowed[randomnumber].data.url)
      .setDescription("**-----------------------------------**")
      .addField("Meme provided by", `https://reddit.com/r/${memes}`)
      .addField("Upvotes and comments", `Upvote: **${allowed[randomnumber].data.ups}** | Comment(s) **${allowed[randomnumber].data.num_comments}**`)
      .setColor("RANDOM")
      .setTimestamp(new Date())
      .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))

    return message.channel.send(embed);
    });
}

exports.help = {
  name: "meme",
  description: "Checkmate some memes from lots of sources 😋",
  usage: "meme",
  example: "meme"
}

exports.conf = {
  aliases: ["meme", "m"],
  cooldown: 3,
  guildOnly: true,
  userPerms: [],
	clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
}