const request = require('node-superfetch');

exports.run = async(client, interaction) => {
    let name = interaction.options.getString('name');
    await interaction.deferReply();
    try {
        const { body } = await request
            .get(`https://api.genderize.io/`)
            .query({ name });
        if (!body.gender) return interaction.editReply(`i have no idea what gender ${body.name} is :pensive:`);
        return interaction.editReply(`i'm ${Math.round(body.probability * 100)}% sure that ${body.name} is a ${body.gender} name.`);
    } catch (err) {
        return interaction.editReply(`oh no, i can't seem to be able to guess the gender for that name :pensive: here is a hug for now 🤗`);
    }
};