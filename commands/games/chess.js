const jsChess = require('js-chess-engine');
const { createCanvas, loadImage } = require('canvas');
const moment = require('moment');
const validateFEN = require('fen-validator').default;
const path = require('path');
const { stripIndents } = require('common-tags');
const { verify, reactIfAble } = require('../../util/util');
const { centerImagePart } = require('../../util/canvas');
const { MessageEmbed } = require('discord.js');
const turnRegex = /^(?:((?:[A-H][1-8])|(?:[PKRQBN]))?([A-H]|X)?([A-H][1-8])(?:=([QRNB]))?)|(?:0-0(?:-0)?)$/;
const pieces = ['pawn', 'rook', 'knight', 'king', 'queen', 'bishop'];
const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

exports.run = async(client, message, args, prefix, cmd) => {
    const current = client.games.get(message.channel.id);
    if (current) return message.inlineReply(current.prompt);
    const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:';
    if (args[0]) {
        if (args[0].toLowerCase() === 'delete') {
            const data = await client.gameStorage.findOne({
                guildId: message.guild.id,
                userId: message.author.id
            });
            if (data) {
                const foundGameSave = data.storage.find(storage => storage.type === 'chess');
                if (!foundGameSave) return message.inlineReply(`you don\'t have any saved chess game ${sedEmoji}`);
                data.storage.splice(data.storage.indexOf(x => x.type === 'chess'), 1);
                await data.save();
                return message.inlineReply(`your saved game has been deleted ${sedEmoji}`);
            } else {
                return message.inlineReply(`you don\'t have any saved chess game ${sedEmoji}`);
            }
        };
    };
    const member = await getMemberfromMention(args[0], message.guild);
    if (!member) return message.inlineReply("who do you want to play with? tag me to play with me if no one is arround :pensive:");
    const opponent = member.user;
    if (opponent.id === message.author.id) return message.inlineReply("you can't play with yourself!");
    if (opponent.bot && opponent.id !== client.user.id) return message.inlineReply("those bot are busy doing their jobs anyway. wanna play with me instead?");
    if (!args[1] || isNaN(args[1]) || args[1] < 0 || args[1] > 120) return message.inlineReply(`how long should the chess timers be set for (in minutes)? use 0 for infinite. pick a duration between 0 and 120 by using \`${prefix}chess <@opponent> <time>\`!`);
    let time = parseInt(args[1]);
    let fen = args.slice(2).join(' ');
    if (fen) {
        const valid = validateFEN(fen);
        if (!valid) return message.inlineReply("invalid FEN for the start board :pensive: try it again!");
    }
    client.games.set(message.channel.id, { prompt: `please wait until **${message.author.username}** and **${opponent.username}** finish playing chess :(` });
    let images = null;
    if (!images) await loadImages();
    try {
        if (!opponent.bot) {
            await message.channel.send(`${opponent}, do you accept this challenge? \`y/n\``);
            const verification = await verify(message.channel, opponent);
            if (!verification) {
                client.games.delete(message.channel.id);
                return message.channel.send(`looks like they declined... ${sedEmoji}`);
            }
        };
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
            await message.channel.send(stripIndents `
            you already have a saved game, do you want to resume it? \`y/n\`

            *this will delete your currently saved game*
            `);
            const verification = await verify(message.channel, message.author);
            if (verification) {
                try {
                    const data = foundGameSave;
                    game = new jsChess.Game(data.fen);
                    whiteTime = data.whiteTime === -1 ? Infinity : data.whiteTime;
                    blackTime = data.blackTime === -1 ? Infinity : data.blackTime;
                    whitePlayer = data.color === 'white' ? message.author : opponent;
                    blackPlayer = data.color === 'black' ? message.author : opponent;
                    resumeGame.storage.chess = undefined;
                    await resumeGame.save();
                } catch {
                    client.games.delete(message.channel.id);
                    resumeGame.storage.chess = undefined;
                    await resumeGame.save();
                    return message.inlineReply(`there was an error while reading your saved game... try again please ${sedEmoji}`);
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
                const displayTime = userTime === Infinity ? 'infinite' : moment.duration(userTime).format();
                const GameEmbed = new MessageEmbed()
                    .setDescription(stripIndents `
                type \`end\` to forfeit.

                save your game by typing \`save\`
                can't think of a move? use \`help\` *coward*
                `)
                    .setTitle(`${message.author.username} vs ${opponent.username}`)
                    .setFooter(`time remaining: ${displayTime} (max 10 minutes per turn)`)
                    .setColor('#34e363')
                    .attachFiles({ attachment: displayBoard(gameState, prevPieces), name: 'chess.png' })
                    .setImage(`attachment://chess.png`)
                await message.channel.send(`**${user.username}**, what move do you want to make? (ex. A1A2 or NC3)?\n_you are ${gameState.check ? '**in check!**' : 'not in check.'}_`, GameEmbed);
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
                    }
                    return true;
                };
                const now = new Date();
                const turn = await message.channel.awaitMessages(pickFilter, {
                    max: 1,
                    time: Math.min(userTime, 600000)
                });
                if (!turn.size) {
                    const timeTaken = new Date() - now;
                    client.games.delete(message.channel.id);
                    if (userTime - timeTaken <= 0) {
                        return message.channel.send(`${user.id === message.author.id ? opponent : message.author} wins from timeout!`);
                    } else {
                        return message.channel.send(`the game was ended, **${user.username}**! you cannot take more than 10 minutes.`);
                    }
                };
                if (turn.first().content.toLowerCase() === 'end') break;
                if (turn.first().content.toLowerCase() === 'save') {
                    const { author } = turn.first();
                    const alreadySaved = resumeGame.storage.chess;
                    if (alreadySaved) {
                        await message.channel.send('you already have a saved game, do you want to overwrite it? \`y/n\`');
                        const verification = await verify(message.channel, author);
                        if (!verification) continue;
                    };
                    resumeGame.storage.chess = undefined;
                    if (gameState.turn === 'black') blackTime -= new Date() - now;
                    if (gameState.turn === 'white') whiteTime -= new Date() - now;
                    resumeGame.storage.chess = (exportGame(
                        game,
                        blackTime,
                        whiteTime,
                        whitePlayer.id === author.id ? 'white' : 'black'
                    ))
                    await resumeGame.save();
                    saved = true;
                    break;
                }
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
                }
                const timeTaken = new Date() - now;
                if (gameState.turn === 'black') blackTime -= timeTaken - 5000;
                if (gameState.turn === 'white') whiteTime -= timeTaken - 5000;
            }
        }
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
            return message.channel.send('stalemate! this game is a draw!', {
                files: [{ attachment: displayBoard(gameState, prevPieces), name: 'chess.png' }]
            });
        }
        const winner = gameState.turn === 'black' ? whitePlayer : blackPlayer;
        const EndEmbed = new MessageEmbed()
            .setTitle(`${winner.username} won!`)
            .setColor('#34e363')
            .attachFiles({ attachment: displayBoard(gameState, prevPieces), name: 'chess.png' })
            .setImage(`attachment://chess.png`)
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
                },
            }, {
                upsert: true,
                new: true,
            });
            EndEmbed
                .setDescription(`⏣ __${amount}__ token was placed in your wallet as a reward!`)
                .setFooter(`your current balance: ${storageAfter.balance} token`)
        }
        return message.channel.send(`checkmate! congratulations, **${winner.username}**!`, EndEmbed);
    } catch (err) {
        client.games.delete(message.channel.id);
        throw err;
    }

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
        }
        if (move[0] === '0-0-0') {
            if (gameState.turn === 'white') {
                if (gameState.castling.whiteLong) return ['E1', 'C1'];
                return null;
            } else if (gameState.turn === 'black') {
                if (gameState.castling.blackLong) return ['E8', 'C8'];
                return null;
            }
        }
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
    }

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
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