const fs = require("fs");

const { glob } = require('glob');
const { promisify } = require('util');

const globPromise = promisify(glob);

// module.exports = async () => {
//     const cmdFiles = await globPromise(`${process.cwd()}/slashCommands/*`);
//     return console.log(cmdFiles);
// }

module.exports = async client => {
    const normalCategories = await globPromise(`${process.cwd()}/commands/*`);
    if (!normalCategories.length) return;
    let totalCmd = 0;
    for (const category of normalCategories) {
        let moduleConf = require(`${category}/module.json`);
        if (!moduleConf) return;
        moduleConf.cmds = [];
        client.helps.set(moduleConf.name, moduleConf);
        const cmdFiles = await globPromise(`${category}/*.js`);
        if (!cmdFiles.length) return;
        totalCmd += cmdFiles.length;
        for (const file of cmdFiles) {
            let prop = sync.require(file);
            client.commands.set(prop.help.name, prop);

            if (!prop.conf.adult && !prop.conf.owner) client.allNameCmds.push(prop.help.name);
            prop.conf.aliases.forEach(alias => {
                client.aliases.set(alias, prop.help.name);
                if (!prop.conf.adult && !prop.conf.owner) client.allNameCmds.push(alias);
            });
            client.helps.get(moduleConf.name).cmds.push({ name: prop.help.name, desc: prop.help.description });
        }
    };
    logger.info(`[HANDLER] Found total ${totalCmd} text command(s) from ${normalCategories.length} categories.`);
    const slashCategories = await globPromise(`${process.cwd()}/slashCommands/*`);
    if (!slashCategories.length) return;
    let totalSlashCmd = 0;
    for (const category of slashCategories) {
        let moduleConf = require(`${category}/module.json`);
        if (!moduleConf) return;
        moduleConf.cmds = [];
        client.slashHelps.set(moduleConf.name, moduleConf);
        const cmdFiles = await globPromise(`${category}/*.js`);
        if (!cmdFiles.length) return;
        totalSlashCmd += cmdFiles.length;
        for (const file of cmdFiles) {
            let prop = sync.require(file);
            if (!prop.conf.adult && !prop.conf.context) client.allSlashCmds.push(prop.conf.data.name);
            if (!prop.conf.context) client.slashHelps.get(moduleConf.name).cmds.push({ name: prop.conf.data.name, desc: prop.conf.data.description });
            prop.subCommand = [];
            const command = prop.conf.data.toJSON();
            if (command.options && command.options.length) {
                const { options } = command;
                options.forEach(sub => {
                    if (sub.type === 1) {
                        client.slashHelps.get(moduleConf.name).cmds.push({ name: `${prop.conf.data.name} ${sub.name}`, desc: sub.description });
                        prop.subCommand.push(`${prop.conf.data.name} ${sub.name}`);
                    } else if (sub.type === 2) {
                        sub.options.forEach(op => {
                            client.slashHelps.get(moduleConf.name).cmds.push({ name: `${prop.conf.data.name} ${sub.name} ${op.name}`, desc: op.description });
                            prop.subCommand.push(`${prop.conf.data.name} ${sub.name} ${op.name}`);
                        })
                    }
                })
            };
            client.slash.set(prop.conf.data.name, prop);
        }
    };
    logger.info(`[HANDLER] Found total ${totalSlashCmd} slash command(s) from ${slashCategories.length} categories.`);
};