const Guild = require('../../model/music');


exports.run = async (client, message, args) => {

    if (message.flags[0] === "off") {
        await Guild.findOneAndUpdate({
            guildId: message.guild.id,
        },
        {
            KaraokeChannelID: null
        })
        return message.channel.send({embed: {color: "f3f3f3", description: `❌ karaoke mode has been disabled`}});
    }

    const channel = await message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);

    if (!channel) return message.reply('i can\'t find that channel. pls mention a channel within this guild 😔').then(m => m.delete({timeout: 5000}));

    await Guild.findOneAndUpdate({
        guildId: message.guild.id,
    },
    {
        KaraokeChannelID: channel.id
    })
    .catch(err => console.error(err));
    message.channel.send(({embed: {color: "f3f3f3", description: `☑️ the karaoke channel has been set to ${channel}!`}}));

}
exports.help = {
	name: "karaoke",
	description: "Set the karaoke channel where i sing the lyric for karaoke event :)",
	usage: ["karaoke `<#channel>`", "karaoke `<channel id>`", "karaoke -off"],
	example: ["karaoke `#singing`", "karaoke `4545455454644`"]
};
  
exports.conf = {
	aliases: ["singing"],
    cooldown: 5,
    guildOnly: true,
    userPerms: ["MANAGE_GUILD"],
	clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"]
};