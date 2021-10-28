const { SlashCommandBuilder } = require('@discordjs/builders');
const birdCmd = require('./art/bird');
const catCmd = require('./art/cat');
const dogCmd = require('./art/dog');
const gooseCmd = require('./art/goose');
const pandaCmd = require('./art/panda');

exports.run = async(client, interaction) => {
    switch (interaction.options.getSubcommand()) {
        case 'bird':
            birdCmd.run(client, interaction);
            break;
        case 'cat':
            catCmd.run(client, interaction);
            break;
        case 'dog':
            dogCmd.run(client, interaction);
            break;
        case 'goose':
            gooseCmd.run(client, interaction);
            break;
        case 'panda':
            pandaCmd.run(client, interaction);
            break;
    };
};


exports.help = {
    name: "art",
    description: "get random art on the internet",
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addSubcommand(sub => sub
            .setName('bird')
            .setDescription("get some random bird")
        )
        .addSubcommand(sub => sub
            .setName('cat')
            .setDescription("get a random cat image 🐱")
        )
        .addSubcommand(sub => sub
            .setName('dog')
            .setDescription("get a random dog image 🐶")
        )
        .addSubcommand(sub => sub
            .setName('goose')
            .setDescription("get a random image of a goose")
        )
        .addSubcommand(sub => sub
            .setName('panda')
            .setDescription("get a random panda image")
        ),
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};