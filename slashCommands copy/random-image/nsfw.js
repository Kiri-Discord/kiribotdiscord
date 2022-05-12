const { MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    await interaction.deferReply();
    let random = ["hentai", "ecchi", "ahegao", "pantsu"];
    let subreddit = random[Math.floor(Math.random() * random.length)];
    fetch(`https://www.reddit.com/r/${subreddit}/about.json`)
        .then(res => res.json())
        .then(image => {
            if (!image.data.icon_img && !image.data.community_icon) {
                icon = 'https://i.imgur.com/DSBOK0P.png'
            } else {
                icon = image.data.icon_img || image.data.community_icon.replace(/\?.+/, '');
            };
        })
    fetch(`https://www.reddit.com/r/${subreddit}.json?sort=top&t=daily`)
        .then(res => res.json())
        .then(body => {
            if (!body) return interaction.editReply("ouch. i can't find any result. try again please :(");
            const post = body.data.over_18 || body.data.children;
            if (!post.length) return interaction.editReply('hmm looks like an error happened to me... :( try again please!');
            const randomnumber = Math.floor(Math.random() * post.length)
            let url = `https://www.reddit.com${post[randomnumber].data.permalink}`
            const embed = new MessageEmbed()
                .setAuthor({name: `r/${subreddit}`, iconURL: icon, url: `https://reddit.com/r/${subreddit}`})
                .setTitle(post[randomnumber].data.title)
                .setURL(url)
                .setImage(post[randomnumber].data.url)
                .setColor("#7DBBEB")
                .setTimestamp(post[randomnumber].data.created_utc * 1000)
                .setFooter({text: `⬆ ${post[randomnumber].data.ups} 💬 ${post[randomnumber].data.num_comments}`})
            return interaction.editReply({ embeds: [embed] })
        });
}

exports.help = {
    name: "nsfw",
    description: "send some nsfw content fron random sources 😢",
    usage: ["nsfw"],
    example: ["nsfw"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description),
    cooldown: 3,
    guildOnly: true,
    adult: true,
    channelPerms: ["EMBED_LINKS"]
};