const mongoose = require('mongoose')

const reqString = {
  type: String,
  required: true,
}

const gameSchema = mongoose.Schema({
  guildId: reqString,
  userId: reqString,
  storage: {
    type: [Object],
    default: []
  },
});

module.exports = mongoose.model(
  'gameStorage',
  gameSchema,
  'gameStorage'
)