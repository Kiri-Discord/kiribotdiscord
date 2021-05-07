const fs = require("fs");

module.exports = client => {
  
  fs.readdir("./commands/", (err, categories) => {
    if (err) console.log(err)
    console.log(`Found total ${categories.length} categories.`);
    
    categories.forEach(category => {
      let moduleConf = require(`../commands/${category}/module.json`);
      moduleConf.path = `./commands/${category}`;
      moduleConf.cmds = [];
      if (!moduleConf) return;
      client.helps.set(moduleConf.name, moduleConf);
      if (!moduleConf.adult && !moduleConf.hide) client.allNameFeatures.push(moduleConf.name);
      
      fs.readdir(`./commands/${category}`, (err, files) => {
        console.log(`Found total ${files.length - 1} command(s) from ${category}.`);
        if (err) console.log(err);
        
        files.forEach(file => {
          if (!file.endsWith(".js")) return;
          let prop = require(`../commands/${category}/${file}`);
          client.commands.set(prop.help.name, prop);

          if (!prop.conf.adult && !prop.conf.owner) client.allNameCmds.push(prop.help.name);
          prop.conf.aliases.forEach(alias => {
            client.aliases.set(alias, prop.help.name);
            if (!prop.conf.adult && !prop.conf.owner) client.allNameCmds.push(alias);
          })
          client.helps.get(moduleConf.name).cmds.push(prop.help.name);
        })
      })
    })
  })
}