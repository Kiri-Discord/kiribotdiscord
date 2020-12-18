const randomanime = require("random-anime");
const Discord = require("discord.js");
const fetch = require("node-fetch");
exports.run = async (client, message, args) => {
	let choices = ["local", "reddit"];
	let choice = choices[Math.floor(Math.random() * choices.length)];
	if (choice === "local") {
		const anime = randomanime.anime();
		const embed = new Discord.MessageEmbed()
		.setDescription(`*powered by bell's homework folder*`)
		.setImage(anime)
		.setColor('RANDOM')
		return message.channel.send(embed)
	} else if (choice === "reddit") {
		let random =  ["Pixiv", "AnimeART", "Patchuu", "awwnime", "cutelittlefangs"];
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
		if (!body) return message.reply("ouch. i fell, try again please :(");
		const allowed = message.channel.nsfw ? body.data.children : body.data.children.filter(post => !post.data.over_18);
		if (!allowed.length) return message.reply('hmm looks like an error to me... :(');
		const randomnumber = Math.floor(Math.random() * allowed.length)
		let url = `https://www.reddit.com${allowed[randomnumber].data.permalink}`
		const embed = new Discord.MessageEmbed()
		.setAuthor(`r/${subreddit}`, icon, `https://reddit.com/r/${subreddit}`)
		.setTitle(allowed[randomnumber].data.title)
		.setURL(url)
		.setImage(allowed[randomnumber].data.url)
		.setColor("RANDOM")
		.setTimestamp(allowed[randomnumber].data.created_utc * 1000)
		.setFooter(`⬆ ${allowed[randomnumber].data.ups} 💬 ${allowed[randomnumber].data.num_comments}`)
		return message.channel.send(embed)
	});
}
}

exports.help = {
	name: "animeart",
	description: "get a random art from bell's homework folder or online",
	usage: "animeart",
	example: "animeart"
};
  
exports.conf = {
	aliases: [],
	cooldown: 3,
	guildOnly: true,
	userPerms: [],
	clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
};