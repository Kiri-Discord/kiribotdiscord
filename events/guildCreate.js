module.exports = client => {
    guild.owner.send(`Thanks for adding me to your server ${guild.name}\nMy default prefix is ` + '`>`' + `\nType >help to see a full list of commands. Have fun!`);
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    client.users.cache.get('768448397786349578').send(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    client.users.cache.get('733281923144613918').send(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
};
