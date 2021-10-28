const { SlashCommandBuilder } = require('@discordjs/builders');

exports.run = async(client, interaction) => {
    const method = interaction.options.getString('method');

    const text = interaction.options.getString('text');


    if (!text) return interaction.reply({ content: "p l e a s e input some text :pensive:", ephemeral: true });

    if (text.length > 1024) return interaction.reply({ content: "oww, that is way too much. the maximum character is 1,024.", ephemeral: true });

    function encode(char) {
        return char.split("").map(str => {
            const converted = str.charCodeAt(0).toString(2);
            return converted.padStart(8, "0");
        }).join(" ")
    };

    function decode(char) {
        return char.split(" ").map(str => String.fromCharCode(Number.parseInt(str, 2))).join("");
    };

    if (method === "encode") {
        const result = encode(text);
        if (result.length > 1024) return interaction.reply({ content: "bruh, that is way too much for me to handle! the encoded text just reached over 1024 character, which is beyond Discord limit :pensive:", ephemeral: true });
        return interaction.reply(encode(text));
    } else if (method === "decode") {
        const result = decode(text);
        if (result.length > 1024) return interaction.reply({ content: "bruh, that is way too much for me to handle! the encoded text just reached over 1024 character, which is beyond Discord limit :pensive:", ephemeral: true });
        return interaction.reply(decode(text));
    }
};

exports.help = {
    name: "binary",
    description: "speak out your heart in binary and vice versa",
    usage: ["binary `<encode | decode> <text>`"],
    example: ["binary `encode i love you`"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addStringOption(option => option
            .setName('method')
            .setRequired(true)
            .setDescription('the method uses to either decoding or encoding the binary string')
            .addChoice('encode text to binary', 'encode')
            .addChoice('decode binary to text', 'decode')
        )
        .addStringOption(option => option
            .setName('text')
            .setDescription('the text or the binary string which you want to encode or decode')
            .setRequired(true)
        ),
    ,
    cooldown: 5,
    guildOnly: true,
}