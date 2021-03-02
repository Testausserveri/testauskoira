const config = require('./config.json');
const Imap = require('./src/imap.js');
const { deliverMessages } = require('./src/delivery.js');

const imapServer = new Imap(config.imap);
const discordClient = require('./src/discord.js');
const databaseClient = require('./src/database.js');
const httpServer = require('./src/http.js');

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
  