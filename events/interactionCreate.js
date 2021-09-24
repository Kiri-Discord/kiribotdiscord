const { MessageEmbed } = require('discord.js');
const { Collection } = require("discord.js");
const cooldowns = new Collection();
// const { deleteIfAble, reactIfAble } = require('../util/util');

module.exports = async(client, interaction) => {
        if (!client.finished) return;
        if (!interaction.isCommand()) return;
        let commandFile = client.slash.get(interaction.commandName);
        if (!commandFile) {
            return interaction.reply({
                content: `:grey_question: that slash command is probably outdated! can you try again in an hour?`,
                ephemeral: true
            });
        };
        const sed = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:';
        const duh = client.customEmojis.get('duh') ? client.customEmojis.get('duh') : ':blush:';
        if (commandFile.conf.maintenance && !client.config.owners.includes(interaction.user.id)) return interaction.reply(`\`/${interaction.commandName}\` is being maintained. try again later ${sed}`);
        if (interaction.channel.type === "DM" && commandFile.conf.guildOnly) return interaction.reply(`i can't execute that command inside DMs! ${client.customEmojis.get('duh') ? client.customEmojis.get('duh').toString() : ':thinking:'}`);
        if (!interaction.channel.nsfw && commandFile.conf.adult) {
            if (!interaction.channel.permissionsFor(interaction.guild.me).has('EMBED_LINKS')) {
                return interaction.reply({ content: `you can only use that in a NSFW channel! ${sed}`, ephemeral: true });
            } else {
                const embed2 = new MessageEmbed()
                    .setColor(0x7289DA)
                    .setDescription(`you met the void that belongs to people that run my NSFW commands at normal channel..\nplease consider running it in a proper NSFW channel to escape this place ${sed}`)
                    .setTitle('where is this place?')
                    .setImage('https://i.redd.it/bo81jbsoqnw41.png');
                return interaction.reply({ embeds: [embed2], ephemeral: true }).catch(() => null);
            };
        };

        if (commandFile.conf.channelPerms && interaction.channel.type !== 'DM' && commandFile.conf.channelPerms.length) {
            if (!interaction.channel.permissionsFor(interaction.guild.me).has(commandFile.conf.channelPerms)) {
                return interaction.reply({ content: `ouch! bruh it seems like i don't have the ${commandFile.conf.channelPerms.map(x => `\`${x}\``).join(" and ")} permission in this channel to properly do that for you :pensive:`, ephemeral: true});
            };
    };
    if (commandFile.conf.userPerms && interaction.channel.type !== "DM" && commandFile.conf.userPerms.length) {
        if (!interaction.member.permissions.has(commandFile.conf.userPerms)) {
            return interaction.reply({ content: `are you a mod? you don't seems to have the ${commandFile.conf.userPerms.map(x => `\`${x}\``).join(" and ")} permission for this dear :pensive:`, ephemeral: true});
        };
    };
    if (commandFile.conf.clientPerms && interaction.channel.type !== "DM" && commandFile.conf.clientPerms.length) {
        if (!interaction.guild.me.permissions.has(commandFile.conf.clientPerms)) {
            return interaction.reply({ content: `sorry, i don't have the ${commandFile.conf.clientPerms.map(x => `\`${x}\``).join(" and ")} permission across the server to do that ${sed}`, ephemeral: true });
        };
    };
    if (!cooldowns.has(commandFile.help.name)) cooldowns.set(commandFile.help.name, new Collection());

    const cooldownID = interaction.channel.type === "DM" ? interaction.user.id : interaction.user.id + interaction.guild.id;

    const now = Date.now();
    const timestamps = cooldowns.get(commandFile.help.name);
    const cooldownAmount = (commandFile.conf.cooldown || 3) * 1000;

    if (!timestamps.has(cooldownID)) {
        if (!client.config.owners.includes(interaction.user.id)) {

            timestamps.set(cooldownID, now);
        }
    } else {
        const expirationTime = timestamps.get(cooldownID) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return interaction.reply({ content: `calm down, you are in cooldown! can you wait **${timeLeft.toFixed(1)}** seconds before continuing? ${duh}`, ephemeral: true })
        };
        timestamps.set(cooldownID, now);
        setTimeout(() => timestamps.delete(cooldownID), cooldownAmount);
    };
    try {
        commandFile.run(client, interaction);
        logger.log('info', `${interaction.user.tag} (${interaction.user.id}) from ${interaction.channel.type === 'DM' ? 'DM' : `${interaction.guild.name} (${interaction.guild.id})`} ran a slash command: /${interaction.commandName}`);
    } catch (error) {
        interaction.reply({ content: `sorry, i got an error while executing that command for you. please seek some support if this happen frequently ${duh}`, ephemeral: true })
        logger.log('error', error);
    };
};