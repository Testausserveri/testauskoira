const imapSimple = require('imap-simple');
const parseEmail = require('mailparser').simpleParser;

class Imap {
    connection;
    config;
    /**
     * Create new Imap client with given credentials
     * @param {Object} imapSettings Imap credentials
     */
    constructor(imapSettings) {
        this.config = {
            imap: imapSettings,
            onend: () => {
                console.log('Connection to IMAP has ended! Reconnecting...');
                delete this.connection;
                this.connect();
            }
        };
    }
    
    /**
     * Connect to the IMAP server
     */
    connect() {
        return imapSimple.connect(this.config)
        .then((con) => {
            this.connection = con;
            console.log('Connected to IMAP!');
            return true;
        });
    }

    /**
     * Fetch new emails from the IMAP server
     * @returns {Array.Object} Array of message objects  
     */
    fetch() {
        return new Promise((resolve, reject) => {
            this.connection.openBox('INBOX').then(() => {
                let searchCriteria = ['UNSEEN'];
                let fetchOptions = {
                    bodies: ['HEADER', 'TEXT', ''],
                    markSeen: true
                };
                this.connection.search(searchCriteria, fetchOptions).then(async (messages) => {
                    let promises = [];
                    messages.forEach(async (item) => {
                        let messageBody = item.parts.find(part => part.which == '').body;
                        let idHeader = "Imap-Id: " + item.attributes.uid + "\r\n";
                        promises.push(new Promise((resolve, reject) => {
                            parseEmail(idHeader+messageBody, (err, {from, to, subject, text}) => {
                                // deleting message immediately, we don't need it anymore
                                // it doesn't move it to trash; it destroys it
                                this.connection.deleteMessage(item.attributes.uid); 

                                resolve({from, to, subject, text});
                            })
                        }));
                    });
                    Promise.all(promises).then(resolve);
                });
            });
        })
    }
}

module.exports = Imap;