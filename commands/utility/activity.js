const { MessageActionRow, MessageSelectMenu, MessageEmbed, Permissions } = require('discord.js');

exports.run = async(client, message, args) => {
    const { channel } = message.member.voice;
    if (!channel) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `⚠️ you are not in a voice channel!` }] });
    if (!channel.permissionsFor(message.guild.me).has(Permissions.FLAGS.CREATE_INSTANT_INVITE)) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `i can't play activities in the voice channel you are in. can you check my permission?` }] });
    const options = [{
            value: '755600276941176913',
            label: 'YouTube Together'
        },
        {
            value: '755827207812677713',
            label: 'Poker Night'
        },
        {
            value: '773336526917861400',
            label: 'Betrayal.io'
        },
        {
            value: '814288819477020702',
            label: 'Fishington.io'
        },
        {
            value: '832012774040141894',
            label: 'Chess in the Park'
        },
        {
            value: '878067389634314250',
            label: 'Doodle Crew'
        },
        {
            value: '879863686565621790',
            label: 'Letter Tile'
        },
        {
            value: '879863881349087252',
            label: 'Awkword'
        },
        {
            value: '879863976006127627',
            label: 'Word Snacks'
        }
    ]
    const menu = new MessageSelectMenu()
        .setCustomId('search')
        .setMaxValues(1)
        .setMinValues(1)
        .addOptions(options)
        .setPlaceholder('choose an activity:');
    const row = new MessageActionRow()
        .addComponents(menu)
    const embed = new MessageEmbed()
        .setDescription('what activity do you want to create?')
        .setColor("#bee7f7")
        .setFooter('timing out in 30 seconds');

    const filter = async(res) => {
        if (res.user.id !== message.author.id) {
            await res.reply({
                embeds: [{
                    description: `this menu doesn't belong to you :pensive:`
                }],
                ephemeral: true
            });
            return false;
        } else {
            return true;
        };
    };
    const msg = await message.channel.send({
        embeds: [embed],
        components: [row]
    })
    const collector = msg.createMessageComponentCollector({
        componentType: 'SELECT_MENU',
        filter,
        time: 30000,
        max: 1
    });
    collector.on('end', async(res) => {
        row.components.forEach(component => component.setDisabled(true));
        await msg.edit({
            embeds: [{
                color: '#bee7f7',
                description: `this command is now inactive :pensive:`
            }],
            components: [row]
        });
    });
    collector.on('collect', async(res) => {
        res.deferUpdate();
        collector.stop();
        const invite = await channel.createInvite({
            targetApplication: res.values[0],
            targetType: 2
        });
        return message.channel.send({
            embeds: [{
                description: `[Click me](${invite.url}) to add **${options.find(x => x.value === res.values[0]).label}** in ${channel} :slight_smile:`,
                color: '#bee7f7'
            }]
        })
    });
}




exports.help = {
    name: "activity",
    description: "opening Discord special voice channel activities, such as YouTube Together",
    usage: ["activity"],
    example: ["activity"]
};

exports.conf = {
    aliases: ['activities'],
    cooldown: 4,
    guildOnly: true
}