const Guild = require('../../model/music');
const ISO6391 = require('iso-639-1');

exports.run = async(client, message, args, prefix) => {
        const serverQueue = client.queue.get(message.guild.id);
        if (args[0] === "off") {
            if (serverQueue) {
                if (serverQueue.karaoke.isEnabled && serverQueue.karaoke.instance) {
                    serverQueue.karaoke.instance.stop();
                };
                serverQueue.karaoke.isEnabled = false;
            }
            await Guild.findOneAndUpdate({
                guildId: message.guild.id,
            }, {
                KaraokeChannelID: null
            }, {
                upsert: true,
                new: true,
            })
            return message.channel.send({ embeds: [{ color: "#bee7f7", description: `❌ scrolling lyric has been disabled` }] });
        } else if (args[0] === "on") {
            if (!serverQueue) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `❌ there isn't any queue to turn it on :pensive: you should play a song first!` }] });
            if (!serverQueue.karaoke.channel) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `❌ the scrolling lyrics channel haven't been set yet. do \`${prefix}scrolling-lyrics set #yourchannel\` to set it first!` }] });
            if (!serverQueue.karaoke.languageCode) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `❌ you haven't set the language for the lyrics yet. do \`${prefix}scrolling-lyrics lang <language>\` to set it first!` }] });
            if (serverQueue.karaoke.isEnabled) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `i thought scrolling lyrics is already enabled? :thinking:` }] });
            serverQueue.karaoke.isEnabled = true;
            await Guild.findOneAndUpdate({
                    guildId: message.guild.id,
                }, {
                    KaraokeChannelID: serverQueue.karaoke.channel.id
                }, {
                    upsert: true,
                    new: true,
                })
                .catch(err => logger.log('error', err));
            return message.channel.send(({ embeds: [{ color: "#bee7f7", description: `☑️ scrolling lyric is turned on in ${serverQueue.karaoke.channel}!` }] }));

        } else if (args[0] === "lang") {
            if (!serverQueue) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `❌ there isn't any queue to set the language for :pensive: you should play a song first!` }] });
            const query = args[1];
            const code = ISO6391.getCode(query.toLowerCase());
            if (!ISO6391.validate(code)) return message.channel.send({ embeds: [{ color: "#bee7f7", description: `❌ sorry, \`${query}\` is not a valid language :pensive:` }] });
            serverQueue.karaoke.languageCode = code;
            return message.channel.send({ embeds: [{ color: "#bee7f7", description: `☑️ the lyric language has been set to \`${ISO6391.getName(code)}\`\n\ndo \`${prefix}scrolling-lyrics on\` to enable it :wink:` }] });
        } else if (args[0] === 'set') {
            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
            if (!channel) return message.reply({ embeds: [{ color: "#bee7f7", description: `i can\'t find that channel. pls mention a channel within this guild properly with ${prefix}scrolling-lyrics \`set <#channel>\` 😔` }] });
            if (!channel.permissionsFor(message.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS'])) return message.reply({ embeds: [{ color: "#bee7f7", description: `i don't have the perms to send messages and embed links to ${channel}! can you check my perms? :pensive:` }] });
            if (serverQueue) {
                serverQueue.karaoke.channel = channel;
                if (serverQueue.karaoke.isEnabled && serverQueue.karaoke.instance) {
                    serverQueue.karaoke.instance.change(channel);
                }
            }

            await Guild.findOneAndUpdate({
                    guildId: message.guild.id,
                }, {
                    KaraokeChannelID: channel.id
                }, {
                    upsert: true,
                    new: true,
                })
                .catch(err => logger.log('error', err));
            return message.channel.send(({ embeds: [{ color: "#bee7f7", description: `☑️ the scrolling lyric channel has been set to ${channel}!${serverQueue ? `\n\ndo \`${prefix}scrolling-lyrics on\` to enable it :wink:` : ''}` }] }));
    } else {
        return message.channel.send({
            embeds: [{
                description: `uh seems like that's a wrong usage! you can check out \`${prefix}help scrolling-lyrics\`!`,
                color: "#bee7f7",
                footer: {
                    text: `you can check ${prefix}scrolling-lyrics set <#channel> to get started!`
                }
            }]
        });
    }

}
exports.help = {
    name: "scrolling-lyrics",
    description: "set up the auto scrolling lyrics feature",
    usage: ["scrolling-lyrics `set <#channel>`", "scrolling-lyrics `set <channel ID>`", "scrolling-lyrics `off`", "scrolling-lyrics `lang <language code>`"],
    example: ["scrolling-lyrics `set #singing`", "scrolling-lyrics `set 4545455454644`", "scrolling-lyrics `off`", "scrolling-lyrics `lang english`"]
};

exports.conf = {
    aliases: ["karaoke", "sl", "lyrics-scrolling"],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};