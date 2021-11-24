//credit to my friend Crocodile#6300 for this command
const { MessageEmbed } = require('discord.js');
const request = require('node-superfetch');

exports.run = async(client, interaction) => {
    const query = interaction.options.getString('tag') || '';
    try {
        await interaction.deferReply();
        const { text } = await request
            .get('https://safebooru.org/index.php')
            .query({
                page: 'dapi',
                s: 'post',
                q: 'index',
                json: 1,
                tags: query,
                limit: 200
            });
        const body = JSON.parse(text);
        const data = body[Math.floor(Math.random() * body.length)];
        const embed = new MessageEmbed()
            .setColor("#7DBBEB")
            .setAuthor(`${data.id} (${data.owner})`)
            .setImage(`https://safebooru.org/images/${data.directory}/${data.image}`);
        return interaction.editReply({ embeds: [embed] })
    } catch (error) {
        interaction.editReply("i can't fetch a post for you at this time! here is a hug for now 🤗");
        return logger.log('error', err);
    };
};


exports.help = {
    name: "safebooru",
    description: "finds a random picture on Safebooru",
    usage: ["safebooru `[tag]`"],
    example: ["safebooru `hug`"]
};

exports.conf = {
    data: {
        name: exports.help.name,
        description: exports.help.description,
        options: [{
            type: 3,
            name: "tag",
            description: "what tag would you like to search for?",
            required: false
        }]
    },
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"],
    rawData: true
};