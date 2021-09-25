exports.run = async(client, message, args) => {
    const blessEmoji = client.customEmojis.get('bless') ? client.customEmojis.get('bless').toString() : '✔️';
    const pingMessage = await message.channel.send(`almost there...`);
    const ping = pingMessage.createdTimestamp - message.createdTimestamp;
    return pingMessage.edit(`${blessEmoji} boop! took me ${ping}ms, and discord ${Math.round(client.ws.ping)}ms?`);
};

exports.help = {
    name: "beep",
    description: "play a nice ping pong game but in robot language",
    usage: [`beep`],
    example: [`beep`]
};

exports.conf = {
    aliases: [],
    cooldown: 2,
};