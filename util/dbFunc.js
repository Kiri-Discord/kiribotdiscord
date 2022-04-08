const hugSchema = require('../model/hug');
const punchSchema = require('../model/punch');
const slapSchema = require('../model/slap');
const patSchema = require('../model/pat');
const cuddleSchema = require('../model/cuddle');
const kissSchema = require('../model/kiss');
const musicSchema = require('../model/music');

module.exports = class dbFunc {
    constructor(passthrough) {
		Object.defineProperty(this, 'passthrough', { value: passthrough });
	}
    async purgeNonExistingGuilds(idsArray) {
        if (!idsArray) return;
        try {
            await this.passthrough.db.guilds.findOneAndDelete({
                guildID: { $nin: idsArray }
            });
            await this.passthrough.db.embeds.deleteMany({
                guildID: { $nin: idsArray }
            });
            
            await this.passthrough.db.leveling.deleteMany({
                guildId: { $nin: idsArray }
            });
            await this.passthrough.db.cooldowns.deleteMany({
                guildId: { $nin: idsArray }
            });
        
            await this.passthrough.db.garden.deleteMany({
                guildId: id
            });
            await this.passthrough.db.levelingRewards.deleteMany({
                guildId: { $nin: idsArray }
            });
    
            await this.passthrough.db.inventory.deleteMany({
                guildId: { $nin: idsArray }
            });
    
            await this.passthrough.db.money.deleteMany({
                guildId: { $nin: idsArray }
            });
        
            await this.passthrough.db.love.deleteMany({
                guildId: { $nin: idsArray }
            });
        
            await this.passthrough.db.gameStorage.deleteMany({
                guildId: { $nin: idsArray }
            });
        
            await hugSchema.deleteMany({
                guildId: { $nin: idsArray }
            });
        
            await punchSchema.deleteMany({
                guildId: { $nin: idsArray }
            });
        
            await musicSchema.deleteMany({
                guildId: { $nin: idsArray }
            });
        
            await slapSchema.deleteMany({
                guildId: { $nin: idsArray }
            });
        
            await cuddleSchema.deleteMany({
                guildId: { $nin: idsArray }
            });
        
            await kissSchema.deleteMany({
                guildId: { $nin: idsArray }
            });
        
            await patSchema.deleteMany({
                guildId: { $nin: idsArray }
            });
            return true;
        } catch {
            return null;
        }
    };
};