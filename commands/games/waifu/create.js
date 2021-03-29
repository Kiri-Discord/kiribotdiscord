const { User, userExists } = require("../../../model/user");
const { Waifu } = require("../../../model/waifu");

const commandCreate = async (user, waifuname, prefix) => {
    const response = await userExists(user, prefix);
    try {
        const newUser = new User(user)
        const newWaifu = new Waifu({
            master: newUser._id,
        })

        newWaifu.name = waifuname

        await newUser.save();
        await newWaifu.save();

        response.query = `${user.at}, your waifu was created!`;
    } catch (e) {
        console.log(e)
        response.query = `${user.at}, i got an error :( please try again later!`
    }
    return response
}

module.exports = commandCreate
