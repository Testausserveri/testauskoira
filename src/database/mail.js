class MailDatabase {
    constructor(connection) {
        this.connection = connection;
    } 
    getRegisteredUsers() {
        return new Promise((resolve, reject) => {
            this.connection.query('SELECT `mailbox`, `userid` FROM `mailboxes`')
            .then(([result]) => {
                resolve(result);
            })
        });
    }
    resolveUserByMailbox(mailbox) {
        return new Promise((resolve, reject) => {
            connection.execute('SELECT `userid`, `key` FROM `mailboxes` WHERE `mailbox` = ?', [mailbox])
            .then(([[result]]) => {
                resolve({...result});
            })
        });
    }
    resolveMailboxByKey(key) {
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
    }
    addBlock(from, mailbox, sub) {
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
    }
    checkBlock(from, mailbox, sub = '') {
        return new Promise((resolve, reject) => {
            connection.execute('SELECT `id` FROM `blocks` WHERE `from`=? AND `mailbox`=? AND `sub`=?', [from, mailbox, sub])
            .then(([[data]]) => {
                resolve(data);
            }).catch(reject);
        });
    }
    createMailbox(mailbox, userid) {
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
    }
}

module.exports = MailDatabase;


