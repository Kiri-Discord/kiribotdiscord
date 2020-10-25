module.exports = {
    name: 'ping',
    description: "extremely self-explanatory",
    cooldown: 2,
    guildOnly: true,
    execute(message, args){
        message.channel.send('pong!');
    }
}