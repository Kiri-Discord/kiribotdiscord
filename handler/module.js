const fs = require("fs");

module.exports = client => {

    fs.readdir("./commands/", (err, categories) => {
        if (err) logger.log('error', err);
        logger.log('info', `Found total ${categories.length} categories.`);

        categories.forEach(category => {
            let moduleConf = require(`../commands/${category}/module.json`);
            if (!moduleConf) return;
            moduleConf.path = `./commands/${category}`;
            moduleConf.cmds = [];
            client.helps.set(moduleConf.name, moduleConf);
            client.allNameFeaturesSlash.push({ label: moduleConf.name, value: moduleConf.name })
            client.allNameFeatures.push(moduleConf.name);

            fs.readdir(`./commands/${category}`, (err, files) => {
                logger.log('info', `Found total ${files.length - 1} command(s) from ${category}.`);
                if (err) logger.log('error', err);

                files.forEach(file => {
                    if (!file.endsWith(".js")) return;
                    let prop = require(`../commands/${category}/${file}`);
                    client.commands.set(prop.help.name, prop);

                    if (!prop.conf.adult && !prop.conf.owner) client.allNameCmds.push(prop.help.name);
                    prop.conf.aliases.forEach(alias => {
                        client.aliases.set(alias, prop.help.name);
                        if (!prop.conf.adult && !prop.conf.owner) client.allNameCmds.push(alias);
                    })
                    client.helps.get(moduleConf.name).cmds.push({ name: prop.help.name, desc: prop.help.description });
                })
            })
        })
    })
}