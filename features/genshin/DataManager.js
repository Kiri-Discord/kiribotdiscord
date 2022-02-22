const { exists, unlink, move, writeFile, existsSync, readFileSync } = require("fs-extra")
const { join } = require("path")


const artifactsData = require("../../assets/genshin/gamedata/artifacts.json")
const artifactsMainStats = require("../../assets/genshin/gamedata/artifact_main_stats.json")
const artifactsMainLevels = require("../../assets/genshin/gamedata/artifact_main_levels.json")

const characterData = require("../../assets/genshin/gamedata/characters.json")
const characterCurves = require("../../assets/genshin/gamedata/character_curves.json")
const characterLevels = require("../../assets/genshin/gamedata/character_levels.json")

const paimonShop = require("../../assets/genshin/gamedata/paimon_shop.json");

const materialData = require('../../assets/genshin/gamedata/materials.json')

const enemyData = require("../../assets/genshin/gamedata/enemies.json")

const costTemplates = require("../../assets/genshin/gamedata/cost_templates.json")

const weaponData = require("../../assets/genshin/gamedata/weapons.json")
const weaponCurves = require("../../assets/genshin/gamedata/weapon_curves.json")
const weaponLevels = require("../../assets/genshin/gamedata/weapon_levels.json")

const abyssFloors = require("../../assets/genshin/gamedata/abyss_floors.json")
const abyssSchedule = require("../../assets/genshin/gamedata/abyss_schedule.json")

const emojiData = require("../../assets/genshin/emojis.json")
const eventData = require("../../assets/genshin/events.json");
const guideData = require("../../assets/genshin/guides.json");

const { findFuzzy } = require('./utils')
const existsP = async (path) => new Promise((resolve) => exists(path, resolve));

const path = join(__dirname, '..', '..', 'assets', 'genshin')
const store = join(path, "store.json")
const oldstore = join(path, "store.json.old")
const defaultStore = {};

