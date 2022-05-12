exports.run = async(client, interaction) => {
    await interaction.deferReply();
    const responses = [
        "ye",
        "probably",
        "idk",
        "unprobably",
        "no",
        "heck no",
        "yes",
        "of course",
        "i do"
    ];
    const randomResponse = Math.floor(Math.random() * (responses.length - 1) + 1);
    setTimeout(async() => {
        return interaction.editReply(`${responses[randomResponse]}`);
    }, 10000);
}