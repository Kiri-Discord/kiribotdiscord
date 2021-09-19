const { MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton } = require("discord.js");
const { askString, deleteIfAble } = require('../../util/util');
const { findBestMatch } = require("string-similarity");

exports.run = async(client, message, args, prefix) => {
    if (!args[0]) {
        let module = [...client.helps.values()];
        if (!client.config.owners.includes(message.author.id)) module = module.filter(x => !x.hide);
        const replyEmoji = client.customEmojis.get('following');
        message.channel.sendTyping();
        const optionList = [{
            label: '📔 all',
            value: 'all',
            default: true
        }];
        let fullCmd = [];
        let list = [];
        let arrSplitted = [];
        let arrEmbeds = [];
        for (const mod of module) {
            optionList.push({
                label: mod.displayName,
                value: mod.name,
            })
            mod.cmds.forEach(x => x.type = mod.name);
            fullCmd.push(...mod.cmds);
        };
        list = fullCmd.map(x => `**${x.name}**\n${replyEmoji} ${x.desc}`);
        while (list.length) {
            const toAdd = list.splice(0, list.length >= 10 ? 10 : list.length);
            arrSplitted.push(toAdd);
        };
        arrSplitted.map((item, index) => {
            const embed = new MessageEmbed()
                .setColor('#bee7f7')
                .setThumbnail(message.guild.iconURL({ size: 4096, dynamic: true }))
                .setDescription(item.join('\n'))
                .setFooter(`do ${prefix}help <cmd> for more help on a command`)
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
            .setCustomId('menu')
            .setMaxValues(1)
            .addOptions(optionList)
            .setPlaceholder('choose a result');
        const row1 = new MessageActionRow()
            .addComponents(menu);
        const msg = await message.channel.send({
            embeds: [arrEmbeds[0]],
            components: [row, row1],
            content: `page 1 of ${arrEmbeds.length}`,
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
            time: 30000
        });
        collector.on('end', async() => {
            row.components.forEach(button => button.setDisabled(true));
            row1.components.forEach(button => button.setDisabled(true));
            return msg.edit({
                content: `page ${currentPage + 1} of ${arrEmbeds.length}`,
                components: [row, row1],
                embeds: [arrEmbeds[currentPage]]
            });
        })
        collector.on('collect', async(res) => {
            switch (res.customId) {
                case 'menu':
                    if (res.values[0] !== 'all') {
                        list = fullCmd.filter(x => x.type === res.values[0]).map(x => `**${x.name}**\n${replyEmoji} ${x.desc}`);
                    } else {
                        list = fullCmd.map(x => `**${x.name}**\n${replyEmoji} ${x.desc}`);
                    };
                    arrSplitted = [];
                    while (list.length) {
                        const toAdd = list.splice(0, list.length >= 10 ? 10 : list.length);
                        arrSplitted.push(toAdd);
                    };
                    arrEmbeds = [];
                    arrSplitted.map((item, index) => {
                        const embed = new MessageEmbed()
                            .setColor('#bee7f7')
                            .setThumbnail(message.guild.iconURL({ size: 4096, dynamic: true }))
                            .setDescription(item.join('\n'))
                            .setFooter(`do ${prefix}help <cmd> for more help on a command`)
                        arrEmbeds.push(embed);
                    });
                    currentPage = 0;
                    await res.editReply({
                        content: `page ${currentPage + 1} of ${arrEmbeds.length}`,
                        components: [row, row1],
                        embeds: [arrEmbeds[currentPage]]
                    });
                case 'previousbtn':
                    if (currentPage !== 0) {
                        --currentPage;
                        await res.editReply({
                            content: `page ${currentPage + 1} of ${arrEmbeds.length}`,
                            components: [row, row1],
                            embeds: [arrEmbeds[currentPage]]
                        });
                    };
                    break;
                case 'nextbtn':
                    if (currentPage < arrEmbeds.length - 1) {
                        currentPage++;
                        await res.editReply({
                            content: `page ${currentPage + 1} of ${arrEmbeds.length}`,
                            components: [row, row1],
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
                        if (res.author.id === message.author.id) {
                            const number = res.content;
                            await deleteIfAble(res)
                            if (isNaN(number) || number > arrEmbeds.length || number < 1) {
                                return false;
                            } else return true;
                        } else return false;
                    };
                    const number = await askString(message.channel, filter, { time: 15000 });
                    if (number === 0 || !number) return prompt.delete();
                    else {
                        currentPage = parseInt(number) - 1;
                        await res.editReply({
                            content: `page ${number} of ${arrEmbeds.length}`,
                            components: [row, row1],
                            embeds: [arrEmbeds[currentPage]]
                        })
                    };
                    await prompt.delete();
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
                if (message.channel.permissionsFor(message.guild.me).has('MANAGE_MESSAGES')) await message.delete();
                return message.channel.send({ embeds: [{ color: "RED", description: `uh.. ${message.author.username}, wasn't that supposed to be sent in a NSFW channel bruh ${dead}` }] });
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
            const looking = client.customEmojis.get('looking') ? client.customEmojis.get('looking').toString() : ':eyes:';
            const matches = findBestMatch(query, client.allNameCmds).bestMatch.target;
            return message.channel.send({ embed: { color: "#bee7f7", description: `i don't remember having that commmand or feature packed ${looking} maybe you mean \`${prefix}help ${matches}\` ?` } });
        };
    };
};

exports.help = {
    name: "help",
    description: "show the help message for using me, with all the features and commands for it",
    usage: ["help `[command]`", "help `[feature]`", "help"],
    example: ["help `ping`", "help `memeify`", "help"]
}

exports.conf = {
    aliases: ["?"],
    cooldown: 3,
    channelPerms: ["EMBED_LINKS"]
};
