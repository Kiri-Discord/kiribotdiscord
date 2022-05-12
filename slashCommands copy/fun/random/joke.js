const fetch = require('node-fetch');
exports.run = async(client, interaction) => {
    await interaction.deferReply();
    let jokeFilter;
    if (!interaction.channel.nsfw) jokeFilter = "blacklistFlags=nsfw,religious,political,racist,sexist";
    else jokeFilter = "";
    fetch(`https://sv443.net/jokeapi/v2/joke/Any?${jokeFilter}`)
        .then(res => res.json())
        .then(json => {
            if (json.setup) {
                interaction.editReply(`${json.setup.toLowerCase()}\n${json.delivery.toLowerCase()}`);
            } else if (json.joke) {
                interaction.editReply(`${json.joke.toLowerCase()}`);
            } else if (json.additionalInfo) {
                interaction.editReply(json.additionalInfo.toLowerCase());
            }
        })
        .catch(err => {
            interaction.editReply("i can't seem to be able to give you a fact :( here is a hug for now 🤗");
            return logger.log('error', err);
        });
};