/**
 * @file Mail class used inside the database object
 */

const crypto = require('crypto');

/**
 * @typedef Mailbox
 * @property {String} mailbox Mailbox name
 * @property {String} userid Owner's Discord user id
 * @property {String} key Mailbox key for self-managing blocks through HTTP interface
 */

class MailDatabase {
    constructor(connection) {
        this.connection = connection;
    } 
    /**
     * Lists registered mailboxes and their owners' user id
     * @returns {Promise<Array.<Mailbox>>} Returns array of mailbox objects
     */
    getRegisteredUsers() {
        return new Promise((resolve, reject) => {
            this.connection.query('SELECT `mailbox`, `userid` FROM `mailboxes`')
            .then(([result]) => {
                resolve(result);
            })
        });
    }

    /**
     * Check whether mailbox belongs to userid
     * @param {String} mailbox 
     * @param {String} userid 
     * @returns {Boolean}
     */
    belongsTo(mailbox, userid) {
        return new Promise((resolve, reject) => {
            this.connection.execute('SELECT `mailbox`, `userid` FROM `mailboxes` WHERE `mailbox` = ? AND `userid` = ?', [mailbox, userid])
            .then(([result]) => {
                resolve(result.length > 0)
            })
            .catch(() => {
                resolve(false)
            })
        })
    }

    /**
     * Check whether mailbox is available
     * @param {String} mailbox 
     * @param {String} userid 
     * @returns {Boolean}
     */
     available(mailbox, userid) {
        return new Promise((resolve, reject) => {
            this.connection.execute('SELECT `mailbox`, `userid` FROM `mailboxes` WHERE `mailbox` = ?', [mailbox])
            .then(([result]) => {
                resolve(result.length == 0)
            })
            .catch(() => {
                resolve(true)
            })
        })
    }

    /**
     * Resolve user by a mailbox name
     * @param {String} mailbox Name of the mailbox
     * @returns {Promise<Mailbox>} Promise to mailbox object
     */
    resolveUserByMailbox(mailbox) {
        return new Promise((resolve, reject) => {
            this.connection.execute('SELECT `userid`, `key`, `mailbox` FROM `mailboxes` WHERE `mailbox` = ?', [mailbox])
            .then(([[result]]) => {
                resolve({...result});
            })
        });
    }

    /**
     * Resolve mailbox and owner's user id by mailbox key
     * @param {String} key Mailbox blocks management key
     * @returns {Promise<Mailbox>} Promise to mailbox object
     */
    resolveMailboxByKey(key) {
        return new Promise((resolve, reject) => {
            this.connection.execute('SELECT `mailbox`, `userid`, `key` FROM `mailboxes` WHERE `key` = ?', [key])
            .then(([[result]]) => {
                if (result) {
                    resolve({...result});
                } else {
                    reject('No results');
                }
            })
        });
    }

    /**
     * 
     * @param {String} from Mail sender's email address
     * @param {String} mailbox Mailbox name
     * @param {String} [sub] Mailbox sub (for example abc in abc+mailbox@domain.fi)
     * @returns {Promise}
     */
    addBlock(from, mailbox, sub = '') {
        return new Promise((resolve, reject) => {
            this.connection.execute('INSERT INTO `blocks` SET `from`=?, `mailbox`=?, `sub`=?', [from, mailbox, sub])
            .then(([data]) => {
                if (data.affectedRows == 1) {
                    resolve();
                } else {
                    reject();
                }
            }).catch(reject);
        });
    }

    /**
     * Checks if block exists with given details
     * @param {String} from Email sender
     * @param {String} mailbox Mailbox object
     * @returns {Promise<Number>} Bblock id
     */
    checkBlock(from, mailbox) {
        return new Promise((resolve, reject) => {
            this.connection.execute('SELECT `id` FROM `blocks` WHERE `from`=? AND `mailbox`=? AND `sub`=?', [from, mailbox.name, mailbox.sub])
            .then(([[data]]) => {
                resolve(data);
            }).catch(reject);
        });
    }

    /**
     * Create mailbox with given details
     * @param {String} mailbox Mailbox name
     * @param {String} userid Owner's Discord user id
     * @returns {Promise}
     */
    createMailbox(mailbox, userid) {
        return new Promise(async (resolve, reject) => {
            const key = await crypto.randomBytes(20).toString('hex');
            this.connection.execute('INSERT INTO `mailboxes` SET `mailbox`=?, `userid`=?, `key`=?', [mailbox, userid, key])
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


