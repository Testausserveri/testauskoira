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

const getRandomMember = async (offsetDays) => {
    const [data] = await database.connection.execute('SELECT `userid`, `message_count` FROM `messages_day_stat` \
        WHERE `date` = subdate(current_date, ?) AND \
        `userid` NOT IN (\'464685299214319616\', \'285089672974172161\', \'639844207439118346\', \'812081823727222785\', \'815680099729801218\', \'857723888514629643\', \'798936760096653332\') \
            ORDER BY RAND() LIMIT 1', [parseInt(offsetDays)])
            return [...data].map(item => ({...item}))
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
    console.log("Fetching a random user to receive the award")
    current = await getRandomMember(1)
    console.log("Current", current)

    console.log("Waiting for Discord")
    await waitForDiscord()
    const guild = await discordClient.guilds.fetch(config.discord.defaultGuild)
    console.log("Discord is ready", discordClient.user.tag)

    console.log("Fetching the previos awardee from discord");
    const therole = await guild.roles.fetch(awardRole);
    const previous = therole.members[0];
    if(!previous) {
        console.log("Couldn't get the previous awardee. Task failed.");
        process.exit(1);
    }
    if(previous.id == current.userid) {
        // Reroll
        current = await getRandomMember(1);
    }
    console.log("Previous", previous);
    console.log("Current", current);

    console.log("Updating roles")

    await updateRole("remove", guild, previous.id)
    member = await updateRole("add", guild, current.userid)

    if (!member) {
        console.log("Couldn't get current member. Task failed.")
        process.exit(1)
    }

    console.log("Generating image")
    const avatarUrl = member.user.displayAvatarURL() + "?size=128"
    const image = await createImage(avatarUrl)

    console.log("Sending message")
    const channel = await discordClient.channels.fetch(config.discord.defaultChannel)

    const attachment = new Discord.MessageAttachment(image, 'onnittelut.png');
    const leaderboardEmbed = new Discord.MessageEmbed()
        .setColor("#ffd700")
        .setTitle("Päivän Kultainen Testauskoira palkinnon saaja:")
        .attachFiles(attachment)
        .setThumbnail("attachment://onnittelut.png")
        .setDescription(`<@${current.userid}> vei kultaisen Testauskoiran tänään, onnittelut!`)

    await channel.send(leaderboardEmbed);

    process.exit()
})
