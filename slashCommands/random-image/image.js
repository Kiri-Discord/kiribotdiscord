const { SlashCommandBuilder } = require('@discordjs/builders');
const birdCmd = sync.require('./art/bird');
const catCmd = sync.require('./art/cat');
const dogCmd = sync.require('./art/dog');
const gooseCmd = sync.require('./art/goose');
const pandaCmd = sync.require('./art/panda');

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
    description: "get or search random image on the internet",
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