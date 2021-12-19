const { MessageEmbed, Util: { resolveColor } } = require("discord.js");
const { askString, deleteIfAble } = require("../../util/util");
const validUrl = require("valid-url");
const { stripIndents } = require("common-tags");
const fileTypeRe = /\.(jpe?g|png|gif|jfif|bmp)(\?.+)?$/i;
const varReplace = require("../../util/variableReplace");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { ChannelType } = require("discord-api-types/v9");

exports.run = async (client, interaction) => {
    if (interaction.options.getSubcommand() === "new") {
        await interaction.deferReply();
        let embedsStorage = client.dbembeds;
        let storage = await embedsStorage.findOne({
            guildID: interaction.guild.id,
        });
        if (!storage)
            storage = new embedsStorage({
                guildID: interaction.guild.id,
            });
        if (storage.embeds.toObject().length > 100)
            return interaction.editReply({
                embeds: [
                    {
                        color: "RED",
                        description: `your server has reached the 100 embeds created limit :pensive: please use \`/${exports.help.name} delete\` to delete unused embeds before creating another one.`,
                    },
                ],
            });
        let name = null;
        let setupMessage = null;
        let displayMessage = null;
        const empty = client.customEmojis.get("empty").toString();
        const duh = client.customEmojis.get("duh").toString();
        const targetEmbed = {
            description: empty,
        };
        let ongoing = false;
        interaction.editReply({
            embeds: [
                {
                    color: "#bee7f7",
                    description: `✅ the embed creation setup was started! please follow my guide ${duh}`,
                },
            ],
        });
        async function ending(reason) {
            if (setupMessage && setupMessage.deletable)
                await setupMessage.delete();
            if (displayMessage && displayMessage.deletable)
                await displayMessage.delete();
            if (reason === 1) {
                const angry = client.customEmojis.get("dead");
                return interaction.channel.send(
                    `the embed creation was cancelled! try again whenever you want to talk with me ${angry}`
                );
            } else if (reason === 2)
                return interaction.channel.send(
                    `alright i have cancelled the command :wink:`
                );
            else if (reason === 3) {
                const sed = client.customEmojis.get("sed");
                return interaction.channel.send(
                    `an error occured and i had to stop the embed creation ${sed} you can visit our support server at \`/invite\`!`
                );
            }
        }
        try {
            const embed = new MessageEmbed()
                .setColor("#bee7f7")
                .setAuthor("step 1 of 9")
                .setTitle("alright, how do you want to call your embed?")
                .setDescription(
                    stripIndents`
            this will be used for linking this embed to certain feature.
            keep it short - if you're making a greet message or a leave message, something like \`greet\` or \`leave\` will do the trick.
            the name of the embed can't have space or unknown character

            **something to keep in mind:**
            > type \`skip\` during the setup process if you want to setup certain step (only for optional step)
            > type \`cancel\` if you want to skip the whole setup process
            > variable are supported! go check out \`/variable\` to fill in your embed!
            > [] optional, <> required. don't includes these things while setting up the embed :)
        `
                )
                .setTimestamp()
                .setImage("https://i.imgur.com/XnDAHF9.png");
            while (!name) {
                if (!setupMessage || setupMessage.deleted)
                    setupMessage = await interaction.channel.send({
                        embeds: [embed],
                    });
                const filter = (res) => res.author.id === interaction.user.id;
                const res = await askString(interaction.channel, filter, {
                    time: 180000,
                });
                if (res === 0) return ending(1);
                if (!res) return ending(2);
                const id = res.content.trim().split(/ +/g)[0];
                if (storage.embeds.toObject().find((x) => x._id === id)) {
                    await deleteIfAble(res);
                    embed
                        .setAuthor("step 1 of 9")
                        .setTitle("oops, that doesn't seems right...")
                        .setDescription(stripIndents`
                    that embed name has already been used!
                    please respond with an another unique embed name :)
                    keep it short - if you're making a greet message or a leave message, something like \`greet\` or \`leave\` will do the trick.
                
                    **something to keep in mind:**
                    > type \`skip\` during the setup process if you want to setup certain step (only for optional step)
                    > type \`cancel\` if you want to cancel the whole setup process
                    > variable are supported! go check out \`/variable\` to fill in your embed!
                    > [] optional, <> required. don't includes these things while setting up the embed :)
                `);
                    if (!setupMessage || setupMessage.deleted)
                        setupMessage = await interaction.channel.send({
                            embeds: [embed],
                        });
                    else await setupMessage.edit({ embeds: [embed] });
                    continue;
                }
                name = id;
            }
            while (!targetEmbed.color) {
                if (!displayMessage || displayMessage.deleted)
                    displayMessage = await interaction.channel.send({
                        embeds: [targetEmbed],
                    });
                if (!ongoing) {
                    embed
                        .setAuthor("step 2 of 9 (optional)")
                        .setTitle(
                            "great! now what color would you like this embed to be?"
                        ).setDescription(stripIndents`
                    please respond with a hex code or generic color name, e.g. \`#c0efff\` or \`RED\`, \`BLUE\`.
                
                    **something to keep in mind:**
                    > type \`skip\` during the setup process if you want to setup certain step (only for optional step)
                    > type \`cancel\` if you want to cancel the whole setup process
                    > variable are supported! go check out \`/variable\` to fill in your embed!
                    > [] optional, <> required. don't includes these things while setting up the embed :)
                `);
                    if (!setupMessage || setupMessage.deleted)
                        setupMessage = await interaction.channel.send({
                            embeds: [embed],
                        });
                    await setupMessage.edit({ embeds: [embed] });
                }
                const filter = (msg) => msg.author.id === interaction.user.id;
                const res = await askString(interaction.channel, filter, {
                    time: 180000,
                });
                if (res === 0) return ending(1);
                if (!res) return ending(2);
                if (res.content.trim().toLowerCase() === "skip") {
                    ongoing = false;
                    await deleteIfAble(res);
                    break;
                };
                const parseColor = (color) => {
                    try {
                        const number = resolveColor(color);
                        return number;
                    } catch {
                        return null;
                    }
                }
                const color = parseColor(res.content.toUpperCase());
                if (!color) {
                    ongoing = true;
                    await deleteIfAble(res);
                    embed.setTitle("oops, that doesn't seems right...")
                        .setDescription(stripIndents`
                    :boom: sorry, color must be an actual color (hex or color name) (e.g. \`blue\` or \`#c0eeff\`)
                    you can try it again using a valid color name or color hex :slight_smile:

                    **something to keep in mind:**
                    > type \`skip\` during the setup process if you want to setup certain step (only for optional step)
                    > type \`cancel\` if you want to cancel the whole setup process
                    > variable are supported! go check out \`/variable\` to fill in your embed!
                    > [] optional, <> required. don't includes these things while setting up the embed :)
                `);
                    if (!setupMessage || setupMessage.deleted)
                        setupMessage = await interaction.channel.send({
                            embeds: [embed],
                        });
                    else await setupMessage.edit({ embeds: [embed] });
                    continue;
                }
                await deleteIfAble(res);
                targetEmbed.color = color;
                ongoing = false;
                if (!displayMessage || displayMessage.deleted)
                    displayMessage = await interaction.channel.send({
                        embeds: [
                            varReplace.replaceEmbed(
                                targetEmbed,
                                interaction.member,
                                interaction.guild
                            ),
                        ],
                    });
                else
                    await displayMessage.edit({
                        embeds: [
                            varReplace.replaceEmbed(
                                targetEmbed,
                                interaction.member,
                                interaction.guild
                            ),
                        ],
                    });
            }
            while (!targetEmbed.author) {
                if (!ongoing) {
                    embed
                        .setAuthor("step 3 of 9 (optional)")
                        .setTitle(
                            "next, we'll be editing the author of the embed."
                        ).setDescription(stripIndents`
                    as you can see below, the author can have a small icon at the left of the text, which is optional. 
                    respond with what you'd like in the text and icon in this format: \`<name> /\\ [icon link] /\\ [url of the author]\`
                    the embed author **name** is limited to 256 characters.
                
                    **something to keep in mind:**
                    > type \`skip\` during the setup process if you want to setup certain step (only for optional step)
                    > type \`cancel\` if you want to cancel the whole setup process
                    > variable are supported! go check out \`/variable\` to fill in your embed!
                    > [] optional, <> required. don't includes these things while setting up the embed :)
                `);
                    if (!setupMessage || setupMessage.deleted)
                        setupMessage = await interaction.channel.send({
                            embeds: [embed],
                        });
                    else await setupMessage.edit({ embeds: [embed] });
                }
                const filter = (res) =>
                    res.author.id === interaction.user.id &&
                    res.content
                        .trim()
                        .split("/\\")
                        .every((x) => x.length > 0);
                const res = await askString(interaction.channel, filter, {
                    time: 180000,
                });
                if (res === 0) return ending(1);
                if (!res) return ending(2);
                if (res.content.trim().toLowerCase() === "skip") {
                    ongoing = false;
                    await deleteIfAble(res);
                    break;
                }
                const field = res.content.trim().split("/\\");
                const text = field[0];
                const iconUrl = field[1];
                const url = field[2];
                if (
                    !text ||
                    varReplace.replaceText(
                        text.trim(),
                        interaction.member,
                        interaction.guild
                    ).length > 256
                ) {
                    ongoing = true;
                    await deleteIfAble(res);
                    embed.setTitle("oops, that doesn't seems right...")
                        .setDescription(stripIndents`
                :boom: sorry, it seems like your embed author **text** has exceed the 256 characters limit (including placeholder) :pensive:
                there are a few limits to be aware of while planning your embeds due to the Discord API's limitations.
                for a quick reference, you can visit [this page](https://discord.com/developers/docs/resources/channel#embed-limits) for more info about embeds limit!
                
                **something to keep in mind:**
                > type \`skip\` during the setup process if you want to setup certain step (only for optional step)
                > type \`cancel\` if you want to skip the whole setup process
                > variable are supported! go check out \`/variable\` to fill in your embed!
                > [] optional, <> required. don't includes these things while setting up the embed :)
                `);
                    if (!setupMessage || setupMessage.deleted)
                        setupMessage = await interaction.channel.send({
                            embeds: [embed],
                        });
                    else await setupMessage.edit({ embeds: [embed] });
                    continue;
                }
                if (
                    (iconUrl &&
                        !validUrl.isWebUri(
                            varReplace.replaceImage(
                                iconUrl.trim(),
                                interaction.member,
                                interaction.guild
                            )
                        ) &&
                        !fileTypeRe.test(
                            varReplace.replaceImage(
                                iconUrl.trim(),
                                interaction.member,
                                interaction.guild
                            )
                        )) ||
                    (url && !validUrl.isWebUri(url.trim()))
                ) {
                    ongoing = true;
                    await deleteIfAble(res);
                    embed.setTitle("oops, that doesn't seems right...")
                        .setDescription(stripIndents`
                :boom: sorry, it seems like your link isn't valid :pensive:
                normally a valid link will turn into blue at the chat, so keep that in mind.
                also the icon link **must** be a direct link to an image in order for it to work!
                if the link you type in is correct, please make sure to follow the systax (\`<text> /\\ [icon link] /\\ [url of the author]\`) to add icon image and url!
                
                **something to keep in mind:**
                > type \`skip\` during the setup process if you want to setup certain step (only for optional step)
                > type \`cancel\` if you want to skip the whole setup process
                > variable are supported! go check out \`/variable\` to fill in your embed!
                > [] optional, <> required. don't includes these things while setting up the embed :)
                `);
                    if (!setupMessage || setupMessage.deleted)
                        setupMessage = await interaction.channel.send({
                            embeds: [embed],
                        });
                    else await setupMessage.edit({ embeds: [embed] });
                    continue;
                }
                await deleteIfAble(res);
                if (targetEmbed.description === empty)
                    targetEmbed.description = null;
                targetEmbed.author = {};
                targetEmbed.author.name = text.trim();
                if (iconUrl) targetEmbed.author.icon_url = iconUrl.trim();
                if (url) targetEmbed.author.url = url.trim();
                ongoing = false;
                if (!displayMessage || displayMessage.deleted)
                    displayMessage = await interaction.channel.send({
                        embeds: [
                            varReplace.replaceEmbed(
                                targetEmbed,
                                interaction.member,
                                interaction.guild
                            ),
                        ],
                    });
                else
                    await displayMessage.edit({
                        embeds: [
                            varReplace.replaceEmbed(
                                targetEmbed,
                                interaction.member,
                                interaction.guild
                            ),
                        ],
                    });
            }
            while (!targetEmbed.title) {
                if (!ongoing) {
                    embed
                        .setAuthor("step 4 of 9 (optional)")
                        .setTitle("now, let's set the title of your embed.")
                        .setDescription(stripIndents`
                    this text will be a bit larger / bold than the description in your embed can stay above the embed description.
                    embed titles are limited to 256 characters!

                    **something to keep in mind:**
                    > type \`skip\` during the setup process if you want to setup certain step (only for optional step)
                    > type \`cancel\` if you want to cancel the whole setup process
                    > variable are supported! go check out \`/variable\` to fill in your embed!
                    > [] optional, <> required. don't includes these things while setting up the embed :)
                `);
                    if (!setupMessage || setupMessage.deleted)
                        setupMessage = await interaction.channel.send({
                            embeds: [embed],
                        });
                    else await setupMessage.edit({ embeds: [embed] });
                }
                const filter = (res) => res.author.id === interaction.user.id;
                const res = await askString(interaction.channel, filter, {
                    time: 180000,
                });
                if (res === 0) return ending(1);
                if (!res) return ending(2);
                if (res.content.trim().toLowerCase() === "skip") {
                    ongoing = false;
                    await deleteIfAble(res);
                    break;
                }
                const text = res.content.trim();
                if (
                    varReplace.replaceText(
                        text,
                        interaction.member,
                        interaction.guild
                    ).length > 256
                ) {
                    ongoing = true;
                    await deleteIfAble(res);
                    embed.setTitle("oops, that doesn't seems right...")
                        .setDescription(stripIndents`
                    :boom: sorry, it seems like your embed author **title** has exceed the 256 characters limit (including placeholder) :pensive:
                    there are a few limits to be aware of while planning your embeds due to the Discord API's limitations.
                
                    **something to keep in mind:**
                    > type \`skip\` during the setup process if you want to setup certain step (only for optional step)
                    > type \`cancel\` if you want to skip the whole setup process
                    > variable are supported! go check out \`/variable\` to fill in your embed!
                    > [] optional, <> required. don't includes these things while setting up the embed :)
                `);
                    if (!setupMessage || setupMessage.deleted)
                        setupMessage = await interaction.channel.send({
                            embeds: [embed],
                        });
                    else await setupMessage.edit({ embeds: [embed] });
                    continue;
                }
                await deleteIfAble(res);
                if (targetEmbed.description === empty)
                    targetEmbed.description = null;
                targetEmbed.title = text;
                ongoing = false;
                if (!displayMessage || displayMessage.deleted)
                    displayMessage = await interaction.channel.send({
                        embeds: [
                            varReplace.replaceEmbed(
                                targetEmbed,
                                interaction.member,
                                interaction.guild
                            ),
                        ],
                    });
                else
                    await displayMessage.edit({
                        embeds: [
                            varReplace.replaceEmbed(
                                targetEmbed,
                                interaction.member,
                                interaction.guild
                            ),
                        ],
                    });
            }
            while (
                !targetEmbed.description ||
                targetEmbed.description === empty
            ) {
                if (!ongoing) {
                    embed
                        .setAuthor("step 5 of 9 (optional)")
                        .setTitle(
                            "now, let's set the description of your embed."
                        ).setDescription(stripIndents`
                    the description is the largest block of text in the embed, consisting most of the body of your embed text.
                    embed descriptions are limited to 2048 characters!

                    **something to keep in mind:**
                    > type \`skip\` during the setup process if you want to setup certain step (only for optional step)
                    > type \`cancel\` if you want to cancel the whole setup process
                    > variable are supported! go check out \`/variable\` to fill in your embed!
                    > [] optional, <> required. don't includes these things while setting up the embed :)
                `);
                    if (!setupMessage || setupMessage.deleted)
                        setupMessage = await interaction.channel.send({
                            embeds: [embed],
                        });
                    else await setupMessage.edit({ embeds: [embed] });
                }
                const filter = (res) => res.author.id === interaction.user.id;
                const res = await askString(interaction.channel, filter, {
                    time: 180000,
                });
                if (res === 0) return ending(1);
                if (!res) return ending(2);
                if (res.content.trim().toLowerCase() === "skip") {
                    ongoing = false;
                    await deleteIfAble(res);
                    break;
                }
                const text = res.content.trim();
                if (
                    varReplace.replaceText(
                        text,
                        interaction.member,
                        interaction.guild
                    ).length > 4096
                ) {
                    ongoing = true;
                    await deleteIfAble(res);
                    embed.setTitle("oops, that doesn't seems right...")
                        .setDescription(stripIndents`
                    :boom: sorry, it seems like your embed author **description** has exceed the 2048 characters limit :pensive:
                    there are a few limits to be aware of while planning your embeds due to the Discord API's limitations.
                
                    **something to keep in mind:**
                    > type \`skip\` during the setup process if you want to setup certain step (only for optional step)
                    > type \`cancel\` if you want to skip the whole setup process
                    > variable are supported! go check out \`/variable\` to fill in your embed!
                    > [] optional, <> required. don't includes these things while setting up the embed :)
                `);
                    if (!setupMessage)
                        setupMessage = await interaction.channel.send({
                            embeds: [embed],
                        });
                    else await setupMessage.edit({ embeds: [embed] });
                    continue;
                }
                await deleteIfAble(res);
                // if (targetEmbed.description === empty) targetEmbed.description = null;
                targetEmbed.description = text;
                ongoing = false;
                if (!displayMessage || displayMessage.deleted)
                    displayMessage = await interaction.channel.send({
                        embeds: [
                            varReplace.replaceEmbed(
                                targetEmbed,
                                interaction.member,
                                interaction.guild
                            ),
                        ],
                    });
                else
                    await displayMessage.edit({
                        embeds: [
                            varReplace.replaceEmbed(
                                targetEmbed,
                                interaction.member,
                                interaction.guild
                            ),
                        ],
                    });
                break;
            }
            while (!targetEmbed.thumbnail) {
                if (!ongoing) {
                    embed
                        .setAuthor("step 6 of 9 (optional)")
                        .setTitle("coming up, we'll be editing the thumbnail.")
                        .setDescription(stripIndents`
                    thumbnail is the small image that lie on the right of the embed.
                    please put an **image** link if you would like to set one for your embed.

                    **something to keep in mind:**
                    > type \`skip\` during the setup process if you want to setup certain step (only for optional step)
                    > type \`cancel\` if you want to cancel the whole setup process
                    > variable are supported! go check out \`/variable\` to fill in your embed!
                    > [] optional, <> required. don't includes these things while setting up the embed :)
                `);
                    if (!setupMessage || setupMessage.deleted)
                        setupMessage = await interaction.channel.send({
                            embeds: [embed],
                        });
                    else await setupMessage.edit({ embeds: [embed] });
                }
                const filter = (res) => res.author.id === interaction.user.id;
                const res = await askString(interaction.channel, filter, {
                    time: 180000,
                });
                if (res === 0) return ending(1);
                if (!res) return ending(2);
                if (res.content.trim().toLowerCase() === "skip") {
                    ongoing = false;
                    await deleteIfAble(res);
                    break;
                }
                const iconUrl = res.content.trim().split(/ +/g)[0];
                if (
                    iconUrl &&
                    !validUrl.isWebUri(
                        varReplace.replaceImage(
                            iconUrl.trim(),
                            interaction.member,
                            interaction.guild
                        )
                    ) &&
                    !fileTypeRe.test(
                        varReplace.replaceImage(
                            iconUrl.trim(),
                            interaction.member,
                            interaction.guild
                        )
                    )
                ) {
                    ongoing = true;
                    await deleteIfAble(res);
                    embed.setTitle("oops, that doesn't seems right...")
                        .setDescription(stripIndents`
                    :boom: sorry, it seems like your link isn't valid :pensive:
                    normally a valid link will turn into blue at the chat, so keep that in mind.
                    also the thumbnail link **must** be a direct link to an image in order for it to work!
                
                    **something to keep in mind:**
                    > type \`skip\` during the setup process if you want to setup certain step (only for optional step)
                    > type \`cancel\` if you want to skip the whole setup process
                    > variable are supported! go check out \`/variable\` to fill in your embed!
                    > [] optional, <> required. don't includes these things while setting up the embed :)
                `);
                    if (!setupMessage || setupMessage.deleted)
                        setupMessage = await interaction.channel.send({
                            embeds: [embed],
                        });
                    else await setupMessage.edit({ embeds: [embed] });
                    continue;
                }
                await deleteIfAble(res);
                targetEmbed.thumbnail = {
                    url: iconUrl,
                };
                ongoing = false;
                if (!displayMessage || displayMessage.deleted)
                    displayMessage = await interaction.channel.send({
                        embeds: [
                            varReplace.replaceEmbed(
                                targetEmbed,
                                interaction.member,
                                interaction.guild
                            ),
                        ],
                    });
                else
                    await displayMessage.edit({
                        embeds: [
                            varReplace.replaceEmbed(
                                targetEmbed,
                                interaction.member,
                                interaction.guild
                            ),
                        ],
                    });
            }
            while (!targetEmbed.fields) {
                let fieldsArray = [];
                if (!ongoing) {
                    embed
                        .setAuthor("step 7 of 9 (optional)")
                        .setTitle(
                            "coming up, we'll be adding fields to the embed"
                        ).setDescription(stripIndents`
                    fields always have two parts that you can add: the field name and the field description.
                    fields can be used to convey more info in your embed!
                    to add a blank field, use \`\u200b\` to if you want to skip certain part!
                    fields can be added by using:
                    \`\`\`<field name> /\\ <field value> /\\ [inline? yes or no](enter new line)
                    <another field name> /\\ <another field value> /\\ [inline? yes or no](enter new line)
                    and so on...
                    \`\`\`

                    **something to keep in mind:**
                    > type \`skip\` during the setup process if you want to setup certain step (only for optional step)
                    > type \`cancel\` if you want to cancel the whole setup process
                    > variable are supported! go check out \`/variable\` to fill in your embed!
                    > [] optional, <> required. don't includes these things while setting up the embed :)
                `);
                    if (!setupMessage || setupMessage.deleted)
                        setupMessage = await interaction.channel.send({
                            embeds: [embed],
                        });
                    else await setupMessage.edit({ embeds: [embed] });
                }
                const filter = (res) =>
                    res.author.id === interaction.user.id &&
                    res.content
                        .trim()
                        .split("\n")
                        .every((line) =>
                            line
                                .trim()
                                .split("/\\")
                                .every((field) => field.length > 0)
                        );
                const res = await askString(interaction.channel, filter, {
                    time: 180000,
                });
                if (res === 0) return ending(1);
                if (!res) return ending(2);
                if (res.content.trim().toLowerCase() === "skip") {
                    ongoing = false;
                    await deleteIfAble(res);
                    break;
                }
                const lines = res.content.trim().split("\n");
                const check = lines.every((line) => {
                    const fields = line.split("/\\");
                    if (fields.length < 2) return false;
                    if (
                        varReplace.replaceText(
                            fields[0],
                            interaction.member,
                            interaction.guild
                        ).length > 256
                    )
                        return false;
                    if (
                        varReplace.replaceText(
                            fields[1],
                            interaction.member,
                            interaction.guild
                        ).length > 1024
                    )
                        return false;
                    fieldsArray.push({
                        name: fields[0],
                        value: fields[1],
                        inline: fields[2] === "yes" ? true : false,
                    });
                    return true;
                });
                if (!check) {
                    ongoing = true;
                    await deleteIfAble(res);
                    embed.setTitle("oops, that doesn't seems right...")
                        .setDescription(stripIndents`
                    :boom: sorry, it seems like some part in your embed fields has exceed its characters limit :pensive:
                    there are a few limits to be aware of while planning your embeds due to the Discord API's limitations.
                    a field's name is limited to 256 characters and its value to 1024 characters.
                
                    **something to keep in mind:**
                    > type \`skip\` during the setup process if you want to setup certain step (only for optional step)
                    > type \`cancel\` if you want to skip the whole setup process
                    > variable are supported! go check out \`/variable\` to fill in your embed!
                    > [] optional, <> required. don't includes these things while setting up the embed :)
                `);
                    if (!setupMessage || setupMessage.deleted)
                        setupMessage = await interaction.channel.send({
                            embeds: [embed],
                        });
                    else await setupMessage.edit({ embeds: [embed] });
                    continue;
                }
                await deleteIfAble(res);
                targetEmbed.fields = fieldsArray;
                ongoing = false;
                if (!displayMessage || displayMessage.deleted)
                    displayMessage = await interaction.channel.send({
                        embeds: [
                            varReplace.replaceEmbed(
                                targetEmbed,
                                interaction.member,
                                interaction.guild
                            ),
                        ],
                    });
                else
                    await displayMessage.edit({
                        embeds: [
                            varReplace.replaceEmbed(
                                targetEmbed,
                                interaction.member,
                                interaction.guild
                            ),
                        ],
                    });
            }
            while (!targetEmbed.image) {
                if (!ongoing) {
                    embed
                        .setAuthor("step 7 of 9 (optional)")
                        .setTitle(
                            "Oki doki! now, let's edit the main image of the embed."
                        ).setDescription(stripIndents`
                    near the bottom of the embed, you can put a larger image.
                    please put an **image** link if you would like to set one for your embed.

                    **something to keep in mind:**
                    > type \`skip\` during the setup process if you want to setup certain step (only for optional step)
                    > type \`cancel\` if you want to cancel the whole setup process
                    > variable are supported! go check out \`/variable\` to fill in your embed!
                    > [] optional, <> required. don't includes these things while setting up the embed :)
                `);
                    if (!setupMessage || setupMessage.deleted)
                        setupMessage = await interaction.channel.send({
                            embeds: [embed],
                        });
                    else await setupMessage.edit({ embeds: [embed] });
                }
                const filter = (res) => res.author.id === interaction.user.id;
                const res = await askString(interaction.channel, filter, {
                    time: 180000,
                });
                if (res === 0) return ending(1);
                if (!res) return ending(2);
                if (res.content.trim().toLowerCase() === "skip") {
                    ongoing = false;
                    await deleteIfAble(res);
                    break;
                }
                const iconUrl = res.content.trim().split(/ +/g)[0];
                if (
                    iconUrl &&
                    !validUrl.isWebUri(
                        varReplace.replaceImage(
                            iconUrl.trim(),
                            interaction.member,
                            interaction.guild
                        )
                    ) &&
                    !fileTypeRe.test(
                        varReplace.replaceImage(
                            iconUrl.trim(),
                            interaction.member,
                            interaction.guild
                        )
                    )
                ) {
                    ongoing = true;
                    await deleteIfAble(res);
                    embed.setTitle("oops, that doesn't seems right...")
                        .setDescription(stripIndents`
                    :boom: sorry, it seems like your link isn't valid :pensive:
                    normally a valid link will turn into blue at the chat, so keep that in mind.
                    also the thumbnail link **must** be a direct link to an image in order for it to work!
                
                    **something to keep in mind:**
                    > type \`skip\` during the setup process if you want to setup certain step (only for optional step)
                    > type \`cancel\` if you want to skip the whole setup process
                    > variable are supported! go check out \`/variable\` to fill in your embed!
                    > [] optional, <> required. don't includes these things while setting up the embed :)
                `);
                    if (!setupMessage || setupMessage.deleted)
                        setupMessage = await interaction.channel.send({
                            embeds: [embed],
                        });
                    else await setupMessage.edit({ embeds: [embed] });
                    continue;
                }
                await deleteIfAble(res);
                targetEmbed.image = {
                    url: iconUrl,
                };
                ongoing = false;
                if (!displayMessage || displayMessage.deleted)
                    displayMessage = await interaction.channel.send({
                        embeds: [
                            varReplace.replaceEmbed(
                                targetEmbed,
                                interaction.member,
                                interaction.guild
                            ),
                        ],
                    });
                else
                    await displayMessage.edit({
                        embeds: [
                            varReplace.replaceEmbed(
                                targetEmbed,
                                interaction.member,
                                interaction.guild
                            ),
                        ],
                    });
            }
            while (!targetEmbed.footer) {
                if (!ongoing) {
                    embed
                        .setAuthor("step 8 of 9 (optional)")
                        .setTitle(
                            "next, we'll be editing the footer of the embed."
                        ).setDescription(stripIndents`
                    similar to the author field, you can put in a footer, which is at the bottom of the embed, with an optional icon.
                    respond with what you'd like in the text and icon in this format: \`[name] /\\ [icon link]\`
                    the embed footer is limited to 500 characters.
                
                    **something to keep in mind:**
                    > type \`skip\` during the setup process if you want to setup certain step (only for optional step)
                    > type \`cancel\` if you want to cancel the whole setup process
                    > variable are supported! go check out \`/variable\` to fill in your embed!
                    > [] optional, <> required. don't includes these things while setting up the embed :)
                `);
                    if (!setupMessage || setupMessage.deleted)
                        setupMessage = await interaction.channel.send({
                            embeds: [embed],
                        });
                    else await setupMessage.edit({ embeds: [embed] });
                }
                const filter = (res) =>
                    res.author.id === interaction.user.id &&
                    res.content
                        .trim()
                        .split("/\\")
                        .every((x) => x.length > 0);
                const res = await askString(interaction.channel, filter, {
                    time: 180000,
                });
                if (res === 0) return ending(1);
                if (!res) return ending(2);
                if (res.content.trim().toLowerCase() === "skip") {
                    ongoing = false;
                    await deleteIfAble(res);
                    break;
                }
                const field = res.content.trim().split("/\\");
                const text = field[0];
                const iconUrl = field[1];
                if (
                    !text ||
                    varReplace.replaceText(
                        text,
                        interaction.member,
                        interaction.guild
                    ).length > 500
                ) {
                    ongoing = true;
                    await deleteIfAble(res);
                    embed.setTitle("oops, that doesn't seems right...")
                        .setDescription(stripIndents`
                :boom: sorry, it seems like your embed footer has exceed the 500 characters limit :pensive:
                there are a few limits to be aware of while planning your embeds due to the Discord API's limitations.
                for a quick reference, you can visit [this page](https://discord.com/developers/docs/resources/channel#embed-limits) for more info about embeds limit!
                
                **something to keep in mind:**
                > type \`skip\` during the setup process if you want to setup certain step (only for optional step)
                > type \`cancel\` if you want to skip the whole setup process
                > variable are supported! go check out \`/variable\` to fill in your embed!
                > [] optional, <> required. don't includes these things while setting up the embed :)
                `);
                    if (!setupMessage || setupMessage.deleted)
                        setupMessage = await interaction.channel.send({
                            embeds: [embed],
                        });
                    else await setupMessage.edit({ embeds: [embed] });
                    continue;
                }
                if (
                    iconUrl &&
                    !validUrl.isWebUri(
                        varReplace.replaceImage(
                            iconUrl.trim(),
                            interaction.member,
                            interaction.guild
                        )
                    ) &&
                    !fileTypeRe.test(
                        varReplace.replaceImage(
                            iconUrl.trim(),
                            interaction.member,
                            interaction.guild
                        )
                    )
                ) {
                    ongoing = true;
                    await deleteIfAble(res);
                    embed.setTitle("oops, that doesn't seems right...")
                        .setDescription(stripIndents`
                :boom: sorry, it seems like your icon link isn't valid :pensive:
                normally a valid link will turn into blue at the chat, so keep that in mind.
                also the icon link **must** be a direct link to an image in order for it to work!
                if the link you type in is correct, please make sure to follow the systax (\`[name] /\\ [icon link]\`)!
                
                **something to keep in mind:**
                > type \`skip\` during the setup process if you want to setup certain step (only for optional step)
                > type \`cancel\` if you want to skip the whole setup process
                > variable are supported! go check out \`/variable\` to fill in your embed!
                > [] optional, <> required. don't includes these things while setting up the embed :)
                `);
                    if (!setupMessage || setupMessage.deleted)
                        setupMessage = await interaction.channel.send({
                            embeds: [embed],
                        });
                    else await setupMessage.edit({ embeds: [embed] });
                    continue;
                }
                await deleteIfAble(res);
                // if (targetEmbed.description === empty) targetEmbed.description = null;
                targetEmbed.footer = {
                    text,
                };
                if (iconUrl) targetEmbed.footer.icon_url = iconUrl.trim();
                ongoing = false;
                if (!displayMessage || displayMessage.deleted)
                    displayMessage = await interaction.channel.send({
                        embeds: [
                            varReplace.replaceEmbed(
                                targetEmbed,
                                interaction.member,
                                interaction.guild
                            ),
                        ],
                    });
                await displayMessage.edit({
                    embeds: [
                        varReplace.replaceEmbed(
                            targetEmbed,
                            interaction.member,
                            interaction.guild,
                            null,
                            { level: 50, xp: 50 }
                        ),
                    ],
                });
            }
            while (!targetEmbed.timestamp) {
                if (!ongoing) {
                    embed
                        .setAuthor("step 9 of 9 (optional)")
                        .setTitle(
                            "finally, would you like to set a timestamp for the embed?"
                        ).setDescription(stripIndents`
                    the timestamp are displayed next to the footer and will automatically adjust the timezone depending on the user's device.
                    if you want to set a timestamp for your embed, type \`yes or no\`
                
                    **something to keep in mind:**
                    > type \`skip\` during the setup process if you want to setup certain step (only for optional step)
                    > type \`cancel\` if you want to cancel the whole setup process
                    > variable are supported! go check out \`/variable\` to fill in your embed!
                    > [] optional, <> required. don't includes these things while setting up the embed :)
                `);
                    if (!setupMessage || setupMessage.deleted)
                        setupMessage = await interaction.channel.send({
                            embeds: [embed],
                        });
                    else await setupMessage.edit({ embeds: [embed] });
                }
                const filter = (msg) => msg.author.id === interaction.user.id;
                const res = await askString(interaction.channel, filter, {
                    time: 180000,
                });
                if (res === 0) return ending(1);
                if (!res) return ending(2);
                if (
                    res.content.trim().toLowerCase() === "skip" ||
                    res.content.trim().toLowerCase() === "no"
                ) {
                    await deleteIfAble(res);
                    break;
                }
                await deleteIfAble(res);
                targetEmbed.timestamp = true;
                ongoing = false;
                if (!displayMessage || displayMessage.deleted)
                    displayMessage = await interaction.channel.send({
                        embeds: [
                            varReplace.replaceEmbed(
                                targetEmbed,
                                interaction.member,
                                interaction.guild
                            ),
                        ],
                    });
                else
                    await displayMessage.edit({
                        embeds: [
                            varReplace.replaceEmbed(
                                targetEmbed,
                                interaction.member,
                                interaction.guild
                            ),
                        ],
                    });
            }
            const embed2 = new MessageEmbed().setColor("#bee7f7")
                .setDescription(stripIndents`
            it's all done! i have created the new embed for you :innocent:
            your embed is named \`${name}\` and can be used with the following command below:

            - display the embed via \`/embed send ${name} #channel\`
            - link to:
            greet message: via \`/setgreeting content\` 
            leave message: via \`/setgoodbye content\` 
            leveling message: via \`/leveling content\`
        `);
            storage.embeds.push({
                embed: targetEmbed,
                _id: name,
                creator: interaction.user.id,
            });
            await storage.save();
            return setupMessage.edit({ embeds: [embed2] });
        } catch (err) {
            logger.error(err);
            return ending(3);
        }
    } else if (interaction.options.getSubcommand() === "send") {
        const id = interaction.options.getString("id");
        await interaction.deferReply();
        let embedsStorage = client.dbembeds;
        let storage = await embedsStorage.findOne({
            guildID: interaction.guild.id,
        });
        if (!storage)
            storage = new embedsStorage({
                guildID: interaction.guild.id,
            });
        const embed = storage.embeds.toObject().find((x) => x._id === id);
        if (!embed)
            return interaction.editReply({
                embeds: [
                    {
                        color: "#bee7f7",
                        description: `there aren't any embed created on this server name \`${id}\` :pensive: to create a new embed, do \`/embeds new\`!`,
                    },
                ],
            });

        const channel =
            interaction.options.getChannel("destination") ||
            interaction.channel;

        if (
            !channel.viewable ||
            !channel.permissionsFor(interaction.guild.me).has("MANAGE_WEBHOOKS")
        )
            return interaction.editReply({
                embeds: [
                    {
                        color: "#bee7f7",
                        description:
                            "i don't have the perms to send embeds to that channel! :pensive:\nplease allow the permission `EMBED_LINKS` **and** `SEND_MESSAGES` for me there before trying again.",
                    },
                ],
            });
        interaction.editReply({
            embeds: [
                { color: "#bee7f7", description: `✅ your embed was sent!` },
            ],
        });
        return channel.send({
            embeds: [
                varReplace.replaceEmbed(
                    embed.embed,
                    interaction.member,
                    interaction.guild
                ),
            ],
        });
    } else if (interaction.options.getSubcommand() === "delete") {
        const id = interaction.options.getString("id");
        await interaction.deferReply();
        let embedsStorage = client.dbembeds;
        let storage = await embedsStorage.findOne({
            guildID: interaction.guild.id,
        });
        if (!storage)
            storage = new embedsStorage({
                guildID: interaction.guild.id,
            });
        if (!storage.embeds.toObject().length)
            return interaction.editReply({
                embeds: [
                    {
                        color: "#bee7f7",
                        description: `there aren't any embed created on this server yet :pensive: to create a new embed, do \`/embeds new\`!`,
                    },
                ],
            });
        const embed = storage.embeds.toObject().find((x) => x._id === id);
        if (!embed)
            return interaction.editReply({
                embeds: [
                    {
                        color: "#bee7f7",
                        description: `there aren't any embed created on this server name \`${id}\` :pensive: to create a new embed, do \`/embeds new\`!`,
                    },
                ],
            });
        storage.embeds.pull(embed);
        storage.markModified("embeds");
        await storage.save();
        return interaction.editReply({
            embeds: [
                {
                    color: "#bee7f7",
                    description: `☑️ that embed was deleted successfully`,
                },
            ],
        });
    } else if (interaction.options.getSubcommand() === "list") {
        await interaction.deferReply();
        let embedsStorage = client.dbembeds;
        let storage = await embedsStorage.findOne({
            guildID: interaction.guild.id,
        });
        if (!storage)
            storage = new embedsStorage({
                guildID: interaction.guild.id,
            });
        if (!storage.embeds.toObject().length)
            return interaction.editReply({
                embeds: [
                    {
                        color: "#bee7f7",
                        description: `there aren't any embed created on this server yet :pensive: to create a new embed, do \`/embeds new\`!`,
                    },
                ],
            });
        const array = [];
        storage.embeds.toObject().map((each, index) => {
            const author = interaction.guild.members.cache.get(each.creator);
            array.push(
                `\`${index + 1}\` - ${each._id} [${
                    author ? author.toString() : "Left user"
                }]`
            );
        });
        const embed = new MessageEmbed()
            .setDescription(array.join("\n"))
            .setColor(interaction.guild.me.displayHexColor)
            .setAuthor(`all embeds created in ${interaction.guild.name}:`)
            .setThumbnail(
                interaction.guild.iconURL({ size: 4096, dynamic: true })
            );
        return interaction.editReply({ embeds: [embed] });
    }
};

