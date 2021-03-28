const mongoose = require('mongoose')

const reqString = {
  type: String,
  required: true,
}

const moneySchema = mongoose.Schema({
  userId: reqString,
  guildId: reqString,
  balance: {
    type: Number,
    default: 10,
  },
  lastDaily: Date,
  lastGamble: Date
})

module.exports = mongoose.model(
  'money',
  moneySchema,
  'money'
)