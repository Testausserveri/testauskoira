const config = require('../config.json');
const express = require('express')
const app = express()

const mailRoute = require('./mail/router');
app.use('/posti/', mailRoute);

app.listen(config.httpPort, () => {
    console.log('[HTTP] Server is running port ' + config.httpPort);
})

module.exports = app;