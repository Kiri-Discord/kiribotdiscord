const request = require('node-superfetch');

exports.run = async(client, message, args) => {
    let name = args.join(" ");
    if (!name) return message.inlineReply('you have to provide a name for me to guess :confused:').then(m => m.delete({ timeout: 5000 }));
    try {
        const { body } = await request
            .get(`https://api.genderize.io/`)
            .query({ name });
        if (!body.gender) return message.channel.send(`i have no idea what gender ${body.name} is :(`);
        return message.channel.send(`i'm ${Math.round(body.probability * 100)}% sure that ${body.name} is a ${body.gender} name.`);
    } catch (err) {
        return message.channel.send(`oh no, i can't seem to be able to guess that name's gender :( here is a hug for now 🤗`);
    }
}

exports.help = {
    name: "gender-name",
    description: "give me a name and i will try to guess the gender 😄",
    usage: "gender-name `<name>`",
    example: "gender-name Kiri"
};

exports.conf = {
    aliases: ["gendername"],
    cooldown: 4,
    guildOnly: true,
}