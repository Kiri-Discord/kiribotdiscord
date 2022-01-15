const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { stripIndent } = require('common-tags');

exports.run = async(client, interaction) => {
    await interaction.deferReply();
    const author = await client.love.findOne({
        userID: interaction.user.id,
        guildID: interaction.guild.id
    });
    if (!author) {
        return interaction.editReply('you are not married!');
    } else {
        if (!author.marriedID) return interaction.editReply('you are not married!');
        const marry = await client.love.findOne({
            userID: author.marriedID,
            guildID: interaction.guild.id
        });
        if (!marry) {
            await client.love.findOneAndDelete({
                guildID: interaction.guild.id,
                userID: interaction.user.id
            });
            return interaction.editReply("it seems like you did married, but i don't know who though. you are single now.")
        } else {
            if (marry.marriedID) {
                if (marry.marriedID !== interaction.user.id) {
                    await client.love.findOneAndDelete({
                        guildID: interaction.guild.id,
                        userID: interaction.user.id
                    });
                    return interaction.editReply("that user isn't married to you! :pensive:")
                } else {
                    const member = interaction.guild.members.cache.get(author.marriedID);
                    if (!member) {
                        await client.love.findOneAndDelete({
                            guildID: interaction.guild.id,
                            userID: interaction.user.id
                        });
                        return interaction.editReply("can't find your partner in this server! i will just change you to single instead...")
                    } else {
                        return divorce(client, interaction, member);
                    }
                }
            } else {
                await client.love.findOneAndDelete({
                    guildID: interaction.guild.id,
                    userID: interaction.user.id
                });
                return interaction.editReply("your partner isn't married to you in my database! i will just change you to single instead...")
            }
        }

    }
}
async function divorce(client, interaction, member) {
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('yes')
            .setLabel('Yes')
            .setStyle('PRIMARY'),
            new MessageButton()
            .setCustomId('no')
            .setLabel('No')
            .setStyle('DANGER')
        );
    const embed = new MessageEmbed()
        .setColor('#7DBBEB')
        .setFooter({text: 'i will be going in a minute.'})
        .setDescription(stripIndent `
        ${member}, it seems like ${interaction.user} is asking for a divorce...
        
        do you accept this request? please select **Yes** or **No**.
        `)
    const msg = await interaction.editReply({ embeds: [embed], components: [row], fetchReply: true });
    const filter = async(res) => {
        if (res.user.id !== member.user.id) {
            await res.reply({
                embeds: [{
                    description: `those buttons doesn't belong to you :pensive:`
                }],
                ephemeral: true
            });
            return false;
        } else {
            return true;
        };
    };
    const collector = msg.createMessageComponentCollector({
        componentType: 'BUTTON',
        filter,
        time: 60000,
        max: 1
    });
    collector.on('collect', async(res) => {
        await res.deferReply();
        if (res.customId === 'no') {
            res.editReply(`**${member.user.username}** declined your request :(`);
            return collector.stop();
        } else if (res.customId === 'yes') {
            await client.love.findOneAndDelete({
                guildID: interaction.guild.id,
                userID: interaction.user.id
            });
            await client.love.findOneAndDelete({
                userID: member.user.id,
                guildID: interaction.guild.id
            });
            res.editReply(`**${interaction.user.username}**, you have divorced with **${member.user.username}** :pensive:`);
            return collector.stop();
        };
    });
    collector.on('end', (collected) => {
        row.components.forEach(component => component.setDisabled(true));
        msg.edit({ components: [row] });
        if (!collected.size) return res.followUp('you two didn\'t say anything!');
    });
};