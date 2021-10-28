const { SlashCommandBuilder } = require('@discordjs/builders');
const Guild = require('../../model/music');
const ISO6391 = require('iso-639-1');
const { ChannelType } = require('discord-api-types/v9');

exports.run = async(client, interaction) => {
        const serverQueue = client.queue.get(interaction.guild.id);
        if (interaction.options.getSubcommand() === "off") {
            if (serverQueue) {
                if (serverQueue.karaoke.isEnabled && serverQueue.karaoke.instance) {
                    serverQueue.karaoke.instance.stop();
                };
                serverQueue.karaoke.isEnabled = false;
            };
            await interaction.deferReply();
            await Guild.findOneAndUpdate({
                guildId: interaction.guild.id,
            }, {
                KaraokeChannelID: null
            }, {
                upsert: true,
                new: true,
            })
            return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `❌ scrolling lyric has been disabled` }] });
        } else if (interaction.options.getSubcommand() === "on") {
            if (!serverQueue) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `❌ there isn't any queue to turn it on :pensive: you should play a song first!` }], ephemeral: true });
            if (!serverQueue.karaoke.channel) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `❌ the scrolling lyrics channel haven't been set yet. do \`/scrolling-lyrics set #channel\` to set it first!` }], ephemeral: true });
            if (!serverQueue.karaoke.languageCode) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `❌ you haven't set the language for the lyrics yet. do \`/scrolling-lyrics lang <language>\` to set it first!` }], ephemeral: true });
            if (serverQueue.karaoke.isEnabled) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `i thought scrolling lyrics is already enabled? :thinking:` }], ephemeral: true });
            serverQueue.karaoke.isEnabled = true;
            await interaction.deferReply();
            await Guild.findOneAndUpdate({
                    guildId: interaction.guild.id,
                }, {
                    KaraokeChannelID: serverQueue.karaoke.channel.id
                }, {
                    upsert: true,
                    new: true,
                })
                .catch(err => logger.log('error', err));
            return interaction.editReply(({ embeds: [{ color: "#bee7f7", description: `☑️ scrolling lyric is turned on in ${serverQueue.karaoke.channel}!` }] }));

        } else if (interaction.options.getSubcommand() === "lang") {
            if (!serverQueue) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `❌ there isn't any queue to set the language for :pensive: you should play a song first!` }], ephemeral: true });
            const query = interaction.options.getString('lang');
            const code = ISO6391.getCode(query.toLowerCase());
            if (!ISO6391.validate(code)) return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `❌ sorry, \`${query}\` is not a valid language :pensive:` }], ephemeral: true });
            serverQueue.karaoke.languageCode = code;
            return interaction.reply({ embeds: [{ color: "#bee7f7", description: `☑️ the lyric language has been set to \`${ISO6391.getName(code)}\`\n\ndo \`/scrolling-lyrics on\` to enable it :wink:` }], ephemeral: true });
        } else if (interaction.options.getSubcommand() === 'set') {
            const channel = interaction.options.getChannel('channel');
            if (!channel.permissionsFor(interaction.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS'])) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `i don't have the perms to send messages and embed links to ${channel}! can you check my perms? :pensive:` }], ephemeral: true });
            if (serverQueue) {
                serverQueue.karaoke.channel = channel;
                if (serverQueue.karaoke.isEnabled && serverQueue.karaoke.instance) {
                    serverQueue.karaoke.instance.change(channel);
                }
            };
            await interaction.deferReply();

            await Guild.findOneAndUpdate({
                    guildId: interaction.guild.id,
                }, {
                    KaraokeChannelID: channel.id
                }, {
                    upsert: true,
                    new: true,
                })
                .catch(err => logger.log('error', err));
            return interaction.editReply(({ embeds: [{ color: "#bee7f7", description: `☑️ the scrolling lyric channel has been set to ${channel}!${serverQueue ? `\n\ndo \`/scrolling-lyrics on\` to enable it :wink:` : ''}` }] }));
    };

}
exports.help = {
    name: "scrolling-lyrics",
    description: "set up the auto scrolling lyrics feature",
    usage: ["scrolling-lyrics `set <#channel>`", "scrolling-lyrics `set <channel ID>`", "scrolling-lyrics `off`", "scrolling-lyrics `lang <language code>`"],
    example: ["scrolling-lyrics `set #singing`", "scrolling-lyrics `set 4545455454644`", "scrolling-lyrics `off`", "scrolling-lyrics `lang english`"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addSubcommand(sub => sub
            .setName('off')
            .setDescription("turn off the scrolling lyrics features and stop all current instance")
        )
        .addSubcommand(sub => sub
            .setName('on')
            .setDescription("turn the scrolling lyrics feature on in the current queue")
        )
        .addSubcommand(sub => sub
            .setName('set')
            .setDescription("setup the scrolling lyrics channel")
            .addChannelOption(option => option
                .setName('channel')
                .setRequired(true)
                .setDescription('the channel where you want to send lyrics to')
                .addChannelType(ChannelType.GuildText)
            )
        )
        .addSubcommand(sub => sub
            .setName('lang')
            .setDescription("set the language for scrolling lyric")
            .addStringOption(option => option
                .setName('language')
                .setDescription('the language that you would like to use (e.g English, Japanese, ..)')
                .setRequired(true)
            )
        ),
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};