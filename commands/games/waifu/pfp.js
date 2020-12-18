const { userExists } = require("../../../model/user")
const { Waifu } = require("../../../model/waifu")

const commandAvatar = async (user, query, prefix) => {
    const response = await userExists(user, prefix);
    if (!response.user) response.query = response.message; 
    const foundUser = response.user

    if (foundUser) {
        response.query = "yee haw"
        if (query.length > 2) {
            response.query = `${user.at}, your waifu was given a new avatar!`
            await Waifu.findOneAndUpdate({ 
                master: foundUser._id, 
            }, {
                image: query[2]
            })

        } else {
            response.query = `${user.at}, you need to give me your waifu image link!`
        }
    }

    return response
}

module.exports = commandAvatar