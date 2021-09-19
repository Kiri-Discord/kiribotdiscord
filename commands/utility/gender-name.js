const request = require('node-superfetch');

exports.run = async(client, message, args) => {
    let name = args.join(" ");
    if (!name) return message.reply('you have to provide a name for me to guess :confused:');
    try {
        const { body } = await request
            .get(`https://api.genderize.io/`)
            .query({ name });
        if (!body.gender) return message.channel.send(`i have no idea what gender ${body.name} is :pensive:`);
        return message.channel.send(`i'm ${Math.round(body.probability * 100)}% sure that ${body.name} is a ${body.gender} name.`);
    } catch (err) {
        return message.channel.send(`oh no, i can't seem to be able to guess the gender for that name :pensive: here is a hug for now 🤗`);
    }
}

exports.help = {
    name: "gender-guess",
    description: "guess the gender of a person by their name",
    usage: ["gender-guess `<name>`"],
    example: ["gender-guess `Kiri`"]
};

exports.conf = {
    aliases: ["gender"],
    cooldown: 3,
    guildOnly: true,
};