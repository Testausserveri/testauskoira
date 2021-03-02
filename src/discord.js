const config = require('../config.json');
const Discord = require('discord.js');
const discordClient = new Discord.Client();

discordClient.on('ready', () => {
    console.log(`[DC] Logged in as ${discordClient.user.tag}!`);
});

discordClient.login(config.discord.token);

module.exports = discordClient;