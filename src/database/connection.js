const config = require('../../config.json');
const mysql = require('mysql2/promise');

const MailDatabase = require('./mail');

class DatabaseConnection {
    constructor(config) {
        this.config = config;
        this.connect()
        .then(() => {
            this.mail = new MailDatabase(this.connection);
        });
    }
    connect() {
        return new Promise((resolve, reject) => {
            mysql.createConnection(this.config).then((c) => {
                this.connection = c;
                console.log('[DB] Connected!');
                resolve();
                this.connection.on('error', function(err) {
                    console.log('[DB] Database connection error! ' + err);
                    if (!err.fatal) return; 
                    if (err.code !== 'PROTOCOL_CONNECTION_LOST') throw err;
                
                    console.log('[DB] Re-connecting lost connection: ' + err.stack);
                    this.connect();
                });
            });
        })
    }
}

module.exports = DatabaseConnection;