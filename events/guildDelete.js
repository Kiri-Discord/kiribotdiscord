const hugSchema = require('../model/hug');
const punchSchema = require('../model/punch');
const slapSchema = require('../model/slap');
const patSchema = require('../model/pat');
const cuddleSchema = require('../model/cuddle');
const kissSchema = require('../model/kiss');
const musicSchema = require('../model/music');
const gameSchema = require('../model/game');

module.exports = async(client, guild) => {
    client.guildsStorage.delete(guild.id);
    client.queue.delete(guild.id);


    client.dbguilds.findOneAndDelete({
        guildID: guild.id
    }, (err) => {
        if (err) console.error(err)
    });

    client.dbverify.deleteMany({
        guildID: guild.id,
    }, (err) => {
        if (err) console.error(err)
    });
    client.dbleveling.deleteMany({
        guildId: guild.id,
    }, (err) => {
        if (err) console.error(err)
    });
    client.money.deleteMany({
        guildId: guild.id
    }, (err) => {
        if (err) console.error(err)
    });
    client.cooldowns.deleteMany({
        guildId: guild.id
    }, (err) => {
        if (err) console.error(err)
    });

    client.inventory.deleteMany({
        guildId: guild.id
    }, (err) => {
        if (err) console.error(err)
    });


    client.love.deleteMany({
        guildID: guild.id
    }, (err) => {
        if (err) console.error(err)
    });

    client.gameStorage.deleteMany({
        guildId: guild.id
    }, (err) => {
        if (err) console.error(err)
    });

    hugSchema.deleteMany({
        guildId: guild.id,
    }, (err) => {
        if (err) console.error(err)
    });

    punchSchema.deleteMany({
        guildId: guild.id,
    }, (err) => {
        if (err) console.error(err)
    });

    musicSchema.deleteMany({
        guildId: guild.id,
    }, (err) => {
        if (err) console.error(err)
    });

    slapSchema.deleteMany({
        guildId: guild.id,
    }, (err) => {
        if (err) console.error(err)
    });

    cuddleSchema.deleteMany({
        guildId: guild.id,
    }, (err) => {
        if (err) console.error(err)
    });

    kissSchema.deleteMany({
        guildId: guild.id,
    }, (err) => {
        if (err) console.error(err)
    });

    patSchema.deleteMany({
        guildId: guild.id,
    }, (err) => {
        if (err) console.error(err)
    });

    console.log(`Guild left: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    const owner = client.users.cache.get(client.config.ownerID);
    if (owner) owner.send(`Guild left: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    client.config.logChannels.forEach(id => {
        const channel = client.channels.cache.get(id);
        if (channel) channel.send(`Guild left: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    });
};