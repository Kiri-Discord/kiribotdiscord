const mongoose = require('mongoose');

const reqString = {
  type: String,
  required: true,
}

const loveSchema = mongoose.Schema({
  userID: reqString,
  guildID: reqString,
  marriedID: String
});

module.exports = mongoose.model(
  'love',
  loveSchema,
  'love'
)