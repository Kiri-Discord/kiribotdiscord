const hugSchema = require('../model/hug');
const punchSchema = require('../model/punch');
const slapSchema = require('../model/slap');
const patSchema = require('../model/pat');

module.exports = async (client, guild) => {

    await client.dbguilds.findOneAndDelete({
        guildID: guild.id
    }, (err) => {
        if (err) console.error(err)
    });

    await client.dbverify.deleteMany({
        guildID: guild.id,
    }, (err) => {
        if (err) console.error(err)
    });
    await client.dbleveling.deleteMany({
        guildId: guild.id,
    }, (err) => {
        if (err) console.error(err)
    });
    await client.money.deleteMany({
        guildId: guild.id
    }, (err) => {
        if (err) console.error(err)
    });

    await client.love.deleteMany({
        guildID: guild.id
    }, (err) => {
        if (err) console.error(err)
    });

    await client.gameStorage.deleteMany({
        guildId: guild.id
    }, (err) => {
        if (err) console.error(err)
    });

    await hugSchema.deleteMany({
        guildId: guild.id,
    }, (err) => {
        if (err) console.error(err)
    });

    await punchSchema.deleteMany({
        guildId: guild.id,
    }, (err) => {
        if (err) console.error(err)
    });

    await slapSchema.deleteMany({
        guildId: guild.id,
    }, (err) => {
        if (err) console.error(err)
    });

    await patSchema.deleteMany({
        guildId: guild.id,
    }, (err) => {
        if (err) console.error(err)
    });
    console.log(`Guild left: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    client.users.cache.get('617777631257034783').send(`Guild left: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    const logChannel1 = client.channels.cache.get('768448397786349578');
    const logChannel2 = client.channels.cache.get('827954468779327489');
    if (logChannel1) logChannel1.send(`Guild left: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    if (logChannel2) logChannel2.send(`Guild left: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
};
