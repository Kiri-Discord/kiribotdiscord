const { MessageEmbed } = require('discord.js');
const request = require('node-superfetch');
const semver = require('semver');
const { stripIndents } = require('common-tags');
const { dependencies } = require('../../package.json');

exports.run = async (client, message, args) => {
  if (!client.config.owners.includes(message.author.id)) return message.message.inlineReply('only coco or bell can execute this command!')
  const needUpdate = [];
  for (const [dep, ver] of Object.entries(dependencies)) {
      const update = await parseUpdate(dep, ver);
      if (!update) continue;
      needUpdate.push(update);
  }
  if (!needUpdate.length) return message.channel.send('all packages are up to date!');
  const updatesList = needUpdate.map(pkg => {
      const breaking = pkg.breaking ? ' ⚠️' : '';
      return `${pkg.name} (${pkg.oldVer} -> ${pkg.newVer})${breaking}`;
  });
  const embed = new MessageEmbed()
  .setAuthor(client.user.username, client.user.displayAvatarURL())
  .setColor('#ffe6cc')
  .setTitle('Package updates available:')
  .setDescription(stripIndents`${updatesList.join('\n')}`)
  return message.channel.send(embed);
	
};


async function fetchVersion(dependency) {
    const { body } = await request.get(`https://registry.npmjs.com/${dependency}`);
    if (body.time.unpublished) return null;
    return body['dist-tags'].latest;
}

async function parseUpdate(dep, ver) {
    if (ver.startsWith('github:')) return null;
    const latest = await fetchVersion(dep);
    const clean = ver.replace(/^(\^|<=?|>=?|=|~)/, '');
    if (latest === clean) return null;
    return {
        name: dep,
        oldVer: clean,
        newVer: latest,
        breaking: !semver.satisfies(latest, ver)
    };
}

exports.help = {
  name: "update-check",
  description: "very self-explanatory",
  usage: `update-check`,
  example: `update-check`
}

exports.conf = {
  aliases: [],
  cooldown: 2,
  guildOnly: true,
  userPerms: [],
  channelPerms: ["EMBED_LINKS"]
}

