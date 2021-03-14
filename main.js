const config = require('./config.json');
const discordClient = require('./src/discord.js');
const httpServer = require('./src/http.js');
const mailBot = require('./src/mail');  

// Give roles automatically to new guild members
discordClient.on('guildMemberAdd', member => {
    member.roles.add(config.discord.autoRole);
});