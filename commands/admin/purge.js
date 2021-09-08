const { MessageEmbed } = require('discord.js');
const sendHook = require('../../features/webhook.js');

exports.run = async(client, message, args) => {
        const guildDB = client.guildsStorage.get(message.guild.id)
        const logChannel = message.guild.channels.cache.get(guildDB.logChannelID);
        const amount = parseInt(args[0]) + 1;
        if (isNaN(amount)) {
            return message.reply('that doesn\'t seem to be a valid number.');
        } else if (amount <= 1 || amount > 100) {
            return message.reply('you need to input a number between 1 and 99!');
        };
        try {
            const fetch = await message.channel.messages.fetch({ limit: amount });
            const deletedMessages = await message.channel.bulkDelete(fetch, true);

            const results = {};
            for (const [, deleted] of deletedMessages) {
                const user = `${deleted.author.username}#${deleted.author.discriminator}`;
                if (!results[user]) results[user] = 0;
                results[user]++;
            };
            const userMessageMap = Object.entries(results);

            const finalResult = `${deletedMessages.size} message${deletedMessages.size > 1 ? 's' : ''} were removed!\n\n${userMessageMap.map(([user, messages]) => `**${user}** : ${messages}`).join('\n')}`;
        await message.channel.send({ content: finalResult }).then(async (msg) => setTimeout(() => msg.delete(), 5000))
        if (!logChannel) {
            return
        } else {
            const logembed = new MessageEmbed()
            .setAuthor(client.user.username, client.user.displayAvatarURL())
            .setDescription(`${amount} messages was deleted in ${message.channel.toString()}:\n\n${userMessageMap.map(([user, messages]) => `From **${user}** : ${messages}`).join('\n')}`)
            .addField('Moderator', message.author.toString());
            const instance = new sendHook(client, logChannel, {
                username: message.guild.me.displayName,
                avatarURL: client.user.displayAvatarURL(),
                embeds: [logembed],
            })
            return instance.send();
        };
    } catch (error) {
        return message.channel.send('there was an error when i tried to prune messages in this channel! can you check my perms?');
    };
};


exports.help = {
    name: "purge",
    description: "Purge a defined amount of message(s)",
    usage: "purge `<number>`",
    example: "purge 69"
};

exports.conf = {
    aliases: ["delete"],
    cooldown: 4,
    guildOnly: true,
    userPerms: ["MANAGE_MESSAGES"],
    channelPerms: ["MANAGE_MESSAGES"]
};