const mongoose = require('mongoose')

const reqString = {
  type: String,
  required: true,
}

const cuddleSchema = mongoose.Schema({
  userId: reqString,
  guildId: reqString,
  received: {
    type: Number,
    default: 0,
  },
})

module.exports = mongoose.model(
  'cuddle-sefy',
  cuddleSchema,
  'cuddle-sefy'
);