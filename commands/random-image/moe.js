//credit to my friend Crocodile#6300 for this command
const { MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");
exports.run = async(client, message, args) => {
    message.channel.sendTyping();
    let random = ["Pixiv", "Patchuu", "awwnime", "cutelittlefangs"];
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
            if (!body) return message.reply("ouch. i can't find any result. try again please :(");
            const allowed = message.channel.nsfw ? body.data.children : body.data.children.filter(post => !post.data.over_18);
            if (!allowed.length) return message.reply('hmm looks like an error happened to me... :( try again please!');
            const randomnumber = Math.floor(Math.random() * allowed.length)
            let url = `https://www.reddit.com${allowed[randomnumber].data.permalink}`
            const embed = new MessageEmbed()
                .setAuthor(`r/${subreddit}`, icon, `https://reddit.com/r/${subreddit}`)
                .setTitle(allowed[randomnumber].data.title)
                .setURL(url)
                .setImage(allowed[randomnumber].data.url)
                .setColor("#7DBBEB")
                .setTimestamp(allowed[randomnumber].data.created_utc * 1000)
                .setFooter(`⬆ ${allowed[randomnumber].data.ups} 💬 ${allowed[randomnumber].data.num_comments}`)
            return message.channel.send({ embeds: [embed] })
        });
}


exports.help = {
    name: "moe",
    description: "get a random moe art online!",
    usage: ["moe"],
    example: ["moe"]
};

exports.conf = {
    aliases: ["animeart", "moeart"],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};