const { MessageEmbed } = require('discord.js');
const sendHook = require('../../features/webhook.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const guildDB = client.guildsStorage.get(interaction.guild.id);
        const logChannel = interaction.guild.channels.cache.get(guildDB.logChannelID);
        const amount = interaction.options.getInteger('amount');
        if (amount <= 1 || amount > 100) {
            return interaction.editReply('the amount of message must lay between 1 and 99!');
        };
        try {
            const fetch = await interaction.channel.messages.fetch({ limit: amount });
            if (!fetch.size) return interaction.editReply(`there isn't any message in this channel!`)
            const deletedMessages = await interaction.channel.bulkDelete(fetch, true);

            const results = {};
            for (const [, deleted] of deletedMessages) {
                const user = `${deleted.author.username}#${deleted.author.discriminator}`;
                if (!results[user]) results[user] = 0;
                results[user]++;
            };
            const userMessageMap = Object.entries(results);

            const finalResult = `${deletedMessages.size} message${deletedMessages.size > 1 ? 's' : ''} were removed!\n\n${userMessageMap.map(([user, messages]) => `**${user}** : ${messages}`).join('\n')}`;
        await interaction.editReply({ content: finalResult });
        if (!logChannel) {
            return
        } else {
            const logembed = new MessageEmbed()
            .setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL()})
            .setDescription(`${amount} messages was deleted in ${interaction.channel.toString()}:\n\n${userMessageMap.map(([user, messages]) => `From **${user}** : ${messages}`).join('\n')}`)
            .addField('Moderator', interaction.user.toString());
            const instance = new sendHook(client, logChannel, {
                username: interaction.guild.me.displayName,
                avatarURL: client.user.displayAvatarURL(),
                embeds: [logembed],
            })
            return instance.send();
        };
    } catch (error) {
        return interaction.editReply('there was an error when i tried to prune messages in this channel! can you check my perms?');
    };
};

exports.help = {
    name: "purge",
    description: "purge a defined amount of messages in the channel",
    usage: ["purge `<number>`"],
    example: ["purge 69"]
};

exports.conf = {
    cooldown: 4,
    guildOnly: true,
    data: new SlashCommandBuilder()
    .setName(exports.help.name)
    .setDescription(exports.help.description)
    .addIntegerOption(option => option
        .setMaxValue(100)
        .setMinValue(1)
        .setName('amount')
        .setRequired(true)
        .setDescription('how many message would you like to purge?')),
    userPerms: ["MANAGE_MESSAGES"],
    channelPerms: ["MANAGE_MESSAGES", "READ_MESSAGE_HISTORY"]
};