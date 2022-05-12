const jsChess = require('js-chess-engine');//wtf
const { createCanvas, loadImage } = require('canvas');
const { msToHMS } = require('../../util/util');
const validateFEN = require('fen-validator').default;
const { SlashCommandBuilder } = require('@discordjs/builders');
const path = require('path');
const { stripIndents } = require('common-tags');
const { buttonVerify, reactIfAble } = require('../../util/util');
const { centerImagePart } = require('../../util/canvas');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const turnRegex = /^(?:((?:[A-H][1-8])|(?:[PKRQBN]))?([A-H]|X)?([A-H][1-8])(?:=([QRNB]))?)|(?:0-0(?:-0)?)$/;
const pieces = ['pawn', 'rook', 'knight', 'king', 'queen', 'bishop'];
const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

exports.run = async(client, interaction, args) => {
    if (interaction.options.getSubcommand() === 'delete') {
        const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:';
        await interaction.deferReply();
        const data = await client.db.gameStorage.findOne({
            guildId: interaction.guild.id,
            userId: interaction.user.id
        });
        if (data) {
            const foundGameSave = data.storage.chess;
            if (!foundGameSave) return interaction.editReply(`you don\'t have any saved chess game ${sedEmoji}`);

            await client.db.gameStorage.findOneAndDelete({
                guildId: interaction.guild.id,
                userId: interaction.user.id
            });
            return interaction.editReply(`your saved game has been deleted ${sedEmoji}`);
        } else {
            return interaction.editReply(`you don\'t have any saved chess game ${sedEmoji}`);
        };
    };
    const channelId = interaction.channel.id;
    const current = client.games.get(channelId);
    if (current) return interaction.reply({ content: current.prompt, ephemeral: true });
    const member = interaction.options.getMember('opponent');

    const opponent = member.user;
    if (opponent.id === interaction.user.id) return interaction.reply({ content: "you can't play with yourself!", ephemeral: true });

    let time = interaction.options.getInteger('time');

    if (time < 0 || time > 120) return interaction.reply({
        embeds: [{
            description: `how long should the chess timers be set for (in minutes)? use 0 for infinite. pick a duration between 0 and 120 by using \`/chess <@opponent> <time>\`!`
        }],
        ephemeral: true
    });
    let fen = interaction.options.getString('fen-string');
    if (fen) {
        const valid = validateFEN(fen);
        if (!valid) return interaction.reply({ content: "invalid FEN for the start board :pensive: try it again!", ephemeral: true });
    };
    if (client.isPlaying.get(interaction.user.id)) return interaction.reply({ content: 'you are already in a game. please finish that first.', ephemeral: true });
    client.isPlaying.set(interaction.user.id, true);
    client.games.set(channelId, { prompt: `please wait until **${interaction.user.username}** and **${opponent.username}** finish their chess game!` });

    try {
        if (!opponent.bot) {
            if (client.isPlaying.get(opponent.id)) {
                client.isPlaying.delete(interaction.user.id);
                client.games.delete(channelId);
                return interaction.reply({ content: 'that user is already in a game. try again in a minute.', ephemeral: true });
            };
            await interaction.deferReply();
            const verification = await buttonVerify(interaction.channel, opponent, `${opponent}, do you accept this challenge?`);
            if (!verification) {
                client.isPlaying.delete(interaction.user.id);
                client.games.delete(channelId);
                return interaction.editReply({ content: `looks like they declined..` });
            } else {
                interaction.editReply({ content: 'beginning the Chess game...' });
            };
            client.isPlaying.set(opponent.id, true);
        } else {
            interaction.reply({ content: 'beginning the Chess game...', ephemeral: true });
        };
        let images = null;
        if (!images) await loadImages();
        let gameStorage = client.db.gameStorage;
        let resumeGame = await gameStorage.findOne({
            guildId: interaction.guild.id,
            userId: interaction.user.id
        });
        if (!resumeGame) resumeGame = new gameStorage({
            guildId: interaction.guild.id,
            userId: interaction.user.id
        });
        let game;
        let whiteTime = time === 0 ? Infinity : time * 60000;
        let blackTime = time === 0 ? Infinity : time * 60000;
        let whitePlayer = interaction.user;
        let blackPlayer = opponent;
        let foundGameSave = resumeGame.storage.chess;
        if (foundGameSave) {
            const verification = await buttonVerify(interaction.channel, interaction.user, stripIndents `
            you already have a saved game, do you want to resume it? \`y/n\`

            *this will delete your currently saved game*
            `);
            if (verification) {
                try {
                    const data = foundGameSave;
                    game = new jsChess.Game(data.fen);
                    whiteTime = data.whiteTime === -1 ? Infinity : data.whiteTime;
                    blackTime = data.blackTime === -1 ? Infinity : data.blackTime;
                    whitePlayer = data.color === 'white' ? interaction.user : opponent;
                    blackPlayer = data.color === 'black' ? interaction.user : opponent;
                    await client.db.gameStorage.findOneAndDelete({
                        guildId: interaction.guild.id,
                        userId: interaction.user.id
                    });
                } catch {
                    client.isPlaying.delete(interaction.user.id);
                    client.isPlaying.delete(opponent.id);
                    client.games.delete(channelId);
                    await client.db.gameStorage.findOneAndDelete({
                        guildId: interaction.guild.id,
                        userId: interaction.user.id
                    });
                    return interaction.channel.send(`there was an error while reading your saved game... can you try again later? ${sedEmoji}`);
                }
            } else {
                game = new jsChess.Game(fen || undefined);
            }
        } else {
            game = new jsChess.Game(fen || undefined);
        }
        let prevPieces = null;
        let saved = false;
        while (!game.exportJson().isFinished && game.exportJson().halfMove <= 50) {
            const gameState = game.exportJson();
            const user = gameState.turn === 'black' ? blackPlayer : whitePlayer;
            const userTime = gameState.turn === 'black' ? blackTime : whiteTime;
            if (user.bot) {
                prevPieces = Object.assign({}, game.exportJson().pieces);
                const now = new Date();
                game.aiMove(1);
                const timeTaken = new Date() - now;
                if (gameState.turn === 'black') blackTime -= timeTaken - 5000;
                if (gameState.turn === 'white') whiteTime -= timeTaken - 5000;
            } else {
                const displayTime = userTime === Infinity ? 'infinite' : msToHMS(userTime);
                const GameEmbed = new MessageEmbed()
                    .setDescription(stripIndents `
                    type \`end\` to forfeit.

                    save your game by typing \`save\`
                    can't think of a move? use \`help\` *coward*
                    `)
                    .setTitle(`${interaction.user.username} vs ${opponent.username}`)
                    .setFooter({text: `time remaining: ${displayTime} (max 10 minutes per turn)`})
                    .setColor('#34e363')
                    .setImage(`attachment://chess.png`)
                await interaction.channel.send({
                    content: `**${user.username}**, what move do you want to make? (ex. A1A2 or NC3)?\n_you are ${gameState.check ? '**in check!**' : 'not in check.'}_`,
                    embeds: [GameEmbed],
                    files: [new MessageAttachment(displayBoard(gameState, prevPieces), 'chess.png')]
                })
                prevPieces = Object.assign({}, game.exportJson().pieces);
                const moves = game.moves();
                const pickFilter = res => {
                    if (![interaction.user.id, opponent.id].includes(res.author.id)) return false;
                    const choice = res.content.toUpperCase();
                    if (choice === 'END') return true;
                    if (choice === 'SAVE') return true;
                    if (choice === 'HELP') return true;
                    if (res.author.id !== user.id) return false;
                    const move = choice.match(turnRegex);
                    if (!move) return false;
                    const parsed = parseSAN(gameState, moves, move);
                    if (!parsed || !moves[parsed[0]] || !moves[parsed[0]].includes(parsed[1])) {
                        reactIfAble(res, res.author, '❌');
                        return false;
                    };
                    return true;
                };
                const now = new Date();
                const turn = await interaction.channel.awaitMessages({
                    filter: pickFilter,
                    max: 1,
                    time: Math.min(userTime, 600000)
                });
                if (!turn.size) {
                    const timeTaken = new Date() - now;
                    client.games.delete(channelId);
                    client.isPlaying.delete(interaction.user.id);
                    client.isPlaying.delete(opponent.id);
                    if (userTime - timeTaken <= 0) {
                        return interaction.channel.send(`${user.id === interaction.user.id ? opponent : interaction.user} wins from timeout!`);
                    } else {
                        return interaction.channel.send(`the game was ended, **${user.username}**! you cannot take more than 10 minutes.`);
                    };
                };
                if (turn.first().content.toLowerCase() === 'end') break;
                if (turn.first().content.toLowerCase() === 'save') {
                    const { author } = turn.first();
                    let previousGameData = await gameStorage.findOne({
                        guildId: interaction.guild.id,
                        userId: interaction.user.id
                    });
                    if (!previousGameData) previousGameData = new gameStorage({
                        guildId: interaction.guild.id,
                        userId: interaction.user.id
                    });
                    const alreadySaved = previousGameData.storage.chess;
                    if (alreadySaved) {
                        const verification = await buttonVerify(interaction.channel, author, 'you already have a saved game, do you want to overwrite it?');
                        if (!verification) continue;
                    };
                    if (gameState.turn === 'black') blackTime -= new Date() - now;
                    if (gameState.turn === 'white') whiteTime -= new Date() - now;
                    previousGameData.storage.chess = (exportGame(
                        game,
                        blackTime,
                        whiteTime,
                        whitePlayer.id === author.id ? 'white' : 'black'
                    ));
                    await previousGameData.save();
                    saved = true;
                    break;
                };
                if (turn.first().content.toLowerCase() === 'help') {
                    game.aiMove(0);
                } else {
                    const choice = parseSAN(gameState, moves, turn.first().content.toUpperCase().match(turnRegex));
                    const pawnMoved = gameState.pieces[choice[0]].toUpperCase() === 'P';
                    game.move(choice[0], choice[1]);
                    if (pawnMoved && choice[1].endsWith(gameState.turn === 'white' ? '8' : '1')) {
                        game.board.configuration.pieces[choice[1]] = gameState.turn === 'white' ?
                            choice[2] :
                            choice[2].toLowerCase();
                    };
                };
                const timeTaken = new Date() - now;
                if (gameState.turn === 'black') blackTime -= timeTaken - 5000;
                if (gameState.turn === 'white') whiteTime -= timeTaken - 5000;
            };
        };
        client.isPlaying.delete(interaction.user.id);
        client.isPlaying.delete(opponent.id);
        client.games.delete(channelId);
        if (saved) {
            return interaction.channel.send(stripIndents `
            game was saved! use \`/${interaction.commandName} @${opponent.tag} ${time}\` to resume anytime!
            the same opponent is not required to resume the game :)

            *if you want to delete your saved game, use \`/${interaction.commandName} delete\`*
            `);
        }
        const gameState = game.exportJson();
        if (gameState.halfMove > 50) return interaction.channel.send('due to the 50 moves rule, this game is a draw.');
        if (!gameState.isFinished) return interaction.channel.send('game was ended due to forfeit :pensive:');
        if (!gameState.checkMate && gameState.isFinished) {
            const staleEmbed = new MessageEmbed()
                .setTitle(`this game is a draw!`)
                .setColor('#34e363')
                .setImage(`attachment://chess.png`)
            return interaction.channel.send({
                content: 'stalemate!',
                files: [new MessageAttachment(displayBoard(gameState, prevPieces), 'chess.png')],
                embeds: [staleEmbed]
            });
        };
        const winner = gameState.turn === 'black' ? whitePlayer : blackPlayer;
        const EndEmbed = new MessageEmbed()
            .setTitle(`${winner.username} won!`)
            .setColor('#34e363')
            .setImage(`attachment://chess.png`);
        const lost = winner.id === interaction.user.id ? opponent : interaction.user;
        if (!lost.bot) {
            await client.db.money.findOneAndUpdate({
                guildId: interaction.guild.id,
                userId: lost.id
            }, {
                guildId: interaction.guild.id,
                userId: lost.id,
                $inc: {
                    matchPlayed: 1,
                    lose: 1
                },
            }, {
                upsert: true,
                new: true,
            });
        };
        if (!winner.bot) {
            let amount = getRandomInt(5, 15);
            const storageAfter = await client.db.money.findOneAndUpdate({
                guildId: interaction.guild.id,
                userId: winner.id
            }, {
                guildId: interaction.guild.id,
                userId: winner.id,
                $inc: {
                    balance: amount,
                    matchPlayed: 1,
                    win: 1
                },
            }, {
                upsert: true,
                new: true,
            });
            EndEmbed
                .setDescription(`⏣ __${amount}__ token was placed in your wallet as a reward!`)
                .setFooter({text: `your current balance: ${storageAfter.balance} token`})
        };
        return interaction.channel.send({
            embeds: [EndEmbed],
            content: `checkmate! congratulations, **${winner.username}**!`,
            files: [new MessageAttachment(displayBoard(gameState, prevPieces), 'chess.png')]
        });

        function parseSAN(gameState, moves, move) {
            if (!move) return null;
            if (move[0] === '0-0') {
                if (gameState.turn === 'white') {
                    if (gameState.castling.whiteShort) return ['E1', 'G1'];
                    return null;
                } else if (gameState.turn === 'black') {
                    if (gameState.castling.blackShort) return ['E8', 'G8'];
                    return null;
                }
            };
            if (move[0] === '0-0-0') {
                if (gameState.turn === 'white') {
                    if (gameState.castling.whiteLong) return ['E1', 'C1'];
                    return null;
                } else if (gameState.turn === 'black') {
                    if (gameState.castling.blackLong) return ['E8', 'C8'];
                    return null;
                }
            };
            if (!move[3]) return null;
            const initial = move[1] || 'P';
            if (gameState.pieces[initial]) return [initial, move[3], move[4] || 'Q'];
            const possiblePieces = Object.keys(gameState.pieces).filter(piece => {
                if (pickImage(gameState.pieces[piece]).color !== gameState.turn) return false;
                if (gameState.pieces[piece].toUpperCase() !== initial) return false;
                if (move[2] && move[2] !== 'X' && !piece.startsWith(move[2])) return false;
                if (move[4]) {
                    if (!piece.endsWith(gameState.turn === 'black' ? '2' : '7')) return false;
                    if (gameState.pieces[piece].toUpperCase() !== 'P') return false;
                }
                if (!moves[piece]) return false;
                return moves[piece].includes(move[3]);
            });
            if (possiblePieces.length === 1) return [possiblePieces[0], move[3], move[4] || 'Q'];
            return null;
        };

        function displayBoard(gameState, prevPieces) {
            const canvas = createCanvas(images.board.width, images.board.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(images.board, 0, 0);
            let w = 2;
            let h = 3;
            let row = 8;
            let col = 0;
            for (let i = 0; i < 64; i++) {
                const piece = gameState.pieces[`${cols[col]}${row}`];
                const prevGamePiece = prevPieces ? prevPieces[`${cols[col]}${row}`] : null;
                if (piece) {
                    const parsed = pickImage(piece);
                    const img = images[parsed.color][parsed.name];
                    const { x, y, width, height } = centerImagePart(img, 62, 62, w, h);
                    if ((gameState.check || gameState.checkMate) && piece === (gameState.turn === 'white' ? 'K' : 'k')) {
                        ctx.fillStyle = 'red';
                        ctx.globalAlpha = 0.5;
                        ctx.fillRect(w, h, 62, 62);
                        ctx.globalAlpha = 1;
                        ctx.drawImage(img, x, y, width, height);
                    } else if (prevPieces && (!prevGamePiece || piece !== prevGamePiece)) {
                        ctx.fillStyle = 'yellow';
                        ctx.globalAlpha = 0.5;
                        ctx.fillRect(w, h, 62, 62);
                        ctx.globalAlpha = 1;
                        ctx.drawImage(img, x, y, width, height);
                    } else {
                        ctx.drawImage(img, x, y, width, height);
                    }
                } else if (prevGamePiece) {
                    ctx.fillStyle = 'yellow';
                    ctx.globalAlpha = 0.5;
                    ctx.fillRect(w, h, 62, 62);
                    ctx.globalAlpha = 1;
                }
                w += 62;
                col += 1;
                if (col % 8 === 0 && col !== 0) {
                    w = 2;
                    col = 0;
                    h += 62;
                    row -= 1;
                }
            }
            return canvas.toBuffer();
        };

        async function loadImages() {
            const image = { black: {}, white: {} };
            image.board = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'chess', 'board.png'));
            for (const piece of pieces) {
                const blk = `black-${piece}.png`;
                image.black[piece] = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'chess', blk));
                const whi = `white-${piece}.png`;
                image.white[piece] = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'chess', whi));
            }
            images = image;
            return images;
        };

        function pickImage(piece) {
            let name;
            let color;
            switch (piece) {
                case 'p':
                    name = 'pawn';
                    color = 'black';
                    break;
                case 'n':
                    name = 'knight';
                    color = 'black';
                    break;
                case 'b':
                    name = 'bishop';
                    color = 'black';
                    break;
                case 'r':
                    name = 'rook';
                    color = 'black';
                    break;
                case 'q':
                    name = 'queen';
                    color = 'black';
                    break;
                case 'k':
                    name = 'king';
                    color = 'black';
                    break;
                case 'P':
                    name = 'pawn';
                    color = 'white';
                    break;
                case 'N':
                    name = 'knight';
                    color = 'white';
                    break;
                case 'B':
                    name = 'bishop';
                    color = 'white';
                    break;
                case 'R':
                    name = 'rook';
                    color = 'white';
                    break;
                case 'Q':
                    name = 'queen';
                    color = 'white';
                    break;
                case 'K':
                    name = 'king';
                    color = 'white';
                    break;
            }
            return { name, color };
        };

        function exportGame(game, blackTime, whiteTime, playerColor) {
            return {
                type: 'chess',
                fen: game.exportFEN(),
                blackTime: blackTime === Infinity ? -1 : blackTime,
                whiteTime: whiteTime === Infinity ? -1 : whiteTime,
                color: playerColor
            };
        };

        function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };
    } catch (err) {
        client.games.delete(channelId);
        client.isPlaying.delete(interaction.user.id);
        client.isPlaying.delete(opponent.id);
        throw err;
    };
};

exports.help = {
    name: "chess",
    description: "play chess with other people or against me! FEN string is supported!",
    usage: ["chess play `<@opponent> <timers duration>`", "chess play `<@opponent> <timers duration> [FEN]`", "chess `delete`"],
    example: ["chess play `@Bell 1`", "chess play `@Bell 1 rnbqkbnr/pppppppp/3P4/4P3/6P1/8/P1P1P1PP/RNBQKBNR`", "chess `delete`"]
};

exports.conf = {
    data: new SlashCommandBuilder()
        .setName(exports.help.name)
        .setDescription(exports.help.description)
        .addSubcommand(sub => sub
            .setName('play')
            .setDescription('start a new chess game')
            .addUserOption(option => option
                .setName('opponent')
                .setDescription('who would you want to be your opponent? you can also choose me!')
                .setRequired(true)
            )
            .addIntegerOption(option => option
                .setDescription('how long should the chess timers be set for (in minutes)? use 0 for infinite.')
                .setName('time')
                .setMaxValue(120)
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('fen-string')
                .setDescription('the FEN string that you want to use to start this game')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('delete')
            .setDescription('delete an already saved game')
        ),
    cooldown: 4,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};