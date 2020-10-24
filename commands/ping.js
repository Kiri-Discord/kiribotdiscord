module.exports = {
    name: 'ping',
    description: "this is a ping command!",
    cooldown: 2,
    execute(message, args){
        message.channel.send('pong!');
    }
}