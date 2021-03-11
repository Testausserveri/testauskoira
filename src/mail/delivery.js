const database = require('../database/database.js');
const { formatAddress, chunkString, createBlockLink } = require('../utils');
const discordClient = require('../discord.js');

/**
 * Resolve bunch of useful data about address
 * @param {Object} receiver Address object
 * @returns {Promise<Object>}
 */
const resolveReceiver = (receiver) => {
    return new Promise((resolve, reject) => {
        const mailbox = {
            name: receiver.address.split('@')[0],
            sub: '',
            key: ''
        };
        if (mailbox.name.includes('+')) {
            let nameSplit = mailbox.name.split('+');
            mailbox.name = nameSplit[1];
            mailbox.sub = nameSplit[0];
        }
        database.mail.resolveUserByMailbox(mailbox.name)
        .then(u => {
            if (!u.userid) {
                reject('User ' + mailbox.name + ' not found'); return;
            }
            mailbox.key = u.key;
            discordClient.users.fetch(u.userid).then(user => {
                console.log(`[DELIVERY] Delivering mail to ${user.tag} (${receiver.address})`)
                resolve({
                    discordUser: user, // Discord user
                    mailbox: mailbox
                })    
            });
        }) 
    });
}

/**
 * Sends a Discord embed to the given user
 * @param {Object} discordUser 
 * @param {Object} embedData 
 * @returns {Promise}
 */
const sendEmbed = (discordUser, embedData) => {
    let embed = {color: 0x4881A7, ...embedData};
    return discordUser.send({embed}).catch(reason => {
        console.log('Could not deliver mail', reason);
    });
}

/**
 * Checks whether receiver has blocked the sender
 * @param {*} discordUser (Just gets passed in the resolve)
 * @param {*} mailbox Receiving mailbox object
 * @param {*} sender Sender object
 * @returns {Object}
 */
const checkBlock = (discordUser, mailbox, sender) => {
    return new Promise(async (resolve, reject) => {
        const blocked = await database.mail.checkBlock(sender.value[0].address, mailbox);
        if (blocked) {
            console.log('[DELIVERY] Mail delivery cancelled, block id ' + blocked.id);
            reject('User has blocked');
        } else {
            const blockLink = createBlockLink({
                from: sender,
                mailbox: mailbox
            });
            resolve({
                discordUser, 
                mailbox, 
                blockLink
            });
        }
    });
};

const deliverMessage = (message, receiver) => {
    resolveReceiver(receiver)
    .then(({discordUser, mailbox}) => checkBlock(discordUser, mailbox, message.from))
    .then(async ({discordUser, mailbox, blockLink}) => {
        // decide whether we can send whole email message in one embed
        // or do we need to split it up to smaller embed parts
        if (message.text.toString().length < 1500) {
            sendEmbed(discordUser, {
                title: `Lähettäjä: ${formatAddress(message.from)}\nSaaja: ${formatAddress(message.to)}\n\n${message.subject}`,
                description: '' + message.text + '' + `\n[Estä](${blockLink})`
            })
        } else {
            let messageChunks = chunkString(message.text.toString(), 1950);
            sendEmbed(discordUser, {
                title: `Lähettäjä: ${formatAddress(message.from)}\nSaaja: ${formatAddress(message.to)}\n\n${message.subject}`
            })
            messageChunks.forEach((messageChunk, index) => {
                sendEmbed(discordUser, {
                    description: '' + messageChunk + '' + (index == messageChunks.length - 1 ? `[Estä](${blockLink})` : '')
                });
            })
        }
    })
    .catch(reason => {
        console.log('Couldn\'t deliver message! ', reason);
    });
}

const deliverMessages = (messages) => {
    messages.forEach(async (message) => { // go through new messages
        let receivers = message.to.value.filter(to => to.address.includes('testausserveri.fi')); // find all receivers that are our guys
        receivers.forEach((receiver) => deliverMessage(message, receiver))
    });
}

module.exports = { deliverMessages };