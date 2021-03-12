const config = require('../config.json');
const express = require('express')
const app = express()

const mailRoute = require('./mail/router');
const apiRoute = require('./api/router');
app.use('/posti/', mailRoute);
app.use('/api/', apiRoute);

app.listen(config.httpPort, () => {
    console.log('[HTTP] Server is running port ' + config.httpPort);
})

module.exports = app;