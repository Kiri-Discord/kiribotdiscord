const { Util } = require('discord.js');

exports.run = async(client, message, args) => {
    if (!args[0]) {
        let listGuild = [];
        client.guilds.cache.each(guild => {
            listGuild.push(`${guild.name} - ${guild.id} (owner: ${guild.ownerID})`)
        });
        const [first, ...rest] = Util.splitMessage(listGuild.join('\n'), { maxLength: 1900, char: '\n' });
        if (rest.length) {
            await message.channel.send(first);
            for (const text of rest) {
                const embed1 = new MessageEmbed()
                    .setColor(message.member.displayHexColor)
                    .setDescription(text)
                await message.channel.send(text);
            };
        } else {
            return message.channel.send(first);
        };
    }
    const guild = client.guilds.cache.get(args[0]);
    if (!guild) return message.channel.send('guild not found.');
    const channels = guild.channels.cache.filter(channel => channel.type === 'GUILD_TEXT' && channel.permissionsFor(guild.me).has('CREATE_INSTANT_INVITE')).first();
    if (!channels) return message.channel.send('no channel was found in that guild in order to create an invite.. wait what?');
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