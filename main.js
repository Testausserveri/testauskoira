const config = require('./config.json');
const discordClient = require('./src/discord.js');
const httpServer = require('./src/http.js');
const mailBot = require('./src/mail');  

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

