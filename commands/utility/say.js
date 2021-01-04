const tts = require('google-tts-api');
const languages = require('../../assets/language')

exports.help = {
    name: "say",
    description: `i know a lot of languages. make me say something by doing this :D\nyou can check my supported languages [here](https://www.w3schools.com/tags/ref_language_codes.asp)\n*don't do weird stuff*`,
    usage: "say `<language> <word>`",
    example: "say `en hello`"
};
  
exports.conf = {
    aliases: ["tts", "text-to-speech"],
    cooldown: 7,
    guildOnly: true,
    userPerms: [],
	  clientPerms: ["CONNECT", "SEND_MESSAGES", "SPEAK", "USE_VAD"]
}


exports.run = async (client, message, args) => {
  const setting = await client.dbguilds.findOne({
    guildID: message.guild.id
  });
  
  const prefix = setting.prefix;
  let act = args[0];
  let toMp3 = args.slice(1).join(' ');
  if (!act) return message.reply(`i don\'t understand what you want me to do :( use \`${prefix}help say\` to show the usage for this one :)`)
  if (!languages.includes(act)) return message.reply(`i don't recognize that language :( use \`${prefix}help say\` to show the list of langauge that i can speak!`)
  if (!toMp3) message.reply(`you must tell me something to say! use \`${prefix}help say\` to show the usage for this one :)`);
  if (toMp3.length > 200) message.reply(`your text is longer than 200 words, which makes me harder to say it :( i'm still saying it btw`);
  const current = client.voicequeue.get(message.guild.id);
	if (current) return message.reply(current.prompt);

    try {
      if (message.member.voice.channel) {
        await client.voicequeue.set(message.guild.id, { prompt: `please wait until i finish talking to **${message.author.username}** :(\n*i can only talk in one voice channel at a time, in one server. just like real people :)*` });
        const link = await tts.getAllAudioUrls(toMp3, {
          lang: act,
          slow: false,
          host: 'https://translate.google.com',
        });
        const connection = await message.member.voice.channel.join();
        const dispatcher = connection.play(link[0].url);
        let msg;
        dispatcher.on('start', async () => {
          msg = await message.channel.send('hey i started talking')
        });        
        dispatcher.on('finish', async () => {
          await client.voicequeue.delete(message.guild.id);
          await connection.disconnect();
          return msg.edit('done')
        });
      } else {
        return message.channel.send(`you have to join a voice channel first!`)
      }
    } catch {
      await client.voicequeue.delete(message.guild.id);
      return message.reply('sorry, i got an error while sending you my voice record :( try again later!') 
    }
}