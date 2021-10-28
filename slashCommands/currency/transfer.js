const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    const member = interaction.options.getMember('user');
    const user = member.user;

    if (user.id === client.user.id) return interaction.reply({ content: "wow you are so generous but.. that's me.", ephemeral: true });
    if (user.bot) return interaction.reply({ content: "that user is a bot.", ephemeral: true });
    if (user.id === interaction.user.id) return interaction.reply({ content: "why do you want to transfer to yourself?", ephemeral: true });

    const amount = interaction.options.getInteger('amount');
    if (isNaN(amount)) return interaction.reply("that was not a valid number!");
    if (amount === 0) return interaction.reply("why did you transfer nothing?");
    if (amount === 0 || amount < 0) return interaction.reply({ content: "that is an invalid amount of token! you can't neither transfer nothing or using a negative amount :pensive:", ephemeral: true });

    await interaction.deferReply();
    let storage = await client.money.findOne({
        userId: interaction.user.id,
        guildId: interaction.guild.id
    });
    if (!storage) {
        const model = client.money
        storage = new model({
            userId: interaction.user.id,
            guildId: interaction.guild.id
        });
    };
    let balance = storage.balance;

    if (!balance || balance == 0) return interaction.editReply("your wallet is empty. broke. nothing is there :anguished:");
    if (amount > balance) return interaction.editReply("you don't have that enough credits to transfer!");
    await client.money.findOneAndUpdate({
        guildId: interaction.guild.id,
        userId: interaction.user.id
    }, {
        guildId: interaction.guild.id,
        userId: interaction.user.id,
        $inc: {
            balance: -amount,
        },
    }, {
        upsert: true,
        new: true,
    });
    await client.money.findOneAndUpdate({
        userId: user.id,
        guildId: interaction.guild.id
    }, {
        userId: user.id,
        guildId: interaction.guild.id,
        $inc: {
            balance: amount,
        },
    }, {
        upsert: true,
        new: true,
    });

    return interaction.editReply(`💸 you've transferred to **${user.tag}** ⏣ **${amount}** token!`);
};

exports.help = {
    name: "transfer",
    description: "transfer tokens to an another user.",
    usage: ["transfer `<@user> <amount>`", "transfer `<user ID> <amount>`"],
    example: ["transfer `@coconut#1337 50`", "transfer `444177575757 50`"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addUserOption(option => option
            .setName('user')
            .setRequired(true)
            .setDescription('which member would you like to transfer to?')
        )
        .addIntegerOption(option => option
            .setName('amount')
            .setDescription('how many token that you want to give?')
            .setRequired(true)
        ),
    cooldown: 15,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};