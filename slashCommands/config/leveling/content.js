exports.run = async(client, interaction, db) => {
    const type = interaction.options.getString('type');
    const content = interaction.options.getString('content');
    await interaction.deferReply();
    let contentObject;
    if (type === 'plain') {
        contentObject = {
            type: 'plain',
            content: content
        };
    } else if (type === 'embed') {
        let embedsStorage = client.dbembeds;
        let storage = await embedsStorage.findOne({
            guildID: interaction.guild.id
        });
        if (!storage) storage = new embedsStorage({
            guildID: interaction.guild.id
        });;
        if (!storage.embeds.toObject().length) return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `there aren't any embed created on this server yet :pensive: to create a new embed, do \`/embeds new\`!` }] });
        const targetEmbed = storage.embeds.toObject().find(x => x._id === content);
        if (!targetEmbed) return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `there aren't any embed created on this server with ID \`${content}\` :pensive: to create a new embed, do \`/embeds new\`!` }] });
        contentObject = {
            type: 'embed',
            content: targetEmbed
        };
    };
    const setting = await client.dbguilds.findOne({
        guildID: interaction.guild.id
    });
    setting.levelings.content = contentObject;
    db.levelings.content = contentObject;
    setting.markModified('levelings');
    await setting.save();
    return interaction.editReply({
        embeds: [{
            color: "#bee7f7",
            description: `☑️ your leveling announcement message has been set up!`,
            footer: {
                text: `you can test it out using /leveling test!`
            }
        }]
    });
};