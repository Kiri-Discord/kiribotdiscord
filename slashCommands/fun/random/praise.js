const fetch = require('node-fetch');

exports.run = async(client, interaction) => {
    await interaction.deferReply();
    fetch('https://complimentr.com/api')
        .then(res => res.json())
        .then(json => interaction.editReply(json.compliment.toLowerCase()))
        .catch(err => {
            interaction.editReply("i can't seem to be able to praise you :( here is a hug for now 🤗");
            return logger.log('error', err);
        });
};