const ms = require('ms');

exports.run = async(client, interaction, db) => {
    const off = interaction.options.getBoolean('disable');
    if (off) {
        await interaction.deferReply();
        db.verifyTimeout = undefined;
        await client.db.guilds.findOneAndUpdate({
            guildID: interaction.guild.id,
        }, {
            verifyTimeout: null
        });
        return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `❌ verify timeout has been disabled` }] });
    };
    const time = interaction.options.getString('timeout');
    let convert = ms(time);
    let toSecond = Math.floor(convert / 1000);

    if (!toSecond) return interaction.reply({
        content: "please insert the valid time format! all valid time format are \`s, m, hrs\`!",
        ephemeral: true
    });
    if (toSecond > 21600 || toSecond < 60) return interaction.reply({
        content: "the timer should be more than or equal to 1 minute or less than 6 hours!",
        ephemeral: true
    });
    try {
        await interaction.deferReply();
        db.verifyTimeout = convert;
        await client.db.guilds.findOneAndUpdate({
            guildID: interaction.guild.id,
        }, {
            verifyTimeout: convert
        })
        return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `☑️ new member will be kicked in **${ms(ms(time), {long: true})}** if they aren't verified. if you can't get it working, use \`/verify setup\` first!` }] });
    } catch (err) {
        logger.log('error', err);
        return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `:x: there was a problem when i was trying to save that! can you try again later?` }] });
    };
};