const mongoose = require('mongoose')

const reqString = {
  type: String,
  required: true,
}

const hugSchema = mongoose.Schema({
  guildId: reqString,
  KaraokeChannelID: {
    type: String,
  },
  volume: {
    type: Number,
    default: 100,
  },
})

module.exports = mongoose.model(
  'music-sefy',
  hugSchema,
  'music-sefy'
)