const config = require('../config.json');
const mysql = require('mysql2/promise');
const crypto = require('crypto');

let connection;

const connect = () => { 
    mysql.createConnection(config.mysql).then((c) => {
        connection = c;
        console.log('[DB] Connected!');
        connection.on('error', function(err) {
            console.log('[DB] Database connection error! ' + err);
            if (!err.fatal) return; 
            if (err.code !== 'PROTOCOL_CONNECTION_LOST') throw err;
        
            console.log('[DB] Re-connecting lost connection: ' + err.stack);
            connect();
        });
    });
};

connect();

const resolveUserByMailbox = (mailbox) => {
    return new Promise((resolve, reject) => {
        connection.execute('SELECT `userid`, `key` FROM `mailboxes` WHERE `mailbox` = ?', [mailbox])
        .then(([[result]]) => {
            resolve({...result});
        })
    });
}

const resolveMailboxByKey = (key) => {
    return new Promise((resolve, reject) => {
        connection.execute('SELECT `mailbox`, `userid` FROM `mailboxes` WHERE `key` = ?', [key])
        .then(([[result]]) => {
            if (result) {
                resolve({...result});
            } else {
                reject('No results');
            }
        })
    });
};

const addBlock = (from, mailbox, sub) => {
    return new Promise((resolve, reject) => {
        connection.execute('INSERT INTO `blocks` SET `from`=?, `mailbox`=?, `sub`=?', [from, mailbox, sub])
        .then(([data]) => {
            if (data.affectedRows == 1) {
                resolve();
            } else {
                reject();
            }
        }).catch(reject);
    });
};

const checkBlock = (from, mailbox, sub = '') => {
    return new Promise((resolve, reject) => {
        connection.execute('SELECT `id` FROM `blocks` WHERE `from`=? AND `mailbox`=? AND `sub`=?', [from, mailbox, sub])
        .then(([[data]]) => {
            resolve(data);
        }).catch(reject);
    });
}

const getRegisteredUsers = () => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT `mailbox`, `userid` FROM `mailboxes`')
        .then(([result]) => {
            resolve(result);
        })
    });
};

const createMailbox = (mailbox, userid) => {
    return new Promise(async (resolve, reject) => {
        const key = await crypto.randomBytes(20).toString('hex');
        connection.execute('INSERT INTO `mailboxes` SET `mailbox`=?, `userid`=?, `key`=?', [mailbox, userid, key])
        .then(([data]) => {
            if (data.affectedRows == 1) {
                resolve();
            } else {
                reject();
            }
        }).catch(reject);
    });
};

module.exports = {resolveUserByMailbox, resolveMailboxByKey, addBlock, checkBlock, getRegisteredUsers, createMailbox, connection};
