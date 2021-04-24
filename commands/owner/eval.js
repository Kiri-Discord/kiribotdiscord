const { MessageEmbed } = require("discord.js");
const { post } = require("node-superfetch");

exports.run = async (client, message, args) => {
  if (!client.config.owners.includes(message.author.id)) return;
  
  const embed = new MessageEmbed()
  .addField("Input", "```js\n" + args.join(" ") + "```")
  .setAuthor(client.user.username, client.user.displayAvatarURL())
  
  try {
    const code = args.join(" ");
    if (!code) return message.channel.send("gimme some code pls");
    let evaled;
    
    if (code.includes("process.env")) {
      evaled = "hey no secret token here";
    } else {
      evaled = await eval(code);
    }
    
    if (typeof evaled !== "string") evaled = require("util").inspect(evaled, {depth: 0});
    
    let output = clean(evaled);
    if (output.length > 1024) {
      const { body } = await post("https://hastebin.com/documents").send(output);
      embed.addField("output", `https://hastebin.com/${body.key}.js`).setColor('RANDOM').setColor(0x7289DA);
    } else {
      embed.addField("output", "```js\n" + output + "```").setColor(0x7289DA);
    }
    
    return message.channel.send(embed);
    
  } catch (error) {
    let err = clean(error);
    if (err.length > 1024) {
      const {body} = await post("https://hastebin.com/documents").send(err);
      embed.addField("output", `https://hastebin.com/${body.key}.js`).setColor("RED");
    } else {
      embed.addField("output", "```js\n" + err + "```").setColor("RED");
    }
    
    return message.channel.send(embed);
  }
}

exports.help = {
  name: "eval",
  description: "run js code",
  usage: `eval \`<code>\``,
  example: `eval \`hi\``
}

exports.conf = {
  aliases: ["ev"],
  cooldown: 4
}

function clean(string) {
  if (typeof text === "string") {
    return string.replace(/`/g, "`" + String.fromCharCode(8203))
    .replace(/@/g, "@" + String.fromCharCode(8203))
  } else {
    return string;
  }
}
