const { MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton } = require("discord.js");
const { askString, deleteIfAble } = require('../../util/util');
const { findBestMatch } = require("string-similarity");

exports.run = async(client, message, args, prefix) => {
    if (!args[0]) {
        let module = [...client.helps.values()];
        if (!client.config.owners.includes(message.author.id)) module = module.filter(x => !x.hide);
        const replyEmoji = client.customEmojis.get('arrow');
        const duh = client.customEmojis.get('duh');
        message.channel.sendTyping();
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
                .setFooter(`page ${index + 1} of ${arrSplitted.length} | do ${prefix}help <command> for more help info on a command!`)
            arrEmbeds.push(embed);
        });
        let components = [];
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
        let row = new MessageActionRow()
            .addComponents(components);
        const menu = new MessageSelectMenu()
            .setMaxValues(1)
            .setMinValues(1)
            .setCustomId('menu')
            .addOptions(optionList)
            .setPlaceholder('choose a category');
        const row1 = new MessageActionRow()
            .addComponents(menu);
        const msg = await message.channel.send({
            embeds: [arrEmbeds[0]],
            components: [row1, row],
            content: `if you ran into any trouble, use \`${prefix}invite\` to get more info about my support servers ${duh}`
        });
        const filter = async res => {
            if (res.user.id !== message.author.id) {
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
                            .setFooter(`page ${index + 1} of ${arrSplitted.length} | do ${prefix}help <command> for more help info on a command!`)
                        arrEmbeds.push(embed);
                    });
                    components = [];
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
                    row = new MessageActionRow()
                        .addComponents(components);
                    currentPage = 0;
                    await res.editReply({
                        embeds: [arrEmbeds[currentPage]],
                        components: [row1, row]
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
                        }],
                        fetchReply: true
                    });
                    const filter = async res => {
                        if (res.author.id === message.author.id) {
                            const number = res.content;
                            await deleteIfAble(res)
                            if (isNaN(number) || number > arrEmbeds.length || number < 1) {
                                return false;
                            } else return true;
                        } else return false;
                    };
                    const number = await askString(message.channel, filter, { time: 15000 });
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
        let query = args[0].toLowerCase();
        if (client.commands.has(query) || client.commands.get(client.aliases.get(query))) {
            let command = client.commands.get(query) || client.commands.get(client.aliases.get(query));
            const dead = client.customEmojis.get('dead') ? client.customEmojis.get('dead').toString() : ':thinking:';
            if (command.conf.owner) return message.channel.send({ embeds: [{ color: "RED", description: `that command is accessible only by my owner 👑` }] });
            if (command.conf.adult && !message.channel.nsfw) {
                if (message.channel.permissionsFor(message.guild.me).has('MANAGE_MESSAGES')) await deleteIfAble(message);
                return message.channel.send({ embeds: [{ color: "RED", description: `uh.. ${message.author.username}, wasn't that supposed to be sent in a NSFW channel dear ${dead}` }] });
            };
            let name = command.help.name;
            let desc = command.help.description;
            let cooldown = command.conf.cooldown + " second(s)";
            let aliases = command.conf.aliases.join(", ") ? command.conf.aliases.join(", ") : "no aliases provided.";
            let usage = command.help.usage ? command.help.usage.join(", ") : "no usage provided.";
            let example = command.help.example ? command.help.example.join(", ") : "no example provided.";
            let userperms = command.conf.userPerms ? command.conf.userPerms.map(x => `\`${x}\``).join(", ") : "no perms required.";
            let botperms = command.conf.clientPerms ? command.conf.clientPerms.map(x => `\`${x}\``).join(", ") : "no perms required.";
            let channelperms = command.conf.channelPerms ? command.conf.channelPerms.map(x => `\`${x}\``).join(", ") : "no perms required.";
            let adult = command.conf.adult ? 'true' : 'false';

            let embed = new MessageEmbed()
                .setColor('#bee7f7')
                .setAuthor('command information (=^･ω･^=)')
                .setTitle(`${prefix}${name}`)
                .setDescription(desc)
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter("[] are optional and <> are required. don't includes these things while typing a command :)")
                .addField("cooldown", cooldown, true)
                .addField("aliases", aliases, true)
                .addField("usage", usage, true)
                .addField("example", example, true)
                .addField("user permission", userperms, true)
                .addField("global permission", botperms, true)
                .addField(`channel permission`, channelperms, true)
                .addField('nsfw?', adult, true)
            return message.channel.send({ embeds: [embed] });
        } else {
            const matches = findBestMatch(query, client.allNameCmds).bestMatch.target;
            return message.channel.send(`:grey_question: maybe you mean \`${prefix}help ${matches}\` ?`);
        };
    };
};

exports.help = {
    name: "help",
    description: "gives descriptions and usage of my commands",
    usage: ["help `[command]`", "help `[feature]`", "help"],
    example: ["help `ping`", "help `memeify`", "help"]
}

exports.conf = {
    aliases: ["?"],
    cooldown: 3,
    channelPerms: ["EMBED_LINKS"]
};