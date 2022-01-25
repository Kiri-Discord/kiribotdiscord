const request = require('node-superfetch');
const { stripIndent } = require('common-tags');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

exports.run = async(client, interaction) => {
    await interaction.deferReply();
    const author = await client.db.love.findOne({
        userID: interaction.user.id,
        guildID: interaction.guild.id
    });
    if (author) {
        if (author.marriedID) {
            return interaction.editReply('you are already married! *cheater*');
        };
    };
    const member = interaction.options.getMember('user');
    if (member.user.id === interaction.user.id) return interaction.editReply('WHY DO YOU WANT TO MARRY YOURSELF?');
    if (member.user.id === client.user.id) return interaction.editReply('aww i apreciated that but.. i am just a bot :(');
    if (member.user.bot) return interaction.editReply('that user is a bot :pensive:');
    let storage = await client.db.inventory.findOne({
        userId: interaction.user.id,
        guildId: interaction.guild.id
    });
    if (!storage) {
        const model = client.db.inventory;
        storage = new model({
            userId: interaction.user.id,
            guildId: interaction.guild.id,
        });
    };
    if (storage.rings < 1) return interaction.editReply(`:x: you don't have enough 💍 **Wedding Ring** to make a proposal! buy one at \`/shop\`.`);
    const marry = await client.db.love.findOne({
        userID: member.user.id,
        guildID: interaction.guild.id
    });
    if (marry) {
        if (marry.marriedID) {
            return interaction.editReply('that user is already married!');
        };
    };
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
        .setDescription(stripIndent `
        ${member}, it seems like ${interaction.user} is interested in taking you as their loved one...
        
        do you accept this proposal? please select **Yes** or **No**.
        *this proposal will expire in a minute.*
        `)
        .setFooter({text: 'this proposal will expire in a minute.'})
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
            res.editReply(`**${member.user.username}** declined your proposal :(`);
            return collector.stop();
        } else if (res.customId === 'yes') {
            await client.db.love.findOneAndUpdate({
                guildID: interaction.guild.id,
                userID: interaction.user.id
            }, {
                guildID: interaction.guild.id,
                userID: interaction.user.id,
                marriedID: member.user.id
            }, {
                upsert: true,
                new: true,
            });
            await client.db.love.findOneAndUpdate({
                userID: member.user.id,
                guildID: interaction.guild.id
            }, {
                userID: member.user.id,
                guildID: interaction.guild.id,
                marriedID: interaction.user.id
            }, {
                upsert: true,
                new: true,
            });
            await client.db.inventory.findOneAndUpdate({
                guildId: interaction.guild.id,
                userId: interaction.user.id
            }, {
                guildId: interaction.guild.id,
                userId: interaction.user.id,
                $inc: {
                    rings: -1,
                },
            }, {
                upsert: true,
                new: true,
            });
            const { body } = await request.get('https://nekos.best/api/v1/kiss');
            let image = body.url;
            const embed = new MessageEmbed()
                .setDescription(`:sparkling_heart: **${interaction.user.username}** and **${member.user.username}** are now married! :sparkling_heart:`)
                .setImage(image);
            await res.editReply({ embeds: [embed] });
            return collector.stop();
        };
    });
    collector.on('end', (collected) => {
        row.components.forEach(component => component.setDisabled(true));
        msg.edit({ components: [row] });
        if (!collected.size) return interaction.followUp('you two didn\'t say anything!');
    });
}