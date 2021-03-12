const config = require('../config.json');
const Discord = require('discord.js');
const database = require('./database/database.js');
const discordClient = new Discord.Client();

discordClient.on('ready', () => {
    console.log(`[DC] Logged in as ${discordClient.user.tag}!`);
});

discordClient.on('message' , (msg) => {
    database.bumpMessagesPerDayStatistic(msg.author.id).catch(reason => {
        console.log(reason)
    })
});

discordClient.login(config.discord.token);

module.exports = discordClient;