const Guild = require('../../model/music');
const ISO6391 = require('iso-639-1');

exports.run = async (client, message, args, prefix) => {
    const serverQueue = client.queue.get(message.guild.id);
    if (!args.length) return message.channel.send(`uh seems like that's a wrong usage :pensive: check out \`${prefix}help auto-lyrics\`!`)
    if (args[0] === "off") {
        if (serverQueue) {
            serverQueue.karaoke.isEnabled = false;
            if (serverQueue.karaoke.timeout.length) {
                serverQueue.karaoke.timeout.forEach(x => {
                    clearTimeout(x);
                });
                serverQueue.karaoke.timeout.splice(0, serverQueue.karaoke.timeout.length);
            }
        }
        await Guild.findOneAndUpdate({
            guildId: message.guild.id,
        },
        {
            KaraokeChannelID: undefined
        }, {
            upsert: true,
            new: true,
        })
        return message.channel.send({embed: {color: "f3f3f3", description: `❌ auto scroll lyric has been disabled`}});
    };
    if (args[0] === "on") {
        if (!serverQueue) return message.channel.send({embed: {color: "f3f3f3", description: `❌ there isn't any queue to turn it on :pensive:`}});
        if (!serverQueue.karaoke.channel) return message.channel.send({embed: {color: "f3f3f3", description: `❌ the auto-scroll lyric channel haven't been set yet. do \`${prefix}auto-lyrics -set #yourchannel\` to set it first!`}});
        if (!serverQueue.karaoke.languageCode) return message.channel.send({embed: {color: "f3f3f3", description: `❌ you haven't set the language for the lyrics yet. do \`${prefix}auto-lyrics -lang <language>\` to set it first!`}});
        if (serverQueue.karaoke.isEnabled) return message.channel.send({embed: {color: "f3f3f3", description: `i thought auto-lyric is already enabled? :thinking:`}});
        serverQueue.karaoke.isEnabled = true;
        await Guild.findOneAndUpdate({
            guildId: message.guild.id,
        },
        {
            KaraokeChannelID: serverQueue.karaoke.channel.id
        }, {
            upsert: true,
            new: true,
        })
        .catch(err => console.error(err));
        return message.channel.send(({embed: {color: "f3f3f3", description: `☑️ auto-scroll lyric is turned on in ${serverQueue.karaoke.channel}!`}}));

    };
    if (args[0] === "lang") {
        if (!serverQueue) return message.channel.send({embed: {color: "f3f3f3", description: `❌ there isn't any queue to set the language for :pensive:`}});
        const query = args[1];
        const code = ISO6391.getCode(query.toLowerCase());
        if (!ISO6391.validate(code)) return message.channel.send({embed: {color: "f3f3f3", description: `❌ sorry, \`${query}\` is not a valid language :pensive:`}});
        serverQueue.karaoke.languageCode = code;
        return message.channel.send({embed: {color: "f3f3f3", description: `☑️ the lyric language has been set to \`${ISO6391.getName(code)}\`\n\ndo \`${prefix}auto-lyric -on\` to enable it :wink:`}});
    };
    if (args[0] === 'set') {
        const channel = await message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
        if (!channel) return message.inlineReply('i can\'t find that channel. pls mention a channel within this guild 😔').then(m => m.delete({timeout: 5000}));
        if (serverQueue) {
            serverQueue.karaoke.channel = channel;
            if (serverQueue.karaoke.timeout.length) {
                serverQueue.karaoke.timeout.forEach(x => {
                    clearTimeout(x);
                });
                serverQueue.karaoke.timeout.splice(0, serverQueue.karaoke.timeout.length);
            }
        }
    
        await Guild.findOneAndUpdate({
            guildId: message.guild.id,
        },
        {
            KaraokeChannelID: channel.id
        }, {
            upsert: true,
            new: true,
        })
        .catch(err => console.error(err));
        return message.channel.send(({embed: {color: "f3f3f3", description: `☑️ the auto scroll lyric channel has been set to ${channel}!\n\ndo \`${prefix}auto-lyric -on\` to enable it :wink:`}}));
    }

}
exports.help = {
	name: "auto-lyrics",
	description: "Setting for my auto scrolling lyrics features",
	usage: ["auto-lyrics `set <#channel>`", "auto-lyrics `set <channel id>`", "auto-lyrics `off`", "auto-lyrics `-lang <language code>`"],
	example: ["auto-lyrics `set #singing`", "auto-lyrics `set 4545455454644`", "auto-lyrics `off`", "auto-lyrics `-lang english`"]
};
  
exports.conf = {
	aliases: ["karaoke", "al", "lyrics-scrolling", "auto-lyrics"],
    cooldown: 5,
    guildOnly: true,
	channelPerms: ["EMBED_LINKS"]
};
