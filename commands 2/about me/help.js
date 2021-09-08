const { MessageEmbed, Util } = require("discord.js");
const { findBestMatch } = require("string-similarity");

exports.run = async(client, message, args, prefix) => {
    if (!args[0]) {
        let module = client.helps.array();
        if (!client.config.owners.includes(message.author.id)) module = await module.filter(x => !x.hide);
        const embed1 = new MessageEmbed()
            .setColor("#bee7f7")
            .setAuthor('my command list (p`･ω･´) q')
            .setDescription(`run the command below each features to get more information!\nif you are using a mobile device, click the **hover for info** button to see descriptions!\nif you ran into any trouble, use \`${prefix}invite\` to get more info about support servers.`)
            .setTitle('hey, how can i help?')
            .setThumbnail(client.user.displayAvatarURL())
        for (const mod of module) {
            const addS = mod.cmds.length === 1 ? '' : 's';
            embed1.addField(mod.displayName, `\`${prefix}help ${mod.name}\`\n[hover for info](https://kiribot.xyz '${mod.desc} (there are ${mod.cmds.length} command${addS} for this feature)')`, true)
        };
        return message.channel.send({ embeds: [embed1] });
    } else {
        let query = args[0].toLowerCase();
        if (client.commands.has(query) || client.commands.get(client.aliases.get(query))) {
            let command = client.commands.get(query) || client.commands.get(client.aliases.get(query));
            const dead = client.customEmojis.get('dead') ? client.customEmojis.get('dead') : ':thinking:';
            if (command.conf.owner) return message.channel.send({ embeds: [{ color: "RED", description: `that command is accessible only by my owner 👑` }] });
            if (command.conf.adult && !message.channel.nsfw) {
                if (message.channel.permissionsFor(message.guild.me).has('MANAGE_MESSAGES')) await message.delete();
                return message.channel.send({ embeds: [{ color: "RED", description: `uh.. ${message.author.username}, wasn't that supposed to be sent in a NSFW channel bruh ${dead}` }] });
            };
            let name = command.help.name;
            let desc = command.help.description;
            let cooldown = command.conf.cooldown + " second(s)";
            let aliases = command.conf.aliases.join(", ") ? command.conf.aliases.join(", ") : "no aliases provided.";
            let usage = command.help.usage ? command.help.usage : "no usage provided.";
            let example = command.help.example ? command.help.example : "no example provided.";
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
                .setFooter("[] optional, <> required. don't includes these things while typing a command :)")
                .addField("cooldown", cooldown, true)
                .addField("aliases", aliases, true)
                .addField("usage", usage, true)
                .addField("example", example, true)
                .addField("user permission(s)", userperms, true)
                .addField("global permission(s)", botperms, true)
                .addField(`channel permission(s)`, channelperms, true)
                .addField('nsfw?', adult, true)
            return message.channel.send({ embeds: [embed] });
        } else if (client.helps.has(query)) {
            const feature = client.helps.get(query);
            if (feature.hide && !client.config.owners.includes(message.author.id)) return;
            let cmd = feature.cmds.map(x => `● \`${x.name}\` - ${x.desc}`).join("\n");
            const [first, ...rest] = Util.splitMessage(cmd, { maxLength: 3000, char: '\n' });
            const embedsArray = [];
            let embed = new MessageEmbed()
                .setColor("#bee7f7")
                .setAuthor('feature information (=･ω･=)')
                .setThumbnail(client.user.displayAvatarURL())
            if (rest.length) {
                embed.setTitle(`commands list for ${feature.displayName}`)
                embed.setDescription(first);
                embedsArray.push(embed);
                const lastContent = rest.splice(rest.length - 1, 1);
                for (const text of rest) {
                    const embed1 = new MessageEmbed()
                        .setColor("#bee7f7")
                        .setDescription(text)
                    embedsArray.push(embed1);
                };
                const embed3 = new MessageEmbed()
                    .setColor("#bee7f7")
                    .setDescription(lastContent)
                    .setFooter(`remember to type ${prefix} before each command!`)
                embedsArray.push(embed3);
                return message.channel.send({ embeds: embedsArray })
            } else {
                embed
                    .setTitle(`commands list for ${feature.displayName}`)
                    .setFooter(`remember to type ${prefix} before each command!`)
                    .setColor("#bee7f7")
                    .setDescription(first + `\n\nif you want to get more help regarding each command, use \`${prefix}help <command>\`!`)
                return message.channel.send({ embeds: [embed] });
            };
        } else {
            const list = client.allNameCmds.concat(client.allNameFeatures)
            const looking = client.customEmojis.get('looking') ? client.customEmojis.get('looking') : ':eyes:';
            const matches = findBestMatch(query, list).bestMatch.target;
            return message.channel.send({ embed: { color: "RED", description: `i don't remember having that commmand or feature packed ${looking} maybe you mean \`${prefix}help ${matches}\` ?` } });
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