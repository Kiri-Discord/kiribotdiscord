module.exports = async(client, role) => {
    await client.cluster.request({ type: 'eval', eval: `
    client.db.levelingRewards.findOneAndDelete({
        roleId: '${role.id}',
        guildId: ${role.guild.id}
    });
    ` });
};