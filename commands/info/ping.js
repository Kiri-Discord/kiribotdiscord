exports.run = async(client, message, args) => {
    const pingMessage = await message.channel.send(`almost there...`);
    const ping = pingMessage.createdTimestamp - message.createdTimestamp;
    return pingMessage.edit(`:ping_pong: pong! took me ${ping}ms, and Discord ${Math.round(client.ws.ping)}ms`);
};
exports.help = {
    name: "ping",
    description: "ping me and check if i'm actually alive or not",
    usage: ["ping"],
    example: ["ping"]
};

exports.conf = {
    aliases: [],
    cooldown: 2,
};