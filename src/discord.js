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
discordClient.on('messageReactionAdd', async (reaction, user) => {
    const role = config.discord.roleSelfService.find(r => r.message == reaction.message.id && r.reaction == ( reaction.emoji.id || reaction.emoji.name ));
    if (!role) return;

    const member = await reaction.message.guild.members.fetch(user.id);
    member.roles.add(role.role).catch(console.error);

    console.log(`[DC] Added role ${role.description} to ${user.tag}`)
});

discordClient.on('message' , (msg) => {
    database.bumpMessagesPerDayStatistic(msg.author.id).catch(reason => {
        console.log(reason)
    })
});

discordClient.login(config.discord.token);

module.exports = discordClient;