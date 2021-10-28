const request = require('node-superfetch');

exports.run = async(client, interaction) => {
    let text = interaction.options.getString('text');
    try {
        await interaction.deferReply();
        const { body } = await request
            .get('https://api.qrserver.com/v1/create-qr-code/')
            .query({ data: text });
        return interaction.editReply({ files: [{ attachment: body, name: 'qr.png' }] });
    } catch (err) {
        return interaction.editReply(`sorry! the server might be down so i got an error. try again later!`);
    }
};