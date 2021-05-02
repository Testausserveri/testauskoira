const config = require('../config.json');
const Discord = require('discord.js');
const database = require('./database/database.js');
const discordClient = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

discordClient.on('ready', () => {
    console.log(`[DC] Logged in as ${discordClient.user.tag}!`);
});

// Give roles automatically to new guild members
discordClient.on('guildMemberAdd', member => {
    member.roles.add(config.discord.autoRole);
});
discordClient.on('messageReactionAdd', (reaction, user) => {
    if (reaction.message.id == config.discord.karhu.msgid) {
        reaction.message.guild.members.fetch(user.id).then(member => {
            member.roles.add(config.discord.karhu.roleid).catch(console.error);
        })
    }
});

discordClient.on('message' , (msg) => {
    database.bumpMessagesPerDayStatistic(msg.author.id).catch(reason => {
        console.log(reason)
    })
});

discordClient.login(config.discord.token);

module.exports = discordClient;