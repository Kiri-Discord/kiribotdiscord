const ms = require("ms");
const { MessageEmbed } = require("discord.js");
const sendHook = require('../../features/webhook.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType } = require('discord-api-types/v9');

exports.run = async(client, interaction) => {
    const guildDB = client.guildsStorage.get(interaction.guild.id);

    const logChannel = interaction.guild.channels.cache.get(guildDB.logChannelID);

    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const time = interaction.options.getString('time');

    if (interaction.options.getBoolean('off')) {
        channel.setRateLimitPerUser(0);
        return interaction.reply({ embeds: [{ color: "#bee7f7", description: `<#${channel.id}> slowmode has been deactivated.` }] });
    };

    if (!time) return interaction.reply({ embeds: [{ color: "RED", description: "please includes the time format if you don't want to disable slowmode. all valid time format are \`s, m, hrs\` <3" }], ephemeral: true });

    let convert = ms(time);
    let toSecond = Math.floor(convert / 1000);

    if (!toSecond) return interaction.reply({ embeds: [{ color: "RED", description: "please includes the **valid** time format. all valid time format are \`s, m, hrs\` <3" }], ephemeral: true });

    if (toSecond > 21600) return interaction.reply({ embeds: [{ color: "RED", description: "the cooldown duration must not be equal to or more than 6 hours!" }], ephemeral: true });
    const rolelog = new MessageEmbed()
        .setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL()})
        .setDescription(`Slowmode is set on <#${channel.id}> for **${ms(ms(time), {long: true})}**.`)
        .addField('Moderator', interaction.user.toString())
        .setTimestamp();
    try {
        channel.setRateLimitPerUser(toSecond);
        interaction.reply({ embeds: [{ color: "#bee7f7", description: `☑️ this channel: <#${channel.id}> will have slowmode turn on for **${ms(ms(time), {long: true})}**.` }] });
        if (!logChannel) {
            return
        } else {
            const instance = new sendHook(client, logChannel, {
                username: interaction.guild.me.displayName,
                avatarURL: client.user.displayAvatarURL(),
                embeds: [rolelog],
            })
            return instance.send();
        }
    } catch (error) {
        return interaction.reply({ embeds: [{ color: 'RED', description: "ouch, i bumped by an error! can you recheck my perms? :pensive:" }], ephemeral: true });
    };
};

exports.help = {
    name: "slowmode",
    description: "set slowmode for a certain channel",
    usage: ["slowmode `<time>`", "slowmode `[channel] <time>`", "slowmode `[-off]`"],
    example: ["slowmode `#general 5s`", "slowmode `5.25 hrs`"]
};

exports.conf = {
    cooldown: 3,
    guildOnly: true,
    userPerms: ["MANAGE_CHANNELS"],
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addChannelOption(option => option
            .setName('channel')
            .setRequired(false)
            .setDescription('which channel that you want to set slowmode for?')
            .addChannelType(ChannelType.GuildText)
        )
        .addBooleanOption(option => option
            .setName('off')
            .setDescription('do you want to disable slowmode completely? (this override every option you enter)')
            .setRequired(false))
        .addStringOption(option => option
            .setName('time')
            .setRequired(false)
            .setDescription('how long is the slowmode duration? (all valid time format are \`s, m, hrs\` <3)"')),
    clientPerms: ['MANAGE_CHANNELS'],
    channelPerms: ["EMBED_LINKS"]
};