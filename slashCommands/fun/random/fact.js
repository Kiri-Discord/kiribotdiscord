const req = require('node-superfetch');
exports.run = async(client, interaction, args) => {
    await interaction.deferReply();
    try {
        const { body } = await req.get('https://uselessfacts.jsph.pl/random.json?language=en');
        const fact = body.text.toLowerCase().split('`').join("'");
        return interaction.editReply(fact);
    } catch {
        interaction.editReply("i can't seem to be able to give you a fact :( here is a hug for now 🤗");
        return logger.log('error', err);
    };
};