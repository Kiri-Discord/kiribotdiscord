const { glob } = require('glob');
const { promisify } = require('util');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const globPromise = promisify(glob);
const config = require('../config.json');

const Heatsync = require("heatsync");
global.sync = new Heatsync();

const init = async() => {
    const cmdFiles = await globPromise(`${process.cwd()}/slashCommands/*/*.js`);
    console.log(`Found ${cmdFiles.length} application (/) commands`);
    if (!cmdFiles.length) return;
    const guild = [];
    const slash = [];
    for (const directory of cmdFiles) {
        const command = require(directory);
        if (command.conf.guild) guild.push(command.conf.data);
        else slash.push(command.conf.data);
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
        process.exit(1);
    } catch (error) {
        console.log(error);
        process.exit(1);
    };
};
init();