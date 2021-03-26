const express = require('express');
const basicAuth = require('express-basic-auth')

const discordClient = require('../discord.js');
const database = require('../database/database.js');
const { prettyHtml } = require('../utils');
const { cors, cache } = require('./middleware');
const config = require('../../config.json');

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const mime = require('mime');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, './uploads/'))
    },
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));
        });
    }
});
const upload = multer({
    storage: storage
});
const router = express.Router();

let messageTemplate;
fs.readFile(path.join(__dirname, 'messageTemplate.txt'), 'utf-8')
.then(data => {
    messageTemplate = data;
})

router.use(cors);

router.get('/guildInfo', cache(5), async function (req, res) {
    console.log('[API] Requested /guildInfo ', new Date());
    const messagesToday = await database.getTotalMessagesToday();
    const memberCount = (await discordClient.guilds.fetch(config.discord.defaultGuild)).memberCount;
    
    res.json({
        memberCount,
        messagesToday
    });
});


// routes after this are password-protected
router.use(basicAuth(config.http.basicAuth));

let userData;

const updateUserData = () => {
    console.log(`[API] Updating user data...`);
    database.mail.getRegisteredUsers().then((registeredUsers) => {
        discordClient.guilds.fetch(config.discord.defaultGuild).then(guild => {
        guild.members.fetch()
            .then(a => {
                userData = [...a].map(b => {
                    const mailbox = (registeredUsers.find(p => p.userid == b[1].user.id));
                    return {
                    id: b[1].user.id,
                    username: b[1].user.username,
                    registered: (mailbox ? mailbox.mailbox : false),
                    joinedTimestamp: b[1].joinedTimestamp,
                    createdAt: b[1].user.createdAt
                    };
                });
                userData.sort((a, b) => b.joinedTimestamp - a.joinedTimestamp )
                console.log('[API] User data updated... loaded ', userData.length, 'users')
            })
        })
    });
}

discordClient.on('ready', async () => {
    updateUserData();
});
setInterval(updateUserData, 1000 * 60 * 8);

router.get('/users', (req, res) => {
    res.json(userData);
})

router.post('/sendWelcome', upload.single('image'), function (req, res, next) {
    console.log(req.file);

    discordClient.users.fetch(req.body.id)
    .then((user) => {
        console.log('[API] Sending email welcome message to ' + user);
        database.mail.createMailbox(req.body.mailbox, user.id).then(() => {
            user.send({
                files: [req.file.path]
            })
            let message = messageTemplate.replace('{MAILBOXNAME}', req.body.mailbox);
            user.send(message);
            userData[userData.findIndex(a => a.id == user.id)].registered = req.body.mailbox;

            res.status(200).end('OK');
        })
    .catch(() => res.status(500).end());
    }).catch(() => res.status(500).end());
})


module.exports = router;