const { stripIndents } = require('common-tags');
const request = require('node-superfetch');

exports.run = async(client, message, args, prefix) => {
    const text = args.join(" ");
    if (!text) return message.channel.send(`you should provide some options to add in the poll and seperate it with a comma (,)`)
    const options = text.trim().split(",").filter(x => x !== '').map(x => x.trim());
    if (options.length < 2) return message.channel.send(`you should provide more than a choice and seperate it with a comma (,)`);
    if (options.length > 31) return message.channel.send('you can only provide less than 30 choices in a poll!');
    // try {

    // } catch (err) {
    //     return message.channel.send(`bruh, an error has occurred when i tried to upload that poll for you. can you try again later? :pensive:`);
    // };
    const { body } = await request
        .post('https://www.strawpoll.me/api/v2/polls')
        .set({ 'Content-Type': 'application/json' })
        .send({
            title: `${message.author.username}'s poll'`,
            options,
            captcha: true
        });
    return message.channel.send(stripIndents `
    ${body.title}
    http://www.strawpoll.me/${body.id}
`);
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