const { Util } = require('discord.js');

exports.run = async(client, message, args) => {
    if (!args[0]) {
        let listGuild = [];
        client.guilds.cache.each(guild => {
            listGuild.push(`${guild.name} - ${guild.id} (owner: ${guild.ownerId})`)
        });
        const [first, ...rest] = Util.splitMessage(listGuild.join('\n'), { maxLength: 1900, char: '\n' });
        if (rest.length) {
            await message.channel.send(first);
            for (const text of rest) {
                await message.channel.send(text);
            };
            return;
        } else {
            return message.channel.send(first);
        };
    };
    const guild = client.guilds.cache.get(args[0]);
    if (!guild) return message.channel.send('guild not found.');
    const channels = guild.channels.cache.filter(channel => channel.type === 'GUILD_TEXT' && channel.permissionsFor(guild.me).has('CREATE_INSTANT_INVITE') && channel.viewable).first();
    if (!channels.size) return message.channel.send('no channel was found in that guild in order to create an invite.. wait what?');
    const invite = await channels.createInvite();
    if (!invite) return message.channel.send('NO PERMISSION AT ALL');
    return message.channel.send(`here is your invite to ${guild.name}: ${invite.url}`)
};

exports.help = {
    name: "guilds-invite",
    description: "hmm",
    usage: [`guilds-invite`],
    example: [`guilds-invite`]
}

exports.conf = {
    aliases: ["guilds"],
    cooldown: 3,
    owner: true
}