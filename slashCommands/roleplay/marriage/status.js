exports.run = async(client, interaction, args) => {
    const member = interaction.options.getMember('user') || interaction.member;
    const user = member.user;
    if (user.id === client.user.id) return interaction.reply({ content: 'i am just a bot :pensive:', ephemeral: true });
    if (user.bot) return interaction.reply({ content: 'that user is a bot :pensive:', ephemeral: true });
    await interaction.deferReply();
    if (user.id === interaction.user.id) {
        const author = await client.db.love.findOne({
            userID: interaction.user.id,
            guildID: interaction.guild.id
        });
        if (!author) {
            return interaction.editReply('you are single');
        } else {
            const target = await client.db.love.findOne({
                userID: user.id,
                guildID: interaction.guild.id
            });
            if (target) {
                if (target.marriedID) {
                    const married = interaction.guild.members.cache.get(target.marriedID);
                    if (!married) {
                        await client.db.love.findOneAndDelete({
                            guildID: interaction.guild.id,
                            userID: user.id,
                        });
                        return interaction.editReply(`you are single!`);
                    } else {
                        return interaction.editReply(`you are married to **${married.user.username}** :sparkling_heart:`);
                    }
                } else {
                    return interaction.editReply(`you are single!`);
                }
            } else {
                return interaction.editReply(`you are single!`);
            };
        };
    };
    const target = await client.db.love.findOne({
        userID: user.id,
        guildID: interaction.guild.id
    });
    if (target) {
        if (target.marriedID) {
            const married = interaction.guild.members.cache.get(target.marriedID);
            if (!married) {
                await client.db.love.findOneAndDelete({
                    guildID: interaction.guild.id,
                    userID: user.id,
                });
                return interaction.editReply("can't find your partner in this server! i will just change you to single instead...")
            } else {
                return interaction.editReply(`**${user.username}** is married to **${married.user.username}** :sparkling_heart:`);
            }
        } else {
            return interaction.editReply(`**${user.username}** is single!`);
        }
    } else {
        return interaction.editReply(`**${user.username}** is single!`);
    };
};