const express = require('express');
const { Client, Collection, MessageEmbed } = require("discord.js");
const { embedURL } = require('../util/util');
const PokemonStore = require('../features/pokemon/pokemonstore');
const VerifyTimer = require('../features/redis/verify');
const app = express();
const ownGiveaway = require('../features/giveaway');

module.exports = class kiri extends Client {
        constructor(options) {
            super(options)
            this.nodes = require('../lavalinkNodes.json');
            this.vote = require('../model/vote');
            this.globalStorage = require('../model/global');
            this.gameStorage = require('../model/game');
            this.webapp = app;
            this.giveaways = null;
            this.queue = new Map();
            this.dbembeds = require('../model/embeds');
            this.commands = new Collection();
            this.cooldowns = require('../model/cooldown');
            this.inventory = require('../model/inventory');
            this.garden = require('../model/garden');
            this.helps = new Collection();
            this.customEmojis = new Collection();
            this.allNameCmds = [];
            this.allNameFeatures = [];
            this.allNameFeaturesSlash = [];
            this.guildsStorage = new Collection();
            this.aliases = new Collection();
            this.config = require('../config.json');
            this.recent = new Set();
            this.money = require('../model/currency');
            this.love = require('../model/love');
            this.dbguilds = require('../model/guild');
            this.leveling = require("../util/LevelingUtil.js");
            this.dbleveling = require("../model/leveling")
            this.dbverify = require("../model/verify")
            this.games = new Collection();
            this.pokemon = new PokemonStore();
            this.verifytimers = new VerifyTimer(this);
        };
        initGiveaway() {
                const tada = this.customEmojis.get('giveaway');
                this.giveaways = new ownGiveaway(this, {
                            hasGuildMembersIntent: true,
                            endedGiveawaysLifetime: 1209600000,
                            default: {
                                botsCanWin: false,
                                embedColor: '#ba6363',
                                embedColorEnd: '#67cc60',
                                reaction: tada.id,
                                winnerCount: 1,
                                messages: {
                                    winMessage: {
                                        content: `{winners}, you have won a giveaway by {this.hostedBy}!`,
                                        embed: new MessageEmbed()
                                            .setDescription(`There was **{this.winnerIds.length}** winner(s) for your giveaway **{this.prize}** (${embedURL(`jump to message`, '{this.messageURL}')})`)
                    .setFooter('if you want to reroll please do so now since all giveaway will be deleted in 14 days after they are finished') },
                    giveaway: `${tada} **GIVEAWAY** ${tada}`,
                    inviteToParticipate: `Enter the giveaway by reacting to ${tada}!`,
                    drawing: `Drawing: **{timestamp}**`,
                    embedFooter: `started in:`,
                    giveawayEnded: `${tada} **GIVEAWAY ENDED** ${tada}`,
                    noWinner: `the giveaway above was ended because there was no enough participant :pensive:`,
                    units: {
                        pluralS: true
                    },
                },
                lastChance: {
                    enabled: true,
                    content: ':warning: LAST CHANCE TO ENTER :warning:'
                }
            }
        });
    }
}