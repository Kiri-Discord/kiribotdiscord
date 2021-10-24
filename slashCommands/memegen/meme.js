const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require("node-fetch");

exports.run = async(client, interaction) => {
    await interaction.deferReply();
    let icon;
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
            if (!body) return interaction.editReply("ouch. i fell, try again please.");
            const allowed = interaction.channel.nsfw ? body.data.children : body.data.children.filter(post => !post.data.over_18);
            if (!allowed.length) return interaction.editReply('hmm looks like an error to me... :(');
            const randomnumber = Math.floor(Math.random() * allowed.length)
            let url = `https://www.reddit.com${allowed[randomnumber].data.permalink}`
            let embed = new MessageEmbed()
                .setAuthor(`r/${memes}`, icon, `https://reddit.com/r/${memes}`)
                .setTitle(allowed[randomnumber].data.title)
                .setURL(url)
                .setImage(allowed[randomnumber].data.url)
                .setColor("#7DBBEB")
                .setTimestamp(allowed[randomnumber].data.created_utc * 1000)
                .setFooter(`⬆ ${allowed[randomnumber].data.ups} 💬 ${allowed[randomnumber].data.num_comments}`)

            return interaction.editReply({ embeds: [embed] });
        });
};

exports.help = {
    name: "meme",
    description: "checkmate some memes from a variety of sources 😋",
    usage: ["meme"],
    example: ["meme"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description),
    guild: true,
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};