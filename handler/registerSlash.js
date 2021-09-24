const { glob } = require('glob');
const { promisify } = require('util');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const globPromise = promisify(glob);

module.exports = async client => {
    const cmdFiles = await globPromise(`${process.cwd()}/slashCommands/*/*.js`);
    logger.log('info', `Found ${cmdFiles.length} slash (/) commands`);
    const guild = [];
    const slash = [];
    for (const directory of cmdFiles) {
        const command = require(directory);
        client.slash.set(command.conf.data.name, command);
        if (command.conf.guild) guild.push(command.conf.data.toJSON());
        else slash.push(command.conf.data.toJSON());
    };
    if (!client.config.updateSlashOnBoot) return;
    try {
        const rest = new REST({ version: '9' }).setToken(process.env.token);
        if (guild.length) {
            logger.log('info', '[DISCORD] Started refreshing application GUILD (/) commands.');
            await rest.put(
                Routes.applicationGuildCommands(client.config.applicationID, client.config.slashTestServerID), { body: guild },
            );
        };
        if (slash.length) {
            logger.log('info', '[DISCORD] Started refreshing application GLOBAL (/) commands.');
            await rest.put(
                Routes.applicationCommands(client.config.applicationID), { body: slash },
            );
        };
    } catch (error) {
        console.log(error);
    };
};