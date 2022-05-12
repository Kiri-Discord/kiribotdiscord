const { MessageAttachment } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { generate } = require('spotify-card');
const ordinal = require('ordinal');
const ColorThief = require("colorthief");
const parse = require('parse-color');

exports.run = async(client, interaction) => {
    let mention = interaction.options.getMember('user') || interaction.member;

    if (mention.user.id === client.user.id) return interaction.reply({ content: 'that is me lmao', ephemeral: true });
    if (mention.user.bot) return interaction.reply({ embeds: [{ color: "#bee7f7", description: 'just to make this clear... bots can\'t level up :pensive:' }], ephemeral: true });

    await interaction.deferReply();

    let target = await client.db.leveling.findOne({
        guildId: interaction.guild.id,
        userId: mention.user.id
    });

    if (!target) return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `❌ you or that user doesn't have any leveling data yet!` }] });

    const res = client.leveling.getLevelBounds(target.level + 1);

    let neededXP = res.lowerBound;
    const result = await client.db.leveling.find({
        guildId: interaction.guild.id,
    }).sort({
        xp: -1
    });

    if (!result) return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `❌ this guild doesn't have any leveling data yet!\nto turn on the leveling system, do \`/leveling toggle on\`!` }] });

    
    let rank;
    for (let counter = 0; counter < result.length; ++counter) {
        let member = interaction.guild.members.cache.get(result[counter].userId);
        if (!member) {
            client.db.leveling.findOneAndDelete({
                userId: result[counter].userId,
                guildId: interaction.guild.id,
            }, (err) => {
                if (err) logger.log('error', err);
            });
        } else if (member.user.id === mention.user.id) {
            rank = counter + 1;
        };
    };
    const avatar = mention.user.displayAvatarURL({ size: 1024, dynamic: false, format: 'png' });
    const color = await ColorThief.getColor(avatar, 3);
    const image = await generate({
        songData: {
            title: mention.user.tag,
            cover: avatar,
            album: `level ${target.level} | ranked ${ordinal(rank)}`
        },
        currentTime: target.xp,
        totalTime: neededXP,
        background: parse(color).hex,
        blurImage: true,
        adaptiveTextcolor: true,
        progressBar: true
    });
    return interaction.editReply({
        files: [new MessageAttachment(image, 'rank.png')],
        content: mention.user.id === interaction.user.id ? `this is your rank card, **${mention.user.username}**! ✨` : `this is **${mention.user.username}**'s rank card! ✨`
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
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["ATTACH_FILES", "EMBED_LINKS"]
};