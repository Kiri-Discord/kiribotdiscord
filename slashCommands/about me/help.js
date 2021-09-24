const { MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton } = require("discord.js");
const { askString, deleteIfAble } = require('../../util/util');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { findBestMatch } = require("string-similarity");

exports.run = async(client, interaction) => {
    const option = interaction.options.getString('name');
    if (!option) {
        let module = [...client.slashHelps.values()];
        if (!client.config.owners.includes(interaction.user.id)) module = module.filter(x => !x.hide);
        const replyEmoji = client.customEmojis.get('arrow');
        const duh = client.customEmojis.get('duh');
        const optionList = [{
            label: 'all',
            value: 'all',
            emoji: '📔'
        }];
        let fullCmd = [];
        let list = [];
        let arrSplitted = [];
        let arrEmbeds = [];
        for (const mod of module) {
            optionList.push({
                label: mod.displayName,
                value: mod.name,
                emoji: mod.emoji,
            })
            mod.cmds.forEach(x => x.type = mod.name);
            fullCmd.push(...mod.cmds);
        };
        list = fullCmd.map(x => `**[${x.name}](https://kiribot.xyz)**\n${replyEmoji} ${x.desc}`);
        while (list.length) {
            const toAdd = list.splice(0, list.length >= 10 ? 10 : list.length);
            arrSplitted.push(toAdd);
        };
        arrSplitted.forEach((item, index) => {
            const embed = new MessageEmbed()
                .setColor('#FFE6CC')
                .setDescription(item.join('\n'))
                .setFooter(`page ${index + 1} of ${arrSplitted.length} | do /help <command> for more help info on a command!`)
            arrEmbeds.push(embed);
        });
        const components = [];
        if (arrEmbeds.length > 1) {
            components.push(
                new MessageButton()
                .setCustomId("previousbtn")
                .setEmoji(client.customEmojis.get('left') ? client.customEmojis.get('left').id : '⬅️')
                .setStyle("SECONDARY"),
                new MessageButton()
                .setCustomId('jumpbtn')
                .setEmoji(client.customEmojis.get('jump') ? client.customEmojis.get('jump').id : '↗️')
                .setStyle('SECONDARY'),
                new MessageButton()
                .setCustomId("nextbtn")
                .setEmoji(client.customEmojis.get('right') ? client.customEmojis.get('right').id : '➡️')
                .setStyle("SECONDARY")
            )
        };
        components.push(new MessageButton()
            .setCustomId('clearbtn')
            .setEmoji(client.customEmojis.get('trash') ? client.customEmojis.get('trash').id : '🗑️')
            .setStyle('DANGER'));
        const row = new MessageActionRow()
            .addComponents(components);
        const menu = new MessageSelectMenu()
            .setMaxValues(1)
            .setMinValues(1)
            .setCustomId('menu')
            .addOptions(optionList)
            .setPlaceholder('choose a category');
        const row1 = new MessageActionRow()
            .addComponents(menu);
        const msg = await interaction.reply({
            embeds: [arrEmbeds[0]],
            components: [row1, row],
            content: `if you ran into any trouble, use \`/invite\` to get more info about my support servers ${duh}`,
            fetchReply: true
        });
        const filter = async res => {
            if (res.user.id !== interaction.user.id) {
                await res.reply({
                    embeds: [{
                        description: `those interaction are not for you :pensive:`
                    }],
                    ephemeral: true
                });
                return false;
            } else {
                await res.deferUpdate();
                return true;
            }
        };
        let currentPage = 0;
        const collector = msg.createMessageComponentCollector({
            filter,
            time: 45000
        });
        collector.on('end', async() => {
            row.components.forEach(button => button.setDisabled(true));
            row1.components.forEach(button => button.setDisabled(true));
            return msg.edit({
                components: [row1, row],
                embeds: [arrEmbeds[currentPage]]
            });
        })
        collector.on('collect', async(res) => {
            switch (res.customId) {
                case 'menu':
                    if (res.values[0] !== 'all') {
                        list = fullCmd.filter(x => x.type === res.values[0]).map(x => `**[${x.name}](https://kiribot.xyz)**\n${replyEmoji} ${x.desc}`);
                    } else {
                        list = fullCmd.map(x => `**[${x.name}](https://kiribot.xyz)**\n${replyEmoji} ${x.desc}`);
                    };
                    arrSplitted = [];
                    while (list.length) {
                        const toAdd = list.splice(0, list.length >= 10 ? 10 : list.length);
                        arrSplitted.push(toAdd);
                    };
                    arrEmbeds = [];
                    arrSplitted.forEach((item, index) => {
                        const embed = new MessageEmbed()
                            .setColor('#FFE6CC')
                            .setDescription(item.join('\n'))
                            .setFooter(`page ${index + 1} of ${arrSplitted.length} | do /help <command> for more help info on a command!`)
                        arrEmbeds.push(embed);
                    });
                    currentPage = 0;
                    await res.editReply({
                        embeds: [arrEmbeds[currentPage]]
                    });
                    break;
                case 'previousbtn':
                    if (currentPage !== 0) {
                        --currentPage;
                        await res.editReply({
                            embeds: [arrEmbeds[currentPage]]
                        });
                    };
                    break;
                case 'nextbtn':
                    if (currentPage < arrEmbeds.length - 1) {
                        currentPage++;
                        await res.editReply({
                            embeds: [arrEmbeds[currentPage]]
                        })
                    };
                    break;
                case 'jumpbtn':
                    const prompt = await res.followUp({
                        embeds: [{
                            description: `to what page would you like to jump? (1 - ${arrEmbeds.length}) :slight_smile:`,
                            footer: {
                                text: "type 'cancel' to cancel the jumping"
                            }
                        }]
                    });
                    const filter = async res => {
                        if (res.author.id === interaction.user.id) {
                            const number = res.content;
                            await deleteIfAble(res)
                            if (isNaN(number) || number > arrEmbeds.length || number < 1) {
                                return false;
                            } else return true;
                        } else return false;
                    };
                    const number = await askString(interaction.channel, filter, { time: 15000 });
                    if (number === 0 || !number) prompt.delete();
                    else {
                        await prompt.delete();
                        currentPage = parseInt(number) - 1;
                        await res.editReply({
                            embeds: [arrEmbeds[currentPage]]
                        })
                    };
                    break;
                case 'clearbtn':
                    collector.stop();
                    break;
            };
        });
    } else {
        let query = option.toLowerCase();
        if (client.slash.has(query)) {
            let command = client.slash.get(query);
            const dead = client.customEmojis.get('dead') ? client.customEmojis.get('dead').toString() : ':thinking:';
            if (command.conf.adult && !interaction.channel.nsfw) {
                return interaction.reply({ embeds: [{ color: "RED", description: `uh.. ${message.author.username}, wasn't that supposed to be sent in a NSFW channel dear ${dead}` }], ephemeral: true });
            };
            let name = command.help.name;
            let desc = command.help.description;
            let cooldown = command.conf.cooldown + " second(s)";
            let example = command.help.example ? command.help.example.join(", ") : "no example provided.";
            let userperms = command.conf.userPerms ? command.conf.userPerms.map(x => `\`${x}\``).join(", ") : "no perms required.";
            let botperms = command.conf.clientPerms ? command.conf.clientPerms.map(x => `\`${x}\``).join(", ") : "no perms required.";
            let channelperms = command.conf.channelPerms ? command.conf.channelPerms.map(x => `\`${x}\``).join(", ") : "no perms required.";
            let adult = command.conf.adult ? 'true' : 'false';

            let embed = new MessageEmbed()
                .setColor('#bee7f7')
                .setAuthor('command information (=^･ω･^=)')
                .setTitle(`/${name}`)
                .setDescription(desc)
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter("[] are optional and <> are required. don't includes these things while typing a command :)")
                .addField("cooldown", cooldown, true)
                .addField("example", example, true)
                .addField("user permission", userperms, true)
                .addField("global permission", botperms, true)
                .addField(`channel permission`, channelperms, true)
                .addField('nsfw?', adult, true)
            return interaction.reply({ embeds: [embed] });
        } else {
            const matches = findBestMatch(query, client.allSlashCmds).bestMatch.target;
            return interaction.reply({
                content: `:grey_question: maybe you mean \`/help ${matches}\` ?`,
                ephemeral: true
            });
        };
    };
};

exports.help = {
    name: "help",
    description: "show descriptions and usage of my commands",
    usage: ["help `[command]`", "help `[feature]`", "help"],
    example: ["help `ping`", "help `memeify`", "help"]
};

exports.conf = {
    cooldown: 3,
    channelPerms: ["EMBED_LINKS"],
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addStringOption(option => option
            .setName('name')
            .setDescription('the command you want to get')
            .setRequired(false)
        ),
    guild: true
};