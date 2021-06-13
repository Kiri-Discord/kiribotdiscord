const { GiveawaysManager } = require('discord-giveaways');
const { MessageEmbed } = require('discord.js');
const { embedURL } = require('../util/util');
const giveawayModel = require('../model/giveaways');

module.exports = {
    init: (client) => {
        const GiveawayManagerWithOwnDatabase = class extends GiveawaysManager {
            async getAllGiveaways() {
              return await giveawayModel.find({});
            };
          
            async saveGiveaway(messageID, giveawayData) {
              await giveawayModel.create(giveawayData);
              return true;
            };
          
            async editGiveaway(messageID, giveawayData) {
              await giveawayModel.findOneAndUpdate({ messageID: messageID }, giveawayData).exec();
              return true;
            };
            async deleteGiveaway(messageID) {
              await giveawayModel.findOneAndDelete({ messageID: messageID }).exec();
              return true;
            }
        };
        const tada = client.customEmojis.get('giveaway');
        const manager = new GiveawayManagerWithOwnDatabase(client, {
          updateCountdownEvery: 10000,
          hasGuildMembersIntent: true,
          endedGiveawaysLifetime: 1209600000,
          default: {
            botsCanWin: false,
            embedColor: '#ba6363',
            embedColorEnd: '#67cc60',
            reaction: tada.id,
            winnerCount: 1,
            messages: {
              giveaway: `${tada} **GIVEAWAY** ${tada}`,
              inviteToParticipate: `Enter the giveaway by reacting to ${tada}!`,
              timeRemaining: `Remaining time: **{duration}**`,
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
        manager.on('giveawayEnded', async (giveaway, winners) => {
          const embed = new MessageEmbed()
          .setDescription(`There was **${giveaway.winnerIDs.length}** winner(s) for your giveaway **${giveaway.prize}** (${embedURL(`jump to message`, giveaway.messageURL)})`)
          .setFooter('if you want to reroll please do so now since all giveaway will be deleted in 14 days after they are finished')
          giveaway.channel.send(giveaway.hostedBy, embed);
        });
        client.giveaways = manager;
        console.log(`[DISCORD] Giveaway module loaded`);
    }
}