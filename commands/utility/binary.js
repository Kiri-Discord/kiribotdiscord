const Discord = require("discord.js");

exports.run = async(client, message, args) => {
    if (!args[0]) return message.channel.send("unknown parameter :( please choose the method first, either decode or encode it.");

    let choice = ["encode", "decode"];
    if (!choice.includes(args[0].toLowerCase())) return message.channel.send("unknown parameter :( please choose the method first, either decode or encode it.");

    let text = args.slice(1).join(" ");


    if (!text) return message.reply("p l e a s e input some text :pensive:");

    if (text.length > 1024) return message.reply("oww, that is way too much. the maximum character is 1,024.");

    function encode(char) {
        return char.split("").map(str => {
            const converted = str.charCodeAt(0).toString(2);
            return converted.padStart(8, "0");
        }).join(" ")
    };

    function decode(char) {
        return char.split(" ").map(str => String.fromCharCode(Number.parseInt(str, 2))).join("");
    };

    if (args[0].toLowerCase() === "encode") {
        const result = encode(text);
        if (result.length > 1024) return message.reply("bruh, that is way too much for me to handle! the encoded text just reached over 1024 character, which is beyond Discord limit :pensive:");
        return message.channel.send(encode(text));
    } else if (args[0].toLowerCase() === "decode") {
        const result = decode(text);
        if (result.length > 1024) return message.reply("bruh, that is way too much for me to handle! the encoded text just reached over 1024 character, which is beyond Discord limit :pensive:");
        return message.channel.send(decode(text));
    }
};

exports.help = {
    name: "binary",
    description: "convert text to binary or otherwise.",
    usage: ["binary `<encode | decode> <text>`"],
    example: ["binary `encode i love you`"]
};

exports.conf = {
    aliases: [],
    cooldown: 5,
    guildOnly: true,
}