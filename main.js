// Requiring dependencies
const { readdirSync } = require('fs');
const { Client, Collection, GuildMember, Guild } = require('discord.js');
const client = new Client();
const { sep } = require("path");
const cooldowns = new Collection();
client.commands = new Collection();

// Reading through commands folder and all of its subfolders
const dir = './commands/';
readdirSync(dir).forEach(dirs => {
    const commandFiles = readdirSync(`${dir}${sep}/${dirs}${sep}`);
    for (const file of commandFiles) {
        // Looping through the files and requiring them
        const pull = require(`${dir}${dirs}/${file}`);
        if (typeof pull.name !== 'undefined') client.commands.set(pull.name, pull); // Checking if the command exists and adding it to the collection
    }
});

//Bot's activity
client.on('ready', () => {
    console.log(`i am ready!`);
    client.user.setActivity('your heartbeat', { type: 'LISTENING'}).catch(console.error);
});

let prefix;
try {
  const config = require("./config.json");
  prefix = config.prefix;
} catch (error) {
  prefix = process.env.prefix;
}

client.prefix = prefix


client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.guildOnly && message.channel.type === 'dm') return message.reply('i can\'t execute that command inside DMs!'); // stop user from running commands thru dm
	
	if (command.userPermissions) for (permission in command.userPermissions) {
		const sed = client.emojis.cache.get("769852738632548393");
		if (!message.member.hasPermission(command.userPermissions[permission])) return message.reply(`that might be a mistype, but you don't have permission. sorry ${sed}`);
		
	}

	if (command.args && !args.length) {
		let reply = `you didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nthe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
		command.execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

client.login(process.env.token);