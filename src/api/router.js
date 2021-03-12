const express = require('express');

const discordClient = require('../discord.js');
const database = require('../database/database.js');
const { prettyHtml } = require('../utils');
const { cors, cache } = require('./middleware');
const defaultGuild = require('../../config.json').discord.defaultGuild;


const router = express.Router();

router.use(cors);

router.get('/guildInfo', cache(30), async function (req, res) {
    console.log('[API] Requested /guildInfo');
    const messagesToday = await database.getTotalMessagesToday();
    const memberCount = (await discordClient.guilds.fetch(defaultGuild)).memberCount;
    
    res.json({
        memberCount,
        messagesToday
    });
});

module.exports = router;