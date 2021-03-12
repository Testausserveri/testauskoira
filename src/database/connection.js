const config = require('../../config.json');
const mysql = require('mysql2/promise');

const MailDatabase = require('./mail');

class DatabaseConnection {
    /**
     * Create new database client with given credentials
     * @param {Object} config Mysql connection details
     */
    constructor(config) {
        this.config = config;
        this.connect()
        .then(() => {
            this.mail = new MailDatabase(this.connection);
        });
    }

    /**
     * Connect to the database
     */
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

    /**
     * Adds +1 to messages per day statistic
     * @returns {Promise}
     */
    bumpMessagesPerDayStatistic(userid) {
        return new Promise(async (resolve, reject) => {
            this.connection.execute('INSERT INTO `messages_day_stat` SET `message_count`=1, `userid`=?, `date` = CURDATE() ON DUPLICATE KEY UPDATE `message_count`=`message_count`+1; ', [userid])
            .then(([data]) => {
                if (data.affectedRows >= 1) {
                    resolve();
                } else {
                    reject('No affected rows');
                }
            }).catch(reject);
        });
    }

    getTotalMessagesToday() {
        return new Promise((resolve, reject) => {
            this.connection.query('SELECT SUM(`message_count`) FROM `messages_day_stat` WHERE `date`=CURDATE()')
            .then(([[data]]) => {
                resolve(parseInt(data[Object.keys(data)[0]]));
            }).catch(reject);
        });
    }
}

module.exports = DatabaseConnection;