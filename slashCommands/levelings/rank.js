const { Rank } = require('canvacord');
const { MessageAttachment } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    let mention = interaction.options.getMember('user') || interaction.member;

    if (mention.user.id === client.user.id) return interaction.reply({ content: 'that is me lmao', ephemeral: true });
    if (mention.user.bot) return interaction.reply({ embeds: [{ color: "#bee7f7", description: 'just to make this clear... bots can\'t level up :pensive:' }], ephemeral: true });

    let target = await client.dbleveling.findOne({
        guildId: interaction.guild.id,
        userId: mention.user.id
    });

    if (!target) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `❌ you or that user doesn't have any leveling data yet!` }], ephemeral: true });

    const res = client.leveling.getLevelBounds(target.level + 1);

    let neededXP = res.lowerBound;

    const result = await client.dbleveling.find({
        guildId: interaction.guild.id,
    }).sort({
        xp: -1
    });

    if (!result) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `❌ this guild doesn't have any leveling data yet!\nto turn on the leveling system, do \`/leveling toggle on\`!` }], ephemeral: true });

    await interaction.deferReply();
    let rank;
    for (let counter = 0; counter < result.length; ++counter) {
        let member = interaction.guild.members.cache.get(result[counter].userId);
        if (!member) {
            client.dbleveling.findOneAndDelete({
                userId: result[counter].userId,
                guildId: interaction.guild.id,
            }, (err) => {
                if (err) logger.log('error', err);
            });
        } else if (member.user.id === mention.user.id) {
            rank = counter + 1;
        };
    };
    const rankboard = new Rank()
        .renderEmojis(true)
        .setAvatar(mention.user.displayAvatarURL({ size: 1024, dynamic: false, format: 'png' }))
        .setCurrentXP(target.xp)
        .setRequiredXP(neededXP)
        .setStatus(mention.presence ? mention.presence.status || 'offline' : 'offline')
        .setLevel(target.level)
        .setRank(rank)
        .setDiscriminator(mention.user.discriminator)
        .setUsername(mention.user.username)
        .setProgressBar("#e6e6ff", "COLOR")
        .setBackground("IMAGE", 'https://i.ibb.co/yV1PRjr/shinjuku-tokyo-mimimal-4k-o8.jpg')

    rankboard.build().then(data => {
        return interaction.editReply({
            content: `*behold, the rank card for* **${mention.user.username}**!`,
            files: [new MessageAttachment(data, 'rank.png')]
        })
    });
};

exports.help = {
    name: "rank",
    description: "show the current leveling rank of an user or yourself",
    usage: ["rank `[@member]`"],
    example: ["levelrank `@Bell`"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addUserOption(option => option
            .setName('user')
            .setRequired(false)
            .setDescription('which member would you like to get their rank? :)')
        ),
    guild: true,
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["ATTACH_FILES", "EMBED_LINKS"]
};