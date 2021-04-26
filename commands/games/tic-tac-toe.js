const utils = require('../../util/util');
const { verify } = require('../../util/util');

exports.help = {
	name: "tic-tac-toe",
	description: "challange a player to tic tac toe",
	usage: "tic-tac-toe <@mention>",
	example: "tic-tac-toe @kuru"
};
  
exports.conf = {
	aliases: ["ttt"],
    cooldown: 5,
    guildOnly: true,
    
	channelPerms: ["ADD_REACTIONS"]
};

exports.run = async (client, message, args) => {
    const current = client.games.get(message.channel.id);
    if (current) return message.inlineReply(current.prompt);
    const member = await getMemberfromMention(args[0], message.guild);
    if (!member) return message.inlineReply('you should mention a valid user to play with :(');
    const player_two = member.user;
    if (player_two.id == message.author.id) return message.inlineReply("you can't play against yourself!");
    if (player_two.id == client.user.id) return message.inlineReply("you can't play against me!");
    if (player_two.bot) return message.inlineReply("you can't play against bots!");
    if (utils.inGame.includes(message.author.id)) return message.inlineReply('you are already in a game. please finish that first.');
    if (utils.inGame.includes(player_two.id)) return message.inlineReply('that user is already in a game. try again in a minute.');

    const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:' ;
    await message.channel.send(`${player_two}, do you accept this challenge? \`y/n\``);
    const verification = await verify(message.channel, player_two);
    if (!verification) return message.channel.send(`looks like they declined... ${sedEmoji}`);

    client.games.set(message.channel.id, { prompt: `please wait until **${message.author.username}** and **${player_two.username}** finish playing tic-tac-toe :(` });
    utils.inGame.push(player_two.id, message.author.id);
    class Game {
        constructor(client, message, player_two) {
            this.player_two = player_two
            this.message = message;
            this.grid = [':one:', ':two:', ':three:', ':four:', ':five:', ':six:', ':seven:', ':eight:', ':nine:']
            this.ttt_grid()
            this.reactions = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']
            this.players_go = 0
            this.send_message = true
            this.playing_game = true
            this.ttt_message = false
            this.client = client
            this.run();
        }
    
        async run() {
            await this.eval_win()
            if (this.playing_game == true) {
                if (this.players_go % 2  == 0) {
                    if (this.send_message == true) {
                        let grid = await this.ttt_grid()
                        if (this.players_go == 0) {
                            this.ttt_message =  await this.message.channel.send('<@' + this.message.author.id + '> it is your turn\n' + grid)
                            for (let i in this.reactions) {
                                this.ttt_message.react(this.reactions[i])
                            }
                        }
                        else {
                            this.ttt_message.edit('<@' + this.message.author.id + '> it is your turn\n' + grid)
                        }
                    }
                    this.ttt_message.awaitReactions((reaction, user) => user.id == this.message.author.id && (reaction.emoji.name == '1️⃣' || reaction.emoji.name == '2️⃣' || reaction.emoji.name == '3️⃣' || reaction.emoji.name == '4️⃣' || reaction.emoji.name == '5️⃣' || reaction.emoji.name == '6️⃣' || reaction.emoji.name == '7️⃣' || reaction.emoji.name == '8️⃣' || reaction.emoji.name == '9️⃣'),
                    { max: 1, time: 3000000 }).then(async collected => {
                        this.reaction = collected.first().emoji.name
                        if (this.reaction == '1️⃣') this.user_input = 0
                        if (this.reaction == '2️⃣') this.user_input = 1
                        if (this.reaction == '3️⃣') this.user_input = 2
                        if (this.reaction == '4️⃣') this.user_input = 3
                        if (this.reaction == '5️⃣') this.user_input = 4
                        if (this.reaction == '6️⃣') this.user_input = 5
                        if (this.reaction == '7️⃣') this.user_input = 6
                        if (this.reaction == '8️⃣') this.user_input = 7
                        if (this.reaction == '9️⃣') this.user_input = 8
                        this.grid[this.user_input] = ':negative_squared_cross_mark:'
                        const userReactions = this.ttt_message.reactions.cache.filter(reaction => reaction.users.cache.has(this.message.author.id));
                        for (const reaction of userReactions.values()) {
                        await reaction.users.remove(this.message.author.id);
                        this.ttt_message.reactions.cache.get(this.reactions[this.user_input]).remove()
                        this.players_go++
                        this.send_message = true
                        this.run()
                    }
                    }
                    ).catch(() => {
                        this.ttt_message.edit('The game has timed out')
                        this.end_game(this.player_two, this.message)
                    })
                }
                if (this.players_go % 2  == 1) {
                    if (this.send_message == true) {
                        let grid = await this.ttt_grid()
                        this.ttt_message.edit('<@' + this.player_two.id + '> it is your turn\n' + grid)
                        this.ttt_message.awaitReactions((reaction, user) => user.id == this.player_two.id && (reaction.emoji.name == '1️⃣' || reaction.emoji.name == '2️⃣' || reaction.emoji.name == '3️⃣' || reaction.emoji.name == '4️⃣' || reaction.emoji.name == '5️⃣' || reaction.emoji.name == '6️⃣' || reaction.emoji.name == '7️⃣' || reaction.emoji.name == '8️⃣' || reaction.emoji.name == '9️⃣'),
                        { max: 1, time: 30000 }).then(async collected => {
                            this.reaction = collected.first().emoji.name
                            if (this.reaction == '1️⃣') this.user_input = 0
                            if (this.reaction == '2️⃣') this.user_input = 1
                            if (this.reaction == '3️⃣') this.user_input = 2
                            if (this.reaction == '4️⃣') this.user_input = 3
                            if (this.reaction == '5️⃣') this.user_input = 4
                            if (this.reaction == '6️⃣') this.user_input = 5
                            if (this.reaction == '7️⃣') this.user_input = 6
                            if (this.reaction == '8️⃣') this.user_input = 7
                            if (this.reaction == '9️⃣') this.user_input = 8
                            this.grid[this.user_input] = ':regional_indicator_o:'
                            const userReactions = this.ttt_message.reactions.cache.filter(reaction => reaction.users.cache.has(this.player_two.id));
                            for (const reaction of userReactions.values()) {
                            await reaction.users.remove(this.player_two.id);
                            this.ttt_message.reactions.cache.get(this.reactions[this.user_input]).remove()
                            this.players_go++
                            this.send_message = true
                            this.run()
                        }
                        }
                        ).catch(() => {
                            this.ttt_message.edit('the game has timed out lmao')
                            this.end_game(this.player_two, this.message)
                        })
                    }
                    }
            }
        }
        async ttt_grid() {
                return `${this.grid[0]}${this.grid[1]}${this.grid[2]}\n${this.grid[3]}${this.grid[4]}${this.grid[5]}\n${this.grid[6]}${this.grid[7]}${this.grid[8]}`
        }
        async eval_win() {
            const win_combinations = [
                [0, 1, 2],
                [3, 4, 5], 
                [6, 7, 8], 
                [0, 3, 6], 
                [1, 4, 7], 
                [2, 5, 8], 
                [0, 4, 8], 
                [2, 4, 6] 
            ]
            let step_one = -1
            while (step_one < 7) {
                step_one++
                if (this.grid[win_combinations[step_one][0]] == ':negative_squared_cross_mark:' && this.grid[win_combinations[step_one][1]] == ':negative_squared_cross_mark:' && this.grid[win_combinations[step_one][2]] == ':negative_squared_cross_mark:') {
                    let grid = await this.ttt_grid()
                    await this.ttt_message.edit('<@' + this.message.author.id + '> won!\n' + grid)
                    return this.end_game(this.player_two, this.message)
                } else if (this.grid[win_combinations[step_one][0]] == ':regional_indicator_o:' && this.grid[win_combinations[step_one][1]] == ':regional_indicator_o:' && this.grid[win_combinations[step_one][2]] == ':regional_indicator_o:') {
                    let grid = await this.ttt_grid()
                    await this.ttt_message.edit('<@' + this.player_two.id + '> won!\n' + grid)
                    return this.end_game(this.player_two, this.message)

                } else if (this.players_go == 9 && step_one == 7) {
                    let grid = await this.ttt_grid()
                    await this.ttt_message.edit('you drew!\n' + grid)
                    return this.end_game(this.player_two, this.message)
                }
            }
        }
        end_game(player_two, message) {
            utils.inGame = utils.inGame.filter(i => i != message.author.id);
            utils.inGame = utils.inGame.filter(i => i != player_two.id);
            this.client.games.delete(this.message.channel.id);
            this.playing_game = false
            this.ttt_message.reactions.removeAll()
            game = null                
            return;
        }
    }
    var game = new Game(client, message, player_two)
}


