const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { stripIndents } = require('common-tags');

module.exports = async(client, guild) => {
    if (!client.isReady()) return;
    const data = await client.dbFuncs.existingGuild(guild.id);

    if (data) return;

    logger.info(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members! (shard: ${guild.shardId}, cluster: ${client.cluster.id})`)

    await client.dbFuncs.createGuild(guild.id, true);

    const prefix = client.config.prefix;
    const channels = guild.channels.cache.filter(x => x.viewable && x.type === 'GUILD_TEXT' && x.permissionsFor(guild.me).has(['VIEW_CHANNEL', 'SEND_MESSAGES']));
    const channelbutcansendEmbed = guild.channels.cache.filter(x => x.type === 'GUILD_TEXT' && x.viewable && x.permissionsFor(guild.me).has(['EMBED_LINKS', 'SEND_MESSAGES']));

    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setStyle('LINK')
            .setURL('https://kiribot.xyz')
            .setLabel('Website'),
            new MessageButton()
            .setStyle('LINK')
            .setURL('https://discord.gg/kJRAjMyEkY')
            .setLabel('Our support server!'),
            new MessageButton()
            .setStyle('LINK')
            .setURL('https://discord.gg/kJRAjMyEkY')
            .setLabel('Our community server!')
        );
    const embed = new MessageEmbed()
        .setTitle("thanks for inviting me to your server!")
        .setDescription(stripIndents `
        with a variety of memes and minigames, music, karaoke, utilities and moderation tools, i will try my best to help you around as best as i can :)
        my default prefix is \`${prefix}\`, but mention and slash commands also works!

        type \`${prefix}help\` to get started! have fun!
        before doing any commands, check if i have the crucial permission to work properly, like sending embed or manage messages (for some command)

        changes are updated quite frequently within the bot such as restarts and updates, so using \`${prefix}update\` is recommended to keep tracks of new change logs!
        if you have any questions come ask us in our support server or commmunity server!
        `)
        .setColor('#DAF7A6')
        .setAuthor({ name: "hi, i'm Kiri!" })
        .setTimestamp()
        .setThumbnail(client.user.displayAvatarURL({ size: 4096 }))
    // client.config.logChannels.forEach(id => {
    //     const channel = client.channels.cache.get(id);
    //     if (channel) channel.send(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    // });
    // logger.info(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`)
    // const owner = await client.users.fetch(client.config.ownerID).catch(() => null);
    // if (owner) owner.send(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    if (channelbutcansendEmbed.size) {
        channelbutcansendEmbed.first().send({ embeds: [embed], components: [row] }).catch(() => null);
    } else if (channels.size) {
        channels.first().send({
            content: stripIndents `
            **hi, i'm Kiri! thanks for inviting me to your server :)**
    
            with a variety of memes and minigames, music, karaoke, utilities and moderation tools, i will try my best to help you around as best as i can :)
            my default prefix is \`${prefix}\`, but mention and slash command also works!
            type \`${prefix}help\` to get started! have fun!
            before doing any commands, check if i have the crucial permission to work properly, like sending embed or manage messages (for some commands)
    
            changes are updated quite frequently within the bot such as restarts and updates, so using \`${prefix}update\` is recommended to keep tracks of new change logs!
            if you have any questions come ask us in our support server or commmunity server!
            `,
            components: [row]
        })
    } else {
        return;
    };
    client.config.logChannels.forEach(async id => {
        await client.cluster.broadcastEval((c, context) => {
            const channel = c.channels.cache.get(context.channelId);
            try {
                if (channel) return channel.send(`New guild joined: ${context.guildName} (id: ${context.guildId}). This guild has ${context.memberCount} members! (shard: ${context.shardId}, cluster: ${context.clusterId})`);
                else return false;
            } catch (error) {
                console.log(error)
                return false;
            }
        }, { context: { channelId: id, guildName: guild.name, guildId: guild.id, memberCount: guild.memberCount, shardId: guild.shardId, clusterId: client.cluster.id } });
    });
};