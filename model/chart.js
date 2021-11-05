const mongoose = require('mongoose');

const songSchema = mongoose.Schema({
    songID: String,
    type: String,
    songName: String,
    songAuthor: String,
    songDuration: Number,
    timesPlayed: Number,
});

module.exports = mongoose.model('charts', songSchema);