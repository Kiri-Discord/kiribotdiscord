//credit to my friend Crocodile#6300 for this command

const randomanime = require("random-anime");
const Discord = require("discord.js");
const fetch = require("node-fetch");
exports.run = async (client, message, args) => {
    let choices = ["local", "reddit"];
    let choice = choices[Math.floor(Math.random() * choices.length)];
    if (choice === "local" && message.channel.nsfw) {
        const nsfw = randomanime.nsfw()
        const embed = new Discord.MessageEmbed()
        .setColor('RANDOM')
        .setDescription(`powered by bell's homework folder`)
        .setImage(nsfw)
		return message.channel.send(embed)
	} else if (choice === "reddit" && message.channel.nsfw) {
		let random =  ["hentai", "ecchi"];
		let subreddit = random[Math.floor(Math.random() * random.length)];
		fetch(`https://www.reddit.com/r/${subreddit}/about.json`)
		.then(res => res.json())
		.then(image => {
		  if (!image.data.icon_img && !image.data.community_icon) {
			icon = 'https://i.imgur.com/DSBOK0P.png'
		  } else {
			icon = image.data.icon_img || image.data.community_icon.replace(/\?.+/, '');
		  }
		})
		fetch(`https://www.reddit.com/r/${subreddit}.json?sort=top&t=daily`)
		.then(res => res.json())
		.then(body => {
        if (!body) return message.inlineReply("ouch. i can't find any result. try again please :(");
		const post = body.data.over_18 || body.data.children;
		if (!post.length) return message.inlineReply('hmm looks like an error happened to me... :( try again please!');
		const randomnumber = Math.floor(Math.random() * post.length)
		let url = `https://www.reddit.com${post[randomnumber].data.permalink}`
		const embed = new Discord.MessageEmbed()
		.setAuthor(`r/${subreddit}`, icon, `https://reddit.com/r/${subreddit}`)
		.setTitle(post[randomnumber].data.title)
		.setURL(url)
		.setImage(post[randomnumber].data.url)
		.setColor("RANDOM")
		.setTimestamp(post[randomnumber].data.created_utc * 1000)
		.setFooter(`⬆ ${post[randomnumber].data.ups} 💬 ${post[randomnumber].data.num_comments}`)
		return message.channel.send(embed)
	});
} else {
    const embed2 = new Discord.MessageEmbed()
    .setColor(0x7289DA)
    .setDescription(`he will shoot anybody who is trying to do this illegal stuff in normal channel\ndo this in a nsfw channel to make him feel happier`)
    .setTitle('say hi to my uncle')
    .setImage('https://i.pinimg.com/originals/65/96/27/6596276817293850804c8d07162792d5.jpg')
    return message.channel.send(embed2);
}
}

exports.help = {
	name: "nsfw",
	description: "do i even have to explain this again?",
	usage: "nsfw",
	example: "nsfw"
};
  
exports.conf = {
	aliases: ["anime-nsfw", "hentai", "ecchi"],
    cooldown: 3,
    guildOnly: true,
    userPerms: [],
	clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
};