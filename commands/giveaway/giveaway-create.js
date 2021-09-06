const { MessageEmbed } = require('discord.js');
const { askString } = require('../../util/util');
const ms = require("ms");
const { stripIndents } = require('common-tags');
const { embedURL } = require('../../util/util');

exports.run = async(client, message, args, prefix) => {
    let targetChannel = null;
    let duration = null;
    let winners = null;
    let pingRole = null;
    let prize = null;
    let setupMessage = null;
    let ongoing = false;

    async function ending(reason) {
        await setupMessage.delete();
        if (reason === 1) return message.channel.send(`:boom: the giveaway setup was cancelled due to inactivity :pensive:`);
        if (reason === 2) return message.channel.send(`alright i cancelled the command :wink:`);
    };
    const embed = new MessageEmbed()
        .setColor("#bee7f7")
        .setAuthor('step 1 of 5')
        .setTitle("alright, let's setup your giveaway :)")
        .setDescription(stripIndents `
	:tada: first, what channel do you want the giveaway to be in? mention that channel down in the chat!
	
	> not responding in any required step for over 30 seconds will cancel this setup. typing \`cancel\` also help too!`)
        .setTimestamp()
    while (!targetChannel) {
        if (!setupMessage) setupMessage = await message.channel.send(embed);
        const filter = res => res.author.id === message.author.id;
        const res = await askString(message.channel, filter, { time: 30000 });
        if (res === 0) return ending(1);
        if (!res) return ending(2);
        const channel = res.mentions.channels.first();
        if (!channel) {
            await res.delete();
            embed
                .setTitle('oops, that doesn\'t seems right...')
                .setDescription(stripIndents `
			:boom: that wasn't an existing channel in this server! mention a channel like this ${message.channel.toString()}
			
			> not responding in any required step for over 30 seconds will cancel this setup. typing \`cancel\` also help too!`);
            await setupMessage.edit(embed);
            continue;
        };
        await res.delete();
        targetChannel = channel;
    };
    while (!duration) {
        if (!setupMessage) setupMessage = await message.channel.send(embed);
        if (!ongoing) {
            embed
                .setAuthor('step 2 of 5')
                .setTitle('next, how long should your giveaway last?')
                .setDescription(stripIndents `
			:tada: all valid duration time format are \`s, m, hrs\`!
			for example, use \`6hrs\` for a giveaway that last 6 hours.
			
			> not responding in any required step for over 30 seconds will cancel this setup. typing \`cancel\` also help too!
			`);
            await setupMessage.edit(embed);
        };
        const filter = msg => msg.author.id === message.author.id;
        const res = await askString(message.channel, filter, { time: 30000 });
        if (res === 0) return ending(1);
        if (!res) return ending(2);
        const time = res.content.toLowerCase();
        const convert = ms(time);
        const toSecond = Math.floor(convert / 1000);
        if (!toSecond || toSecond == undefined || toSecond < 1 || toSecond > 2592000) {
            if (!setupMessage) setupMessage = await message.channel.send(embed);
            ongoing = true;
            await res.delete();
            embed
                .setTitle('oops, that doesn\'t seems right...')
                .setDescription(stripIndents `
			:boom: please insert the valid time format for your giveaway duration! all valid time format are \`s, m, hrs\`!
			for example, use \`6hrs\` for a giveaway that last 6 hours (the duration must be shorter than 30 days and longer than 1 second)
			
			> not responding in any required step for over 30 seconds will cancel this setup. typing \`cancel\` also help too!
			`)
            await setupMessage.edit(embed);
            continue;
        };
        await res.delete();
        ongoing = false;
        duration = convert;
    };
    while (!winners) {
        if (!ongoing) {
            embed
                .setAuthor('step 3 of 5')
                .setTitle('moving on, how many winners should there be?')
                .setDescription(stripIndents `
			:tada: choose a number of winners between 1 and 40!
			
			> not responding in any required step for over 30 seconds will cancel this setup. typing \`cancel\` also help too!
			`);
            await setupMessage.edit(embed);
        };
        const filter = res => res.author.id === message.author.id;
        const res = await askString(message.channel, filter, { time: 30000 });
        if (res === 0) return ending(1);
        if (!res) return ending(2);
        const number = parseInt(res.content);
        if (isNaN(number) || number < 1 || number > 40) {
            if (!setupMessage) setupMessage = await message.channel.send(embed);
            ongoing = true;
            await res.delete();
            embed
                .setTitle('oops, that doesn\'t seems right...')
                .setDescription(stripIndents `
			:boom: the number of winners must lie between 1 and 40!
			
			> not responding in any required step for over 30 seconds will cancel this setup. typing \`cancel\` also help too!
			`);
            await setupMessage.edit(embed);
            continue;
        };
        await res.delete();
        ongoing = false;
        winners = number;
    };
    while (!pingRole) {
        if (!setupMessage) setupMessage = await message.channel.send(embed);
        if (!ongoing) {
            embed
                .setAuthor('step 4 of 5 (optional)')
                .setTitle('is there any roles that you would like to notify of this giveaway?')
                .setDescription(stripIndents `
			:tada: mention or paste an ID or name of any role on this server that you would like me to mention for this giveaway!
			
			> not responding for over 30 seconds will cancel this setup. typing \`cancel\` also help too!
            > for this optional step, you can type \`skip\` to pass this step.
			`);
            await setupMessage.edit(embed);
        };
        const filter = res => res.author.id === message.author.id;
        const res = await askString(message.channel, filter, { time: 30000 });
        if (res === 0) return ending(1);
        if (!res) return ending(2);
        if (res.content.toLowerCase() === 'skip') {
            await res.delete();
            break;
        }
        const role = message.guild.roles.cache.find(r => (r.name === res.content) || (r.id === res.content.replace(/[^\w\s]/gi, '')));
        if (!role) {
            if (!setupMessage) setupMessage = await message.channel.send(embed);
            ongoing = true;
            await res.delete();
            embed
                .setAuthor('step 4 of 5 (optional)')
                .setTitle('oops, that doesn\'t seems right...')
                .setDescription(stripIndents `
			:boom: that was not a valid role on this server :pensive: you can use an ID, name or mention the role directly!
			
			> not responding for over 30 seconds will cancel this **step**. typing \`cancel\` also help too!`);
            await setupMessage.edit(embed);
            continue;
        };
        await res.delete();
        ongoing = false;
        pingRole = role;
    };
    while (!prize) {
        if (!setupMessage) setupMessage = await message.channel.send(embed);
        embed
            .setAuthor('step 5 of 5')
            .setTitle('finally, what do you want to giveaway?')
            .setDescription(stripIndents `
		:tada: jot down the prize that you would like to giveaway in the chat! this will also start the giveaway.
		
		> not responding for over 30 seconds will cancel this setup. typing \`cancel\` also help too!
		`);
        await setupMessage.edit(embed);
        const filter = res => res.author.id === message.author.id;
        const res = await askString(message.channel, filter, { time: 30000 });
        if (res === 0) return ending(1);
        if (!res) return ending(2);
        const giveaway = res.content;
        await res.delete();
        prize = giveaway;
    };
    const giveawayMessage = pingRole ? `${pingRole}\n${client.giveaways.options.default.messages.giveaway}` : client.giveaways.options.default.messages.giveaway;
    const giveaway = await client.giveaways.start(targetChannel, {
        time: duration,
        winnerCount: winners,
        prize: prize,
        messages: {
            giveaway: giveawayMessage,
            inviteToParticipate: client.giveaways.options.default.messages.inviteToParticipate,
            timeRemaining: client.giveaways.options.default.messages.timeRemaining,
            embedFooter: client.giveaways.options.default.messages.embedFooter,
            noWinner: client.giveaways.options.default.messages.noWinner,
            giveawayEnded: client.giveaways.options.default.messages.giveawayEnded,
            units: {
                pluralS: true
            },
            winMessage: `congratulations, {winners} :tada: you won **{prize}**!\n{messageURL}`
        },
        lastChance: client.giveaways.options.default.lastChance,
        hostedBy: message.author.toString(),
        extraData: {
            hostedByID: message.author.id
        }
    });
    embed
        .setAuthor('step 5 of 5', 'https://i.imgur.com/agWK351.png')
        .setTitle('success!')
        .setDescription(`:tada: done! the giveaway for **${prize}** is starting in ${targetChannel.toString()}!\n${embedURL('jump to message :arrow_upper_right:', giveaway.messageURL)}`);
    return setupMessage.edit(embed);
};

exports.help = {
    name: "giveaway-create",
    description: "create a new giveaway on the server with interactive setup",
    usage: "giveaway-create",
    example: "giveaway-create"
};

exports.conf = {
    aliases: ["gcreate", "g-create"],
    cooldown: 3,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS", "MANAGE_MESSAGES"],
    userPerms: ["MANAGE_MESSAGES"]
}