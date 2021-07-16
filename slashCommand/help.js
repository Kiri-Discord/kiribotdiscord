const { SlashCommand, CommandOptionType } = require('slash-create');
const { MessageEmbed } = require('discord.js');
const client = require('../main');
const { findBestMatch } = require("string-similarity");

module.exports = class HelpCommand extends SlashCommand {
        constructor(creator) {
            super(creator, {
                name: 'help',
                description: "show the help message for using me, with all the features and commands for it",
                options: [{
                        required: false,
                        type: CommandOptionType.SUB_COMMAND,
                        description: 'get info about a specific command',
                        name: 'command',
                        options: [{
                            name: 'command',
                            description: 'what command do you want to get the info?',
                            type: CommandOptionType.STRING,
                            required: true
                        }]
                    },
                    {
                        type: CommandOptionType.SUB_COMMAND,
                        required: false,
                        description: 'get command list of a specific feature',
                        name: 'feature',
                        options: [{
                            name: 'feature',
                            choices: client.allNameFeaturesSlash,
                            description: 'what command do you want to get the info?',
                            type: CommandOptionType.STRING,
                            required: true
                        }]
                    },
                    {
                        type: CommandOptionType.SUB_COMMAND,
                        required: false,
                        description: 'show my default help command list',
                        name: 'all'
                    }
                ]
            });
            this.deferEphemeral = true;
            this.filePath = __filename;
        };

        async run(ctx) {
                const channel = client.channels.cache.get(ctx.channelID);
                const setting = client.guildsStorage.get(message.guild.id);
                if (ctx.options.feature) {
                    const feature = client.helps.get(ctx.options.feature.feature);
                    const dead = client.customEmojis.get('dead') ? client.customEmojis.get('dead') : ':thinking:';
                    if (feature.adult && !channel.nsfw) {
                        return ctx.send({ embeds: [{ description: `uh.. ${ctx.member.user.username}, wasn't that supposed to be sent in a NSFW channel bruh ${dead}` }], ephemeral: true });
                    };
                    if (feature.hide) return ctx.send({ embeds: [{ description: `that feature is accessible only by my owner 👑` }], ephemeral: true });
                    let cmd = feature.cmds.map(x => `\`${x}\``).join(", ");
                    let adult = feature.adult;
                    const embed = new MessageEmbed()
                        .setColor("#bee7f7")
                        .setAuthor('feature information (=･ω･=)', client.user.displayAvatarURL())
                        .setTitle(`commands for ${feature.displayName}`)
                        .setDescription(`${cmd}\n\nif you want to get more help regarding each command, use \`${setting.prefix}help <command>\`!${adult ? `\n\nall commands in here are flagged as NSFW, so you might want to execute it in a NSFW channel ${dead}` : ''}`)
                .setFooter(`remember to type ${setting.prefix} before each command!`)
                .setThumbnail(client.user.displayAvatarURL())
            return ctx.send({embeds: [embed]})
        } else if (ctx.options.command) {
            let command = client.commands.get(ctx.options.command.command) || client.commands.get(client.aliases.get(ctx.options.command.command));
            if (!command) {
                const looking = client.customEmojis.get('looking') ? client.customEmojis.get('looking') : ':eyes:';
                const matches = findBestMatch(ctx.options.command.command, client.allNameCmds).bestMatch.target;
                return ctx.send({embeds: [{description: `i don't remember having that commmand or feature packed ${looking} maybe you mean \`${setting.prefix}help ${matches}\` ?`}], ephemeral: true});
            }
            const dead = client.customEmojis.get('dead') ? client.customEmojis.get('dead') : ':thinking:';
            if (command.conf.owner) return ctx.send({embeds: [{description: `that feature is accessible only by my owner 👑`}], ephemeral: true});
            if (command.conf.adult && !channel.nsfw) return ctx.send({embeds: [{description: `uh.. ${ctx.member.user.username}, wasn't that supposed to be sent in a NSFW channel bruh ${dead}`}], ephemeral: true});


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
            const embed = new MessageEmbed()

            .setColor('#bee7f7')
            .setAuthor('command information (=^･ω･^=)', client.user.displayAvatarURL())
            .setTitle(`${setting.prefix}${name}`)
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

            return ctx.send({embeds: [embed]})
        } else {
            let module = client.helps.array();
            if (!client.config.owners.includes(ctx.member.user.id)) module = await module.filter(x => !x.hide);
            if (!channel.nsfw) module = module.filter(x => !x.adult);
            const embed1 = new MessageEmbed()
            .setColor("#bee7f7")
            .setAuthor('my command list (p`･ω･´) q', client.user.displayAvatarURL())
            .setDescription(`run the command below each features to get more information!\nif you are using a mobile device, click the **hover for info** button to see descriptions!\nif you ran into any trouble, use \`${setting.prefix}invite\` to get more info about support servers.`)
            .setTitle('hey, how can i help?')
            .setThumbnail(client.user.displayAvatarURL())
            if (!channel.nsfw) embed1.setFooter(`bruh nsfw command was hidden cuz you are in a normal channel`);
            for (const mod of module) {
                const addS = mod.cmds.length === 1 ? '' : 's';
                embed1.addField(mod.displayName, `\`${setting.prefix}help ${mod.name}\`\n[hover for info](https://kiri.daztopia.xyz '${mod.desc} (there are ${mod.cmds.length} command${addS} for this feature)')`, true)
            };
            return ctx.send({embeds: [embed1]})
        }
    };
    onError(err) {
        console.log(err)
    }
}