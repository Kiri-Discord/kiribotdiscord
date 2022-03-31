module.exports = async(client, role) => {
    await client.db.levelingRewards.findOneAndDelete({
        roleId: role.id,
        guildId: role.guild.id
    });
};