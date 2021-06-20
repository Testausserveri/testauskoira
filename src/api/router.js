const express = require('express');
const basicAuth = require('express-basic-auth')

const discordClient = require('../discord.js');
const database = require('../database/database.js');
const { prettyHtml } = require('../utils');
const { cors, cache } = require('./middleware');
const config = require('../../config.json');

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');
const { stripHtml } = require("string-strip-html");
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

router.get('/authorized', async function (req, res) {
    console.log('[API] Requested /authorized ', new Date());

    if (req.query.error) {
        res.status(400).end("Error: \"" + stripHtml(req.query["error_description"]).result.replace(/\+/g, ' ') + "\"").substr(0, 60);
        return;
    }

    const code = req.query.code; 
    if (!/^\w{6,32}$/.test(code)) {
        res.status(400).end("Bad request");
        return;
    }

    let user = {};

    // get user's oauth access token using the code
    axios({
        url: "https://github.com/login/oauth/access_token",
        method: "POST",
        data: {
            ...config.github.oauth,
            code
        },
        headers: {
            "Accept": "application/json"
        }
    })
    .then(({data}) => {
        user.accessToken = data["access_token"];
    })
    // request user info using their access token
    .then(() => axios({
        url: "https://api.github.com/user",
        method: "GET",
        headers: {
            "Authorization": "token " + user.accessToken
        }
    }))
    .then(({data}) => {
        user.id = data["id"];
        user.login = data["login"];
    })
    // invite user to the organization using PAT
    .then(() => axios({
        url: "https://api.github.com/orgs/Testausserveri/invitations",
        method: "POST",
        data: {
            "invitee_id": user.id
        },
        headers: {
            "Authorization": "token " + config.github['PAT']
        }
    }))
    // accept invitation on behalf of the user
    .then(() => axios({
        url: "https://api.github.com/user/memberships/orgs/Testausserveri",
        method: "PATCH",
        data: {
            "accept": "application/vnd.github.v3+json",
            "state": "active"
        },
        headers: {
            "Authorization": "token " + user.accessToken
        }
    }))
    // publicize organization membership on behalf of the user
    .then(() => axios({
        url: "https://api.github.com/orgs/Testausserveri/public_members/" + user.login,
        method: "PUT",
        headers: {
            "Authorization": "token " + user.accessToken
        }
    }))
    .then(() => discordClient.channels.fetch(config.discord.defaultChannel))
    .then((channel) => channel.send(`${user.login} liittyi Testausserverin GitHub-organisaatioon 🎉! Liity sinäkin: https://koira.testausserveri.fi/github/join`))
    .then(() => {
        res.redirect("https://github.com/Testausserveri");
    })
    .catch((reason) => {
        console.log(reason)
        if (reason.request && reason.request.res.statusMessage == 'Unprocessable Entity' && reason.request.path == '/orgs/Testausserveri/invitations') {
            // already in the org
            res.redirect("https://github.com/Testausserveri");
        } else {
            res.status(500).end("Server error");
        }
    })
});

function parseActivity(activities) {
    const activityTypes = {
        'PLAYING': 'Pelaa',
        'WATCHING': 'Katsoo',
        'LISTENING': 'Kuuntelee',
        'STREAMING': 'Striimaa'
    }
    if (activities.length > 0) {
        let {name, type, state, emoji} = activities[0];

        return (type == 'CUSTOM_STATUS'
            ?
            `${(emoji.name || '')} ${state}`
            :
            `${activityTypes[type] || type} ${name}`
        );
    } else {
        return;
    }
}
router.get('/memberInfo', cache(5), async (req, res) => {
    if (req.query.name || req.query.id){
        // Generate roles array
        let guildRoles;
        let timeout = false;
        setTimeout(async () => {
            if(timeout == null) return
            res.status(500).send("Timeout while fetching roles.")
            timeout = true
        }, 5000)
        await new Promise(async (resolve) => {
            await discordClient.guilds.fetch(config.discord.defaultGuild)
            .then(guild => {
                guild.roles.fetch()
                .then(() => {
                    guildRoles = guild.roles.cache.map(role => ({id: role.id, name: role.name, color: role.color, members: role.members, count: role.members.size}));
                    // Filter member data
                    for(let role of guildRoles){
                        if(config.discord.publicRoles.includes(role.id)){
                            role.members = role.members
                            .map(member => 
                                ({
                                    name: member.nickname || member.displayName, 
                                    id: member.id, 
                                    presence: { 
                                        activity: parseActivity(member.presence.activities), 
                                        status: member.presence.status.toString()
                                    }
                                })
                            )
                        }else {
                            role.members = "private"
                        }
                    }
                    timeout = null
                    resolve();
                });
            });
        });
        if(timeout) return;

        // Build response
        let query = req.query.name || req.query.id
        let matches = {}
        for (let role of guildRoles){
            if (role.id != query && role.name != query) continue; // Skip if we do not have a match
            matches[role.id] = {
                name: role.name,
                color: role.color,
                members: role.members
            }
        }
        if (Object.keys(matches).length == 0) {
            res.status(404).send("No matching roles.")
        } else {
            res.status(200).json(matches)
        }
    } else {
        res.status(400).send("Required query parameter not found: name || id")
    }
})

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