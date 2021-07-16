const hugSchema = require('../model/hug');
const punchSchema = require('../model/punch');
const slapSchema = require('../model/slap');
const patSchema = require('../model/pat');
const cuddleSchema = require('../model/cuddle');
const kissSchema = require('../model/kiss');
const musicSchema = require('../model/music');

module.exports = async(client, guild) => {
    client.guildsStorage.delete(guild.id);

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

    await musicSchema.deleteMany({
        guildId: guild.id,
    }, (err) => {
        if (err) console.error(err)
    });

    await slapSchema.deleteMany({
        guildId: guild.id,
    }, (err) => {
        if (err) console.error(err)
    });

    await cuddleSchema.deleteMany({
        guildId: guild.id,
    }, (err) => {
        if (err) console.error(err)
    });

    await kissSchema.deleteMany({
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
    client.config.logChannels.forEach(id => {
        const channel = client.channels.cache.get(id);
        if (channel) channel.send(`Guild left: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    });
};