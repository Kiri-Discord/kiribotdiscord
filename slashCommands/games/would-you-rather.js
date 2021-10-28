const request = require('node-superfetch');
const { stripIndents } = require('common-tags');
const { formatNumber } = require('../../util/util');
const { MessageActionRow, MessageButton } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
        const current = client.games.get(interaction.channel.id);
        if (current) return interaction.reply({ content: current.prompt, ephemeral: true });
        client.games.set(interaction.channel.id, { prompt: `please wait until **${interaction.user.username}** is finished first :(` });
        try {
            await interaction.deferReply();
            const data = await fetchScenario();
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setCustomId('1')
                    .setLabel('1')
                    .setStyle('PRIMARY'),
                    new MessageButton()
                    .setCustomId('2')
                    .setLabel('2')
                    .setStyle('SECONDARY')
                );
            const msg = await interaction.editReply({
                        content: stripIndents `
            ${data.prefix ? `${data.prefix.toLowerCase()}, would you rather...` : 'would you rather...'}
            **1.** ${data.option_1.toLowerCase()}
            **2.** ${data.option_2.toLowerCase()}
            _respond with either **1** or **2** to continue._
        `,
        components: [row],
        fetchReply: true
    });
        const filter = async res => {
            if (res.user.id !== interaction.user.id) {
                await res.reply({
                    content: `those buttons are for ${interaction.user.toString()} :pensive:`,
                    ephemeral: true
                });
                return false;
            } else return true
        };
        const collector = msg.createMessageComponentCollector({
            filter,
            componentType: 'BUTTON',
            time: 30000,
            max: 1
        });
        collector.on('collect', async(res) => {
            await res.deferReply();
            const option1 = res.customId === '1';
            await postResponse(data.id, option1);
            const totalVotes = Number.parseInt(data.option1_total, 10) + Number.parseInt(data.option2_total, 10);
            const numToUse = option1 ? Number.parseInt(data.option1_total, 10) : Number.parseInt(data.option2_total, 10);
            client.games.delete(interaction.channel.id);
            return res.editReply(stripIndents`
                **${Math.round((numToUse / totalVotes) * 100)}%** of people agree with that!
                1.\`${formatNumber(data.option1_total)}\` - 2.\`${formatNumber(data.option2_total)}\`
            `);
        })
        collector.on('end', (collected) => {
            client.games.delete(interaction.channel.id);
            row.components.forEach(component => component.setDisabled(true));
            msg.edit({ components: [row] });
            if (!collected.size) return interaction.channel.send(stripIndents`
            no response? :D
            1.\`${formatNumber(data.option1_total)}\` - 2.\`${formatNumber(data.option2_total)}\`
            `);
        });
    } catch (err) {
        client.games.delete(interaction.channel.id);
        return interaction.followUp(`sorry! i got an error. try again later :pensive:`);
    };
};

async function fetchScenario() {
    const { text } = await request.get('http://either.io/');
    return JSON.parse(text.match(/window.initial_question = (\{.+\})/)[1]).question;
};

async function postResponse(id, bool) {
    try {
        const { text } = await request
            .get(`http://either.io/vote/${id}/${bool ? '1' : '2'}`)
            .set({ 'X-Requested-With': 'XMLHttpRequest' });
        return JSON.parse(text).result;
    } catch {
        return false;
    };
};

exports.help = {
	name: "would-you-rather",
	description: `ask you a random "would you rather...?" question.`,
	usage: ["would-you-rather"],
	example: ["would-you-rather"]
};
  
exports.conf = {
    cooldown: 4,
    data: new SlashCommandBuilder()
    .setName(exports.help.name)
    .setDescription(exports.help.description),
    guildOnly: true,
};