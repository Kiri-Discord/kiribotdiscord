const hugSchema = require('../model/hug');
const punchSchema = require('../model/punch');
const slapSchema = require('../model/slap');
const patSchema = require('../model/pat');
const cuddleSchema = require('../model/cuddle');
const kissSchema = require('../model/kiss');

module.exports = async(client, member) => {

    client.dbverify.findOneAndDelete({
        guildID: member.guild.id,
        userID: member.user.id,
    });


    client.dbleveling.findOneAndDelete({
        guildId: member.guild.id,
        userId: member.user.id,
    });

    client.money.findOneAndDelete({
        guildId: member.guild.id,
        userId: member.user.id,
    });

    client.cooldowns.findOneAndDelete({
        guildId: member.guild.id,
        userId: member.user.id,
    });
    client.inventory.findOneAndDelete({
        guildId: member.guild.id,
        userId: member.user.id,
    });

    client.love.findOneAndDelete({
        guildID: member.guild.id,
        userID: member.user.id,
    });

    client.gameStorage.findOneAndDelete({
        guildId: member.guild.id,
        userId: member.user.id,
    });

    hugSchema.findOneAndDelete({
        userId: member.user.id,
        guildId: member.guild.id,
    }, (err) => {
        if (err) console.error(err)
    });

    punchSchema.findOneAndDelete({
        userId: member.user.id,
        guildId: member.guild.id,
    }, (err) => {
        if (err) console.error(err)
    });

    slapSchema.findOneAndDelete({
        userId: member.user.id,
        guildId: member.guild.id,
    }, (err) => {
        if (err) console.error(err)
    });


    cuddleSchema.findOneAndDelete({
        userId: member.user.id,
        guildId: member.guild.id,
    }, (err) => {
        if (err) console.error(err)
    });

    kissSchema.findOneAndDelete({
        userId: member.user.id,
        guildId: member.guild.id,
    }, (err) => {
        if (err) console.error(err)
    });

    patSchema.findOneAndDelete({
        userId: member.user.id,
        guildId: member.guild.id,
    }, (err) => {
        if (err) console.error(err)
    });
    client.verifytimers.deleteTimer(member.guild.id, member.user.id);
}