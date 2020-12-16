const { calculateCooldown } = require('./cooldown');

const cooldownTimeMessage = (timer) => {

    const now = new Date()

    if (timer <= now) {
        return `:white_check_mark:`

    } else {
        const cooldown = calculateCooldown(now, timer)
        return "`" + cooldown.hours + "hours " + cooldown.minutes + "minutes " + cooldown.seconds + "seconds`"
    }


}

const youNeedAWaifu = (user, prefix) => {
    return user.at + `, you need to create a waifu to use this command. Use \`${prefix}wb create\` to create your waifu :D`
}

const fightSyntax = (user, prefix) => {
    return user.at + `, you need to mention a waifu owner! \`${prefix}wb fight @someone\``
}

module.exports = {
    cooldownTimeMessage,
    youNeedAWaifu,
    fightSyntax
}