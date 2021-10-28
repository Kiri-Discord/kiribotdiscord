const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    const reason = interaction.options.getString('reason');
    if (!reason) {
        const msg = await interaction.reply({ content: "press 🇫 to pay respect.", fetchReply: true });
        await msg.react("🇫");

        const filter = async(reaction, user) => {
            if (user.bot) return false;
            if (reaction.emoji.name === "🇫") {
                const m = await interaction.channel.send(`**${user.username}** has paid their respect.`);
                setTimeout(() => {
                    m.delete();
                }, 5000);
                return true;
            } else return false;
        };

        const collected = await msg.awaitReactions({ filter, time: 15000 });
        if (!collected.size) return msg.reply('no one paid respect at all... what a shame :pensive:');
        const count = collected.get("🇫").count - 1;
        return interaction.channel.send(`**${count}** ${count === 1 ? 'has': 'have'} paid their respect.`);
    } else {
        const msg = await interaction.reply({ content: `press :regional_indicator_f:  to pay respect to **${reason}**`, fetchReply: true });
        await msg.react("🇫");

        const filter = async(reaction, user) => {
            if (user.bot) return false;
            if (reaction.emoji.name === "🇫") {
                const m = await interaction.channel.send(`**${user.username}** has paid their respect.`)
                setTimeout(() => {
                    m.delete();
                }, 5000);
                return true;
            } else return false;
        };
        const collected = await msg.awaitReactions({ filter, time: 30000 });
        if (!collected.size) return msg.reply('no one paid respect at all... what a shame :pensive:');
        const count = collected.get("🇫").count - 1;
        return interaction.channel.send(`**${count}** person${count === 1 ? '': 's'} paid their respect to **${reason}**`)
    };
};

exports.help = {
    name: "pay-respect",
    description: "pay respect to someone or a reason",
    usage: ["pay-respect", "pay-respect `[reason]`", "pay-respect `[@user]`", "pay-respect `[@user]` `[reason]`"],
    example: ["pay-respect", "pay-respect `@coconut`", "pay-respect `@coconut :v`"]
};

exports.conf = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addStringOption(option => option
            .setName('reason')
            .setRequired(false)
            .setDescription('why would you want to pay respect?')
        ),
    guildOnly: true,
    channelPerms: ["ADD_REACTIONS"]
};