const Discord = require('discord.js');
const fetch = require("node-fetch");

exports.run = async(client, message, args) => {
    let icon;
    let loadingEmbed = new Discord.MessageEmbed()
        .setColor(message.member.displayHexColor)
        .setDescription(`getting a meme... hang tight!`)
    let msg = await message.channel
        .send(loadingEmbed)
        .then(m => m.delete({ timeout: 2000 }));

    let random = ["Memes", "Meme", "Davie504", "Dankmemer", "funny", "wholesomememes", "dankmemes", "raimimemes", "historymemes", "okbuddyretard", "comedyheaven", "pewdiepiesubmissions", "Animemes"]
    let memes = random[Math.floor(Math.random() * random.length)]
    fetch(`https://www.reddit.com/r/${memes}/about.json`)
        .then(res => res.json())
        .then(image => {
            if (!image.data.icon_img && !image.data.community_icon) {
                icon = 'https://i.imgur.com/DSBOK0P.png'
            } else {
                icon = image.data.icon_img || image.data.community_icon.replace(/\?.+/, '');
            }
        })
    fetch(`https://www.reddit.com/r/${memes}.json?sort=top&t=daily`)
        .then(res => res.json())
        .then(body => {
            if (!body) return message.reply("ouch. i fell, try again please.");
            const allowed = message.channel.nsfw ? body.data.children : body.data.children.filter(post => !post.data.over_18);
            if (!allowed.length) return message.reply('hmm looks like an error to me... :(');
            const randomnumber = Math.floor(Math.random() * allowed.length)
            let url = `https://www.reddit.com${allowed[randomnumber].data.permalink}`
            let embed = new Discord.MessageEmbed()
                .setAuthor(`r/${memes}`, icon, `https://reddit.com/r/${memes}`)
                .setTitle(allowed[randomnumber].data.title)
                .setURL(url)
                .setImage(allowed[randomnumber].data.url)
                .setColor("RANDOM")
                .setTimestamp(allowed[randomnumber].data.created_utc * 1000)
                .setFooter(`⬆ ${allowed[randomnumber].data.ups} 💬 ${allowed[randomnumber].data.num_comments}`)

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

    channelPerms: ["EMBED_LINKS"]
}