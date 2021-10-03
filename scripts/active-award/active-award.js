/**
 * Give role to the most active user of yesterday
 */

const Discord = require("discord.js")
const sharp = require("sharp")
const axios = require("axios")
const path = require("path")

const database = require("../../src/database/database.js")
const config = require("../../config.json")

const awardRole = "892768551591624745"

const createImage = (avatarUrl) => (new Promise(async (resolve) => {
    const avatarBuffer = (await axios({ url: avatarUrl, responseType: "arraybuffer" })).data

    sharp(path.join(__dirname, "./mask.png"))
        .extractChannel('red')
        .toBuffer()
        .then(alpha => sharp(avatarBuffer)
            .joinChannel(alpha)
            .toBuffer()
            .then(image => sharp(image)
                .composite([{input: path.join(__dirname, "./blackcomposite.png")}])
                .toBuffer()
                .then(output => resolve(output))
            ))
}))

const getMostActive = async (offsetDays) => {
    const [[data]] = await database.connection.execute('SELECT `userid`, `message_count` FROM `messages_day_stat` \
        WHERE `date` = subdate(current_date, ?) AND \
        `userid` NOT IN (\'464685299214319616\', \'285089672974172161\', \'639844207439118346\', \'812081823727222785\', \'815680099729801218\', \'857723888514629643\', \'798936760096653332\') \
            ORDER BY `message_count` DESC LIMIT 5', [parseInt(offsetDays)])
            return {...data}
        }

const discordClient = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL'] })
discordClient.login(config.discord.token)
const waitForDiscord = () => (new Promise((resolve) => {
    setInterval(() => {
        if (discordClient.readyTimestamp) resolve()
    }, 50)
}))
const updateRole = async (method, guild, userid) => {
    try {
        const member = await guild.members.fetch(userid)
        await member.roles[method](awardRole)
        console.log(`Updated role: ${method} to ${member.user.tag}`)

        return member
    } catch (e) {
        console.log(`Couldn't update role for ${userid}`, e.message)
        return false
    }
}

database.events.on("connected", async () => {
    console.log("Fetching the most active users from database")
    const previous = await getMostActive(2)
    const current = await getMostActive(1)
    console.log("Previous", previous)
    console.log("Current", current)

    console.log("Waiting for Discord")
    await waitForDiscord()
    const guild = await discordClient.guilds.fetch(config.discord.defaultGuild)
    console.log("Discord is ready", discordClient.user.tag)

    console.log("Updating roles")
    await updateRole("remove", guild, previous[0].userid)
    members = []
    members[0] = await updateRole("add", guild, current[0].userid)
    for (let m of current) {
        members.push(await guild.members.fetch(m));
    }

    if (!members[0]) {
        console.log("Couldn't get current member. Task failed.")
        process.exit(1)
    }

    console.log("Generating image")
    const avatarUrl = members[0].user.displayAvatarURL() + "?size=128"
    const image = await createImage(avatarUrl)

    console.log("Sending message")
    const channel = await discordClient.channels.fetch(config.discord.defaultChannel)
    await channel.send({files: [{
        attachment: image,
        name: "onnittelut.png"
    }]});

    const leaderboardEmbed = new Discord.MessageEmbed()
        .setColor("#ffd700")
        .setTitle("Päivän kultainen Testauskoira tulostaulukko:")
        .setDescription(`${members[0].user.username} vei kultaisen testauskoiran tänään, onnittelut!
            Tässä vielä top 5 -tulostaulukko eniten viestejä lähettäneistä:
            \n** 1. ${members[0].user.username}, ${current[0].userid} viestiä
            \n2. ${members[1].user.username}, ${current[1].userid} viestiä
            \n3. ${members[2].user.username}, ${current[2].userid} viestiä
            \n4. ${members[3].user.username}, ${current[3].userid} viestiä
            \n5. ${members[4].user.username}, ${current[4].userid} viestiä**`)

    await channel.send({ embeds: [leaderboardEmbed]});

    process.exit()
})
