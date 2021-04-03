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
        guildId: guild.id,
    }, (err) => {
        if (err) console.error(err)
    });
    await client.love.deleteMany({
        guildID: guild.id,
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
  client.channels.cache.get('774476096409436170').send(`Guild left: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
};