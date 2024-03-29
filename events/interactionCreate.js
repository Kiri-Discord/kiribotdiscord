const { MessageEmbed } = require('discord.js');
const { Collection } = require("discord.js");
const cooldowns = new Collection();

module.exports = async(client, interaction) => {
        if (!client.finished) return;
        if (interaction.isCommand() || interaction.isContextMenu()) {
            let commandFile = client.slash.get(interaction.commandName);
            if (!commandFile) {
                return interaction.reply({
                    content: `:grey_question: that slash command is probably outdated! can you try again in an hour?`,
                    ephemeral: true
                });
            };
            const sed = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:';
            const duh = client.customEmojis.get('duh') ? client.customEmojis.get('duh') : ':blush:';
            if (interaction.inGuild() && !interaction.channel.permissionsFor(interaction.guild.me).has("SEND_MESSAGES"))
                return interaction.reply({
                    content: `due to the nature of some commands requiring sending additional messages (not replies of slash command), i will need the \`SEND_MESSAGES\` perms in this channel ${sed}`,
                    ephemeral: true
                });
            if (commandFile.conf.maintenance && !client.config.owners.includes(interaction.user.id)) return interaction.reply(`\`/${interaction.commandName}\` is under maintenance or is only avaliable for a limited number of people. try again later ${sed}`);
            if (!interaction.inGuild() && commandFile.conf.guildOnly) return interaction.reply(`i can't execute that command inside DMs! ${client.customEmojis.get('duh') ? client.customEmojis.get('duh').toString() : ':thinking:'}`);
            if (interaction.inGuild() && !interaction.channel.nsfw && commandFile.conf.adult) {
                if (!interaction.channel.permissionsFor(interaction.guild.me).has('EMBED_LINKS')) {
                    const dead = client.customEmojis.get("dead") ? client.customEmojis.get("dead") : "😑";
                    return interaction.reply({ content: `seriously, use this command in a NSFW channel please ${dead}`, ephemeral: true });
                } else {
                    const embed2 = new MessageEmbed()
                        .setColor(0x7289DA)
                        .setDescription(`you met the void that belongs to people that run my NSFW commands at normal channel..\nplease consider running it in a proper NSFW channel to escape this place ${sed}`)
                        .setTitle('where is this place?')
                        .setImage('https://i.redd.it/bo81jbsoqnw41.png');
                    return interaction.reply({ embeds: [embed2], ephemeral: true }).catch(() => null);
                };
            };

            if (interaction.inGuild() && commandFile.conf.channelPerms && commandFile.conf.channelPerms.length) {
                if (!interaction.channel.permissionsFor(interaction.guild.me).has(commandFile.conf.channelPerms)) {
                    return interaction.reply({ content: `ouch! bruh it seems like i don't have the ${commandFile.conf.channelPerms.map(x => `\`${x}\``).join(" and ")} permission in this channel to properly do that for you :pensive:`, ephemeral: true});
            };
        };
        if (interaction.inGuild() && commandFile.conf.userPerms && commandFile.conf.userPerms.length) {
            if (!interaction.member.permissions.has(commandFile.conf.userPerms)) {
                return interaction.reply({ content: `are you a mod? you don't seems to have the ${commandFile.conf.userPerms.map(x => `\`${x}\``).join(" and ")} permission for this dear :pensive:`, ephemeral: true});
            };
        };
        if (interaction.inGuild() && commandFile.conf.clientPerms && commandFile.conf.clientPerms.length) {
            if (!interaction.guild.me.permissions.has(commandFile.conf.clientPerms)) {
                return interaction.reply({ content: `sorry, i don't have the ${commandFile.conf.clientPerms.map(x => `\`${x}\``).join(" and ")} permission across the server to do that ${sed}`, ephemeral: true });
            };
        };
        if (!cooldowns.has(commandFile.help.name)) cooldowns.set(commandFile.help.name, new Collection());
    
        const cooldownID = interaction.inGuild() ? interaction.user.id + interaction.guild.id : interaction.user.id;
    
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
            logger.log('info', `${interaction.user.tag} (${interaction.user.id}) from ${interaction.inGuild() ? `${interaction.guild.name} (${interaction.guild.id})` : 'DM'} ran an application command: ${interaction.commandName}`);
            if (interaction.inGuild()) {
                let setting = client.guildsStorage.get(interaction.guild.id);
                if (!setting) {
                    const dbguilds = client.db.guilds;
                    setting = new dbguilds({
                        guildID: interaction.guild.id
                    });
                    client.guildsStorage.set(interaction.guild.id, setting);
                    setting.save();
                };
            }
        } catch (error) {
            logger.log('error', error);
            return interaction.reply({ content: `sorry, i got an error while executing that command for you. please seek some support if this happen frequently ${duh}`, ephemeral: true })
        };
    } else if (interaction.isAutocomplete()) {
        let commandFile = client.slash.get(interaction.commandName);
        if (!commandFile || !commandFile.suggestion) return;
        return commandFile.suggestion(interaction);
    };
};