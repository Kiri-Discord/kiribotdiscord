const { SlashCommandBuilder } = require('@discordjs/builders');
const listCmd = require('./giveaway/list');
const createCmd = require('./giveaway/create');
const deleteCmd = require('./giveaway/delete');
const endCmd = require('./giveaway/end');
const rerollCmd = require('./giveaway/reroll');

exports.run = async(client, interaction) => {
    switch (interaction.options.getSubcommand()) {
        case 'list':
            listCmd.run(client, interaction);
            break;
        case 'create':
            if (!interaction.member.permissions.has('MANAGE_MESSAGES')) return interaction.reply({ content: `are you a mod? you don't seems to have the \`MANAGE_MESSAGES\` permission to modify giveaways dear :pensive:`, ephemeral: true });
            createCmd.run(client, interaction);
            break;
        case 'delete':
            if (!interaction.member.permissions.has('MANAGE_MESSAGES')) return interaction.reply({ content: `are you a mod? you don't seems to have the \`MANAGE_MESSAGES\` permission to modify giveaways dear :pensive:`, ephemeral: true });
            deleteCmd.run(client, interaction);
            break;
        case 'end':
            if (!interaction.member.permissions.has('MANAGE_MESSAGES')) return interaction.reply({ content: `are you a mod? you don't seems to have the \`MANAGE_MESSAGES\` permission to modify giveaways dear :pensive:`, ephemeral: true });
            endCmd.run(client, interaction);
            break;
        case 'reroll':
            if (!interaction.member.permissions.has('MANAGE_MESSAGES')) return interaction.reply({ content: `are you a mod? you don't seems to have the \`MANAGE_MESSAGES\` permission to modify giveaways dear :pensive:`, ephemeral: true });
            rerollCmd.run(client, interaction);
            break;
    }
};

exports.help = {
    name: "giveaway",
    description: "create and manage giveaways on the server",
    usage: ["giveaway `create`", "giveaway `delete [message ID]`", "giveaway `end [message ID]`", "giveaway `list`", "giveaway `reroll [message ID]`"],
    example: ["giveaway `create`", "giveaway `delete 55335657545`", "giveaway `end 87864534464`", "giveaway `list`", "giveaway `reroll 868645354575`"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addSubcommand(sub => sub
            .setName('create')
            .setDescription('create a new giveaway on the server with interactive setup')
        )
        .addSubcommand(sub => sub
            .setName('delete')
            .setDescription('delete a giveaway (members with ADMINISTRATOR permission have full control)')
            .addStringOption(option => option
                .setName('message-id')
                .setDescription('what is the message ID of the giveaway the you would like to delete?')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('end')
            .setDescription('end a giveaway sooner (members with ADMINISTRATOR permission have full control)')
            .addStringOption(option => option
                .setName('message-id')
                .setDescription('what is the message ID of the giveaway the you would like to end?')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('reroll')
            .setDescription('reroll a finished giveaway (members with ADMINISTRATOR permission have full control)')
            .addStringOption(option => option
                .setName('message-id')
                .setDescription('what is the message ID of the giveaway the you would like to reroll?')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('list')
            .setDescription('list all avaliable giveaway on the server')
        ),
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"],
}