module.exports = class DataManager {
    constructor() {
        this.store = defaultStore
        this.max_resin = 160
        this.minutes_per_resin = 8;
        this.costTemplates = costTemplates;
    
        this.artifacts = artifactsData;
        this.artifactMainStats = artifactsMainStats;
        this.artifactMainLevels = artifactsMainLevels;
        this.enemies = enemyData;

        this.characterLevels = characterLevels;
        this.paimonsBargains = paimonShop;
    
        this.characters = characterData;
        this.guides = guideData;
        this.weapons = weaponData;
        this.weaponLevels = weaponLevels;
        this.materials = materialData;
        this.abyssSchedule = abyssSchedule;
        this.abyssFloors= abyssFloors;
    
        this.events= eventData
        this.emojis = emojiData;
        try {
            if (existsSync(store))
                try {
                    this.store = Object.assign({}, defaultStore, JSON.parse(readFileSync(store).toString()))
                    return
                } catch (error) {
                    logger.error("Failed to read/parse store.json")
                }

            if (existsSync(oldstore))
                try {
                    this.store = Object.assign({}, defaultStore, JSON.parse(readFileSync(oldstore).toString()))
                    logger.error("Restored from old store!")
                    return
                } catch (error) {
                    logger.error("Failed to read/parse store.json.old")
                }

        } catch (error) {
            logger.error("Failed to open store.json", error)
        }
    };
    lastStore = undefined;
    saveStore() {
        if (this.lastStore == undefined) {
            this.lastStore = setTimeout(async () => {
                try {
                    if (await existsP(oldstore))
                        await unlink(oldstore)

                    if (await existsP(store))
                        await move(store, oldstore)

                    await writeFile(store, JSON.stringify(this.store, undefined, 4))
                } catch (error) {
                    logger.error("Failed to save", error)
                }
                this.lastStore = undefined
            }, 1000)
        }
    };
    emoji(type, includeName = false) {
        if (!type)
            return type ?? "Unknown"

        const found = this.emojis[type];
        if (!found) return type;
        if (!found && includeName == false) return "";
        if (includeName) return `${found} ${type}`
        return found
    }
    getCharacters() {
        return Object.values(this.characters)
    }
    getReleasedCharacters() {
        return Object.values(this.characters).filter(char =>
            this.isFullCharacter(char)
        )
    }
    isFullCharacter(char) {
        return typeof char.releasedOn == "string";
    }
    getAbyssSchedules() {
        return Object.values(this.abyssSchedule)
    }

    getGuides(type, name) {
        return this.guides
            .flatMap(guide => guide.pages
                .filter(page => page.links?.[type]?.includes(name))
                .map(page => ({
                    guide, page
                }))
            )
    }
    
    getEnemyByName(name) {
        const targetNames = Object.keys(this.enemies)
        const target = findFuzzy(targetNames, name)
        if (target)
            return this.enemies[target]
        return undefined
    }
    getMaterialByName(name) {
        const targetNames = Object.keys(this.materials)
        const target = findFuzzy(targetNames, name)
        if (target)
            return this.materials[target]
        return undefined
    }
    getCostsFromTemplate(costTemplate) {
        const template = this.costTemplates[costTemplate.template]
        return template.map(c => ({
            mora: c.mora,
            items: c.items.map(i => ({
                count: i.count,
                name:  i.name.replace(/<(.*?)>/g, (_, x) => costTemplate.mapping[x])
            }))
        }))
    }
    isInCosts(template, name) {
        const costs = Array.isArray(template) ? template : this.getCostsFromTemplate(template)
        for (const c of costs)
            if (c.items.some(i => i.name == name))
                return true
        return false
    }
    getArtifactByName(name) {
        const targetNames = Object.keys(this.artifacts)
        const target = findFuzzy(targetNames, name)

        if (target)
            return this.artifacts[target]

        return undefined
    }
    getCharacterByName(name) {
        const targetNames = this.getCharacters().map(c => c.name)
        const target = findFuzzy(targetNames, name)

        if (target)
            return this.characters[target]
        return undefined
    }
    getWeaponByName(name) {
        const targetNames = Object.keys(this.weapons)
        const target = findFuzzy(targetNames, name)

        if (target)
            return this.weapons[target]

        return undefined
    }
    getCharStatsAt(char, level, ascension) {
        const stats = {
            "Base HP": char.baseStats.hpBase,
            "Base ATK": char.baseStats.attackBase,
            "Base DEF": char.baseStats.defenseBase,
            "CRIT Rate": char.baseStats.criticalBase,
            "CRIT DMG": char.baseStats.criticalDmgBase,
        }

        for (const curve of char.curves) {
            stats[curve.name] = stats[curve.name] * characterCurves[curve.curve][level - 1]
        }

        const asc = char.ascensions.find(a => a.level == ascension)

        for (const statup of asc?.statsUp ?? []) {
            stats[statup.stat] = (stats[statup.stat] ?? 0) + statup.value
        }

        return stats
    }
    getReleasedCharacterByName(name) {
        const targetNames = this.getReleasedCharacters().map(c => c.name)
        const target = findFuzzy(targetNames, name)

        if (target)
            return this.characters[target]

        return undefined
    }
    getWeaponStatsAt(weapon, level, ascension) {
        const stats = {}

        for (const curve of weapon.weaponCurve ?? []) {
            stats[curve.stat] = curve.init * weaponCurves[curve.curve][level - 1]
        }

        const asc = (weapon.ascensions ?? []).find(a => a.level == ascension)

        for (const statup of asc?.statsUp ?? []) {
            stats[statup.stat] = (stats[statup.stat] ?? 0) + statup.value
        };
        return stats
    }
    stat(name, value) {
        switch (name) {
            case "HP%":
            case "DEF%":
            case "ATK%":
            case "Anemo DMG Bonus":
            case "Cryo DMG Bonus":
            case "Dendro DMG Bonus":
            case "Electro DMG Bonus":
            case "Geo DMG Bonus":
            case "Hydro DMG Bonus":
            case "Physical DMG Bonus":
            case "Pyro DMG Bonus":
            case "Healing Bonus":
            case "Energy Recharge":
            case "CRIT Rate":
            case "CRIT DMG":
                return (value * 100).toFixed(1) + "%"

            case "HP":
            case "ATK":
            case "DEF":
            case "Base HP":
            case "Base ATK":
            case "Base DEF":
            case "Elemental Mastery":
                return value.toFixed(0)

            default:
                return value < 2 ? ((value * 100).toFixed(1) + "%") : value.toFixed(0)
        }
    };
    
    statName(name) {
        return name.replace("Base ", "").replace("CRIT ", "C")
    }
    getCosts(cost) {
        let items = cost.items
        if (cost.mora)
            items = [{
                name: "Mora",
                count: cost.mora
            }, ...items]
        return this.getItemCosts(items)
    }
    getItemCosts(items) {
        return items.map(i => `**${i.count}**x *${this.emoji(i.name, true)}*`).join("\n")
    }
}







