const mongoose = require('mongoose');

const giveawaySchema = new mongoose.Schema({
    messageID: String,
    channelID: String,
    guildID: String,
    startAt: Number,
    endAt: Number,
    ended: Boolean,
    winnerCount: Number,
    prize: String,
    messages: {
        giveaway: mongoose.Mixed,
        giveawayEnded: mongoose.Mixed,
        inviteToParticipate: mongoose.Mixed,
        timeRemaining: mongoose.Mixed,
        winMessage: mongoose.Mixed,
        embedFooter: mongoose.Mixed,
        noWinner: mongoose.Mixed,
        winners: mongoose.Mixed,
        endedAt: mongoose.Mixed,
        hostedBy: mongoose.Mixed,
        units: {
            seconds: String,
            minutes: String,
            hours: String,
            days: String,
            pluralS: Boolean,
        },
    },
    hostedBy: String,
    winnerIDs: [String],
    reaction: mongoose.Mixed,
    botsCanWin: Boolean,
    embedColor: mongoose.Mixed,
    embedColorEnd: mongoose.Mixed,
    exemptPermissions: [],
    exemptMembers: String,
    bonusEntries: String,
    extraData: mongoose.Mixed,
    lastChance: {
        enabled: Boolean,
        content: String,
        threshold: Number,
        embedColor: mongoose.Mixed
    }
});

module.exports = mongoose.model('giveaways', giveawaySchema, 'giveaways');