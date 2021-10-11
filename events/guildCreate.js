const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');

module.exports = async(client, guild) => {

    const guildexist = await client.dbguilds.findOne({
        guildID: guild.id
    });

    if (guildexist) return;
    const Guild = client.dbguilds;
    const newGuild = new Guild({
        guildID: guild.id
    });

    client.guildsStorage.set(guild.id, newGuild);

    await newGuild.save();

    const prefix = client.config.prefix;
    const channels = guild.channels.cache.filter(x => x.type === 'GUILD_TEXT').filter(x => x.permissionsFor(guild.me).has(['VIEW_CHANNEL', 'SEND_MESSAGES']))
    const channelbutcansendEmbed = guild.channels.cache.filter(x => x.type === 'GUILD_TEXT').filter(x => x.permissionsFor(guild.me).has(['EMBED_LINKS', 'SEND_MESSAGES', 'VIEW_CHANNEL']));

    const embed = new MessageEmbed()
        .setTitle("thanks for inviting me to your server :)")
        .setDescription(stripIndents `
        with a variety of memes and minigames, music, karaoke, utilities and moderation tools, i will try my best to help you around as best as i can :)
        my default prefix is \`${prefix}\`, but mention also works!

        type \`${prefix}help\` to get started! have fun!
        before doing any commands, check if i have the crucial permission to work properly, like sending embed or manage messages (for some command)

        changes are updated quite frequently within the bot such as restarts, updates, etc...
        if you have any questions come ask us in our support server:
        [Sefiria (community server)](https://discord.gg/kJRAjMyEkY)
        [kiri support (support server)](https://discord.gg/D6rWrvS)
        `)
        .setColor('#DAF7A6')
        .setAuthor("hi, i'm Kiri!")
        .setTimestamp()
        .setThumbnail(client.user.displayAvatarURL())
    client.config.logChannels.forEach(id => {
        const channel = client.channels.cache.get(id);
        if (channel) channel.send(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    });
    logger.log('info', `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`)
    const owner = client.users.cache.get(client.config.ownerID);
    if (owner) owner.send(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    if (channelbutcansendEmbed.size) {
        channelbutcansendEmbed.first().send({ embeds: [embed] }).catch(() => null);
    } else if (channels.size) {
        channels.first().send(stripIndents `
        **hi, i'm Kiri! thanks for inviting me to your server :)**

        with a variety of memes and minigames, music, karaoke, utilities and moderation tools, i will try my best to help you around as best as i can :)
        my default prefix is \`${prefix}\`, but mention also works!
        type \`${prefix}help\` to get started! have fun!
        before doing any commands, check if i have the crucial permission to work properly, like sending embed or manage messages (for some commands)

        changes are updated quite frequently within the bot such as restarts, updates, etc...
        if you have any questions come ask us in our support server:
        [Sefiria (community server)](https://discord.gg/kJRAjMyEkY)
        [kiri support (support server)](https://discord.gg/D6rWrvS)
        `)
    } else {
        return;
    };
};