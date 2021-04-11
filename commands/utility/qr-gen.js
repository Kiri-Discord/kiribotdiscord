const request = require('node-superfetch');

exports.help = {
    name: "qr-gen",
    description: "generate a qr code!",
    usage: "qr-gen `<text>`",
    example: "qr-gen `hello`"
};
  
exports.conf = {
    aliases: ["qr-generator", "createqr"],
    cooldown: 5,
    guildOnly: true,
    userPerms: [],
	clientPerms: ["ATTACH_FILES", "SEND_MESSAGES"]
}
exports.run = async (client, message, args) => {
    let text = args.join(" ");
    if (!text) return message.inlineReply('enter something for me to generate the qr :)')
    try {
        const { body } = await request
            .get('https://api.qrserver.com/v1/create-qr-code/')
            .query({ data: text });
        return message.channel.send({ files: [{ attachment: body, name: 'qr.png' }] });
    } catch (err) {
        return message.inlineReply(`sorry :( i got an error. try again later!`);
    }
}