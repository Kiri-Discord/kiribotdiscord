const jsChess = require('js-chess-engine');//wtf
const { createCanvas, loadImage } = require('canvas');
const { msToHMS } = require('../../util/util');
const validateFEN = require('fen-validator').default;
const path = require('path');
const { stripIndents } = require('common-tags');
const { buttonVerify, reactIfAble } = require('../../util/util');
const { centerImagePart } = require('../../util/canvas');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const turnRegex = /^(?:((?:[A-H][1-8])|(?:[PKRQBN]))?([A-H]|X)?([A-H][1-8])(?:=([QRNB]))?)|(?:0-0(?:-0)?)$/;
const pieces = ['pawn', 'rook', 'knight', 'king', 'queen', 'bishop'];
const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

exports.run = async(client, message, args, prefix, cmd) => {
    if (args[0]) {
        if (args[0].toLowerCase() === 'delete') {
            const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:';
            const data = await client.gameStorage.findOne({
                guildId: message.guild.id,
                userId: message.author.id
            });
            if (data) {
                const foundGameSave = data.storage.chess;
                if (!foundGameSave) return message.reply(`you don\'t have any saved chess game ${sedEmoji}`);
                await client.gameStorage.findOneAndDelete({
                    guildId: message.guild.id,
                    userId: message.author.id
                });
                return message.reply(`your saved game has been deleted ${sedEmoji}`);
            } else {
                return message.reply(`you don\'t have any saved chess game ${sedEmoji}`);
            }
        };
    };
    const current = client.games.get(message.channel.id);
    if (current) return message.reply(current.prompt);
    const member = client.utils.parseMember(message, args[0])
    if (!member) return message.reply("who do you want to play with? tag me to play with me if no one is arround :pensive:");
    const opponent = member.user;
    if (opponent.id === message.author.id) return message.reply("you can't play with yourself!");
    if (!args[1] || isNaN(args[1]) || args[1] < 0 || args[1] > 120) return message.reply({
        embeds: [{
            description: `how long should the chess timers be set for (in minutes)? use 0 for infinite. pick a duration between 0 and 120 by using \`${prefix}chess <@opponent> <time>\`!`
        }]
    });
    let time = parseInt(args[1]);
    let fen = args.slice(2).join(' ');
    if (fen) {
        const valid = validateFEN(fen);
        if (!valid) return message.reply("invalid FEN for the start board :pensive: try it again!");
    };
    if (client.isPlaying.get(message.author.id)) return message.reply('you are already in a game. please finish that first.');
    client.isPlaying.set(message.author.id, true);
    client.games.set(message.channel.id, { prompt: `please wait until **${message.author.username}** and **${opponent.username}** finish their chess game!` });
    try {
        if (!opponent.bot) {
            if (client.isPlaying.get(opponent.id)) {
                client.isPlaying.delete(message.author.id);
                client.games.delete(message.channel.id);
                return message.reply('that user is already in a game. try again in a minute.');
            };
            const verification = await buttonVerify(message.channel, opponent, `${opponent}, do you accept this challenge?`);
            if (!verification) {
                client.isPlaying.delete(message.author.id);
                client.games.delete(message.channel.id);
                return message.channel.send(`looks like they declined..`);
            };
            client.isPlaying.set(opponent.id, true);
        };
        let images = null;
        if (!images) await loadImages();
        let gameStorage = client.gameStorage;
        let resumeGame = await gameStorage.findOne({
            guildId: message.guild.id,
            userId: message.author.id
        });
        if (!resumeGame) resumeGame = new gameStorage({
            guildId: message.guild.id,
            userId: message.author.id
        });
        let game;
        let whiteTime = time === 0 ? Infinity : time * 60000;
        let blackTime = time === 0 ? Infinity : time * 60000;
        let whitePlayer = message.author;
        let blackPlayer = opponent;
        let foundGameSave = resumeGame.storage.chess;
        if (foundGameSave) {
            const verification = await buttonVerify(message.channel, message.author, stripIndents `
            you already have a saved game, do you want to resume it? \`y/n\`

            *this will delete your currently saved game*
            `);
            if (verification) {
                try {
                    const data = foundGameSave;
                    game = new jsChess.Game(data.fen);
                    whiteTime = data.whiteTime === -1 ? Infinity : data.whiteTime;
                    blackTime = data.blackTime === -1 ? Infinity : data.blackTime;
                    whitePlayer = data.color === 'white' ? message.author : opponent;
                    blackPlayer = data.color === 'black' ? message.author : opponent;
                    await client.gameStorage.findOneAndDelete({
                        guildId: message.guild.id,
                        userId: message.author.id
                    });
                } catch {
                    client.isPlaying.delete(message.author.id);
                    client.isPlaying.delete(opponent.id);
                    client.games.delete(message.channel.id);
                    await client.gameStorage.findOneAndDelete({
                        guildId: message.guild.id,
                        userId: message.author.id
                    });
                    return message.reply(`there was an error while reading your saved game... can you try again later? ${sedEmoji}`);
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
                    .setTitle(`${message.author.username} vs ${opponent.username}`)
                    .setFooter({text: `time remaining: ${displayTime} (max 10 minutes per turn)`})
                    .setColor('#34e363')
                    .setImage(`attachment://chess.png`)
                await message.channel.send({
                    content: `**${user.username}**, what move do you want to make? (ex. A1A2 or NC3)?\n_you are ${gameState.check ? '**in check!**' : 'not in check.'}_`,
                    embeds: [GameEmbed],
                    files: [new MessageAttachment(displayBoard(gameState, prevPieces), 'chess.png')]
                })
                prevPieces = Object.assign({}, game.exportJson().pieces);
                const moves = game.moves();
                const pickFilter = res => {
                    if (![message.author.id, opponent.id].includes(res.author.id)) return false;
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
                const turn = await message.channel.awaitMessages({
                    filter: pickFilter,
                    max: 1,
                    time: Math.min(userTime, 600000)
                });
                if (!turn.size) {
                    const timeTaken = new Date() - now;
                    client.games.delete(message.channel.id);
                    client.isPlaying.delete(message.author.id);
                    client.isPlaying.delete(opponent.id);
                    if (userTime - timeTaken <= 0) {
                        return message.channel.send(`${user.id === message.author.id ? opponent : message.author} wins from timeout!`);
                    } else {
                        return message.channel.send(`the game was ended, **${user.username}**! you cannot take more than 10 minutes.`);
                    };
                };
                if (turn.first().content.toLowerCase() === 'end') break;
                if (turn.first().content.toLowerCase() === 'save') {
                    const { author } = turn.first();
                    let previousGameData = await gameStorage.findOne({
                        guildId: message.guild.id,
                        userId: message.author.id
                    });
                    if (!previousGameData) previousGameData = new gameStorage({
                        guildId: message.guild.id,
                        userId: message.author.id
                    });
                    const alreadySaved = previousGameData.storage.chess;
                    if (alreadySaved) {
                        const verification = await buttonVerify(message.channel, author, 'you already have a saved game, do you want to overwrite it?');
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
        client.isPlaying.delete(message.author.id);
        client.isPlaying.delete(opponent.id);
        client.games.delete(message.channel.id);
        if (saved) {
            return message.channel.send(stripIndents `
            game was saved! use \`${prefix}${cmd} @${opponent.tag} ${time}\` to resume anytime!
            the same opponent is not required to resume the game :)

            *if you want to delete your saved game, use \`${prefix}${cmd} delete\`*
            `);
        }
        const gameState = game.exportJson();
        if (gameState.halfMove > 50) return message.channel.send('due to the 50 moves rule, this game is a draw.');
        if (!gameState.isFinished) return message.channel.send('game was ended due to forfeit :pensive:');
        if (!gameState.checkMate && gameState.isFinished) {
            const staleEmbed = new MessageEmbed()
                .setTitle(`this game is a draw!`)
                .setColor('#34e363')
                .setImage(`attachment://chess.png`)
            return message.channel.send({
                content: 'stalemate!',
                files: [new MessageAttachment(displayBoard(gameState, prevPieces), 'chess.png')],
                embeds: [staleEmbed]
            });
        }
        const winner = gameState.turn === 'black' ? whitePlayer : blackPlayer;
        const EndEmbed = new MessageEmbed()
            .setTitle(`${winner.username} won!`)
            .setColor('#34e363')
            .setImage(`attachment://chess.png`);
        const lost = winner.id === message.author.id ? opponent : message.author;
        if (!lost.bot) {
            await client.money.findOneAndUpdate({
                guildId: message.guild.id,
                userId: lost.id
            }, {
                guildId: message.guild.id,
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
            const storageAfter = await client.money.findOneAndUpdate({
                guildId: message.guild.id,
                userId: winner.id
            }, {
                guildId: message.guild.id,
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
        return message.channel.send({
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
        client.isPlaying.delete(message.author.id);
        client.isPlaying.delete(opponent.id);
        client.games.delete(message.channel.id);
        throw err;
    };
};

exports.help = {
    name: "chess",
    description: "play chess with other people or against me! [FEN string](http://www.netreal.de/Forsyth-Edwards-Notation/index.php) is supported!",
    usage: ["chess `<@opponent> <timers duration>`", "chess `<@opponent> <timers duration> [FEN]`", "chess `delete`"],
    example: ["chess `@Bell 1`", "chess `@Bell 1 rnbqkbnr/pppppppp/3P4/4P3/6P1/8/P1P1P1PP/RNBQKBNR`", "chess `delete`"]
};

exports.conf = {
    aliases: ["chess-game", "play-chess"],
    cooldown: 4,
    guildOnly: true,
    channelPerms: ["EMBED_LINKS"]
};