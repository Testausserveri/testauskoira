const config = require('../config.json');
const Discord = require('discord.js');
const database = require('./database/database.js');

const deleteIfHasBannedContent = (msg) => {
	if (/\S*\.trimpsuz\.xyz/i.test(msg.content)) {
		msg.delete({timeout: 1000});
	}
}

function initBot(){
    const discordClientInternal = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

    discordClientInternal.once('ready', () => {
        console.log(`[DC] Logged in as ${discordClientInternal.user.tag}!`);
    });

    // Give roles automatically to new guild members
    discordClientInternal.on('guildMemberAdd', member => {
        member.roles.add(config.discord.autoRole);
    });
    discordClientInternal.on('messageReactionAdd', async (reaction, user) => {
        const role = config.discord.roleSelfService.find(r => r.message == reaction.message.id && r.reaction == ( reaction.emoji.id || reaction.emoji.name ));
        if (!role) return;

        const member = await reaction.message.guild.members.fetch(user.id);
        member.roles.add(role.role).catch(console.error);

        console.log(`[DC] Added role ${role.description} to ${user.tag}`)
    });

    discordClientInternal.on('message' , (msg) => {
        database.bumpMessagesPerDayStatistic(msg.author.id).catch(reason => {
            console.log(reason)
        })
        if (msg.content.toLowerCase().startsWith("!github")) {
            msg.channel.send('Linkki github organisaatioon:\n<https://koira.testausserveri.fi/github/join>');
        }
        deleteIfHasBannedContent(msg);
    });

	discordClientInternal.on('messageUpdate', (_, msg) => {
		deleteIfHasBannedContent(msg);
	})

    discordClientInternal.once("disconnect", () => {
        console.log("[DC] Disconnected.")
        setTimeout(() => initBot(), 1000) // Restart after a second
    })

    discordClientInternal.login(config.discord.token);
    return discordClientInternal;
}

const discordClient = initBot();

module.exports = discordClient;
