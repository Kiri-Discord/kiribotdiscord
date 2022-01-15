const { canModifyQueue } = require("../../../util/musicutil");

exports.run = async(client, interaction) => {
    const queue = client.queue.get(interaction.guild.id);
    if (!queue) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: there isn't any ongoing music queue` }], ephemeral: true });
    if (queue.pending) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `:x: i'm still connecting to your voice channel! try again in a bit dear :slight_smile:` }], ephemeral: true });
    if (!canModifyQueue(interaction.member)) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `you have to be in ${queue.channel} to do this command :(` }], ephemeral: true });
    if (queue.karaoke.isEnabled) return interaction.reply({ embeds: [{ color: "#bee7f7", description: `setting the speed is not possible when scrolling-lyrics is on :pensive: you can turn it off by \`/scrolling-lyrics off\`` }], ephemeral: true });
    await interaction.deferReply();
    let cooldownStorage = await client.cooldowns.findOne({
        userId: interaction.user.id,
        guildId: interaction.guild.id
    });
    if (!cooldownStorage) {
        const model = client.cooldowns;
        cooldownStorage = new model({
            userId: interaction.user.id,
            guildId: interaction.guild.id
        });
    };
    let expire = cooldownStorage.ticketExpire;
    if (!expire || expire < Date.now()) return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `your 🎫 **Effect Ticket** was expired, or you don't have one! obtain one with \`/ticket\`!` }] });
    const rate = interaction.options.getString('rate');

    if (!rate) return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `you should specify the speed rate, ranging from 0.1 to 10! :pensive:` }] });
    if (isNaN(rate)) return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `the amount of speed rate must be a number ❌ (0.1 to 10)` }] });
    if (Number(rate) < 0.1 || Number(rate) > 10) return interaction.editReply({ embeds: [{ color: "#bee7f7", description: `the amount of speed up rate should lie between 0.1 and 10 :pensive:` }] });

    const body = {
        timescale: { speed: Number(rate) }
    }
    queue.player.node.send({
        op: 'filters',
        guildId: queue.guildId,
        ...body
    });

    const sayoriEmoji = client.customEmojis.get("smug");
    interaction.editReply({ embeds: [{ color: "#bee7f7", description: `changed the speed rate of the current queue to **${Number(rate).toFixed(1)}x**! ${sayoriEmoji}` }], content: `to reset all effect, use \`/reset\`!` })
    if (queue.textChannel.id !== interaction.channel.id) queue.textChannel.send({ embeds: [{ color: "#bee7f7", description: `${interaction.user} changed the speed rate of the current queue to **${Number(rate).toFixed(1)}x**! ${sayoriEmoji}` }], content: `to reset all effect, use \`/reset\`!` });
};