const { MessageEmbed } = require("discord.js");
const sendHook = require('../../features/webhook.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {

    const guildDB = client.guildsStorage.get(interaction.guild.id)

    const logChannel = interaction.guild.channels.cache.get(guildDB.logChannelID);


    const member = interaction.options.getMember('user');
    const stareEmoji = client.customEmojis.get('staring') ? client.customEmojis.get('staring') : ':pensive:';
    const { user } = member;
    if (!member.manageable) return interaction.reply({ embeds: [{ color: "RED", description: `i can't change that user's nickname! they may either be an admin, or their roles are way higher than me.` }], ephemeral: true });

    const nick = interaction.options.getString('nickname');
    if (nick.length > 32) return interaction.reply({ embeds: [{ color: "RED", description: `your nickname can't be longer than 32 characters! ${stareEmoji}` }], ephemeral: true });

    const oldNick = member.displayName;
    const rolelog = new MessageEmbed()
        .setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL()})
        .setDescription(`**${user}** nickname was changed to **${nick}**`)
        .addField('Before', oldNick)
        .addField('Moderator', interaction.user.toString())
        .setTimestamp()

    try {
        await interaction.deferReply();
        await member.setNickname(nick);
        await interaction.editReply({ embeds: [{ color: "#bee7f7", description: `✅ i have changed **${user}** nickname to **${nick}** from **${oldNick}**!` }] });
        if (!logChannel) {
            return;
        } else {
            const instance = new sendHook(client, logChannel, {
                username: interaction.guild.me.displayName,
                avatarURL: client.user.displayAvatarURL(),
                embeds: [rolelog],
            })
            return instance.send();
        }
    } catch (error) {
        if (interaction.deferred) return interaction.editReply({ embeds: [{ color: "RED", description: `an error happened when i tried to kick that user! can you try again later :pensive:` }], ephemeral: true });
        else return interaction.reply({ embeds: [{ color: "RED", description: `an error happened when i tried to kick that user! can you try again later :pensive:` }], ephemeral: true });
    };
};

exports.help = {
    name: "set-nickname",
    description: "change or set an user's nickname.",
    usage: ["set-nickname `<@user> <nickname>`"],
    example: ["set-nickname `@bell#9999 hoisted`"]
}

exports.conf = {
    cooldown: 4,
    guildOnly: true,
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addUserOption(option => option
            .setName('user')
            .setRequired(true)
            .setDescription('which member that you want their nickname to be modified?')
        )
        .addStringOption(option => option
            .setName('nickname')
            .setRequired(true)
            .setDescription('what will their new nickname?')),
    userPerms: ["MANAGE_NICKNAMES"],
    clientPerms: ["MANAGE_NICKNAMES"],
    channelPerms: ["EMBED_LINKS"]
}