const Guild = require('../../model/music');
const ISO6391 = require('iso-639-1');

exports.run = async (client, message, args) => {
    const serverQueue = client.queue.get(message.guild.id);
    if (message.flags[0] === "off") {
        if (serverQueue.karaoke.isEnabled) serverQueue.karaoke.isEnabled = false;
        await Guild.findOneAndUpdate({
            guildId: message.guild.id,
        },
        {
            KaraokeChannelID: null
        })
        return message.channel.send({embed: {color: "f3f3f3", description: `❌ auto scroll lyric has been disabled`}});
    };
    if (message.flags[0] === "lang") {
        if (!serverQueue) return message.channel.send({embed: {color: "f3f3f3", description: `❌ there isn't any queue to set the language for :pensive:`}});
        const query = args[1];
        const code = ISO6391.getCode(query.toLowerCase());
        if (!ISO6391.validate(code)) return message.channel.send({embed: {color: "f3f3f3", description: `❌ sorry, \`${query}\` is not a valid language :pensive:`}});
        serverQueue.karaoke.languageCode = code;
        serverQueue.karaoke.isEnabled = true;
        return message.channel.send({embed: {color: "f3f3f3", description: `☑️ the lyric language has been set to \`${ISO6391.getName(code)}\`\n\ni have also turned on auto sing lyric in advanced :wink:`}});
    };
    if (message.flags[0] === 'set') {
        const channel = await message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
        if (!channel) return message.reply('i can\'t find that channel. pls mention a channel within this guild 😔').then(m => m.delete({timeout: 5000}));
    
        await Guild.findOneAndUpdate({
            guildId: message.guild.id,
        },
        {
            KaraokeChannelID: channel.id
        })
        .catch(err => console.error(err));
        return message.channel.send(({embed: {color: "f3f3f3", description: `☑️ the auto scroll lyric channel has been set to ${channel}!`}}));
    }

}
exports.help = {
	name: "lyrics",
	description: "Setting for my auto scrolling lyrics features",
	usage: ["lyrics `-set <#channel>`", "lyrics `-set <channel id>`", "lyrics `-off`", "lyrics `-lang <language code>`"],
	example: ["lyrics `#singing`", "lyrics `4545455454644`", "lyrics `-off`", "lyrics `-lang english`"]
};
  
exports.conf = {
	aliases: ["karaoke", "lyric", "lyrics-scrolling"],
    cooldown: 5,
    guildOnly: true,
    userPerms: [],
	clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
};