const config = require('../../config.json');

const Database = require('./connection');
const databaseClient = new Database(config.mysql);

module.exports = databaseClient;