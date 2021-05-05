const mongoose = require('mongoose');

const reqString = {
    type: String,
    required: true,
}

const voteSchema = mongoose.Schema({
    userId: reqString,
    lastBoost: Date,
});

module.exports = mongoose.model('vote', voteSchema, 'vote');