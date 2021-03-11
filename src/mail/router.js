const express = require('express');
const discordClient = require('../discord.js');
const database = require('../database/database.js');
const { prettyHtml } = require('../utils');
const router = express.Router();

router.get('/:key/block', function (req, res) {
    try {
        if (!req.query.from || req.params.key.length < 5) throw 'Invalid request';
        const key = req.params.key;
        const from = req.query.from;
        const subMailbox = req.query.sub || '';

        console.log('[HTTP] Adding block', key, from, subMailbox);
        database.mail.resolveMailboxByKey(key)
        .then(async (data) => {
            database.mail.addBlock(from, data.mailbox, subMailbox)
            .then(() => {
                res.end(prettyHtml(`Estit lähettäjän <b>${from}</b> lähettämästä sähköpostilaatikkoosi <b>${(subMailbox ? subMailbox + '+' + data.mailbox : data.mailbox)}</b>@testausserveri.fi`));

                discordClient.users.fetch(data.userid).then(user => {
                    user.send({ embed: {
                        title: `Kuittaus estosta`,
                        description: `Estit lähettäjän **${from}** lähettämästä sähköpostilaatikkoosi **${(subMailbox ? subMailbox + '+' + data.mailbox : data.mailbox)}**@testausserveri.fi`
                    }});
                });
            })
            .catch(() => {
                res.end(prettyHtml('Olet jo estänyt tämän lähettäjän tähän postilaatikkoon.'));
            });
            
        })
        .catch((reason) => {
            console.log('[HTTP] Error on route /posti/:key/block', reason, req.params, req.query)
            res.end(prettyHtml('Hups! Tapahtui virhe'));
        });
    } catch (e) {
        console.log('[HTTP] Error on route /posti/:key/block', e, req.params, req.query)
        res.status(500).end(prettyHtml('Hups! Tapahtui virhe'));
    }
})

module.exports = router;