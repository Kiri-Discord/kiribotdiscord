const mongoose = require('mongoose')

const reqString = {
  type: String,
  required: true,
}

const moneySchema = mongoose.Schema({
  guildId: reqString,
  userId: reqString,
  storage: {
    type: [Object],
    default: []
  },
});

module.exports = mongoose.model(
  'gameStorage',
  moneySchema,
  'gameStorage'
)