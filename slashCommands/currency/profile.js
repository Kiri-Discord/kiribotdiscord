const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const itemsList = require('../../assets/items.json');
const itemsName = Object.keys(itemsList);

exports.run = async(client, interaction) => {
    const member = interaction.options.getMember('user') || interaction.member;
    const user = member.user;
    if (user.id === client.user.id) return interaction.reply({
        embeds: [{
            description: "that's me! i don't have any profile to begin with :eyes:"
        }],
        ephemeral: true
    });
    if (user.bot) return interaction.reply({
        embeds: [{
            description: "a bot can't have its own profile, sorry :pensive:"
        }],
        ephemeral: true
    });
    await interaction.deferReply();
    let storage = await client.money.findOne({
        userId: user.id,
        guildId: interaction.guild.id
    });
    if (!storage) {
        const model = client.money;
        storage = new model({
            userId: user.id,
            guildId: interaction.guild.id
        });
    };
    let leveling = await client.dbleveling.findOne({
        guildId: interaction.guild.id,
        userId: user.id
    });
    const level = leveling ? leveling.level : 0;
    const xp = leveling ? leveling.xp : 0;
    let items = await client.inventory.findOne({
        userId: user.id,
        guildId: interaction.guild.id
    });
    if (!items) {
        const model = client.inventory
        items = new model({
            userId: user.id,
            guildId: interaction.guild.id
        });
    };
    let item = 0;
    let itemTotal = 0;
    let worth = 0;
    for (const property in items) {
        if (itemsName.includes(property) && items[property] > 0) {
            item += 1;
            itemTotal += items[property];
            worth += itemsList[property].price * items[property];
        };
    };
    let marriageStatus;
    const target = await client.love.findOne({
        userID: user.id,
        guildID: interaction.guild.id
    });
    if (target) {
        if (target.marriedID) {
            const married = interaction.guild.members.cache.get(target.marriedID);
            if (!married) {
                await client.love.findOneAndDelete({
                    guildID: interaction.guild.id,
                    userID: user.id,
                });
                marriageStatus = `**${user.username}** is single!`;
            } else {
                marriageStatus = `**${user.username}** is married to **${married.user.username}** :sparkling_heart:`;
            }
        } else {
            marriageStatus = `**${user.username}** is single!`;
        }
    } else {
        marriageStatus = `**${user.username}** is single!`
    };
    const winLoseRate = storage.win / storage.lose;

    const embed = new MessageEmbed()
        .setColor("#bee7f7")
        .setAuthor(`${user.username}'s profile in ${interaction.guild.name}`)
        .setThumbnail(user.displayAvatarURL({ size: 4096, dynamic: true, format: 'png' }))
        .addField(`Leveling`, `✨ XP: \`${xp}\`\n:arrow_up: Level: \`${level}\``)
        .addField(`Currency`, `:moneybag: Balance: ⏣ \`${storage.balance}\`\nOwn \`${item}\` item (total \`${itemTotal}\`) that worth ⏣ ${worth}`)
        .addField(`Minigames (only multiplayer)`, `:golf: Games played: **${storage.matchPlayed || 0}**\n:tada: Win: ${storage.win}\n:pensive: Lose: ${storage.lose}\nW/L: **${isNaN(winLoseRate.toFixed(2)) ? 'None' : winLoseRate.toFixed(2)}**`)
        .addField('Marriage', `${marriageStatus} \`/marriage status\` to refresh`)
    return interaction.editReply({ embeds: [embed] })
};

exports.help = {
    name: "profile",
    description: "show yours, or another user's Kiri profile.",
    usage: ["profile"],
    example: ["profile"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addUserOption(option => option
            .setName('user')
            .setRequired(false)
            .setDescription('which member would you like to get the profile for? :)')
        ),
    guild: true,
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};