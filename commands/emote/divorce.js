const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { stripIndent } = require('common-tags');

exports.run = async(client, message, args) => {
    const author = await client.love.findOne({
        userID: message.author.id,
        guildID: message.guild.id
    });
    if (!author) {
        return message.reply('you are not married!');
    } else {
        if (!author.marriedID) return message.reply('you are not married!');
        const marry = await client.love.findOne({
            userID: author.marriedID,
            guildID: message.guild.id
        });
        if (!marry) {
            await client.love.findOneAndDelete({
                guildID: message.guild.id,
                userID: message.author.id
            });
            return message.channel.send("it seems like you did married, but i don't know who though. you are single now.")
        } else {
            if (marry.marriedID) {
                if (marry.marriedID !== message.author.id) {
                    await client.love.findOneAndDelete({
                        guildID: message.guild.id,
                        userID: message.author.id
                    });
                    return message.channel.send("that user isn't married to you! :pensive:")
                } else {
                    const member = message.guild.members.cache.get(author.marriedID);
                    if (!member) {
                        await client.love.findOneAndDelete({
                            guildID: message.guild.id,
                            userID: message.author.id
                        });
                        return message.channel.send("can't find your partner in this server! i will just change you to single instead...")
                    } else {
                        return divorce(client, message, member);
                    }
                }
            } else {
                await client.love.findOneAndDelete({
                    guildID: message.guild.id,
                    userID: message.author.id
                });
                return message.channel.send("your partner isn't married to you in my database! i will just change you to single instead...")
            }
        }

    }
}
async function divorce(client, message, member) {
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('yes')
            .setLabel('Yes')
            .setStyle('PRIMARY'),
            new MessageButton()
            .setCustomId('no')
            .setLabel('No')
            .setStyle('DANGER')
        );
    const embed = new MessageEmbed()
        .setColor('#7DBBEB')
        .setFooter('i will be going in a minute.')
        .setDescription(stripIndent `
        ${member}, it seems like ${message.author} is asking for a divorce...
        
        do you accept this request? please select **Yes** or **No**.
        `)
    const msg = await message.channel.send({ embeds: [embed], components: [row] });
    const filter = async(res) => {
        if (res.user.id !== member.user.id) {
            await res.reply({
                embeds: [{
                    description: `those buttons doesn't belong to you :pensive:`
                }],
                ephemeral: true
            });
            return false;
        } else {
            return true;
        };
    };
    const collector = msg.createMessageComponentCollector({
        componentType: 'BUTTON',
        filter,
        time: 60000,
        max: 1
    });
    collector.on('collect', async(res) => {
        await res.deferReply();
        if (res.customId === 'no') {
            message.channel.send(`**${member.user.username}** declined your request :(`);
            return collector.stop();
        } else if (res.customId === 'yes') {
            await client.love.findOneAndDelete({
                guildID: message.guild.id,
                userID: message.author.id
            });
            await client.love.findOneAndDelete({
                userID: member.user.id,
                guildID: message.guild.id
            });
            res.editReply(`**${message.author.username}**, you have divorced with **${member.user.username}** :pensive:`);
            return collector.stop();
        };
    });
    collector.on('end', (collected) => {
        row.components.forEach(component => component.setDisabled(true));
        msg.edit({ components: [row] });
        if (!collected.size) return message.channel.send('you two didn\'t say anything!');
    });
}
exports.help = {
    name: "divorce",
    description: "divorce with somebody after marry them :pensive:",
    usage: ["divorce `<@mention>`"],
    example: ["divorce `@somebody`"]
};

exports.conf = {
    aliases: ['breakup'],
    cooldown: 4,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};