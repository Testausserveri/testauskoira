const config = require('../../config.json');

const MailDatabase = require('./mail');
const databaseClient = new MailDatabase(config.mysql);

module.exports = databaseClient;