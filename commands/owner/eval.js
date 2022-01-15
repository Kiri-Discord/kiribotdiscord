const { MessageEmbed } = require("discord.js");
const { post } = require("node-superfetch");

exports.run = async(client, message, args) => {
    const embed = new MessageEmbed()
        .addField("Input", "```js\n" + args.join(" ") + "```")

    try {
        const code = args.join(" ");
        if (!code) return message.channel.send("gimme some code pls");
        let evaled = await eval(code);
        if (typeof evaled !== "string") evaled = require("util").inspect(evaled, { depth: 0 });

        let output = clean(evaled);
        if (output.length > 1024) {
            const { body } = await post("https://www.toptal.com/developers/hastebin/documents").send(output);
            embed.addField("output", `https://hastebin.com/${body.key}.js`).setColor("#7DBBEB").setColor(0x7289DA);
        } else {
            embed.addField("output", "```js\n" + output + "```").setColor(0x7289DA);
        }

        return message.channel.send({ embeds: [embed] });

    } catch (error) {
        let err = clean(error);
        if (err.length > 1024) {
            const { body } = await post("https://www.toptal.com/developers/hastebin/documents").send(err);
            embed.addField("output", `https://www.toptal.com/developers/hastebin/${body.key}.js`).setColor("RED");
        } else {
            embed.addField("output", "```js\n" + err + "```").setColor("RED");
        }

        return message.channel.send({ embeds: [embed] });
    }
}

exports.help = {
    name: "eval",
    description: "run js code",
    usage: [`eval \`<code>\``],
    example: [`eval \`hi\``]
}

exports.conf = {
    aliases: ["ev"],
    cooldown: 4,
    channelPerms: ["EMBED_LINKS"],
    owner: true
}

function clean(string) {
    if (typeof text === "string") {
        return string.replace(/`/g, "`" + String.fromCharCode(8203))
            .replace(/@/g, "@" + String.fromCharCode(8203))
    } else {
        return string;
    }
}