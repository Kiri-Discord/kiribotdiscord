const { stripIndents } = require('common-tags');
const request = require('node-superfetch');

exports.run = async(client, message, args) => {
    const text = args.join(" ").trim();
    const options = text.split(",").filter(x => x === '').map(x => x.trim());
    if (options.length < 2) return message.channel.send('you should provide more than a choice.');
    if (options.length > 31) return message.channel.send('you can only provide less than 30 choices!');
    try {
        const { body } = await request
            .post('https://www.strawpoll.me/api/v2/polls')
            .set({ 'Content-Type': 'application/json' })
            .send({
                title,
                options,
                captcha: true
            });
        return message.channel.send(stripIndents `
            ${body.title}
            http://www.strawpoll.me/${body.id}
        `);
    } catch (err) {
        return message.channel.send(`bruh, an error has occurred when i tried to upload that poll for you. can you try again later? :pensive:`);
    };
};

exports.help = {
    name: "poll",
    description: "create a poll from Strawpoll",
    usage: ["poll `<options>`"],
    example: ["poll `option, another option, just an another option`"]
};

exports.conf = {
    aliases: ['strawpoll'],
    cooldown: 10,
    guildOnly: true,
};