const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
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
            await interaction.deferReply();
            let board = await generateBoard();
            if (!serverQueue) return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `❌ this sub command is only avaliable when you have a current music queue! however, you should set up your channel where all lyrics will be sent to first (if not done yet) using \`/scrolling-lyrics set #channel\`!` }, board] });
            if (!serverQueue.karaoke.channel) return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `❌ the scrolling lyrics channel haven't been set yet. do \`/scrolling-lyrics set #channel\` to set it first!` }, board] });
            if (!serverQueue.karaoke.languageCode) return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `❌ you haven't set the language for the lyrics yet. do \`/scrolling-lyrics lang <language>\` to set it first!` }, board] });
            if (serverQueue.karaoke.isEnabled) return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `i thought scrolling lyrics is already enabled? :thinking:` }, board] });
            serverQueue.karaoke.isEnabled = true;
            await Guild.findOneAndUpdate({
                guildId: interaction.guild.id,
            }, {
                KaraokeChannelID: serverQueue.karaoke.channel.id
            }, {
                upsert: true,
                new: true,
            });
            board = await generateBoard();
            return interaction.editReply(({ embeds: [{ color: "#bee7f7", description: `☑️ scrolling lyric is turned on in ${serverQueue.karaoke.channel}!` }, board] }));

        } else if (interaction.options.getSubcommand() === "lang") {
            await interaction.deferReply();
            let board = await generateBoard();
            if (!serverQueue) return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `❌ this sub command is only avaliable when you have a current music queue! however, you should set up your channel where all lyrics will be sent to first (if not done yet) using \`/scrolling-lyrics set #channel\`!` }, board] });
            const query = interaction.options.getString('language');
            const code = ISO6391.getCode(query.toLowerCase());
            if (!ISO6391.validate(code)) return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `❌ sorry, \`${query}\` is not a valid language :pensive:` }, board] });
            serverQueue.karaoke.languageCode = code;
            board = await generateBoard();
            return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `☑️ the lyric language has been set to \`${ISO6391.getName(code)}\`\n\ndo \`/scrolling-lyrics on\` to enable it :wink:` }, board] });
        } else if (interaction.options.getSubcommand() === 'set') {
            await interaction.deferReply();
            let board = await generateBoard();
            const channel = interaction.options.getChannel('channel');
            if (!channel.viewable || !channel.permissionsFor(interaction.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS'])) return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `i don't have the perms to send messages and embed links to ${channel}! can you check my perms? :pensive:` }, board] });
            if (serverQueue) {
                serverQueue.karaoke.channel = channel;
                if (serverQueue.karaoke.isEnabled && serverQueue.karaoke.instance) {
                    serverQueue.karaoke.instance.change(channel);
                }
            };


            await Guild.findOneAndUpdate({
                guildId: interaction.guild.id,
            }, {
                KaraokeChannelID: channel.id
            }, {
                upsert: true,
                new: true,
            });
            board = await generateBoard();
            return interaction.editReply(({ embeds: [{ color: "#bee7f7", description: `☑️ the scrolling lyric channel has been set to ${channel}!${serverQueue ? `\n\ndo \`/scrolling-lyrics on\` to enable it :wink:` : ''}` }, board] }));
    };
    async function generateBoard() {
        if (!serverQueue) {
            let setting = await Guild.findOne({
                guildId: interaction.guild.id,
            });
            if (!setting) setting = new Guild();
            const channel = interaction.guild.channels.cache.get(setting.KaraokeChannelID);
            const embed = new MessageEmbed()
            .setTitle('🎹 scrolling lyrics setup board')
            .setDescription(`below is a list of setting that you can set in order to turn on scrolling lyrics/karaoke correctly :slight_smile:\n\nsettings with 🔴 will need to be setup in order to enable the whole feature, those with 🟡 don't have to be setup and can be setup later (applied only when there isn't any queue) and 🟢 indicate a correctly setup setting (つ ≧ ▽ ≦) つ`)
            .addField(channel ? `🟢 lyrics channel` : `❌ lyrics channel`, `this is the channel where lyrics will be sent to. since this can be very spammy, you should create a dedicated channel for it! ${channel ? `(currently set to ${channel.toString()})` : ''}\nlyrics channel can be changed via \`/scrolling-lyrics set #channel\`!`)
            .addField(`🟡 lyric language`, `set the preferred language for the lyrics that you want to display. you can change it to a valid language like English or Japanese using \`/scrolling-lyrics lang <language>\``)
            .setFooter({text: `if all settings are indicated with 🟢, you can now use /scrolling-lyrics on to turn on the scrolling lyrics feature!`})
            return embed;
        } else {
            const embed = new MessageEmbed()
            .setTitle('🎹 scrolling lyrics setup board')
            .setDescription(`below is a list of setting that you can set in order to turn on scrolling lyrics/karaoke correctly :slight_smile:\n\nsettings with 🔴 will need to be setup in order to enable the whole feature, those with 🟡 don't have to be setup and can be setup later (applied only when there isn't any queue) and 🟢 indicate a correctly setup setting (つ ≧ ▽ ≦) つ`)
            .addField(serverQueue.karaoke.channel ? `🟢 lyrics channel` : `🔴 lyrics channel`, `this is the channel where lyrics will be sent to. since this can be very spammy, you should create a dedicated channel for it! ${serverQueue.karaoke.channel ? `(currently set to ${serverQueue.karaoke.channel.toString()})` : ''}\nlyrics channel can be changed via \`/scrolling-lyrics set #channel\`!`)
            .addField(serverQueue.karaoke.languageCode ? `🟢 lyric language` : `🔴 lyric language` , `set the preferred language for the lyrics that you want to display. you can change it to a valid language like English or Japanese using \`/scrolling-lyrics lang <language>\`${serverQueue.karaoke.languageCode ? `\n(currently set to ${ISO6391.getName(serverQueue.karaoke.languageCode)})` : ''}`)
            .setFooter({text: `if all settings are indicated with 🟢, you can now use /scrolling-lyrics on to turn on the scrolling lyrics feature!`})
            return embed;
        }
    }

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