module.exports = async (client, member) => {

    await client.dbverify.findOneAndDelete({
        guildID: member.guild.id,
        userID: member.user.id,
    }, (err) => {
        if (err) console.error(err)
    });


    await client.dbleveling.findOneAndDelete({
        guildId: member.guild.id,
        userId: member.user.id,
    }, (err) => {
        if (err) console.error(err)
    }); 
    

}