
const { MessageEmbed, MessageCollector } = require('discord.js');
const fs = require('fs');
const YAML = require('yaml');

exports.run = async (client, message, args) => {
  const setting = await client.dbguilds.findOne({
    guildID: message.guild.id
  });
  const prefix = setting.prefix;
  let topic = args[0];
  if (!topic) { // Pick a random topic if none given
    topic = message.client.topics[Math.floor(Math.random() * message.client.topics.length)];
  } else if (!message.client.topics.includes(topic))
    return message.channel.send(`can you provide a vaild topic please? use ${prefix}triviatopics for a list 😬`);
  
  // Get question and answers
  const directory = __basedir + "/assets/trivia/" + topic + '.yml';
  const questions = YAML.parse(fs.readFileSync(directory, 'utf-8')).questions;
  const n = Math.floor(Math.random() * questions.length);
  const question = questions[n].question;
  const answers = questions[n].answers;
  const origAnswers = [...answers].map(a => `\`${a}\``);
  // Clean answers
  for (let i = 0; i < answers.length; i++) {
    answers[i] = answers[i].trim().toLowerCase().replace(/\.|'|-|\s/g, '');
  }

  // Get user answer
  const questionEmbed = new MessageEmbed()
    .setColor('#DAF7A6')
    .setFooter(client.user.tag, client.user.displayAvatarURL())
    .setTitle('Trivia')
    .addField('Topic', `\`${topic}\``)
    .addField('Question', `${question}`)
    .setAuthor(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
    .setTimestamp()
    .setColor('RANDOM')
  const url = question.match(/\bhttps?:\/\/\S+/gi);
  if (url) questionEmbed.setImage(url[0]);
  message.channel.send(questionEmbed);
  let winner;
  const collector = new MessageCollector(message.channel, msg => {
    if (!msg.author.bot) return true;
  }, { time: 15000 }); // Wait 15 seconds
  collector.on('collect', msg => {
    if (answers.includes(msg.content.trim().toLowerCase().replace(/\.|'|-|\s/g, ''))) {
      winner = msg.author;
      collector.stop();
    }
  });
  collector.on('end', () => {
    const answerEmbed = new MessageEmbed()
      .setColor('#DAF7A6')
      .setFooter(client.user.tag, client.user.displayAvatarURL())
      .setTitle('Trivia')
      .setAuthor(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(message.guild.me.displayHexColor);
    if (winner) 
      message.channel.send(answerEmbed.setDescription(`Congratulations ${winner}, you gave the correct answer!`));
    else message.channel.send(answerEmbed
      .setDescription('Sorry, time\'s up! Better luck next time :(')
      .addField('Correct answers', origAnswers.join('\n'))
    );
  });
};
exports.help = {
	name: "trivia",
	description: "compete against your friends in a game of trivia (anyone can answer)\nif no topic is given, a random one will be chosen :)\nthe question will expire after 15 seconds.",
	usage: "trivia [topic]",
	example: "trivia anime"
};
  
exports.conf = {
	aliases: ["t"],
	cooldown: 15
};
