const { glob } = require('glob');
const { promisify } = require('util');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const globPromise = promisify(glob);
const config = require('../config.json');

const init = async() => {
    const cmdFiles = await globPromise(`${process.cwd()}/slashCommands/*/*.js`);
    console.log(`Found ${cmdFiles.length} slash (/) commands`);
    if (!cmdFiles.length) return;
    const guild = [];
    const slash = [];
    for (const directory of cmdFiles) {
        const command = require(directory);
        if (command.conf.guild) guild.push(command.conf.data.toJSON());
        else slash.push(command.conf.data.toJSON());
    };
    try {
        const rest = new REST({ version: '9' }).setToken(config.token);
        if (guild.length) {
            console.log('[DISCORD] Started refreshing application GUILD (/) commands.');
            await rest.put(
                Routes.applicationGuildCommands(config.applicationID, config.slashTestServerID), { body: guild },
            );
        };
        if (slash.length) {
            console.log('[DISCORD] Started refreshing application GLOBAL (/) commands.');
            await rest.put(
                Routes.applicationCommands(config.applicationID), { body: slash },
            );
        };
    } catch (error) {
        console.log(error);
    };
};
init();