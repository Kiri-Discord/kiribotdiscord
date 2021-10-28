const request = require('node-superfetch');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    const text = interaction.options.getString('options');

    const options = text.trim().split(",").filter(x => x !== '').map(x => x.trim());
    if (options.length < 2) return interaction.reply({ content: `you should provide more than a choice and seperate it with a comma (eg. 1, 2, 3)`, ephemeral: true });
    if (options.length > 31) return interaction.reply({ content: 'you can only provide less than 30 choices in a poll!', ephemeral: true });
    try {
        await interaction.deferReply();
        const { body } = await request
            .post('https://www.strawpoll.me/api/v2/polls')
            .set({ 'Content-Type': 'application/json' })
            .send({
                title: `${interaction.user.username}s poll`,
                options,
                captcha: true
            });
        return interaction.editReply(`✅ i have create the poll for you! your poll is avaliable on http://www.strawpoll.me/${body.id} :)`);
    } catch (err) {
        return interaction.editReply(`bruh, an error has occurred when i tried to upload that poll for you. can you try again later? :pensive:`);
    };
};

exports.help = {
    name: "poll",
    description: "create a poll from Strawpoll",
    usage: ["poll `<options>`"],
    example: ["poll `1, 2, 3`"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addStringOption(option => option
            .setName('options')
            .setDescription('a list of options to add in the poll, seperated by comma (eg. 1, 2, 3)')
            .setRequired(true)
        ),
    cooldown: 10,
    guildOnly: true,
};