exports.help = {
    name: "embeds",
    description: "create and modify embeds to use later in the server",
    usage: [
        "embeds `new`",
        "embeds `send <ID> <#channel || channel ID>`",
        "embeds `delete <ID>`",
        "embeds `list`",
    ],
    example: [
        "embeds `new`",
        "embeds `send #general help_command`",
        "embeds `delete welcome_msg`",
        "embeds `list`",
    ],
};

exports.conf = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addSubcommand((subcommand) =>
            subcommand
                .setName("new")
                .setDescription("begin creating a new embed")
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("send")
                .setDescription("send a previously created embed")
                .addStringOption((option) =>
                    option
                        .setName("id")
                        .setDescription(
                            "what is the ID of the embed that you want to send?"
                        )
                        .setRequired(true)
                )
                .addChannelOption((option) =>
                    option
                        .setName("destination")
                        .setRequired(false)
                        .setDescription(
                            "where would you like to send the embed to?"
                        )
                        .addChannelType(ChannelType.GuildText)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("list")
                .setDescription("list all created embed in the server")
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("delete")
                .setDescription("delete a previously created embed")
                .addStringOption((option) =>
                    option
                        .setName("id")
                        .setDescription(
                            "what is the ID of the embed that you want to delete?"
                        )
                        .setRequired(true)
                )
        ),
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"],
    userPerms: ["MANAGE_GUILD"],
};
