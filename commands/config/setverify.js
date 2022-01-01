const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { reactIfAble } = require('../../util/util');

exports.run = async(client, message, args, prefix) => {
    const db = client.guildsStorage.get(message.guild.id);
    if (message.flags[0] === "off") {
        db.verifyChannelID = undefined;
        db.verifyRole = undefined;
        await client.dbguilds.findOneAndUpdate({
            guildID: message.guild.id,
        }, {
            verifyChannelID: null,
            verifyRole: null
        })
        return message.channel.send({ embeds: [{ color: "#bee7f7", description: `❌ verify feature has been disabled for all upcoming new members` }] });
    } else if (message.flags[0] === "send") {
        if (!db.verifyChannelID) return message.channel.send({ embeds: [{ color: "RED", description: `you haven't set up the verification feature yet! to setup the verify feature, do \`${prefix}setverify <#channel> <@role>\`` }] });
        const channel = message.guild.channels.cache.get(db.verifyChannelID);
        if (!channel.viewable || !channel.permissionsFor(message.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS'])) return message.reply({ embeds: [{ color: "#bee7f7", description: `it seems like i don't have the perms to send messages and embed links to ${channel}! can you setup the verification feature again? :pensive:` }] });
        const role = message.guild.roles.cache.get(db.verifyRole);
        if (!role) return message.channel.send({ embeds: [{ color: "RED", description: `the verification role was deleted or invalid! can you setup the verification feature again? :pensive:` }] })
        const embed = new MessageEmbed()
            .setColor('#cbd4c2')
            .setAuthor({name: message.guild.name, iconURL: message.guild.iconURL({ size: 4096, dynamic: true })})
            .setTitle(`hey, welcome to ${message.guild.name}!`)
            .setThumbnail(client.user.displayAvatarURL({ size: 4096, dynamic: true }))
            .setDescription(`can you see any channel or chat in our server yet? if you can't, it's probably that the admins here have setup me to provide the verification for you :slight_smile:\nto begin the verification, head to your DM (Direct Message), where i will send your verification link to continue!\n\nthe verification role that you will get is ${role.toString()}`)
            .addField('**did anything wrong happened?**', 'feel free to click on any button below my message here, i will be glad to help!')
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('verify_unsolve_captcha')
                .setLabel("i can't solve the captcha!")
                .setEmoji('⚠️')
                .setStyle('DANGER'),
                new MessageButton()
                .setCustomId('verify_didnt_recieve')
                .setLabel("the DM didn't arrive!")
                .setStyle('SECONDARY')
                .setEmoji('📬'),
                new MessageButton()
                .setCustomId('verify_cant_talk')
                .setLabel("i completed the verification, but i can't talk!")
                .setEmoji('❌')
                .setStyle('PRIMARY'),
            );
        reactIfAble(message, client.user, '👌');
        return channel.send({ embeds: [embed], components: [row] });
    };
    if (!args.length) return message.channel.send({ embeds: [{ color: "RED", description: `to setup the verify feature, do \`${prefix}setverify <#channel> <@role>\` or \`${prefix}setverify -off\` to disable it ;)` }] })
    let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
    if (!channel) return message.reply({ embeds: [{ color: "#bee7f7", description: 'i can\'t find that channel. pls mention a channel within this guild 😔' }] });
    if (!channel.viewable || !channel.permissionsFor(message.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS'])) return message.reply({ embeds: [{ color: "#bee7f7", description: `i don't have the perms to send messages and embed links to ${channel}! can you check my perms? :pensive:` }] });

    const roleName = args.slice(1).join(' ');
    const role = message.guild.roles.cache.find(r => (r.name === roleName.toString()) || (r.id === roleName.toString().replace(/[^\w\s]/gi, '')));

    if (!role) return message.channel.send({ embeds: [{ color: "RED", description: `no valid role was provided :pensive: i can only accept role mention, role name and role ID` }] })

    if (role.name === "@everyone") return message.channel.send({ embeds: [{ color: "RED", description: `\`@everyone\` is not a valid role!` }] });
    if (role.name === "@here") return message.channel.send({ embeds: [{ color: "RED", description: `\`@here\` is not a valid role!` }] });

    if (message.author.id !== message.guild.ownerId && message.member.roles.highest.position <= role.position) return message.channel.send({ embeds: [{ color: "RED", description: `that role is higher or equal your highest role!` }] });

    if (message.guild.me.roles.highest.position <= role.position) return message.reply({ embeds: [{ color: "RED", description: `that role is higher or equal my highest role!` }] });

    db.verifyChannelID = channel.id;
    db.verifyRole = role.id;
    await client.dbguilds.findOneAndUpdate({
            guildID: message.guild.id,
        }, {
            verifyChannelID: channel.id,
            verifyRole: role.id
        })
        .catch(err => logger.log('error', err));
    message.channel.send({
        embeds: [{
            color: "#bee7f7",
            description: `☑️ the verification guiding channel has been set to ${channel} and user will be given the verify role ${role.toString()} after verifying!\n\nhey! i just sent a guiding message in ${channel} to guide new user about this verification! if you accidently delete it, please do \`${prefix}set-verify -send\` to resend it!`,
            footer: {
                text: `unverified people won't get kicked by default. use ${prefix}setverifytimeout <time> to set your own duration!`
            }
        }]
    });
    const embed = new MessageEmbed()
        .setColor('#cbd4c2')
        .setAuthor({name: message.guild.name, iconURL: message.guild.iconURL({ size: 4096, dynamic: true })})
        .setTitle(`hey, welcome to ${message.guild.name}!`)
        .setThumbnail(client.user.displayAvatarURL({ size: 4096, dynamic: true }))
        .setDescription(`can you see any channel or chat in our server yet? if you can't, it's probably that the admins here have setup me to provide the verification for you :slight_smile:\nto begin the verification, head to your DM (Direct Message), where i will send your verification link to continue!\n\nthe verification role that you will get is ${role.toString()}`)
        .addField('**did anything wrong happened?**', 'feel free to click on any button below my message here, i will be glad to help!')
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('verify_unsolve_captcha')
            .setLabel("i can't solve the captcha!")
            .setEmoji('⚠️')
            .setStyle('DANGER'),
            new MessageButton()
            .setCustomId('verify_didnt_recieve')
            .setLabel("the DM didn't arrive!")
            .setStyle('SECONDARY')
            .setEmoji('📬'),
            new MessageButton()
            .setCustomId('verify_cant_talk')
            .setLabel("i completed the verification, but i can't talk!")
            .setEmoji('❌')
            .setStyle('PRIMARY'),
        );
    return channel.send({ embeds: [embed], components: [row] });

}

exports.help = {
    name: "set-verify",
    description: "setup my verification system that intergrate with Google reCAPTCHA",
    usage: ["set-verify `<#channel | id> <role name | id>`", "set-verify `[-off]`"],
    example: ["set-verify `#verify @Verify`", "set-verify `55879822272712 575475475474577`"]
};

exports.conf = {
    aliases: ["verify", "setverify"],
    cooldown: 5,
    guildOnly: true,
    userPerms: ["MANAGE_GUILD"],
    channelPerms: ["EMBED_LINKS"],
    clientPerms: ["MANAGE_ROLES"]
};