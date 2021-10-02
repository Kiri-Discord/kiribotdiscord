const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');

exports.run = async(client, interaction, db) => {
    if (!interaction.guild.me.permissions.has('MANAGE_ROLES')) return interaction.reply({
        embeds: [{
            description: 'sorry, in order to setup the verification feature, i need to have the **Manage Roles** permission enabled :pensive:',
            ephemeral: true
        }]
    });
    const channel = interaction.options.getChannel('channel');
    if (channel.type !== 'GUILD_TEXT') return interaction.reply({ embeds: [{ color: "#bee7f7", description: `the verification guiding channel must be a text channel dear :pensive:` }], ephemeral: true });
    if (!channel.permissionsFor(interaction.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS'])) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `i don't have the perms to send messages and embed links to ${channel}! can you check my perms? :pensive:` }], ephemeral: true });
    const role = interaction.options.getRole('role');
    if (interaction.user.id !== interaction.guild.ownerId && interaction.member.roles.highest.position <= role.position) return interaction.reply({ embeds: [{ color: "RED", description: `that role is higher or equal your highest role!` }], ephemeral: true });

    if (interaction.guild.me.roles.highest.position <= role.position) return interaction.reply({ embeds: [{ color: "RED", description: `that role is higher or equal my highest role!` }], ephemeral: true });
    try {
        await interaction.deferReply();
        db.verifyChannelID = channel.id;
        db.verifyRole = role.id;
        await client.dbguilds.findOneAndUpdate({
            guildID: interaction.guild.id,
        }, {
            verifyChannelID: channel.id,
            verifyRole: role.id
        });
        interaction.editReply({
            embeds: [{
                color: "#bee7f7",
                description: `☑️ the verification guiding channel has been set to ${channel} and user will be given the verify role ${role.toString()} after verifying!\n\nhey! i just sent a guiding message in ${channel} to guide new user about this verification! if you accidently delete it, please do \`/verify send\` to resend it!`,
                footer: {
                    text: `unverified people won't get kicked by default. use /verify timeout <time> to set your own duration!`
                }
            }]
        });
        const embed = new MessageEmbed()
            .setColor('#cbd4c2')
            .setAuthor(interaction.guild.name, interaction.guild.iconURL({ size: 4096, dynamic: true }))
            .setTitle(`hey, welcome to ${interaction.guild.name}!`)
            .setThumbnail(client.user.displayAvatarURL({ size: 4096, dynamic: true }))
            .setDescription(`can you see any channel or chat in our server yet? if you can't, it's probably that the admins here have setup me to provide the verification for you :slight_smile:\nto begin the verification, head to your DM (Direct Message), where i will send your verification link to continue!\n\nthe verification role that you will get is ${role.toString()}`)
            .addField('**did anything wrong happened?**', 'feel free to click on any button below my message here, i will be glad to help!')
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('verify_unsolve_captcha')
                .setLabel("i can't solve the captcha!")
                .setEmoji('⚠️')
                .setStyle('DANGER'),
                new MessageButton()
                .setCustomId('verify_didnt_recieve')
                .setLabel("the DM didn't arrive!")
                .setStyle('SECONDARY')
                .setEmoji('📬'),
                new MessageButton()
                .setCustomId('verify_cant_talk')
                .setLabel("i completed the verification, but i can't talk!")
                .setEmoji('❌')
                .setStyle('PRIMARY'),
            );
        return channel.send({ embeds: [embed], components: [row] });
    } catch (err) {
        logger.log('error', err);
        if (interaction.deferred) return interaction.editReply({ embeds: [{ color: "RED", description: `sorry, an error happened when i tried to setup the verify feature. can you try again later? :pensive:` }], ephemeral: true });
        else return interaction.reply({ embeds: [{ color: "RED", description: `sorry, an error happened when i tried to setup the verify feature. can you try again later? :pensive:` }], ephemeral: true });
    };
};