module.exports = async (client, member) => {

    await client.dbverify.findOneAndDelete({
        guildID: member.guild.id,
        userID: member.user.id,
    }, (err) => {
        if (err) console.error(err)
    });   
    

}