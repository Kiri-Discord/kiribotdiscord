const mongoose = require('mongoose');

const reqString = {
    type: String,
    required: true,
}

const voteSchema = mongoose.Schema({
    userID: reqString,
    lastBoost: Date,
});

module.exports = mongoose.model('vote', voteSchema, 'vote');