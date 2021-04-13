const mongoose = require('mongoose')

const reqString = {
  type: String,
  required: true,
}

const moneySchema = mongoose.Schema({
  guildId: reqString,
  userId: reqString,
  gameId: reqString,
  storage: {
    type: [JSON],
  },
});

module.exports = mongoose.model(
  'gameStorage',
  moneySchema,
  'gameStorage'
)