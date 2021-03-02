const { resolveUserByMailbox, checkBlock } = require('./database.js');
const discordClient = require('./discord.js');

const formatAddress = (addr) => {
    let out = '';
    addr.value.forEach(contact => {
        out += `${(contact.name ? contact.name + ' ' : '')}<${contact.address}>; `
    });
    return out.trim();
}
const resolveReceiver = (receiver) => {
    return new Promise((resolve, reject) => {
        let name = receiver.address.split('@')[0];
        let subMailbox; 
        if (name.includes('+')) {
            let nameSplit = name.split('+');
            name = nameSplit[1];
            subMailbox = nameSplit[0];
        }
        resolveUserByMailbox(name)
        .then(u => {
            if (!u.userid) {
                reject('User ' + name + ' not found'); return;
            }
            discordClient.users.fetch(u.userid).then(user => {
                resolve({
                    user: user,
                    messageReceiver: receiver,
                    key: u.key,
                    subMailbox: subMailbox,
                    mailbox: name
                })    
            });
        }) 
    });
}
const createBlockLink = ({from, subMailbox, key}) => {
    return `https://tonttu.testausserveri.fi/posti/${key}/block?from=${encodeURIComponent(from.value[0].address)}` + (subMailbox ? `&sub=${encodeURIComponent(subMailbox)}` : '');
};
const chunkString = (string, size, multiline = true) => {
    let matchAllToken = (multiline == true) ? '[^]' : '.';
    let re = new RegExp(matchAllToken + '{1,' + size + '}', 'g');
    return string.match(re);
};
const deliverMessages = (messages, discordClient) => {
    messages.forEach(async (message) => { // go through new messages
        let receivers = message.to.value.filter(to => to.address.includes('testausserveri.fi')); // find all receivers that are our guys
        receivers.forEach(async (receiver) => {
            resolveReceiver(receiver, discordClient)
            .then(async ({user, messageReceiver, key, subMailbox, mailbox}) => {
                console.log(`[DELIVERY] Delivering mail to ${user.tag} (${messageReceiver.address})`)

                const blocked = await checkBlock(message.from.value[0].address, mailbox, subMailbox);
                if (blocked) {
                    console.log('[DELIVERY] Mail delivery cancelled, block id ' + blocked.id);
                    return;
                }

                const blockLink = createBlockLink({
                    from: message.from,
                    subMailbox: subMailbox,
                    key: key
                });
                // decide whether we can send whole email message in one embed
                // or do we need to split it up to smaller embed parts
                if (message.text.toString().length < 1500) {
                    user.send({
                        embed: {
                            color: 0x4881A7,
                            title: `Lähettäjä: ${formatAddress(message.from)}\nSaaja: ${formatAddress(message.to)}\n\n${message.subject}`,
                            description: '' + message.text + '' + `\n[Estä](${blockLink})`
                        }
                    }).catch(reason => {
                        console.log('Could not deliver mail', reason)
                    });
                } else {
                    let messageChunks = chunkString(message.text.toString(), 1950);
                    user.send({
                        embed: {
                            color: 0x4881A7,
                            title: `Lähettäjä: ${formatAddress(message.from)}\nSaaja: ${formatAddress(message.to)}\n\n${message.subject}`
                        }
                    })
                    messageChunks.forEach((messageChunk, index) => {
                        user.send({
                            embed: {
                                color: 0x4881A7,
                                description: '' + messageChunk + '' + (index == messageChunks.length - 1 ? `[Estä](${createBlockLink(message.from, messageReceiver, key)})` : '')
                            }
                        }).catch(reason => {
                            console.log('Could not deliver mail chunk ', reason)
                        });
                    })
                }
            })
            .catch(reason => {
                console.log('Couldn\'t resolve user! ', reason);
            });
        })
    });
}

module.exports = { deliverMessages };