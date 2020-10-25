module.exports = {
    name: 'ping',
    description: "ping me and i will response",
    cooldown: 2,
    execute(message, args){
        message.channel.send('pong!');
    }
}