const request = require('node-superfetch');

exports.run = async(client, message, args) => {
    let text = args.join(" ");
    if (!text) return message.reply('enter something for me to generate :)')
    try {
        const { body } = await request
            .get('https://api.qrserver.com/v1/create-qr-code/')
            .query({ data: text });
        return message.channel.send({ files: [{ attachment: body, name: 'qr.png' }] });
    } catch (err) {
        return message.reply(`sorry! the server might be down so i got an error. try again later!`);
    }
};

exports.help = {
    name: "qr-gen",
    description: "generate a QR code from a link or a text",
    usage: ["qr-gen `<text>`"],
    example: ["qr-gen `hello`"]
};

exports.conf = {
    aliases: ["qr-generator", "createqr"],
    cooldown: 5,
    guildOnly: true,
    channelPerms: ["ATTACH_FILES"]
}