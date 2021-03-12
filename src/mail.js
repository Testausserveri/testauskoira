const config = require('../config.json');

const Imap = require('./mail/imap.js');
const { deliverMessages } = require('./mail/delivery.js');

const imapServer = new Imap(config.imap);
const discordClient = require('./discord.js');
const databaseClient = require('./database/database.js');

const loop = () => {
    if (imapServer.connection) {
        imapServer.fetch()
        .then(messages => deliverMessages(messages));
    } else {
        console.log('Can\'t check for new emails - no IMAP connection');
    }
}

discordClient.on('ready', () => {
    imapServer.connect()
    .then(loop);
    setInterval(loop, config.scanInterval * 1000)
});